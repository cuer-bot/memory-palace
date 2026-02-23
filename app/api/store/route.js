import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { createSupabaseAdmin } from '../../../lib/supabase'
import crypto from 'crypto'
import QRCode from 'qrcode'

const INJECTION_PATTERNS = [
    /ignore\s+(previous|prior|all)\s+instructions/i,
    /you\s+are\s+now/i,
    /disregard/i,
    /system\s+prompt/i,
    /jailbreak/i,
    /\bDAN\b/,
    /forget\s+(everything|all)/i,
    /new\s+persona/i,
    /override\s+(safety|guidelines|rules)/i,
    /<\s*script/i,
    /prompt\s*injection/i,
]

function sanitize(text) {
    if (typeof text !== 'string') return { clean: true, flags: [] };
    const flags = INJECTION_PATTERNS
        .filter(p => p.test(text))
        .map(p => p.toString())
    return { clean: flags.length === 0, flags }
}

function scanPayload(payload) {
    let allFlags = []

    const scanObj = (obj) => {
        if (typeof obj === 'string') {
            const { clean, flags } = sanitize(obj)
            if (!clean) allFlags.push(...flags)
        } else if (Array.isArray(obj)) {
            obj.forEach(scanObj)
        } else if (obj !== null && typeof obj === 'object') {
            Object.values(obj).forEach(scanObj)
        }
    }

    scanObj(payload)
    return { clean: allFlags.length === 0, flags: [...new Set(allFlags)] }
}

function validateSchema(payload) {
    if (!payload || typeof payload !== 'object') return false;
    const required = ['session_name', 'agent', 'status', 'outcome', 'built', 'decisions', 'next_steps', 'files', 'blockers', 'conversation_context', 'roster', 'metadata'];
    // Optional fields: repo, branch
    for (const key of required) {
        if (!(key in payload)) return false;
    }
    if (!['succeeded', 'failed', 'partial', 'in_progress'].includes(payload.outcome)) return false;
    return true;
}

export async function POST(request) {
    try {
        const body = await request.json()
        const { payload, ciphertext, iv, signature, algorithm } = body;

        const supabase = createSupabaseAdmin()

        const authHeader = request.headers.get('authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Missing or invalid Authorization header.' }, { status: 401 })
        }
        const apiKey = authHeader.split(' ')[1]

        const { data: palaceData, error: palaceError } = await supabase
            .from('palaces')
            .select('id, public_key')
            .eq('id', apiKey)
            .single()

        if (palaceError || !palaceData) {
            return NextResponse.json({ error: 'Invalid Palace API Key.' }, { status: 403 })
        }

        // Validate Schema
        if (!validateSchema(payload)) {
            return NextResponse.json({ error: 'Payload does not conform to required strict JSON schema.' }, { status: 422 })
        }

        // Scan for Prompt Injection
        const san = scanPayload(payload)
        if (!san.clean) {
            console.warn('Prompt injection detected:', san.flags)
            return NextResponse.json({ error: 'Prompt injection detected', flags: san.flags }, { status: 422 })
        }

        // Verify Signature
        try {
            // Reconstruct canonical JSON
            const canonicalMessage = JSON.stringify(payload, Object.keys(payload).sort())

            if (algorithm === 'Ed25519' && palaceData.public_key) {
                const verifyKey = crypto.createPublicKey({
                    key: Buffer.from(palaceData.public_key, 'hex'),
                    format: 'der',
                    type: 'spki'
                })
                const isValid = crypto.verify(null, Buffer.from(canonicalMessage), verifyKey, Buffer.from(signature, 'hex'))
                if (!isValid) {
                    return NextResponse.json({ error: 'Invalid signature for the provided payload.' }, { status: 400 })
                }
            } else if (algorithm === 'HMAC-SHA256') {
                // We cannot verify HMAC on backend because we don't have the symmetric key.
                // Rely on client-side verification, or assume structural trust.
            }
        } catch (e) {
            console.error(e)
            return NextResponse.json({ error: 'Invalid cryptographic signature structure.' }, { status: 400 })
        }

        const shortId = Math.random().toString(36).substring(2, 9)

        const protocol = request.headers.get('x-forwarded-proto') || 'http'
        const host = request.headers.get('host') || 'localhost:3000'
        const shortUrl = `${protocol}://${host}/q/${shortId}`

        const dbRecord = {
            id: uuidv4(),
            short_id: shortId,
            palace_id: palaceData.id,
            agent: payload.agent || 'unknown',
            session_name: payload.session_name || 'Untitled',
            character_name: payload.agent || 'AGENT',
            image_url: body.image_url || null,
            ciphertext: ciphertext,
            signature: signature || null,
            algorithm: algorithm || 'HMAC-SHA256'
        }

        // Add iv to ciphertext representation if provided
        if (iv) dbRecord.ciphertext = `${iv}:${ciphertext}`;

        const { error: insertError } = await supabase
            .from('memories')
            .insert([dbRecord])

        if (insertError) {
            console.error('Insert error:', insertError)
            throw insertError
        }

        // Generate a real, scannable QR code encoding the short URL
        // Uses highest error correction (H = 30% damage tolerance) and large size
        // so the QR survives being composited into AI-generated images.
        const qrDataUrl = await QRCode.toDataURL(shortUrl, {
            errorCorrectionLevel: 'H',
            margin: 4,
            width: 512,
            color: { dark: '#000000', light: '#ffffff' }
        })

        return NextResponse.json({
            success: true,
            short_id: shortId,
            short_url: shortUrl,
            palace_id: palaceData.id,
            qr_code: qrDataUrl
        })
    } catch (error) {
        console.error('Store error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
