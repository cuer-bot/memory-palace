import { NextResponse } from 'next/server'
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

        const image = await Jimp.read(buffer)
        const imageData = new Uint8ClampedArray(image.bitmap.data)
        const code = jsQR(imageData, image.bitmap.width, image.bitmap.height)

        if (!code) {
            return NextResponse.json({
                scannable: false,
                error: 'No QR code detected'
            })
        }

        const decodedUrl = code.data
        const urlMatch = decodedUrl.match(/\/q\/([a-zA-Z0-9_-]+)$/)

        return NextResponse.json({
            scannable: true,
            short_id: urlMatch ? urlMatch[1] : null,
            decoded_url: decodedUrl,
            valid_format: !!urlMatch
        })

    } catch (error) {
        console.error('Scan verify error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
