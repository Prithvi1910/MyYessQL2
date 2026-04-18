export type AuthorityRole = 'lab' | 'hod' | 'principal' | 'admin';

export interface AuthorityProfile {
  id: string;
  full_name: string;
  role: AuthorityRole;
  username?: string;
  avatar_url?: string;
  updated_at?: string;
}
