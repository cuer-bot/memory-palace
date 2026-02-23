import { NextResponse } from 'next/server'
import { createSupabaseAdmin } from '../../../lib/supabase'
import jsQR from 'jsqr'
import { Jimp } from 'jimp'

export async function POST(request) {
    try {
        const formData = await request.formData()
        const file = formData.get('image')

        if (!file) {
            return NextResponse.json({ error: 'No image uploaded' }, { status: 400 })
        }

        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Parse image with Jimp
        const image = await Jimp.read(buffer)

        // jsQR expects a Uint8ClampedArray of RGBA values
        const imageData = new Uint8ClampedArray(image.bitmap.data)
        const code = jsQR(imageData, image.bitmap.width, image.bitmap.height)

        if (!code) {
            return NextResponse.json({ error: 'No valid QR code detected in the uploaded image.' }, { status: 400 })
        }

        const shortUrl = code.data
        let shortId = null;

        // Match Live URL format (e.g., https://domain.com/q/s5o7u)
        const urlMatch = shortUrl.match(/\/q\/([a-zA-Z0-9_-]+)$/)
        if (urlMatch) {
            shortId = urlMatch[1]
        }

        if (!shortId) {
            return NextResponse.json({
                error: 'QR code found, but it does not match the Memory Palace live URL format.',
                decodedPayload: shortUrl
            }, { status: 400 })
        }

        const supabase = createSupabaseAdmin()

        // Fetch the full memory record
        const { data: memoryData, error } = await supabase
            .from('memories')
            .select('*')
            .eq('short_id', shortId)
            .single()

        if (error || !memoryData) {
            return NextResponse.json({
                error: 'Lossless memory prompt not found in database.',
                id: shortId
            }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            short_id: shortId,
            memory_url: shortUrl,
            ciphertext: memoryData.ciphertext,
            signature: memoryData.signature,
            note: "Decrypt locally using your palace_key via the CLI or MCP tool"
        })

    } catch (error) {
        console.error('Scan error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
