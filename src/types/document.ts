export interface Document {
  id: string
  student_id: string
  application_id: string | null
  file_url: string
  file_name: string
  file_type: string
  uploaded_at: string
}
