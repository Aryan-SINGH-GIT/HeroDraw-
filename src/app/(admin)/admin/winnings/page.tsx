import { createClient } from '@/lib/supabase/server'
import { adminAuthClient } from '@/lib/supabase/admin'
import { processClaim } from './actions'

export const dynamic = 'force-dynamic'

export default async function AdminWinningsPage() {
  const supabase = await createClient()

  // Fetch all pending winners
  const { data: claims, error } = await adminAuthClient
    .from('winners')
    .select(`
      *,
      profiles ( email, full_name ),
      draws ( draw_month, numbers )
    `)
    .eq('verification_status', 'pending')
    .not('proof_url', 'is', null) // Only show ones that have uploaded proof
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching claims:', error)
  }

  // Fetch recently verified winners for history
  const { data: history } = await adminAuthClient
    .from('winners')
    .select(`
      *,
      profiles ( email, full_name ),
      draws ( draw_month )
    `)
    .in('verification_status', ['approved', 'rejected'])
    .order('verified_at', { ascending: false })
    .limit(10)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Verify Winners</h1>
        <p className="mt-1 text-sm text-gray-400">Review scorecard proofs and approve payouts for winners.</p>
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 bg-white/5 -mx-6 -mt-6 mb-6">
          <h2 className="text-lg font-medium text-white">Pending Verification Queue</h2>
        </div>
        
        {claims?.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No pending claims to verify.</div>
        ) : (
          <div className="divide-y divide-white/10 -mx-6">
            {claims?.filter((c) => c.draws).map((claim) => (
              <div key={claim.id} className="p-6 flex flex-col md:flex-row gap-6 items-start">
                {/* Proof Image */}
                <div className="w-full md:w-1/3 flex-shrink-0 border border-white/10 rounded-lg overflow-hidden bg-white/5">
                  <a href={claim.proof_url} target="_blank" rel="noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={claim.proof_url} alt="Scorecard Proof" className="w-full h-auto object-contain max-h-64 cursor-pointer hover:opacity-90 transition-opacity" />
                  </a>
                  <div className="p-2 text-center text-xs text-gray-500 bg-surface/50 border-t border-white/10">
                    Click to view full size
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{claim.profiles?.full_name || 'Anonymous User'}</h3>
                    <p className="text-sm text-gray-400">{claim.profiles?.email}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-white/5 border border-white/10 p-4 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase">Draw Month</p>
                      <p className="font-semibold text-white">{claim.draws?.draw_month ?? 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase">Prize Amount</p>
                      <p className="font-semibold text-accent">₹{claim.prize_amount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase">Matched Numbers</p>
                      <p className="font-mono bg-white/5 px-2 py-1 rounded inline-block border border-white/10 mt-1 text-white">{claim.matched_numbers.join(', ')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase">Draw Numbers</p>
                      <p className="font-mono bg-white/5 px-2 py-1 rounded inline-block border border-white/10 mt-1 text-white">{claim.draws?.numbers?.join(', ') ?? '—'}</p>
                    </div>
                  </div>

                  <form action={processClaim} className="flex gap-3 pt-2">
                    <input type="hidden" name="winId" value={claim.id} />
                    <button type="submit" name="action" value="approve" className="flex-1 bg-green-600/20 text-green-400 border border-green-500/30 px-4 py-2 rounded-lg font-medium hover:bg-green-600/30 transition-colors text-center">
                      Approve & Mark Paid
                    </button>
                    <button type="submit" name="action" value="reject" className="flex-1 bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg font-medium hover:bg-red-500/30 transition-colors text-center">
                      Reject Proof
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History */}
      <div className="bg-surface/50 rounded-xl shadow-sm border border-white/5 overflow-hidden backdrop-blur-md mt-8">
        <div className="px-6 py-4 border-b border-white/10 bg-white/5">
          <h2 className="text-sm font-medium text-white uppercase tracking-wider">Recently Processed</h2>
        </div>
        <table className="w-full text-left text-sm text-gray-300">
          <tbody className="divide-y divide-white/10">
            {history?.filter((h) => h.draws).map((item) => (
              <tr key={item.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-white">{item.profiles?.full_name || item.profiles?.email}</div>
                  <div className="text-xs text-gray-400">{item.draws?.draw_month ?? 'Unknown'}</div>
                </td>
                <td className="px-6 py-4 font-mono text-gray-300">{item.matched_numbers.join(', ')}</td>
                <td className="px-6 py-4 text-right font-medium text-white">₹{item.prize_amount}</td>
                <td className="px-6 py-4 text-right">
                  {item.verification_status === 'approved' ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">Approved</span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">Rejected</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
