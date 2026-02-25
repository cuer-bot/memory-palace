import { NextResponse } from 'next/server'
import { createSupabaseAdmin } from '../../../lib/supabase'

const HELP_URL = 'https://m.cuer.ai/api/troubleshoot'

async function resolveAuth(supabase, authHeader, queryAuth) {
    // Query-param auth (gk_ only, for browse agents that can't set headers)
    const token = queryAuth || (authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null)
    if (!token) return null

    if (token.startsWith('gk_')) {
        const { data, error } = await supabase
            .from('agents')
            .select('palace_id, permissions, active')
            .eq('guest_key', token)
            .single()
        if (error || !data || !data.active) return null
        return { palace_id: data.palace_id, permissions: data.permissions, via: 'guest_key' }
    }

    // Palace ID auth (owner)
    const { data, error } = await supabase
        .from('palaces')
        .select('id')
        .eq('id', token)
        .single()
    if (error || !data) return null
    return { palace_id: data.id, permissions: 'admin', via: 'palace_id' }
}

export async function GET(request) {
    try {
        const supabase = createSupabaseAdmin()

        const authHeader = request.headers.get('authorization')
        const { searchParams } = new URL(request.url)
        const queryAuth = searchParams.get('auth')

        const auth = await resolveAuth(supabase, authHeader, queryAuth)
        if (!auth) {
            return NextResponse.json(
                {
                    error: 'Invalid or missing auth token.',
                    hint: 'Pass ?auth=gk_... in the URL or set Authorization: Bearer <token> header.',
                    help: HELP_URL,
                },
                { status: 401 }
            )
        }

        const shortId = searchParams.get('short_id')

        if (shortId) {
            const { data: mem, error } = await supabase
                .from('memories')
                .select('short_id, agent, image_url, ciphertext, signature, algorithm, created_at')
                .eq('short_id', shortId)
                .eq('palace_id', auth.palace_id)
                .single()

            if (error || !mem) {
                return NextResponse.json(
                    {
                        error: 'Memory not found.',
                        hint: `No memory with short_id "${shortId}" found in this palace.`,
                        help: HELP_URL,
                    },
                    { status: 404 }
                )
            }

            return NextResponse.json({ success: true, palace_id: auth.palace_id, memory: mem })
        }

        const limitParam = parseInt(searchParams.get('limit') || '10')
        const limit = limitParam > 50 ? 50 : limitParam

        const { data: memories, error } = await supabase
            .from('memories')
            .select('short_id, agent, image_url, ciphertext, signature, algorithm, created_at')
            .eq('palace_id', auth.palace_id)
            .order('created_at', { ascending: false })
            .limit(limit)

        if (error) {
            console.error('Fetch error:', error)
            throw error
        }

        return NextResponse.json({
            success: true,
            palace_id: auth.palace_id,
            memories: memories,
        })

    } catch (error) {
        console.error('Recall error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
