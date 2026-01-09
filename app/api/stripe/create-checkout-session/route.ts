
import { NextRequest, NextResponse } from 'next/server'
import { getStripeClient, stripeConfig } from '@/lib/stripe'

export async function POST(request: NextRequest) {
    try {
        // Check if Stripe should be used
        if (!stripeConfig.shouldUseStripe) {
            console.log('[Stripe] Stripe not enabled or misconfigured, returning fallback')
            return NextResponse.json(
                { error: 'Payment system not configured', fallback: true },
                { status: 503 }
            )
        }

        const stripe = getStripeClient()

        if (!stripe) {
            console.error('[Stripe] Failed to initialize Stripe client')
            return NextResponse.json(
                { error: 'Payment system error', fallback: true },
                { status: 500 }
            )
        }

        const baseUrl = process.env.APP_BASE_URL || 'https://www.reflecta.tech'

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: stripeConfig.priceId,
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${baseUrl}/assessment?session_id={CHECKOUT_SESSION_ID}&payment=success`,
            cancel_url: `${baseUrl}/assessment?payment=cancelled`,
            metadata: {
                product: 'reflecta_unlock',
            },
        })

        if (!session.url) {
            throw new Error('Failed to create checkout session URL')
        }

        return NextResponse.json({ url: session.url })
    } catch (error) {
        console.error('[Stripe] Checkout session error:', error)
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        )
    }
}
