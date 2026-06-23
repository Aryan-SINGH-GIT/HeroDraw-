import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is an admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard') // redirect non-admins to their dashboard
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-surface/50 border-r border-white/5 flex-shrink-0 backdrop-blur-xl">
        <div className="p-6">
          <Link href="/" className="text-2xl font-bold text-white tracking-tight">
            Hero Draw
          </Link>
          <span className="ml-2 text-xs font-semibold bg-accent/10 text-accent px-2 py-1 rounded-full">Admin</span>
        </div>
        <nav className="px-4 space-y-1">
          <Link href="/admin" className="block px-4 py-3 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
            Overview
          </Link>
          <Link href="/admin/users" className="block px-4 py-3 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
            Users & Subscriptions
          </Link>
          <Link href="/admin/draws" className="block px-4 py-3 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
            Draw Engine
          </Link>
          <Link href="/admin/winnings" className="block px-4 py-3 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
            Verify Winners
          </Link>
          <Link href="/admin/charities" className="block px-4 py-3 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
            Manage Charities
          </Link>
          <Link href="/dashboard" className="block px-4 py-3 mt-8 rounded-lg text-sm text-gray-500 hover:text-gray-300 transition-colors">
            &larr; Back to User Dashboard
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
