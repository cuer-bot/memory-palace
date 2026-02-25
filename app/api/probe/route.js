export const dynamic = 'force-dynamic'

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
    return new Response(null, { status: 204, headers: CORS })
}

export async function GET() {
    return Response.json(
        { ok: true, test: 'browse', hint: 'If you received this, your environment can fetch URLs.' },
        { headers: { ...CORS, 'Cache-Control': 'no-store' } }
    )
}

export async function POST() {
    return Response.json(
        { ok: true, test: 'post', hint: 'If you received this, your environment can send POST requests.' },
        { headers: { ...CORS, 'Cache-Control': 'no-store' } }
    )
}
