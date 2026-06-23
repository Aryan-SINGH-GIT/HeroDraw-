import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-surface mt-auto py-12 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <span className="text-xl font-bold tracking-tight text-primary">Hero Draw</span>
          <p className="text-sm text-muted mt-1">Your Game. Their Future.</p>
        </div>
        <div className="flex space-x-6 text-sm text-secondary">
          <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-primary">Terms of Service</Link>
          <Link href="/contact" className="hover:text-primary">Contact Us</Link>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 text-center text-xs text-muted">
        &copy; {new Date().getFullYear()} Hero Draw. All rights reserved.
      </div>
    </footer>
  )
}
