import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function CharityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()

  const { data: charity, error } = await supabase
    .from('charities')
    .select('*')
    .eq('id', resolvedParams.id)
    .single()
  
  if (error || !charity) {
    notFound()
  }

  return (
    <div className="py-20 px-4 max-w-4xl mx-auto">
      <Link href="/charities" className="text-secondary hover:text-primary mb-8 inline-block text-sm">
        &larr; Back to Charities
      </Link>
      
      <div className="card overflow-hidden p-0 mb-10 border border-white/10 bg-surface">
        <div className="h-64 sm:h-96 w-full bg-white/5 relative">
          {charity.image_url ? (
            <img 
              src={charity.image_url} 
              alt={charity.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-white/10" />
          )}
        </div>
      </div>

      <h1 className="text-4xl font-bold text-white mb-4">{charity.name}</h1>
      
      <div className="prose prose-invert max-w-none mb-10 text-gray-300">
        <p className="text-xl mb-6 font-medium text-white">{charity.description}</p>
        <p className="whitespace-pre-line leading-relaxed text-gray-400">
          {/* Fallback to description if long description isn't available */}
          {charity.description}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 border-t border-white/10 pt-8 mt-10">
        <Link href={`/signup?charity=${charity.id}`} className="btn-primary text-center px-8 py-3 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
          Support {charity.name}
        </Link>
        {charity.website_url && (
          <a href={charity.website_url} target="_blank" rel="noopener noreferrer" className="btn-accent text-center px-8 py-3 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            Visit Website
          </a>
        )}
      </div>
    </div>
  )
}
