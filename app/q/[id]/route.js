import { NextResponse } from 'next/server'
import { createSupabaseAdmin } from '../../../lib/supabase'

export async function GET(request, context) {
    try {
        const params = await context.params
        const shortId = params.id
        const supabase = createSupabaseAdmin()

        // Provide the full memory JSON record payload
        const { data: memoryData, error } = await supabase
            .from('memories')
            .select('*')
            .eq('short_id', shortId)
            .single()

        if (error || !memoryData) {
            return new NextResponse('Memory Record Not Found', { status: 404 })
        }

        return NextResponse.json(memoryData, {
            headers: {
                'Cache-Control': 'public, max-age=3600',
            },
        })
    } catch (error) {
        return new NextResponse(error.message, { status: 500 })
    }
}
