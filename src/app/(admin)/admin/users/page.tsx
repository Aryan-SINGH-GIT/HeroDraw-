import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const supabase = await createClient()

  // Fetch all profiles along with their latest subscription status and selected charity
  const { data: users, error } = await supabase
    .from('profiles')
    .select(`
      *,
      charities ( name ),
      subscriptions ( status, plan_type )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching users:', error)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Users & Subscriptions</h1>
          <p className="mt-1 text-sm text-gray-400">Manage your platform's user base and monitor their active status.</p>
        </div>
      </div>

      <div className="bg-surface/50 rounded-xl shadow-sm border border-white/5 overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-white/5 text-white font-medium border-b border-white/10">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Charity Selection</th>
                <th className="px-6 py-4">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {users?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                users?.map((user) => {
                  // Get the most relevant subscription (assuming one active per user)
                  const sub = user.subscriptions && user.subscriptions.length > 0 
                    ? user.subscriptions[0] 
                    : null;
                  
                  const isActive = sub?.status === 'active';

                  return (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{user.full_name || 'Anonymous User'}</div>
                        <div className="text-xs text-gray-400">{user.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        {isActive ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active Subscriber
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {user.charities?.name ? (
                          <div>
                            <div className="text-white">{user.charities.name}</div>
                            <div className="text-xs text-gray-400">{user.charity_percentage}% contribution</div>
                          </div>
                        ) : (
                          <span className="text-gray-500 italic">None selected</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
