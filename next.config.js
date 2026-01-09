/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        NEXT_PUBLIC_PAYWALL_MODE: process.env.PAYWALL_MODE || 'stub',
    },
}

module.exports = nextConfig
