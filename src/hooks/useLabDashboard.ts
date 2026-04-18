import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Application } from '../types/workflow'

export const useLabDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({ awaiting: 0, approved: 0, rejected: 0 })
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    if (!user) return
    setIsLoading(true)
    setError(null)

    try {
      // Get lab user's department
      const { data: profile } = await supabase
        .from('profiles')
        .select('department')
        .eq('id', user.id)
        .single()

      if (!profile?.department) {
        throw new Error("No department assigned to your profile.")
      }

      // Fetch Applications at 'lab' stage in this department
      const { data, error: appError } = await supabase
        .from('applications')
        .select('*, student:profiles(full_name, username)')
        .eq('department', profile.department)
        .eq('current_stage', 'lab')
        .eq('is_submitted', true)
        .order('created_at', { ascending: false })

      if (appError) throw appError
      setApplications(data || [])

      // Fetch stats
      const { data: approvalsData, error: statsError } = await supabase
        .from('approvals')
        .select('status, applications!inner(department)')
        .eq('role', 'lab')
        .eq('applications.department', profile.department)

      if (statsError) throw statsError

      const counts = (approvalsData || []).reduce((acc, curr) => {
        acc[curr.status as keyof typeof acc]++
        return acc
      }, { pending: 0, approved: 0, rejected: 0 })

      setStats({
        awaiting: counts.pending,
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
        .eq('role', 'lab')

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
        .eq('role', 'lab')

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
    isLoading,
    approveApplication,
    rejectApplication,
    error,
    refresh: fetchData
  }
}
