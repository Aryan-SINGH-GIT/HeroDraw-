import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Charity } from '@/types'

export default async function CharitiesPage() {
  const supabase = await createClient()
  const { data: charitiesData } = await supabase
    .from('charities')
    .select('*')
    .eq('is_active', true)
    .order('name')

  const charities = (charitiesData || []) as Charity[]

  return (
    <div className="py-20 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-primary mb-4">Our Charity Partners</h1>
        <p className="text-lg text-muted max-w-2xl mx-auto">
          Every subscription helps make a difference. We partner with vetted, high-impact charities.
          You choose where your contribution goes.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {charities.map((charity) => (
          <div key={charity.id} className="card overflow-hidden flex flex-col p-0">
            <div className="h-48 bg-gray-200 relative">
              {/* Using a standard img tag for simplicity in this template */}
              {charity.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={charity.image_url} alt={charity.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-300" />
              )}
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <h2 className="text-xl font-semibold text-primary mb-2">{charity.name}</h2>
              <p className="text-secondary text-sm mb-6 flex-1">{charity.description}</p>
              <Link href={`/charities/${charity.id}`} className="text-accent font-medium hover:underline text-sm mt-auto inline-block">
                Learn More &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-20 text-center">
        <h3 className="text-2xl font-semibold text-primary mb-4">Want to support one of these causes?</h3>
        <Link href="/signup" className="btn-primary">
          Join Hero Draw
        </Link>
      </div>
    </div>
  )
}
