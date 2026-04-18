# MySQL
Here’s a clean, copy-paste ready README section for your Nexus project. It’s written like something you’d actually submit in a hackathon.

📂 File Upload System (Supabase Integration)

This module enables students to upload required documents (ID cards, receipts, etc.) as part of the Nexus clearance workflow. Files are securely stored using Supabase Storage, and metadata is tracked in the database.

🧠 Architecture Overview
User (Frontend)
   ↓
Supabase Auth (user verification)
   ↓
Supabase Storage (file upload)
   ↓
Supabase Database (store file metadata)
⚙️ Setup Instructions
1. Create Storage Bucket

In Supabase Dashboard:

Navigate to: Storage → Create Bucket

Bucket name:

documents
Set visibility: public (for hackathon simplicity)
2. Create Database Table

Run the following SQL in the Supabase SQL Editor:

create table documents (
  id uuid primary key default uuid_generate_v4(),
  application_id uuid references applications(id),
  file_url text,
  file_type text,
  uploaded_at timestamp default now()
);
3. Install Dependencies
npm install @supabase/supabase-js
🔌 Supabase Client Setup

Create a client instance to interact with Supabase.

📁 lib/supabase.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "YOUR_SUPABASE_URL"
const supabaseAnonKey = "YOUR_SUPABASE_ANON_KEY"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
📤 File Upload Implementation

📁 utils/upload.js

import { supabase } from "../lib/supabase"

export async function uploadDocument(file, applicationId, fileType) {
  // Ensure user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("User not authenticated")

  // Generate unique file path
  const fileName = `${user.id}/${Date.now()}_${file.name}`

  // Upload file to Supabase Storage
  const { error } = await supabase.storage
    .from('documents')
    .upload(fileName, file)

  if (error) throw error

  // Retrieve public URL
  const { data } = supabase.storage
    .from('documents')
    .getPublicUrl(fileName)

  const fileUrl = data.publicUrl

  // Store metadata in database
  await supabase.from('documents').insert([
    {
      application_id: applicationId,
      file_url: fileUrl,
      file_type: fileType
    }
  ])

  return fileUrl
}
🖥️ Frontend Usage

Example file input component:

import { uploadDocument } from "../utils/upload"

export default function UploadPage() {

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    await uploadDocument(file, "APPLICATION_ID", "id_card")
  }

  return (
    <div>
      <h2>Upload Document</h2>
      <input type="file" onChange={handleUpload} />
    </div>
  )
}
🔐 Authentication

Users must be logged in before uploading files.

Example login:

await supabase.auth.signInWithPassword({
  email: "student@test.com",
  password: "123456"
})
📦 Data Flow
User selects a file from local system
File is uploaded to Supabase Storage (documents bucket)
Public URL is generated
Metadata is stored in documents table
File is linked to a specific application
⚠️ Common Issues
Issue	Fix
Upload fails	Check bucket name and permissions
"User not authenticated"	Ensure login before upload
File URL not accessible	Ensure bucket is public
RLS error	Disable Row Level Security (for hackathon)
alter table documents disable row level security;
🚀 Future Improvements
Private bucket with signed URLs
File type validation (PDF/JPEG only)
Max file size restriction
Multi-file upload support
Document preview in dashboard