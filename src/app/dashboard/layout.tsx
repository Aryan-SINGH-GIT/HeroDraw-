'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Profile, Subscription } from '@/types';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: '◻' },
  { href: '/dashboard/scores', label: 'Scores', icon: '⬡' },
  { href: '/dashboard/draws', label: 'Draws', icon: '◎' },
  { href: '/dashboard/winnings', label: 'Winnings', icon: '◇' },
  { href: '/dashboard/charity', label: 'Charity', icon: '♡' },
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙' },
];

function StatusBadge({ status }: { status: string }) {
  const isActive = status === 'active' || status === 'trialing';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
        isActive
          ? 'bg-accent/10 text-accent border border-accent/20'
          : 'bg-white/5 text-gray-400 border border-white/10'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full shadow-[0_0_8px_currentColor] ${
          isActive ? 'bg-accent' : 'bg-gray-500'
        }`}
      />
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setProfile(profileData);
      setSubscription(subData);
      setLoading(false);
    }

    loadUser();
  }, [router]);

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent/20 border-t-accent shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background font-[var(--font-geist-sans)] text-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-white/10 bg-surface/30 backdrop-blur-xl lg:flex">
        {/* Brand */}
        <div className="flex h-16 items-center border-b border-white/10 px-6">
          <Link href="/" className="text-xl font-bold tracking-tighter text-white">
            Hero<span className="text-accent">Draw</span>
          </Link>
        </div>

        {/* User Info */}
        <div className="border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white shadow-inner">
              {profile?.full_name?.charAt(0)?.toUpperCase() ||
                profile?.email?.charAt(0)?.toUpperCase() ||
                '?'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">
                {profile?.full_name || 'User'}
              </p>
              <p className="truncate text-xs text-gray-400">{profile?.email}</p>
            </div>
          </div>
          <div className="mt-3">
            <StatusBadge status={subscription?.status || 'inactive'} />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-accent/10 font-bold text-accent shadow-[inset_2px_0_0_0_currentColor]'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="text-base leading-none">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
            {profile?.role === 'admin' && (
              <li className="pt-2 mt-2 border-t border-white/10">
                <Link
                  href="/admin"
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all duration-200 text-coral hover:bg-coral/10 shadow-[inset_2px_0_0_0_transparent] hover:shadow-[inset_2px_0_0_0_currentColor]"
                >
                  <span className="text-base leading-none">⚡</span>
                  Admin Panel
                </Link>
              </li>
            )}
          </ul>
        </nav>

        {/* Subscription info footer */}
        <div className="border-t border-white/10 px-6 py-5 bg-black/20">
          <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
            {subscription?.plan_type === 'yearly'
              ? '₹4,999/year'
              : subscription?.plan_type === 'monthly'
              ? '₹499/month'
              : 'No plan'}
          </p>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-64 border-r border-white/10 bg-background shadow-2xl">
            <div className="flex h-14 items-center justify-between border-b border-white/10 px-5">
              <span className="text-sm font-bold tracking-tight text-white">
                Hero<span className="text-accent">Draw</span>
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-5 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white">
                  {profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white">
                    {profile?.full_name || 'User'}
                  </p>
                </div>
              </div>
              <div className="mt-2">
                <StatusBadge status={subscription?.status || 'inactive'} />
              </div>
            </div>
            <nav className="px-3 py-2">
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                        isActive(item.href)
                          ? 'bg-accent/10 font-bold text-accent shadow-[inset_2px_0_0_0_currentColor]'
                          : 'text-gray-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span className="text-base leading-none">{item.icon}</span>
                      {item.label}
                    </Link>
                  </li>
                ))}
                {profile?.role === 'admin' && (
                  <li className="pt-2 mt-2 border-t border-white/10">
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors text-coral hover:bg-coral/10 shadow-[inset_2px_0_0_0_transparent] hover:shadow-[inset_2px_0_0_0_currentColor]"
                    >
                      <span className="text-base leading-none">⚡</span>
                      Admin Panel
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        {/* Top bar (mobile) */}
        <header className="flex h-14 items-center justify-between border-b border-white/10 bg-surface/50 backdrop-blur-xl px-4 lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 text-gray-400 hover:text-white"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          <span className="text-sm font-bold tracking-tight text-white">Hero<span className="text-accent">Draw</span></span>
          <div className="w-8" />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>

        {/* Mobile bottom nav */}
        <nav className="border-t border-white/10 bg-surface/50 backdrop-blur-xl lg:hidden">
          <ul className="flex items-center justify-around pb-safe">
            {navItems.slice(0, 5).map((item) => (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  className={`flex flex-col items-center gap-1 px-2 py-3 text-[10px] transition-colors ${
                    isActive(item.href)
                      ? 'font-bold text-accent bg-accent/5'
                      : 'text-gray-400 font-medium'
                  }`}
                >
                  <span className="text-lg leading-none">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
