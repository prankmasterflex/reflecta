
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabase } from '@/lib/supabase'

const resend = new Resend(process.env.RESEND_API_KEY || 're_123456789')

export async function POST(request: NextRequest) {
    try {
        const { email, score, gapCount, gaps } = await request.json()

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!email || !emailRegex.test(email)) {
            return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
        }

        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString()
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

        // Store in Supabase
        const { error: dbError } = await supabase
            .from('email_submissions')
            .insert({
                email,
                verification_code: code,
                code_expires_at: expiresAt.toISOString(),
                score,
                gap_count: gapCount,
                gaps,
                verified: false
            })

        if (dbError) {
            console.error('Supabase error:', dbError)
            return NextResponse.json({ error: 'Database error' }, { status: 500 })
        }

        // Send email via Resend
        const { error: emailError } = await resend.emails.send({
            from: 'Reflecta <onboarding@resend.dev>',
            to: email,
            subject: 'Your CMMC Readiness Report Verification Code',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1e3a5f; margin-bottom: 16px;">Verification Code</h2>
          <p style="color: #374151; margin-bottom: 20px;">Enter this code to download your CMMC Level 2 Readiness Report:</p>
          <div style="background: #f4f4f5; padding: 24px; text-align: center; border-radius: 8px; margin: 24px 0;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 6px; color: #1e3a5f;">${code}</span>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 24px;">This code expires in 10 minutes.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #9ca3af; font-size: 12px;">Reflecta - CMMC Level 2 Readiness Assessment</p>
          <p style="color: #9ca3af; font-size: 11px;">This is an automated message. Please do not reply.</p>
        </div>
      `
        })

        if (emailError) {
            console.error('Resend error:', emailError)
            return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Server error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
