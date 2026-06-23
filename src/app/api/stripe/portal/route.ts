import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    if (!subscription || !subscription.stripe_customer_id) {
      return new NextResponse('No active customer found', { status: 400 })
    }

    // Create customer portal session
    const stripeSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
    })

    return NextResponse.redirect(stripeSession.url, { status: 303 })
  } catch (error) {
    console.error('Stripe portal error:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
