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

    const formData = await req.formData()
    const plan = formData.get('plan') as string
    
    let priceId = process.env.STRIPE_PRICE_MONTHLY
    if (plan === 'yearly') {
      priceId = process.env.STRIPE_PRICE_YEARLY
    }

    if (!priceId) {
      return new NextResponse('Price ID not configured', { status: 500 })
    }

    // Check if user already has a customer ID
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    let customerId = subscription?.stripe_customer_id

    // If no customer ID, create a new customer
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id
        }
      })
      customerId = customer.id
      
      if (subscription) {
        await supabase
          .from('subscriptions')
          .update({ stripe_customer_id: customerId })
          .eq('user_id', user.id)
      } else {
        await supabase
          .from('subscriptions')
          .insert({ user_id: user.id, stripe_customer_id: customerId, plan_type: plan })
      }
    }

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/dashboard?success=true`,
      cancel_url: `${origin}/dashboard/settings?canceled=true`,
      client_reference_id: user.id, // Important for webhook matching
      metadata: {
        plan_type: plan
      }
    })

    if (!session.url) {
      return new NextResponse('Error creating stripe session', { status: 500 })
    }

    return NextResponse.redirect(session.url, { status: 303 })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
