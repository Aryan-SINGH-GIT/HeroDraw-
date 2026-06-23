import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Verify admin status
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return redirect('/dashboard')

  // Fetch Analytics Data
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('plan_type, status')
    .eq('status', 'active')

  const activeSubscribers = subscriptions?.length || 0

  // Calculate real MRR from actual plan types
  const estimatedMRR = (subscriptions || []).reduce((sum, sub) => {
    if (sub.plan_type === 'yearly') return sum + Math.round(4999 / 12)
    return sum + 499
  }, 0)

  const { data: charityImpact } = await supabase
    .from('charity_contributions')
    .select('amount')

  const totalCharityImpact = charityImpact?.reduce((sum, c) => sum + Number(c.amount), 0) || 0

  const { data: winningsData } = await supabase
    .from('winners')
    .select('prize_amount')
    .eq('payment_status', 'paid')

  const totalPayouts = winningsData?.reduce((sum, w) => sum + Number(w.prize_amount), 0) || 0

  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Admin Overview</h1>
        <p className="mt-2 text-sm text-gray-400">Platform metrics and health.</p>
      </div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <p className="text-sm font-medium text-gray-400">Active Subscribers</p>
          <p className="mt-2 text-3xl font-bold text-white">{activeSubscribers}</p>
          <p className="mt-1 text-xs text-gray-500">{totalUsers || 0} total users</p>
        </div>
        
        <div className="card">
          <p className="text-sm font-medium text-gray-400">Estimated MRR</p>
          <p className="mt-2 text-3xl font-bold text-accent">₹{estimatedMRR.toLocaleString()}</p>
        </div>

        <div className="card">
          <p className="text-sm font-medium text-gray-400">Total Charity Impact</p>
          <p className="mt-2 text-3xl font-bold text-coral">₹{totalCharityImpact.toLocaleString()}</p>
        </div>

        <div className="card">
          <p className="text-sm font-medium text-gray-400">Prizes Paid Out</p>
          <p className="mt-2 text-3xl font-bold text-white">₹{totalPayouts.toLocaleString()}</p>
        </div>
      </div>
    </div>
  )
}
