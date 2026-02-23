import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { createSupabaseAdmin } from '../../../lib/supabase'

export async function POST(request) {
    try {
        let body = {};
        try {
            body = await request.json();
        } catch (e) { }

        const publicKey = body.public_key || null;

        const supabase = createSupabaseAdmin()
        const palaceName = body.name || 'New Memory Palace';
        const { data, error } = await supabase
            .from('palaces')
            .insert([
                { id: uuidv4(), name: palaceName, public_key: publicKey }
            ])
            .select('id')
            .single()

        if (error) throw error

        return NextResponse.json({
            success: true,
            message: 'New Memory Palace created successfully.',
            palace_id: data.id,
            api_key: data.id,
            note: 'Save this API key. You will need it to store memories in this palace.'
        })
    } catch (error) {
        console.error('Error creating Palace:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
