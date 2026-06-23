import { createClient } from '@/lib/supabase/server'
import { simulateDraw, publishDraw, discardSimulation } from './actions'
import { SubmitButton } from '@/components/SubmitButton'

export default async function AdminDrawsPage() {
  const supabase = await createClient()

  // Fetch past draws
  const { data: draws } = await supabase
    .from('draws')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  // Fetch pending simulation
  const { data: simulation } = await supabase
    .from('draws')
    .select('*')
    .eq('status', 'simulated')
    .single()

  // Fetch simulation winners if it exists
  let simulationWinners = []
  if (simulation) {
    const { data } = await supabase
      .from('winners')
      .select('match_count, prize_amount')
      .eq('draw_id', simulation.id)
    simulationWinners = data || []
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-primary">Draw Engine</h1>
          <p className="mt-2 text-sm text-secondary">Execute monthly draws and manage winners.</p>
        </div>
        
        <form action={simulateDraw} className="flex gap-4">
          <input 
            type="text" 
            name="monthName" 
            placeholder="e.g. June 2026"
            required
            className="input-field max-w-[150px]"
          />
          <select name="drawType" className="input-field max-w-[150px]" required>
            <option value="random">Random</option>
            <option value="algorithmic">Algorithmic</option>
            <option value="test-winner-draw">Demo Winner (Guaranteed)</option>
          </select>
          <SubmitButton className="btn-accent" loadingText="Running...">
            Run Simulation
          </SubmitButton>
        </form>
      </div>

      {simulation && (
        <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-amber-400">Pending Simulation: {simulation.draw_month}</h2>
              <p className="text-sm text-amber-200/70">Review the simulated results before publishing officially.</p>
            </div>
            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-bold uppercase tracking-wider">
              {simulation.draw_type}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-surface/50 border border-white/5 p-4 rounded-lg shadow-sm backdrop-blur-md">
              <p className="text-xs font-medium text-gray-400 uppercase">Winning Numbers</p>
              <p className="mt-1 text-lg font-mono font-bold text-white">{simulation.numbers.join(', ')}</p>
            </div>
            <div className="bg-surface/50 border border-white/5 p-4 rounded-lg shadow-sm backdrop-blur-md">
              <p className="text-xs font-medium text-gray-400 uppercase">Total Pool Generated</p>
              <p className="mt-1 text-lg font-bold text-accent">₹{simulation.total_pool}</p>
            </div>
            <div className="bg-surface/50 border border-white/5 p-4 rounded-lg shadow-sm backdrop-blur-md">
              <p className="text-xs font-medium text-gray-400 uppercase">Jackpot Pool</p>
              <p className="mt-1 text-lg font-bold text-white">₹{simulation.jackpot_pool}</p>
            </div>
            <div className="bg-surface/50 border border-white/5 p-4 rounded-lg shadow-sm backdrop-blur-md">
              <p className="text-xs font-medium text-gray-400 uppercase">Total Winners</p>
              <p className="mt-1 text-lg font-bold text-white">{simulationWinners.length}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <form action={publishDraw}>
              <input type="hidden" name="drawId" value={simulation.id} />
              <SubmitButton className="bg-green-600/20 text-green-400 border border-green-500/30 px-6 py-2 rounded-lg font-medium hover:bg-green-600/30 transition-colors" loadingText="Publishing...">
                Approve & Publish Draw
              </SubmitButton>
            </form>
            <form action={discardSimulation}>
              <input type="hidden" name="drawId" value={simulation.id} />
              <SubmitButton className="bg-surface/50 border border-white/10 text-gray-300 px-6 py-2 rounded-lg font-medium hover:bg-white/5 hover:text-white transition-colors" loadingText="Discarding...">
                Discard & Try Again
              </SubmitButton>
            </form>
          </div>
        </div>
      )}

      <div className="bg-surface/50 rounded-lg border border-white/5 overflow-hidden backdrop-blur-md">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Draw Month</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Winning Numbers</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Total Pool</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {draws?.map((draw) => (
              <tr key={draw.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                  {draw.draw_month}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {new Date(draw.draw_date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <span className="font-mono bg-white/5 px-2 py-1 rounded tracking-widest text-white border border-white/10">
                    {draw.numbers.join(' - ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-accent">
                  ₹{draw.total_pool}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {draw.status}
                  </span>
                </td>
              </tr>
            ))}
            {(!draws || draws.length === 0) && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-secondary text-sm">
                  No draws have been executed yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
