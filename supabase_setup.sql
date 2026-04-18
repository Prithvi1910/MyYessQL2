-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create a table for public profiles (Unified User Table)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone default now(),
  username text unique,
  full_name text,
  avatar_url text,
  student_uid text,
  role text default 'student' check (role in ('student', 'lab', 'hod', 'principal', 'admin')),

  constraint username_length check (char_length(username) >= 3),
  constraint student_uid_length check (student_uid is null or char_length(student_uid) = 10)
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

-- Documents Table (Revised: Application-Independent)
create table public.documents (
  id uuid not null default uuid_generate_v4() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  application_id uuid references public.applications(id) on delete set null,
  file_url text not null,
  file_name text not null,
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

-- [HELPER] Authority Role Check
create or replace function public.is_authority()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles 
    where id = auth.uid() 
    and role in ('lab', 'hod', 'principal', 'admin')
  );
end;
$$ language plpgsql security definer;

-- RLS Policies for Profiles
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can update own profiles." on profiles for update using (auth.uid() = id);

-- RLS Policies for Applications
create policy "Students can view their own applications." on applications for select using (auth.uid() = student_id);
create policy "Authorities can view all applications." on applications for select using (public.is_authority());
create policy "Students can create applications." on applications for insert with check (auth.uid() = student_id);

-- This trigger automatically creates a profile entry when a new user signs up via Supabase Auth.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role, student_uid)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'student_uid'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- --- DOCUMENT VAULT STORAGE SETUP ---

-- 1. Create storage bucket
insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do nothing;

-- 2. Storage RLS Policies
create policy "Owners and authorities read docs"
on storage.objects for select
using (
  bucket_id = 'documents' AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR public.is_authority()
  )
);

create policy "Students upload own docs"
on storage.objects for insert
with check (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

create policy "Only students delete own docs"
on storage.objects for delete
using (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 3. Table RLS Policies for documents table
create policy "Students and authorities can view documents."
on documents for select
using (
  auth.uid() = student_id 
  OR public.is_authority()
);

create policy "Students can insert their own docs."
on documents for insert
with check (auth.uid() = student_id);

create policy "Only students can delete their own docs."
on documents for delete
using (auth.uid() = student_id);

-- --- FIX: PERMISSION DENIED FOR SCHEMA PUBLIC ---
-- These grants ensure that the authenticated role (and anon) can actually use the public schema.
-- RLS still protects the data within the tables.

grant usage on schema public to postgres, anon, authenticated, service_role;

grant all privileges on all tables in schema public to postgres, anon, authenticated, service_role;
grant all privileges on all functions in schema public to postgres, anon, authenticated, service_role;
grant all privileges on all sequences in schema public to postgres, anon, authenticated, service_role;

alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to postgres, anon, authenticated, service_role;
