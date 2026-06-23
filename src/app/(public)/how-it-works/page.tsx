import Link from 'next/link'

export default function HowItWorksPage() {
  return (
    <div className="py-20 px-4 max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-primary mb-4">How Hero Draw Works</h1>
        <p className="text-lg text-muted">Three simple steps to make your game more rewarding and impactful.</p>
      </div>

      <div className="space-y-16">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="w-24 h-24 rounded-full bg-surface border border-gray-200 flex items-center justify-center text-4xl font-bold text-primary flex-shrink-0">
            1
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-primary mb-3">Subscribe & Support</h2>
            <p className="text-secondary leading-relaxed">
              Sign up for our monthly (₹499) or yearly (₹4999) plan. During signup, you'll choose a charity to support. We guarantee a minimum of 10% of your subscription goes directly to your chosen cause, though you can choose to contribute up to 100%.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="w-24 h-24 rounded-full bg-surface border border-gray-200 flex items-center justify-center text-4xl font-bold text-primary flex-shrink-0">
            2
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-primary mb-3">Track Your Scores</h2>
            <p className="text-secondary leading-relaxed">
              After every round, log your Stableford score (1-45). We keep your latest 5 scores active on your profile. As you enter a 6th score, your oldest one drops off. Your active scores become your "tickets" for the upcoming monthly draw.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="w-24 h-24 rounded-full bg-surface border border-gray-200 flex items-center justify-center text-4xl font-bold text-primary flex-shrink-0">
            3
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-primary mb-3">Win the Monthly Draw</h2>
            <p className="text-secondary leading-relaxed">
              At the end of each month, we draw 5 numbers. If your active scores match 3, 4, or 5 of the drawn numbers, you win a share of the prize pool! The 5-match jackpot rolls over if there's no winner, creating massive potential prizes.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-20 text-center card bg-surface border-none shadow-none">
        <h3 className="text-2xl font-semibold text-primary mb-4">Ready to step onto the tee?</h3>
        <Link href="/signup" className="btn-primary inline-block">
          Start Your Subscription
        </Link>
      </div>
    </div>
  )
}
