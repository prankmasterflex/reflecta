
// Client-safe paywall configuration
// Does NOT expose Stripe keys

export type PaywallMode = 'stub' | 'stripe'

export function getPaywallMode(): PaywallMode {
    // This will be populated at build time from env
    const mode = process.env.NEXT_PUBLIC_PAYWALL_MODE as PaywallMode
    return mode === 'stripe' ? 'stripe' : 'stub'
}
