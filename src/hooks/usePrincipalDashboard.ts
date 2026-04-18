import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Application } from '../types/workflow'

export const usePrincipalDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({ awaiting: 0, approved: 0, rejected: 0, total: 0 })
  const [applications, setApplications] = useState<Application[]>([])
  const [allApplications, setAllApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    if (!user) return
    setIsLoading(true)
    setError(null)

    try {
      // Fetch Applications at 'principal' stage
      const { data: principalApps, error: appError } = await supabase
        .from('applications')
        .select('*, student:profiles(full_name, username)')
        .eq('current_stage', 'principal')
        .eq('is_submitted', true)
        .order('created_at', { ascending: false })

      if (appError) throw appError
      setApplications(principalApps || [])

      // Fetch ALL institution-wide applications
      const { data: allApps, error: allError } = await supabase
        .from('applications')
        .select('*, student:profiles(full_name, username)')
        .eq('is_submitted', true)
        .order('created_at', { ascending: false })

      if (allError) throw allError
      setAllApplications(allApps || [])

      // Stats - cross department
      const { data: approvalsData, error: statsError } = await supabase
        .from('approvals')
        .select('status')
        .eq('role', 'principal')

      if (statsError) throw statsError

      const counts = (approvalsData || []).reduce((acc, curr) => {
        acc[curr.status as keyof typeof acc]++
        return acc
      }, { pending: 0, approved: 0, rejected: 0 })

      setStats({
        awaiting: counts.pending,
        approved: counts.approved,
        rejected: counts.rejected,
        total: (allApps || []).length
      })

    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [user])

  const approveApplication = async (applicationId: string, comment: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('approvals')
        .update({
          status: 'approved',
          comment,
          actor_id: user?.id
        })
        .eq('application_id', applicationId)
        .eq('role', 'principal')

      if (error) throw error
      await fetchData()
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
        .update({
          status: 'rejected',
          comment,
          actor_id: user?.id
        })
        .eq('application_id', applicationId)
        .eq('role', 'principal')

      if (error) throw error
      await fetchData()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    stats,
    applications,
    allApplications,
    isLoading,
    approveApplication,
    rejectApplication,
    error,
    refresh: fetchData
  }
}
