import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { adminAuthClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  const body = await req.text()
  const sig = (await headers()).get('stripe-signature') as string

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 })
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = adminAuthClient

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any
        const userId = session.client_reference_id
        
        if (!userId) break

        const { data: existingSub } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle()

        if (existingSub) {
          const { error } = await supabase
            .from('subscriptions')
            .update({
              stripe_customer_id: session.customer,
              stripe_subscription_id: session.subscription,
              status: 'active',
              plan_type: session.metadata?.plan_type || 'monthly'
            })
            .eq('user_id', userId)
          if (error) console.error('Update error:', error)
        } else {
          const { error } = await supabase
            .from('subscriptions')
            .insert({
              user_id: userId,
              stripe_customer_id: session.customer,
              stripe_subscription_id: session.subscription,
              status: 'active',
              plan_type: session.metadata?.plan_type || 'monthly'
            })
          if (error) console.error('Insert error:', error)
        }
        break
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as any
        
        
        const priceId = subscription.items?.data?.[0]?.price?.id
        const updateData: any = {
          status: subscription.status,
          plan_type: priceId === process.env.STRIPE_PRICE_YEARLY ? 'yearly' : 'monthly'
        }
        
        if (subscription.current_period_start) {
          updateData.current_period_start = new Date(subscription.current_period_start * 1000).toISOString()
        }
        if (subscription.current_period_end) {
          updateData.current_period_end = new Date(subscription.current_period_end * 1000).toISOString()
        }

        const { error } = await supabase
          .from('subscriptions')
          .update(updateData)
          .eq('stripe_subscription_id', subscription.id)
          
        if (error) console.error('Subscription update error:', error)
        break
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any
        
        await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
          })
          .eq('stripe_subscription_id', subscription.id)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
