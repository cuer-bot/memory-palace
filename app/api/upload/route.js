import { NextResponse } from 'next/server'
import { createSupabaseAdmin } from '../../../lib/supabase'

export async function POST(request) {
    try {
        const authHeader = request.headers.get('authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 })
        }
        const apiKey = authHeader.split(' ')[1]

        const supabase = createSupabaseAdmin()

        // Validate API key and get Palace
        const { data: palaceData, error: palaceError } = await supabase
            .from('palaces')
            .select('id')
            .eq('id', apiKey)
            .single()

        if (palaceError || !palaceData) {
            return NextResponse.json({ error: 'Invalid Palace API Key' }, { status: 401 })
        }

        // Get form data
        const formData = await request.formData()
        const image = formData.get('image')
        const shortId = formData.get('short_id')

        if (!image || !shortId) {
            return NextResponse.json({ error: 'Missing image or short_id parameter' }, { status: 400 })
        }

        // Upload to Supabase Storage
        const buffer = Buffer.from(await image.arrayBuffer())
        const filePath = `${palaceData.id}/${shortId}.png`

        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('memory-images')
            .upload(filePath, buffer, {
                contentType: 'image/png',
                upsert: true
            })

        if (uploadError) {
            console.error('Upload Error:', uploadError)
            return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
        }

        const { data: publicUrlData } = supabase
            .storage
            .from('memory-images')
            .getPublicUrl(filePath)

        const publicUrl = publicUrlData.publicUrl

        // Update memory record
        const { error: updateError } = await supabase
            .from('memories')
            .update({ image_url: publicUrl })
            .eq('short_id', shortId)
            .eq('palace_id', palaceData.id)

        if (updateError) {
            console.error('Update Error:', updateError)
            return NextResponse.json({ error: 'Failed to update memory record' }, { status: 500 })
        }

        return NextResponse.json({ success: true, image_url: publicUrl })

    } catch (err) {
        console.error('Unexpected error:', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
