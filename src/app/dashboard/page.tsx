import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Score, Subscription, Winner, CharityContribution, Charity } from '@/types';

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function daysUntilEndOfMonth() {
  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const diff = endOfMonth.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Fetch all dashboard data in parallel
  const [
    { data: subscription },
    { data: scores },
    { data: winners },
    { data: contributions },
    { data: profile },
  ] = await Promise.all([
    supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('scores')
      .select('*')
      .eq('user_id', user.id)
      .order('played_date', { ascending: false })
      .limit(5),
    supabase
      .from('winners')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('charity_contributions')
      .select('*, charities(name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase.from('profiles').select('*').eq('id', user.id).single(),
  ]);

  const sub = subscription as Subscription | null;
  const scoreList = (scores || []) as Score[];
  const winnerList = (winners || []) as Winner[];
  const contributionList = (contributions || []) as (CharityContribution & {
    charities: { name: string } | null;
  })[];

  const totalWon = winnerList.reduce((sum, w) => sum + (w.prize_amount || 0), 0);
  const pendingPayouts = winnerList
    .filter((w) => w.payment_status !== 'paid' && w.verification_status === 'approved')
    .reduce((sum, w) => sum + (w.prize_amount || 0), 0);
  const totalContributed = contributionList.reduce(
    (sum, c) => sum + (c.amount || 0),
    0
  );
  const daysLeft = daysUntilEndOfMonth();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Here&apos;s your dashboard overview.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Subscription Card */}
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-wide text-gray-400 uppercase">Subscription</h2>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
                sub?.status === 'active' || sub?.status === 'trialing'
                  ? 'bg-accent/10 text-accent border border-accent/20'
                  : 'bg-white/5 text-gray-400 border border-white/10'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full shadow-[0_0_8px_currentColor] ${
                  sub?.status === 'active' || sub?.status === 'trialing'
                    ? 'bg-accent'
                    : 'bg-gray-500'
                }`}
              />
              {sub?.status === 'active' || sub?.status === 'trialing'
                ? 'Active'
                : sub?.status || 'None'}
            </span>
          </div>
          {sub ? (
            <>
              <p className="text-2xl font-bold text-white">
                {sub.plan_type === 'yearly' ? '₹4,999/year' : '₹499/month'}
              </p>
              <p className="mt-1 text-xs font-medium text-gray-400">
                Renews {formatDate(sub.current_period_end || '')}
              </p>
              {sub.cancel_at_period_end && (
                <p className="mt-1 text-xs font-medium text-coral">Cancels at period end</p>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-400">No active subscription</p>
          )}
          <a
            href="/dashboard/settings"
            className="mt-6 inline-block text-xs font-bold text-accent hover:text-white transition-colors"
          >
            Manage plan →
          </a>
        </div>

        {/* Scores Snapshot */}
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-wide text-gray-400 uppercase">Your Scores</h2>
            <span className="text-xs font-medium text-gray-400">
              {scoreList.length}/5 entered
            </span>
          </div>
          {scoreList.length > 0 ? (
            <ul className="space-y-3">
              {scoreList.map((score, i) => (
                <li key={score.id} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2 border border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-sm font-bold text-white shadow-inner">
                      {score.score}
                    </span>
                    <span className="text-xs font-medium text-gray-300">
                      {formatDate(score.played_date)}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-accent">
                    #{i + 1}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">No scores entered yet.</p>
          )}
          <a
            href="/dashboard/scores"
            className="mt-6 inline-block text-xs font-bold text-accent hover:text-white transition-colors"
          >
            Manage scores →
          </a>
        </div>

        {/* Next Draw Countdown */}
        <div className="card">
          <h2 className="mb-4 text-sm font-semibold tracking-wide text-gray-400 uppercase">Next Draw</h2>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black tabular-nums text-white tracking-tighter">
              {daysLeft}
            </span>
            <span className="text-sm font-medium text-gray-400">
              {daysLeft === 1 ? 'day' : 'days'} remaining
            </span>
          </div>
          <p className="mt-3 text-xs text-gray-400">
            Draw happens at the end of each month.
          </p>
          <a
            href="/dashboard/draws"
            className="mt-6 inline-block text-xs font-bold text-accent hover:text-white transition-colors"
          >
            View past draws →
          </a>
        </div>

        {/* Charity Contribution */}
        <div className="card relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-coral/10 blur-3xl rounded-full transition-opacity opacity-50 group-hover:opacity-100" />
          <h2 className="mb-4 text-sm font-semibold tracking-wide text-gray-400 uppercase relative z-10">Charity</h2>
          {contributionList.length > 0 ? (
            <div className="relative z-10">
              <p className="text-sm font-bold text-white mb-2">
                {contributionList[0]?.charities?.name || 'Selected charity'}
              </p>
              <p className="mt-2 text-3xl font-black text-coral tracking-tighter">
                {formatCurrency(totalContributed)}
              </p>
              <p className="mt-1 text-xs font-medium text-gray-400">Total contributed</p>
            </div>
          ) : (
            <p className="text-sm text-gray-400 relative z-10">No contributions yet.</p>
          )}
          <a
            href="/dashboard/charity"
            className="mt-6 inline-block text-xs font-bold text-coral hover:text-white transition-colors relative z-10"
          >
            Charity settings →
          </a>
        </div>

        {/* Winnings Summary */}
        <div className="card">
          <h2 className="mb-4 text-sm font-semibold tracking-wide text-gray-400 uppercase">Winnings</h2>
          <p className="text-3xl font-black text-white tracking-tighter">
            {formatCurrency(totalWon)}
          </p>
          <p className="mt-1 text-xs font-medium text-gray-400">Total won</p>
          {pendingPayouts > 0 && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-coral/10 px-2.5 py-1 text-xs font-bold text-coral border border-coral/20">
              <span className="h-1.5 w-1.5 rounded-full bg-coral shadow-[0_0_5px_currentColor]" />
              {formatCurrency(pendingPayouts)} pending payout
            </div>
          )}
          <br/>
          <a
            href="/dashboard/winnings"
            className="mt-6 inline-block text-xs font-bold text-accent hover:text-white transition-colors"
          >
            View details →
          </a>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h2 className="mb-4 text-sm font-semibold tracking-wide text-gray-400 uppercase">
            Recent Activity
          </h2>
          <ul className="space-y-4">
            {scoreList.slice(0, 3).map((s) => (
              <li key={s.id} className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-500 shadow-[0_0_5px_currentColor]" />
                <div>
                  <p className="text-sm text-gray-300">
                    Score <span className="font-bold text-white">{s.score}</span> entered
                  </p>
                  <p className="text-xs font-medium text-gray-500 mt-0.5">
                    {formatDate(s.played_date)}
                  </p>
                </div>
              </li>
            ))}
            {winnerList.slice(0, 2).map((w) => (
              <li key={w.id} className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent shadow-[0_0_8px_currentColor]" />
                <div>
                  <p className="text-sm text-gray-300">
                    Won{' '}
                    <span className="font-bold text-accent">
                      {formatCurrency(w.prize_amount)}
                    </span>{' '}
                    ({w.match_count}-match)
                  </p>
                  <p className="text-xs font-medium text-gray-500 mt-0.5">
                    {formatDate(w.created_at)}
                  </p>
                </div>
              </li>
            ))}
            {scoreList.length === 0 && winnerList.length === 0 && (
              <li className="text-sm text-gray-400">No recent activity.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
