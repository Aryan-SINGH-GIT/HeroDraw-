import { createClient } from '@/lib/supabase/server'
import { toggleCharityStatus, addCharity } from './actions'

export const dynamic = 'force-dynamic'

export default async function AdminCharitiesPage() {
  const supabase = await createClient()

  const { data: charities, error } = await supabase
    .from('charities')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching charities:', error)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Manage Charities</h1>
        <p className="mt-1 text-sm text-gray-400">Add new charities or toggle their active status.</p>
      </div>

      <div className="card">
        <h2 className="text-lg font-medium text-white mb-4">Add New Charity</h2>
        <form action={addCharity} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-sm font-medium text-gray-300">Charity Name</label>
            <input type="text" name="name" required className="input-field mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Description</label>
            <textarea name="description" rows={3} className="input-field mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Website URL</label>
            <input type="url" name="websiteUrl" className="input-field mt-1" />
          </div>
          <button type="submit" className="btn-accent">
            Add Charity
          </button>
        </form>
      </div>

      <div className="bg-surface/50 rounded-xl shadow-sm border border-white/5 overflow-hidden backdrop-blur-md">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-white/5 text-white font-medium border-b border-white/10">
            <tr>
              <th className="px-6 py-4">Charity</th>
              <th className="px-6 py-4">Website</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {charities?.map((charity) => (
              <tr key={charity.id} className={`hover:bg-white/5 transition-colors ${!charity.is_active ? 'opacity-50' : ''}`}>
                <td className="px-6 py-4">
                  <div className="font-medium text-white">{charity.name}</div>
                  <div className="text-xs text-gray-400 max-w-xs truncate">{charity.description}</div>
                </td>
                <td className="px-6 py-4">
                  {charity.website_url ? (
                    <a href={charity.website_url} target="_blank" rel="noreferrer" className="text-accent hover:underline">Link ↗</a>
                  ) : <span className="text-gray-500">—</span>}
                </td>
                <td className="px-6 py-4">
                  {charity.is_active ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">Active</span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">Inactive</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <form action={toggleCharityStatus}>
                    <input type="hidden" name="charityId" value={charity.id} />
                    <input type="hidden" name="currentStatus" value={charity.is_active.toString()} />
                    <button type="submit" className={`text-xs font-medium ${charity.is_active ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'}`}>
                      {charity.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
