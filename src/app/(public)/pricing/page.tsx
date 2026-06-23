import Link from 'next/link'

export default function PricingPage() {
  return (
    <div className="py-20 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-primary mb-4">Simple, transparent pricing</h1>
        <p className="text-lg text-muted max-w-2xl mx-auto">Choose the plan that works for you. A portion of every subscription goes directly to charity.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Monthly Plan */}
        <div className="card flex flex-col">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-secondary mb-2">Monthly Subscription</h2>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-primary">₹499</span>
              <span className="text-muted">/month</span>
            </div>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-start">
              <svg className="w-5 h-5 text-accent mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              <span className="text-secondary">Log your latest 5 Stableford scores</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-accent mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              <span className="text-secondary">Automatic entry into monthly prize draws</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-accent mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              <span className="text-secondary">Min. 10% dedicated to your chosen charity</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-accent mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              <span className="text-secondary">Full dashboard access & performance tracking</span>
            </li>
          </ul>
          <Link href="/signup?plan=monthly" className="btn-primary w-full text-center">
            Subscribe Monthly
          </Link>
        </div>

        {/* Yearly Plan */}
        <div className="card border-primary relative flex flex-col">
          <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
            SAVE 17%
          </div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-secondary mb-2">Yearly Subscription</h2>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-primary">₹4999</span>
              <span className="text-muted">/year</span>
            </div>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
             <li className="flex items-start">
              <svg className="w-5 h-5 text-accent mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              <span className="text-secondary">All Monthly features included</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-accent mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              <span className="text-secondary">Two months free compared to monthly</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-accent mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              <span className="text-secondary">Uninterrupted charity support for 12 months</span>
            </li>
          </ul>
          <Link href="/signup?plan=yearly" className="btn-accent w-full text-center">
            Subscribe Yearly
          </Link>
        </div>
      </div>
    </div>
  )
}
