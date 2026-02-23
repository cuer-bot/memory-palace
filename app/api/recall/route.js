import { NextResponse } from 'next/server'
import { createSupabaseAdmin } from '../../../lib/supabase'

export async function GET(request) {
    try {
        const supabase = createSupabaseAdmin()

        const authHeader = request.headers.get('authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Missing or invalid Authorization header.' }, { status: 401 })
        }
        const apiKey = authHeader.split(' ')[1]

        // Validate the API key against the palaces table
        const { data: palaceData, error: palaceError } = await supabase
            .from('palaces')
            .select('id')
            .eq('id', apiKey)
            .single()

        if (palaceError || !palaceData) {
            return NextResponse.json({ error: 'Invalid Palace API Key.' }, { status: 403 })
        }

        // Get limits and pagination from URL
        const { searchParams } = new URL(request.url)
        const limitParams = parseInt(searchParams.get('limit') || '10')
        const limit = limitParams > 50 ? 50 : limitParams

        const { data: memories, error } = await supabase
            .from('memories')
            .select('short_id, agent, image_url, ciphertext, signature, algorithm, created_at')
            .eq('palace_id', palaceData.id)
            .order('created_at', { ascending: false })
            .limit(limit)

        if (error) {
            console.error('Fetch error:', error)
            throw error
        }

        return NextResponse.json({
            success: true,
            palace_id: palaceData.id,
            memories: memories
        })

    } catch (error) {
        console.error('Recall error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
