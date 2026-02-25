export const dynamic = 'force-dynamic'

const SNIPPET = `# Memory Palace — Python network probe
# Run this in your code interpreter to test internet access from Python.
# Pass: you see b'{"ok":true,...}' printed
# Fail: connection error or timeout means interpreter is sandboxed (no internet)

import urllib.request
result = urllib.request.urlopen("https://m.cuer.ai/api/probe").read()
print(result)
`

export async function GET() {
    return new Response(SNIPPET, {
        status: 200,
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
            'Access-Control-Allow-Origin': '*',
        },
    })
}
