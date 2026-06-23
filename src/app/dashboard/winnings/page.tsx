import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function WinningsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch user's wins
  const { data: wins } = await supabase
    .from('winners')
    .select(`
      *,
      draws (
        draw_month,
        numbers,
        total_pool
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">My Winnings</h1>
        <p className="mt-2 text-sm text-gray-400">Check your match results and prizes from the monthly draws.</p>
      </div>

      <div className="space-y-6">
        {!wins || wins.filter((w) => w.draws).length === 0 ? (
          <div className="card text-center py-12 border-dashed border-white/20 bg-transparent">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-lg font-bold text-white mb-2">No winnings yet</h3>
            <p className="text-sm font-medium text-gray-400">Keep logging your scores and wait for the next monthly draw!</p>
          </div>
        ) : (
          wins.filter((w) => w.draws).map((win) => (
            <div key={win.id} className="card flex flex-col md:flex-row md:items-center justify-between border-l-4 border-l-accent gap-6">
              <div>
                <p className="text-xs font-bold text-accent uppercase tracking-wider mb-2">{win.draws?.draw_month ?? 'Unknown'} Draw</p>
                <h3 className="text-2xl font-bold text-white tracking-tight">{win.match_count} Number Match!</h3>
                <p className="text-sm font-medium text-gray-400 mt-2">
                  You matched: <span className="font-mono font-bold bg-white/10 px-2.5 py-1 rounded-md text-white border border-white/10 ml-1 shadow-inner">{win.matched_numbers.join(', ')}</span>
                </p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Prize Won</p>
                <p className="text-4xl font-black text-accent tracking-tighter shadow-[0_0_20px_rgba(59,130,246,0.3)] rounded-full inline-block px-1">₹{win.prize_amount}</p>
                
                <div className="mt-4">
                  {!win.proof_url ? (
                    <Link 
                      href={`/dashboard/winnings/claim/${win.id}`}
                      className="btn-primary inline-block text-sm py-2 px-5 shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                    >
                      Claim Prize
                    </Link>
                  ) : (
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border uppercase tracking-wider ${win.payment_status === 'paid' ? 'bg-accent/10 text-accent border-accent/30' : 'bg-coral/10 text-coral border-coral/30'}`}>
                      {win.payment_status === 'paid' ? 'Paid out' : 'Pending Verification'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
