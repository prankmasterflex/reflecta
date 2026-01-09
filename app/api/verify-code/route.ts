
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
    try {
        const { email, code } = await request.json()

        if (!email || !code) {
            return NextResponse.json({ error: 'Missing email or code' }, { status: 400 })
        }

        // Find matching submission
        const { data, error } = await supabase
            .from('email_submissions')
            .select('*')
            .eq('email', email)
            .eq('verification_code', code)
            .eq('verified', false)
            .gt('code_expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        if (error || !data) {
            return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 })
        }

        // Mark as verified
        const { error: updateError } = await supabase
            .from('email_submissions')
            .update({
                verified: true,
                verified_at: new Date().toISOString()
            })
            .eq('id', data.id)

        if (updateError) {
            return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
        }

        return NextResponse.json({ success: true, submissionId: data.id })
    } catch (error) {
        console.error('Server error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
