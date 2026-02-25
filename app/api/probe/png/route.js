export const dynamic = 'force-dynamic'

// Minimal 1×1 transparent PNG (68 bytes, generated via Python struct/zlib)
const TRANSPARENT_PNG = Buffer.from(
    '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000b49444154789c6360000200000500017a5eab3f0000000049454e44ae426082',
    'hex'
)

export async function GET() {
    return new Response(TRANSPARENT_PNG, {
        status: 200,
        headers: {
            'Content-Type': 'image/png',
            'Content-Length': '68',
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Access-Control-Allow-Origin': '*',
            'X-Test': 'binary-fetch',
            'X-Hint': 'If you received binary image data, your environment can fetch binary files.',
        },
    })
}
