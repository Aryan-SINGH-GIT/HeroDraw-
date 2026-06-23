import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { submitClaim } from '../actions'

export default async function ClaimPrizePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return redirect('/login')

  // Fetch the win record
  const { data: win } = await supabase
    .from('winners')
    .select(`
      *,
      draws ( draw_month, numbers ),
      profiles ( charity_percentage, charity_id )
    `)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!win) return redirect('/dashboard/winnings')
  
  // If already claimed, redirect back
  if (win.proof_url) return redirect('/dashboard/winnings')

  const charityPercentage = win.profiles?.charity_percentage || 10
  const charityAmount = Math.floor(win.prize_amount * (charityPercentage / 100))
  const userTakehome = win.prize_amount - charityAmount

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">Claim Your Prize</h1>
        <p className="mt-2 text-sm text-secondary">Upload a photo of your scorecard to verify your winning numbers.</p>
      </div>

      <div className="card border-l-4 border-l-accent gap-6">
        <h2 className="text-lg font-bold text-white mb-4">Prize Breakdown</h2>
        
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Gross Prize Amount</span>
            <span className="font-bold text-white">₹{win.prize_amount}</span>
          </div>
          <div className="flex justify-between text-sm text-accent">
            <span>Charity Contribution ({charityPercentage}%)</span>
            <span>- ₹{charityAmount}</span>
          </div>
          <div className="pt-3 border-t border-white/10 flex justify-between font-bold text-lg text-white">
            <span>Your Payout</span>
            <span className="text-xl font-black text-accent shadow-[0_0_15px_rgba(99,102,241,0.2)] rounded-full px-1">₹{userTakehome}</span>
          </div>
        </div>
      </div>

      <form action={submitClaim} className="card space-y-6">
        <input type="hidden" name="winId" value={win.id} />
        
        <div>
          <label className="block text-sm font-bold text-white mb-2">
            Upload Scorecard Photo
          </label>
          <p className="text-xs font-medium text-gray-400 mb-4">
            Please upload a clear picture of your physical scorecard showing your matched numbers: 
            <span className="font-mono font-bold bg-white/10 px-2 py-1 rounded text-white border border-white/10 ml-1">{win.matched_numbers.join(', ')}</span>
          </p>
          
          <div className="mt-2 flex justify-center rounded-lg border border-dashed border-white/20 bg-white/5 px-6 py-10 hover:border-accent/50 transition-colors">
            <div className="text-center">
              <div className="mt-4 flex text-sm leading-6 text-gray-400 justify-center">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md bg-transparent font-bold text-accent focus-within:outline-none focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2 hover:text-indigo-400"
                >
                  <span>Upload a file</span>
                  <input id="file-upload" name="proof" type="file" accept="image/*" className="sr-only" required />
                </label>
              </div>
              <p className="text-xs leading-5 font-medium text-gray-500 mt-2">PNG, JPG, GIF up to 5MB</p>
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full btn-primary"
        >
          Submit Claim for Verification
        </button>
      </form>
    </div>
  )
}
