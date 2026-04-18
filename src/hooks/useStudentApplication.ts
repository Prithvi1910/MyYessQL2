import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Application, Approval, Document } from '../types/workflow'

export const useStudentApplication = () => {
  const { user } = useAuth()
  const [application, setApplication] = useState<Application | null>(null)
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [vaultDocuments, setVaultDocuments] = useState<Document[]>([])
  const [profile, setProfile] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showSaved, setShowSaved] = useState(false)
  const [dues, setDues] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  const saveTimeoutRef = useRef<any>(null)

  const fetchData = async () => {
    if (!user) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(null)

    try {
      // 0. Fetch Profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (profileError) throw profileError
      
      if (!profileData) {
        // Self-healing: Create profile if missing
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{
            id: user.id,
            full_name: user.user_metadata?.full_name || 'Student',
            role: user.user_metadata?.role || 'student',
            student_uid: user.user_metadata?.student_uid || null,
            department: user.user_metadata?.department || null
          }])
          .select()
          .maybeSingle()

        if (createError) throw createError
        setProfile(newProfile)
      } else {
        setProfile(profileData)
      }

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

      // 4. Fetch Dues
      const { data: duesData, error: duesError } = await supabase
        .from('dues')
        .select('*')
        .eq('student_id', user.id)

      if (duesError) throw duesError
      setDues(duesData || [])

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
    setIsLoading(true)
    setError(null)

    try {
      // Step 1: Verify session exists
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !session) {
        setError('You must be logged in to create an application. Please log in again.')
        setIsLoading(false)
        return
      }

      const userId = session.user.id

      // Step 2: Fetch student profile
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, student_uid, department, role')
        .eq('id', userId)
        .maybeSingle()

      if (profileError) throw profileError

      let profileData = existingProfile;
      if (!profileData) {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{
            id: userId,
            full_name: session.user.user_metadata?.full_name || 'Student',
            role: session.user.user_metadata?.role || 'student',
            student_uid: session.user.user_metadata?.student_uid || null,
            department: session.user.user_metadata?.department || null
          }])
          .select()
          .maybeSingle()
        
        if (createError) throw createError
        profileData = newProfile
      }

      if (!profileData) {
        setError(`Unable to establish profile. Please contact administrator.`)
        setIsLoading(false)
        return
      }

      if (profileData.role !== 'student') {
        setError(`This page is for students only. Your account role is: ${profileData.role}`)
        setIsLoading(false)
        return
      }

      // Step 3: Check if application already exists
      const { data: existing } = await supabase
        .from('applications')
        .select('id')
        .eq('student_id', userId)
        .maybeSingle()

      if (existing) {
        setError('You already have an existing application. Refreshing...')
        await fetchData()
        setIsLoading(false)
        return
      }

      // Step 4: Insert application
      const { data: newApp, error: insertError } = await supabase
        .from('applications')
        .insert([{
          student_id: userId,
          department: profileData.department ?? 'Unassigned',
          is_submitted: false,
          status: 'librarian_pending',
          current_stage: 'librarian'
        }])
        .select()
        .single()

      if (insertError) {
        setError(`Failed to create application: ${insertError.message} (code: ${insertError.code})`)
        setIsLoading(false)
        return
      }

      // Step 5: Success — set application and move to State B
      setApplication(newApp)
    } catch (err: any) {
      setError(`An unexpected error occurred: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const updateField = useCallback(async (field: string, value: any) => {
    if (!application || application.is_submitted) return

    // Optimistic update
    setApplication(prev => prev ? { ...prev, [field]: value } : null)
    setIsSaving(true)

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const { error } = await supabase
          .from('applications')
          .update({ [field]: value })
          .eq('id', application.id)

        if (error) throw error
        setShowSaved(true)
        setTimeout(() => setShowSaved(false), 2000)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsSaving(false)
      }
    }, 800)
  }, [application])

  const updateDocumentSelection = async (docIds: string[]) => {
    if (!application || application.is_submitted) return

    // Optimistic update
    setApplication(prev => prev ? { ...prev, document_ids: docIds } : null)
    setIsSaving(true)

    try {
      const { error } = await supabase
        .from('applications')
        .update({ document_ids: docIds })
        .eq('id', application.id)

      if (error) throw error
      setShowSaved(true)
      setTimeout(() => setShowSaved(false), 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const submitApplication = async () => {
    if (!application) return
    setIsLoading(true)
    try {
      // Step 1: Submit the application and ensure the department is saved
      const { error: submitError } = await supabase
        .from('applications')
        .update({
          is_submitted: true,
          department: application.department
        })
        .eq('id', application.id)

      if (submitError) throw submitError;

      // Final refresh
      await fetchData()
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
    profile,
    isLoading,
    isSaving,
    showSaved,
    createApplication,
    updateField,
    updateDocumentSelection,
    submitApplication,
    dues,
    error,
    refresh: fetchData
  }
}
