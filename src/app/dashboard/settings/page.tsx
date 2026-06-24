import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { signOut } from '@/app/(auth)/actions'
import { SubmitButton } from '@/components/SubmitButton'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: subscriptions, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3)

  const subscription = subscriptions?.[0]

  const isActive = subscription?.status === 'active' || 
                  (subscription?.current_period_end && new Date(subscription.current_period_end) > new Date())

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Settings</h1>
        <p className="mt-2 text-sm text-gray-400">Manage your subscription and account details.</p>
      </div>

      <div className="card">
        <h2 className="text-sm font-semibold tracking-wide text-gray-400 uppercase mb-4">Subscription</h2>
        
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Status</span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${isActive ? 'bg-accent/10 text-accent border-accent/20' : 'bg-coral/10 text-coral border-coral/20'}`}>
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            {subscription?.plan_type && (
              <div className="text-right">
                <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Plan</span>
                <span className="font-bold text-white capitalize text-lg">{subscription.plan_type}</span>
              </div>
            )}
          </div>
          
          {subscription?.current_period_end && (
            <div className="text-sm font-medium text-gray-400 border-t border-white/10 pt-4 mt-2">
              Current period ends on <span className="text-white">{new Date(subscription.current_period_end).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-4">
          {!isActive ? (
            <form action="/api/stripe/checkout" method="POST" className="flex flex-wrap gap-4">
              <button name="plan" value="monthly" type="submit" className="btn-primary">
                Subscribe Monthly (₹499)
              </button>
              <button name="plan" value="yearly" type="submit" className="btn-accent">
                Subscribe Yearly (₹4999)
              </button>
            </form>
          ) : (
            <form action="/api/stripe/portal" method="POST">
              <button type="submit" className="btn-primary">
                Manage Billing
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="text-sm font-semibold tracking-wide text-gray-400 uppercase mb-4">Charity Settings</h2>
        <p className="text-sm font-medium text-gray-400 mb-6">
          Manage your chosen charity and adjust your contribution rate.
        </p>
        <a href="/dashboard/charity" className="btn-primary inline-block">
          Manage Charity Preferences ↗
        </a>
      </div>

      <div className="card border-l-4 border-l-red-500/50">
        <h2 className="text-sm font-semibold tracking-wide text-gray-400 uppercase mb-4">Account Actions</h2>
        <p className="text-sm font-medium text-gray-400 mb-6">
          Sign out of your Hero Draw account.
        </p>
        <form action={signOut}>
          <SubmitButton className="bg-red-500/10 text-red-400 border border-red-500/20 px-6 py-2 rounded-lg font-medium hover:bg-red-500/20 transition-colors" loadingText="Signing out...">
            Sign Out
          </SubmitButton>
        </form>
      </div>
    </div>
  )
}
