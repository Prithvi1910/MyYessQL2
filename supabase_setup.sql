-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create a table for public profiles (Unified User Table)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone default now(),
  username text unique,
  full_name text,
  avatar_url text,
  role text default 'student' check (role in ('student', 'lab', 'hod', 'principal', 'admin')),

  constraint username_length check (char_length(username) >= 3)
);

-- Applications Table
create table public.applications (
  id uuid not null default uuid_generate_v4() primary key,
  student_id uuid references public.profiles(id) on delete cascade,
  status text default 'lab_pending' check (status in ('lab_pending', 'hod_pending', 'principal_pending', 'approved', 'rejected')),
  current_stage text default 'lab',
  created_at timestamp with time zone default now()
);

-- Approvals Table
create table public.approvals (
  id uuid not null default uuid_generate_v4() primary key,
  application_id uuid references public.applications(id) on delete cascade,
  role text check (role in ('lab', 'hod', 'principal')),
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  comment text,
  updated_at timestamp with time zone default now()
);

-- Documents Table
create table public.documents (
  id uuid not null default uuid_generate_v4() primary key,
  application_id uuid references public.applications(id) on delete cascade,
  file_url text not null,
  file_type text,
  uploaded_at timestamp with time zone default now()
);

-- Dues Table
create table public.dues (
  id uuid not null default uuid_generate_v4() primary key,
  student_id uuid references public.profiles(id) on delete cascade,
  department text not null,
  amount integer default 0,
  status text default 'pending' check (status in ('pending', 'paid'))
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.applications enable row level security;
alter table public.approvals enable row level security;
alter table public.documents enable row level security;
alter table public.dues enable row level security;

-- RLS Policies for Profiles
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can update own profiles." on profiles for update using (auth.uid() = id);

-- RLS Policies for Applications
create policy "Students can view their own applications." on applications for select using (auth.uid() = student_id);
create policy "Authorities can view all applications." on applications for select using (
  exists (select 1 from profiles where id = auth.uid() and role in ('lab', 'hod', 'principal', 'admin'))
);
create policy "Students can create applications." on applications for insert with check (auth.uid() = student_id);

-- This trigger automatically creates a profile entry when a new user signs up via Supabase Auth.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', coalesce(new.raw_user_meta_data->>'role', 'student'));
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
