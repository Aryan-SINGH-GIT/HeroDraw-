import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Charity } from '@/types';

export default async function CharityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch all active charities
  const { data: charitiesData } = await supabase
    .from('charities')
    .select('*')
    .eq('is_active', true)
    .order('name');

  const charities = (charitiesData || []) as Charity[];

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('charity_id, charity_percentage')
    .eq('id', user.id)
    .single();

  const currentPercentage = profile?.charity_percentage || 10;
  const selectedCharityId = profile?.charity_id || '';

  // Fetch lifetime contributions
  const { data: contributions } = await supabase
    .from('charity_contributions')
    .select('amount, created_at, charities(name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const lifetimeTotal = contributions?.reduce((sum, c) => sum + Number(c.amount), 0) || 0;

  async function updateCharitySettings(formData: FormData) {
    'use server';
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const charityId = formData.get('charityId') as string;
    const percentage = parseInt(formData.get('percentage') as string, 10);

    if (percentage < 10) return; // Enforce minimum 10%

    await supabase
      .from('profiles')
      .update({
        charity_id: charityId || null,
        charity_percentage: percentage,
      })
      .eq('id', user.id);

    revalidatePath('/dashboard/charity');
    revalidatePath('/dashboard');
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Charity Settings</h1>
        <p className="mt-1 text-sm text-gray-400">
          Choose the cause you want to support and adjust your contribution rate.
        </p>
      </div>

      <form action={updateCharitySettings} className="space-y-8">
        {/* Contribution Slider */}
        {/* Contribution Slider */}
        <div className="card">
          <div className="mb-4 flex justify-between items-start">
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-gray-400 uppercase">Contribution Rate</h2>
              <p className="mt-1 text-xs font-medium text-gray-400">
                What percentage of your winnings should go directly to your chosen charity? (Minimum 10%)
              </p>
            </div>
            
            <div className="text-right ml-4 pl-4 border-l border-white/10 flex-shrink-0">
              <span className="block text-xs font-bold text-accent uppercase tracking-wider mb-1">Lifetime Impact</span>
              <span className="text-3xl font-black text-white tracking-tighter">₹{lifetimeTotal.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-6 mt-6 pt-4 border-t border-white/10">
            <input
              type="range"
              name="percentage"
              min="10"
              max="100"
              defaultValue={currentPercentage}
              className="flex-1 accent-accent h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-2xl font-bold tabular-nums text-white w-16 text-right">
              {currentPercentage}%
            </span>
          </div>
        </div>

        {/* Charity Selection Grid */}
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-gray-400 uppercase mb-4">Select a Charity</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {charities.length > 0 ? (
              charities.map((charity) => {
                const isSelected = selectedCharityId === charity.id;
                return (
                  <label
                    key={charity.id}
                    className={`relative flex cursor-pointer rounded-xl border p-5 transition-all ${
                      isSelected
                        ? 'border-accent bg-accent/10 ring-1 ring-accent shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <input
                      type="radio"
                      name="charityId"
                      value={charity.id}
                      defaultChecked={isSelected}
                      className="sr-only"
                    />
                    <div className="flex w-full flex-col">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white">
                          {charity.name}
                        </span>
                        {isSelected && (
                          <svg
                            className="h-5 w-5 text-accent"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      {charity.description && (
                        <span className="mt-2 flex items-center text-xs font-medium text-gray-400">
                          {charity.description}
                        </span>
                      )}
                      {charity.website_url && (
                        <a
                          href={charity.website_url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-4 text-[10px] font-bold uppercase tracking-wider text-accent hover:text-white transition-colors"
                        >
                          Visit Website ↗
                        </a>
                      )}
                    </div>
                  </label>
                );
              })
            ) : (
              <div className="col-span-full py-8 text-center text-sm font-medium text-gray-400 rounded-xl border border-dashed border-white/20 bg-transparent">
                No charities available right now. We are partnering with organizations soon.
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="btn-primary"
          >
            Save Charity Preferences
          </button>
        </div>
      </form>

      {/* Contribution History */}
      <div className="card mt-8">
        <h2 className="text-sm font-semibold tracking-wide text-gray-400 uppercase mb-4">Contribution History</h2>
        
        {!contributions || contributions.length === 0 ? (
          <p className="text-sm font-medium text-gray-500 py-4">No contributions yet. Win a draw to make your first impact!</p>
        ) : (
          <div className="space-y-4">
            {contributions.map((contribution, idx) => (
              <div key={idx} className="flex justify-between items-center py-3 border-b border-white/10 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-bold text-gray-200">{(contribution.charities as any)?.name || 'Unknown Charity'}</p>
                  <p className="text-xs font-medium text-gray-500 mt-1">
                    {new Date(contribution.created_at).toLocaleDateString('en-IN', { 
                      year: 'numeric', month: 'short', day: 'numeric' 
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-accent">+ ₹{Number(contribution.amount).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
