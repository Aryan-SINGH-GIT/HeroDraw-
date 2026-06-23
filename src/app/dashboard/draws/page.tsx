import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DrawsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch active scores
  const { data: scores } = await supabase
    .from('scores')
    .select('score')
    .eq('user_id', user.id)
    .order('played_date', { ascending: false })
    .limit(5)

  const activeScores = scores?.map(s => s.score) || []

  // Fetch published draws
  const { data: draws } = await supabase
    .from('draws')
    .select('*')
    .eq('status', 'published')
    .order('draw_date', { ascending: false })

  // Fetch user's wins
  const { data: wins } = await supabase
    .from('winners')
    .select('*, draws(draw_month, draw_date)')
    .eq('user_id', user.id)

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Draws & Prizes</h1>
        <p className="mt-2 text-sm text-gray-400">See past results and your active numbers for the next draw.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="card border-accent/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-3xl rounded-full transition-opacity opacity-50 group-hover:opacity-100" />
            <h2 className="text-sm font-semibold tracking-wide text-gray-400 uppercase mb-4 relative z-10">Your Active Numbers</h2>
            <p className="text-sm text-gray-300 mb-6 relative z-10">These 5 numbers will be entered into the next monthly draw.</p>
            
            <div className="flex flex-wrap gap-3 relative z-10">
              {activeScores.length > 0 ? (
                activeScores.map((score, idx) => (
                  <div key={idx} className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 text-white flex items-center justify-center font-bold text-xl shadow-inner">
                    {score}
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-400">No active scores. Log scores to participate!</div>
              )}
              {/* Fill remaining slots if less than 5 */}
              {Array.from({ length: 5 - activeScores.length }).map((_, idx) => (
                <div key={`empty-${idx}`} className="w-12 h-12 rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center text-white/20">
                  -
                </div>
              ))}
            </div>
            {activeScores.length < 5 && (
              <div className="mt-6 relative z-10">
                <Link href="/dashboard/scores" className="text-xs font-bold text-accent hover:text-white transition-colors">
                  Log {5 - activeScores.length} more score{5 - activeScores.length > 1 ? 's' : ''} to maximize your chances →
                </Link>
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="text-sm font-semibold tracking-wide text-gray-400 uppercase mb-4">Your Wins</h2>
            {wins && wins.filter((w) => w.draws).length > 0 ? (
              <div className="space-y-4">
                {wins.filter((w) => w.draws).map((win) => (
                  <div key={win.id} className="p-4 border border-accent/20 bg-accent/5 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-white">
                        {win.match_count} Matches
                      </span>
                      <span className="font-bold text-accent text-lg">₹{win.prize_amount}</span>
                    </div>
                    <div className="text-xs font-medium text-gray-400 mb-4">
                      {(win.draws as any)?.draw_month ?? 'Unknown'} Draw
                    </div>
                    {win.verification_status === 'pending' ? (
                      <Link href={`/dashboard/winnings/claim/${win.id}`} className="btn-accent text-xs py-2 px-3 block text-center shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                        Claim Prize (Upload Proof)
                      </Link>
                    ) : (
                      <div className="text-xs font-bold text-accent bg-accent/10 border border-accent/20 py-2 px-3 rounded-lg text-center uppercase tracking-wider">
                        Status: {win.verification_status}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400 text-sm">
                You haven't won any prizes yet. Keep playing!
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          <h2 className="text-lg font-bold text-white mb-6">Past Draws</h2>
          
          {draws && draws.length > 0 ? (
            <div className="space-y-6">
              {draws.map((draw) => (
                <div key={draw.id} className="card">
                  <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-5">
                    <div>
                      <h3 className="text-xl font-bold text-white">{draw.draw_month} Draw</h3>
                      <p className="text-xs font-medium text-gray-400 mt-1">{new Date(draw.draw_date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Total Pool</div>
                      <div className="text-2xl font-black text-white">₹{draw.total_pool}</div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <div className="text-xs font-semibold tracking-wide text-gray-400 uppercase mb-4">Winning Numbers:</div>
                    <div className="flex flex-wrap gap-3">
                      {draw.numbers.map((num: number, idx: number) => {
                        const isMatch = activeScores.includes(num);
                        return (
                          <div 
                            key={idx} 
                            className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl transition-all
                              ${isMatch ? 'bg-accent text-white ring-2 ring-accent/50 shadow-[0_0_15px_rgba(59,130,246,0.6)]' : 'bg-white/5 border border-white/10 text-gray-400'}`}
                          >
                            {num}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
                    <div className="text-center">
                      <div className="text-xs font-medium text-gray-400 mb-1">5 Matches (40%)</div>
                      <div className="font-bold text-white">₹{draw.jackpot_pool}</div>
                    </div>
                    <div className="text-center border-l border-r border-white/10">
                      <div className="text-xs font-medium text-gray-400 mb-1">4 Matches (35%)</div>
                      <div className="font-bold text-white">₹{draw.four_match_pool}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-medium text-gray-400 mb-1">3 Matches (25%)</div>
                      <div className="font-bold text-white">₹{draw.three_match_pool}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card border-dashed border-white/20 p-12 text-center bg-transparent">
              <h3 className="text-lg font-bold text-white mb-2">No Draws Yet</h3>
              <p className="text-sm text-gray-400">The first monthly draw hasn't happened yet. Make sure your scores are logged!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
