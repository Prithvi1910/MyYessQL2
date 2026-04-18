export type ApprovalRole = 'lab' | 'hod' | 'principal'
export type ApplicationStatus =
  | 'lab_pending'
  | 'hod_pending'
  | 'principal_pending'
  | 'approved'
  | 'rejected'

export interface Application {
  id: string
  student_id: string
  status: ApplicationStatus
  current_stage: string
  department: string | null
  document_ids: string[]
  is_submitted: boolean
  created_at: string
  student?: {
    full_name: string
    username: string
  }
}

export interface Approval {
  id: string
  application_id: string
  role: ApprovalRole
  status: 'pending' | 'approved' | 'rejected'
  comment: string | null
  actor_id: string | null
  updated_at: string
}

export interface Document {
  id: string
  file_url: string
  file_name: string
  file_type: string
  uploaded_at: string
}
