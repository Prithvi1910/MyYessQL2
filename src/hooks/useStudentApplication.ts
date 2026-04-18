import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Application, Approval, Document } from '../types/workflow'

export const useStudentApplication = () => {
  const { user } = useAuth()
  const [application, setApplication] = useState<Application | null>(null)
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [vaultDocuments, setVaultDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    if (!user) return
    setIsLoading(true)
    setError(null)

    try {
      // 1. Fetch Application
      const { data: appData, error: appError } = await supabase
        .from('applications')
        .select('*')
        .eq('student_id', user.id)
        .maybeSingle()

      if (appError) throw appError
      setApplication(appData)

      if (appData) {
        // 2. Fetch Approvals
        const { data: approvalsData, error: approvalsError } = await supabase
          .from('approvals')
          .select('*')
          .eq('application_id', appData.id)
          .order('updated_at', { ascending: true })

        if (approvalsError) throw approvalsError
        setApprovals(approvalsData || [])
      }

      // 3. Fetch Vault Documents
      const { data: docsData, error: docsError } = await supabase
        .from('documents')
        .select('*')
        .eq('student_id', user.id)

      if (docsError) throw docsError
      setVaultDocuments(docsData || [])

    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [user])

  const createApplication = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      // Get department from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('department')
        .eq('id', user.id)
        .single()

      const { data, error } = await supabase
        .from('applications')
        .insert([{
          student_id: user.id,
          department: profile?.department || null,
          is_submitted: false
        }])
        .select()
        .single()

      if (error) throw error
      setApplication(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const updateDocumentSelection = async (docIds: string[]) => {
    if (!application) return
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('applications')
        .update({ document_ids: docIds })
        .eq('id', application.id)

      if (error) throw error
      setApplication({ ...application, document_ids: docIds })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const submitApplication = async () => {
    if (!application) return
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('applications')
        .update({ is_submitted: true })
        .eq('id', application.id)

      if (error) throw error
      setApplication({ ...application, is_submitted: true })
      // Refresh approvals as they are seeded by trigger
      fetchData()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    application,
    approvals,
    vaultDocuments,
    isLoading,
    createApplication,
    updateDocumentSelection,
    submitApplication,
    error,
    refresh: fetchData
  }
}
