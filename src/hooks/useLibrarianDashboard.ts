import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { ApplicationWithStudent, Approval, Document } from '../types/workflow'

export interface DueRecord {
  id: string
  student_id: string
  department: string
  amount: number
  status: 'pending' | 'paid'
  student?: {
    full_name: string
    student_uid: string
  }
}

export const useLibrarianDashboard = () => {
  const { user } = useAuth()
  const [dues, setDues] = useState<DueRecord[]>([])
  const [systemLogs, setSystemLogs] = useState<any[]>([])
  const [stats, setStats] = useState({ awaiting: 0, approved: 0, rejected: 0 })
  const [applications, setApplications] = useState<ApplicationWithStudent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async (initialLoad = false) => {
    if (!user) return
    if (initialLoad) setIsLoading(true)
    setError(null)

    try {
      // 1. Fetch Dues
      const { data: duesData, error: duesError } = await supabase
        .from('dues')
        .select(`
          *,
          student:profiles(full_name, student_uid)
        `)
        .order('status', { ascending: false })

      if (duesError) throw duesError
      setDues(duesData as any[] || [])

      // 2. Fetch Stats for Librarian Approvals
      const { data: statsData, error: statsError } = await supabase
        .from('approvals')
        .select(`status, application_id`)
        .eq('role', 'librarian')

      if (statsError) throw statsError

      const counts = (statsData || []).reduce((acc, curr) => {
        if (curr.status === 'approved') acc.approved++
        else if (curr.status === 'rejected') acc.rejected++
        else if (curr.status === 'pending') acc.awaiting++
        return acc
      }, { awaiting: 0, approved: 0, rejected: 0 })

      setStats(counts)

      // 2.5 Fetch System Logs (Recent Librarian Approvals)
      const { data: logsData, error: logsError } = await supabase
        .from('approvals')
        .select(`
          id, status, updated_at, comment,
          application:applications(student:profiles(full_name, student_uid))
        `)
        .eq('role', 'librarian')
        .neq('status', 'pending')
        .order('updated_at', { ascending: false })
        .limit(10)
      
      if (logsError) throw logsError
      setSystemLogs(logsData as any[] || [])

      // 3. Fetch Applications at 'librarian' stage
      // Note: Librarians see all departments, so no department filter
      const { data: appsData, error: appError } = await supabase
        .from('applications')
        .select(`
          *,
          student:profiles!inner(full_name, student_uid, department, username)
        `)
        .eq('current_stage', 'librarian')
        .eq('is_submitted', true)
        .order('created_at', { ascending: false })

      if (appError) throw appError

      // --- MOCK FALLBACK for Librarian ---
      if (!duesData || duesData.length === 0) {
        setDues([
          { id: 'l-mock-1', student_id: 's1', department: 'Computer Science', amount: 350, status: 'pending', student: { full_name: 'Marcus Aurelius (Demo)', student_uid: '2024CS0055' } },
          { id: 'l-mock-2', student_id: 's2', department: 'Mechanical', amount: 0, status: 'paid', student: { full_name: 'Isabella Ross (Demo)', student_uid: '2024ME0012' } }
        ])
      } else {
        setDues(duesData as any[] || [])
      }

      if (!appsData || appsData.length === 0) {
        setApplications([
          {
            id: 'l-app-1', student_id: 's1', status: 'librarian_pending' as any, current_stage: 'librarian', department: 'Computer Science',
            is_submitted: true, created_at: new Date().toISOString(), document_ids: [],
            student: { full_name: 'Marcus Aurelius (Demo)', student_uid: '2024CS0055', department: 'Computer Science', username: 'marcus' }
          }
        ])
        counts.awaiting = 1
      } else {
        setApplications(appsData as any[] || [])
      }

      if (!logsData || logsData.length === 0) {
        setSystemLogs([
          { id: 'log-1', action: 'PAYMENT_RECEIVED', details: 'Dues cleared for student Isabella Ross.', timestamp: new Date().toISOString() }
        ])
      } else {
        setSystemLogs(logsData || [])
      }

      setStats({
        awaiting: counts.awaiting,
        approved: counts.approved,
        rejected: counts.rejected
      })

    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData(true) // Initial load with spinner

    // 1. Real-time Subscription for Dues & Broadcast Bridge
    const duesChannel = supabase
      .channel('global-sync-bridge')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dues' }, () => {
        fetchData() // Refresh on any DB change
      })
      .on('broadcast', { event: 'PAYMENT_COMPLETED' }, () => {
        fetchData() // Refresh immediately when student broadcasts payment
      })
      .subscribe()

    // 2. Real-time Subscription for Approvals
    const approvalsChannel = supabase
      .channel('approvals-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'approvals' }, (payload) => {
        if (payload.new && (payload.new as any).role === 'librarian') {
          fetchData()
        }
      })
      .subscribe()

    // 3. Polling Fallback (Every 3 seconds for extra responsiveness - silent)
    const interval = setInterval(() => {
      fetchData()
    }, 3000)

    return () => {
      supabase.removeChannel(duesChannel)
      supabase.removeChannel(approvalsChannel)
      clearInterval(interval)
    }
  }, [user])

  // ... Dues logic ...
  const uploadCSV = async (csvData: string) => {
    setIsLoading(true)
    try {
      const lines = csvData.split('\n')
      const records = lines.slice(1).filter(line => line.trim() !== '')

      const newDues = []
      for (const line of records) {
        const [student_uid, amount, department] = line.split(',')
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('student_uid', student_uid.trim())
          .maybeSingle()

        if (profile) {
          newDues.push({
            student_id: profile.id,
            amount: parseInt(amount.trim()),
            department: department.trim(),
            status: 'pending'
          })
        }
      }

      if (newDues.length > 0) {
        const { error: insertError } = await supabase
          .from('dues')
          .insert(newDues)
        if (insertError) throw insertError
      }

      await fetchData()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const updateDueStatus = async (dueId: string, status: 'pending' | 'paid') => {
    try {
      const { error } = await supabase
        .from('dues')
        .update({ status })
        .eq('id', dueId)
      if (error) throw error
      
      setDues(prev => prev.map(d => d.id === dueId ? { ...d, status } : d))
    } catch (err: any) {
      setError(err.message)
    }
  }

  // ... Applications Logic ...
  const fetchApplicationDocuments = async (docIds: string[]): Promise<Document[]> => {
    if (!docIds || docIds.length === 0) return []
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .in('id', docIds)
    if (error) { setError(error.message); return [] }
    return data || []
  }

  const fetchApplicationApprovals = async (applicationId: string): Promise<Approval[]> => {
    const { data, error } = await supabase
      .from('approvals')
      .select('*')
      .eq('application_id', applicationId)
      .order('updated_at', { ascending: true })
    if (error) { setError(error.message); return [] }
    return data || []
  }

  const approveApplication = async (applicationId: string, comment: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('approvals')
        .update({ status: 'approved', comment, actor_id: user?.id, updated_at: new Date().toISOString() })
        .eq('application_id', applicationId)
        .eq('role', 'librarian')

      if (error) throw error
      setApplications(prev => prev.filter(app => app.id !== applicationId))
      setStats(prev => ({ ...prev, awaiting: prev.awaiting - 1, approved: prev.approved + 1 }))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const rejectApplication = async (applicationId: string, comment: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('approvals')
        .update({ status: 'rejected', comment, actor_id: user?.id, updated_at: new Date().toISOString() })
        .eq('application_id', applicationId)
        .eq('role', 'librarian')

      if (error) throw error
      setApplications(prev => prev.filter(app => app.id !== applicationId))
      setStats(prev => ({ ...prev, awaiting: prev.awaiting - 1, rejected: prev.rejected + 1 }))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    dues,
    systemLogs,
    stats,
    applications,
    isLoading,
    error,
    uploadCSV,
    updateDueStatus,
    fetchApplicationDocuments,
    fetchApplicationApprovals,
    approveApplication,
    rejectApplication,
    refresh: fetchData
  }
}
