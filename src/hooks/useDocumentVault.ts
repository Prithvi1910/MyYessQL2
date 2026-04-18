import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Document } from '../types/document';

export const useDocumentVault = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error('Authentication required');

        setStudentId(user.id);

        const { data: application } = await supabase
          .from('applications')
          .select('id')
          .eq('student_id', user.id)
          .maybeSingle();

        if (application) {
          setApplicationId(application.id);
        }

        await fetchDocuments(user.id);
      } catch (err: any) {
        setError(err.message || 'Failed to initialize document vault');
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const fetchDocuments = async (sId: string) => {
    try {
      const { data, error: docError } = await supabase
        .from('documents')
        .select('*')
        .eq('student_id', sId)
        .order('uploaded_at', { ascending: false });

      if (docError) throw docError;

      setDocuments(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch documents');
    } finally {
      setIsLoading(false);
    }
  };

  const uploadDocument = async (file: File) => {
    if (!studentId) {
      setError('Cannot upload document: Student identity not found');
      return;
    }

    try {
      const uuid = crypto.randomUUID();
      const fileName = `${uuid}-${file.name}`;
      const filePath = `${studentId}/${fileName}`;

      // Upload to Storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (storageError) throw storageError;

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Insert into Database
      const { data: newDoc, error: dbError } = await supabase
        .from('documents')
        .insert({
          student_id: studentId,
          application_id: applicationId, // Link if exists, otherwise null
          file_url: publicUrl,
          file_name: file.name, // Store original name
          file_type: file.type.includes('pdf') ? 'PDF' : 'IMAGE'
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setDocuments(prev => [newDoc, ...prev]);
    } catch (err: any) {
      const msg = err.message || 'Failed to upload document';
      setError(msg);
      throw new Error(msg);
    }
  };

  const downloadDocument = async (doc: Document) => {
    try {
      // Extract storage path from public URL
      // Pattern: .../storage/v1/object/public/documents/user_id/uuid-filename
      const pathParts = doc.file_url.split('/documents/').pop();
      if (!pathParts) throw new Error('Invalid file URL');

      const { data, error: downloadError } = await supabase.storage
        .from('documents')
        .download(pathParts);

      if (downloadError) throw downloadError;

      const url = window.URL.createObjectURL(data);
      const link = window.document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.file_name);
      window.document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Failed to download document');
    }
  };

  const deleteDocument = async (doc: Document) => {
    try {
      const pathParts = doc.file_url.split('/documents/').pop();
      if (!pathParts) throw new Error('Invalid file URL');

      // Delete from Storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([pathParts]);

      if (storageError) throw storageError;

      // Delete from Database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', doc.id);

      if (dbError) throw dbError;

      setDocuments(prev => prev.filter(d => d.id !== doc.id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete document');
    }
  };

  return {
    documents,
    isLoading,
    uploadDocument,
    downloadDocument,
    deleteDocument,
    error,
    clearError: () => setError(null)
  };
};
