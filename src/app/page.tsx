'use client'

import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Activity, Trophy, Heart } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 }
  }
}

export default function LandingPage() {
  return (
    <div className="relative min-h-screen flex flex-col bg-background">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none">
        <Image 
          src="/hero-bg.png" 
          alt="Abstract mesh gradient" 
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        <Navbar />
        <main className="flex-1">
          
          {/* Hero Section */}
          <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-6">
                Your Game. <br className="md:hidden" />
                <span className="text-accent">Their Future.</span>
              </h1>
              <p className="text-xl md:text-2xl text-secondary max-w-3xl mx-auto mb-12 font-light tracking-wide leading-relaxed">
                Log your scores. Win the monthly jackpot. Transform lives.<br/>
                The premium subscription platform where playing your best does the most good.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                <Link href="/signup">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-accent text-white font-bold text-lg px-10 py-4 w-full sm:w-auto rounded-lg shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transition-all"
                  >
                    Get Started &mdash; ₹499/mo
                  </motion.button>
                </Link>
                <Link href="/how-it-works">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-gray-300 font-medium hover:text-white px-8 py-4 transition-colors"
                  >
                    Learn How It Works
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </section>

          {/* How It Works */}
          <section className="relative py-32 border-y border-white/5 bg-surface/30 backdrop-blur-3xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center mb-20"
              >
                <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Simple. Rewarding. Impactful.</h2>
              </motion.div>
              
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="grid md:grid-cols-3 gap-8 text-left"
              >
                <motion.div variants={itemVariants} className="card group">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white mb-6 group-hover:bg-accent/20 group-hover:border-accent/50 transition-all duration-300">
                    <Activity className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3 text-white tracking-tight">Track Scores</h3>
                  <p className="text-secondary leading-relaxed">Log your latest 5 Stableford scores on our minimalist platform. A pure, distraction-free environment for your progress.</p>
                </motion.div>

                <motion.div variants={itemVariants} className="card group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-3xl rounded-full" />
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white mb-6 group-hover:bg-accent/20 group-hover:border-accent/50 transition-all duration-300">
                    <Trophy className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3 text-white tracking-tight">Win Prizes</h3>
                  <p className="text-secondary leading-relaxed">Our algorithmic engine matches your scores in the monthly draw. Match 5 for the rolling jackpot.</p>
                </motion.div>

                <motion.div variants={itemVariants} className="card group relative overflow-hidden">
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-accent/10 blur-3xl rounded-full" />
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white mb-6 group-hover:bg-accent/20 group-hover:border-accent/50 transition-all duration-300">
                    <Heart className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3 text-white tracking-tight">Support Charity</h3>
                  <p className="text-secondary leading-relaxed">A minimum of 10% of your subscription goes directly to your chosen cause. See your real-time impact.</p>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-32 text-center px-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-accent/5 blur-[100px] rounded-full max-w-4xl mx-auto" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative z-10"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-10 tracking-tight">Ready to make a difference?</h2>
              <Link href="/signup">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary text-lg px-12 py-4"
                >
                  Join Hero Draw
                </motion.button>
              </Link>
            </motion.div>
          </section>

        </main>
        <Footer />
      </div>
    </div>
  )
}
