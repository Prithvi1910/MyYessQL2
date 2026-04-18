import JSZip from 'jszip';
import { supabase } from './supabase';

export const exportDigitalLocker = async (studentId: string, studentUid: string) => {
  const zip = new JSZip();
  const folder = zip.folder(`Nexus_Archive_${studentUid}`);

  try {
    // 1. Fetch all documents
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('*')
      .eq('student_id', studentId);

    if (docsError) throw docsError;

    // 2. Download and add each document to the ZIP
    if (documents) {
      for (const doc of documents) {
        const path = doc.file_url.split('/').pop();
        if (!path) continue;

        const { data } = await supabase.storage
          .from('documents')
          .download(path);

        if (data) {
          folder?.file(doc.file_name, data);
        }
      }
    }

    // 3. Generate the ZIP file
    const content = await zip.generateAsync({ type: 'blob' });
    
    // 4. Trigger download
    const url = window.URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Nexus_Locker_${studentUid}.zip`);
    document.body.appendChild(link);
    link.click();
    link.remove();

  } catch (err) {
    console.error("Export error:", err);
    alert("Failed to export digital locker. Please try again.");
  }
};
