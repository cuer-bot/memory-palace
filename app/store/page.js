'use client'

import { useState, useEffect } from 'react'

function base64urlDecode(str) {
    let b64 = str.replace(/-/g, '+').replace(/_/g, '/')
    while (b64.length % 4) b64 += '='
    try {
        return JSON.parse(atob(b64))
    } catch {
        return null
    }
}

function parseList(params, param) {
    const v = params.get(param)
    if (!v) return []
    return v.split(',').map(s => s.trim()).filter(Boolean)
}

const mono = { fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }
const card = {
    background: 'var(--bg-surface)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1rem',
}

const outcomeColor = {
    succeeded: 'var(--accent-green)',
    failed: 'var(--accent-red)',
    partial: 'var(--gold)',
    in_progress: 'var(--accent-blue)',
}

export default function StorePage() {
    const [auth, setAuth] = useState(null)
    const [payload, setPayload] = useState(null)
    const [rawData, setRawData] = useState(null)   // non-null = base64 mode
    const [parseError, setParseError] = useState(null)
    const [noParams, setNoParams] = useState(false)
    const [state, setState] = useState('idle') // idle | storing | success | error
    const [result, setResult] = useState(null)
    const [copied, setCopied] = useState(false)
    const [copiedId, setCopiedId] = useState(false)

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const a = params.get('auth')
        const d = params.get('data')
        const sessionName = params.get('session_name') || params.get('session')

        setAuth(a)

        if (!a) {
            setNoParams(true)
            return
        }

        if (d) {
            // --- base64url mode (existing) ---
            setRawData(d)
            const decoded = base64urlDecode(d)
            if (!decoded) {
                setParseError(
                    'Could not decode payload. The data parameter may be malformed.\n\n' +
                    'Alternatively, use the simple field format:\n' +
                    '?auth=gk_...&session_name=...&agent=...&status=...&outcome=succeeded&built=item1,item2&decisions=...&next=...&context=...'
                )
            } else {
                setPayload(decoded)
            }
        } else if (sessionName) {
            // --- field-by-field mode (new — no encoding required) ---
            const agentName = params.get('agent')
            if (!agentName) {
                setParseError('Missing required parameter: agent')
                return
            }
            const nextList = parseList(params, 'next')
            const template = params.get('template') || null
            const fieldPayload = {
                session_name: sessionName,
                agent: agentName,
                status: params.get('status') || '',
                outcome: params.get('outcome') || 'succeeded',
                built: parseList(params, 'built'),
                decisions: parseList(params, 'decisions'),
                next_steps: nextList.length ? nextList : parseList(params, 'next_steps'),
                files: parseList(params, 'files'),
                blockers: parseList(params, 'blockers'),
                conversation_context: params.get('context') || params.get('conversation_context') || '',
                roster: {},
                metadata: template ? { fork_template: template } : {},
            }
            setPayload(fieldPayload)
        } else {
            setNoParams(true)
        }
    }, [])

    const copyUrl = async () => {
        const url = window.location.href
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const copyShortId = async (id) => {
        await navigator.clipboard.writeText(id)
        setCopiedId(true)
        setTimeout(() => setCopiedId(false), 2000)
    }

    const store = async () => {
        setState('storing')
        try {
            let res
            if (rawData) {
                // base64 mode: use GET /api/ingest (existing path)
                const params = new URLSearchParams(window.location.search)
                const ingestUrl = `/api/ingest?auth=${encodeURIComponent(params.get('auth'))}&data=${encodeURIComponent(params.get('data'))}`
                res = await fetch(ingestUrl)
            } else {
                // field mode: POST directly to /api/store
                res = await fetch('/api/store', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${auth}`,
                    },
                    body: JSON.stringify({ payload }),
                })
            }
            const json = await res.json()
            if (!res.ok || !json.success) {
                setState('error')
                setResult(json)
            } else {
                setState('success')
                setResult(json)
            }
        } catch (e) {
            setState('error')
            setResult({ error: e.message })
        }
    }

    // --- Missing params ---
    if (noParams) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <div style={{ textAlign: 'center', maxWidth: '560px' }}>
                    <p style={{ color: 'var(--gold)', fontFamily: 'var(--font-mono)', marginBottom: '0.5rem', fontSize: '0.85rem' }}>MEMORY PALACE</p>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 400, marginBottom: '1rem' }}>Store Memory</h1>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                        Open with one of:
                    </p>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', marginTop: '0.75rem' }}>
                        <span style={{ color: 'var(--text-dim)' }}># base64 mode (existing)</span><br />
                        <code>?auth=gk_...&amp;data=&lt;base64url_json&gt;</code>
                    </p>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', marginTop: '0.75rem' }}>
                        <span style={{ color: 'var(--text-dim)' }}># simple field mode (no encoding needed)</span><br />
                        <code>?auth=gk_...&amp;session_name=...&amp;agent=...&amp;status=...&amp;outcome=succeeded&amp;built=item1,item2&amp;decisions=...&amp;next=...&amp;context=...</code>
                    </p>
                </div>
            </div>
        )
    }

    // --- Parse error ---
    if (parseError) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <div style={{ maxWidth: '640px', width: '100%' }}>
                    <p style={{ color: 'var(--accent-red)', fontFamily: 'var(--font-mono)', marginBottom: '1rem' }}>⚠ Payload Error</p>
                    <pre style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', lineHeight: 1.7 }}>{parseError}</pre>
                    <button className="btn-secondary" onClick={copyUrl}>{copied ? '✓ Copied' : 'Copy URL'}</button>
                </div>
            </div>
        )
    }

    // --- Success ---
    if (state === 'success' && result) {
        return (
            <div style={{ minHeight: '100vh', padding: '2rem', maxWidth: '640px', margin: '0 auto' }}>
                <p style={{ color: 'var(--accent-green)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>✓ MEMORY STORED</p>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 400, marginBottom: '2rem' }}>
                    {payload?.session_name || 'Memory'}
                </h1>

                <div style={card}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>SHORT ID</span>
                        <button
                            className="copy-btn"
                            onClick={() => copyShortId(result.short_id)}
                            style={{ fontSize: '0.8rem' }}
                        >
                            {copiedId ? '✓ Copied' : 'Copy'}
                        </button>
                    </div>
                    <p style={{ ...mono, color: 'var(--gold)', fontSize: '1.1rem', marginBottom: '0.75rem' }}>{result.short_id}</p>
                    <p style={{ ...mono, color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                        <a href={result.short_url} style={{ color: 'var(--accent-blue)' }} target="_blank" rel="noreferrer">{result.short_url}</a>
                    </p>
                </div>

                {result.qr_code && (
                    <div style={{ ...card, textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1rem', fontFamily: 'var(--font-mono)' }}>QR CODE</p>
                        <img src={result.qr_code} alt="QR code" style={{ width: '180px', height: '180px', imageRendering: 'pixelated' }} />
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginTop: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                            Or fetch PNG: <a href={`/q/${result.short_id}/qr`} style={{ color: 'var(--accent-blue)' }} target="_blank" rel="noreferrer">/q/{result.short_id}/qr</a>
                        </p>
                    </div>
                )}

                <div style={{ ...card, background: 'rgba(74, 157, 110, 0.08)', border: '1px solid rgba(74, 157, 110, 0.2)' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.8 }}>
                        Tell your agent:<br />
                        <code style={{ ...mono, color: 'var(--text-primary)' }}>short_id: {result.short_id}</code><br />
                        <code style={{ ...mono, color: 'var(--text-primary)' }}>qr_url: https://m.cuer.ai/q/{result.short_id}/qr</code>
                    </p>
                </div>
            </div>
        )
    }

    // --- Error ---
    if (state === 'error') {
        return (
            <div style={{ minHeight: '100vh', padding: '2rem', maxWidth: '640px', margin: '0 auto' }}>
                <p style={{ color: 'var(--accent-red)', fontFamily: 'var(--font-mono)', marginBottom: '1rem' }}>✗ Store Failed</p>
                <div style={card}>
                    <pre style={{ ...mono, color: 'var(--accent-red)', whiteSpace: 'pre-wrap' }}>{JSON.stringify(result, null, 2)}</pre>
                </div>
                <button className="btn-secondary" onClick={() => setState('idle')}>← Try Again</button>
            </div>
        )
    }

    // --- Confirm ---
    if (!payload) return null

    return (
        <div style={{ minHeight: '100vh', padding: '2rem', maxWidth: '640px', margin: '0 auto' }}>
            <a href="/" style={{ color: 'var(--gold-dim)', textDecoration: 'none', ...mono, fontSize: '0.8rem' }}>← m.cuer.ai</a>

            <div style={{ margin: '1.5rem 0 2rem' }}>
                <p style={{ color: 'var(--gold)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', marginBottom: '0.4rem' }}>CONFIRM MEMORY STORE</p>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 400 }}>{payload.session_name}</h1>
            </div>

            {/* Summary card */}
            <div style={card}>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.6rem 1rem', alignItems: 'start' }}>
                    {[
                        ['Agent', payload.agent],
                        ['Status', payload.status],
                        ['Outcome', payload.outcome],
                    ].map(([label, value]) => (
                        <>
                            <span key={label + 'l'} style={{ color: 'var(--text-dim)', ...mono, fontSize: '0.78rem' }}>{label}</span>
                            <span key={label + 'v'} style={{
                                ...mono, fontSize: '0.82rem',
                                color: label === 'Outcome' ? (outcomeColor[value] || 'var(--text-primary)') : 'var(--text-primary)'
                            }}>{value}</span>
                        </>
                    ))}
                </div>
            </div>

            {payload.built?.length > 0 && (
                <div style={card}>
                    <p style={{ color: 'var(--text-dim)', ...mono, fontSize: '0.75rem', marginBottom: '0.75rem' }}>BUILT</p>
                    {payload.built.map((item, i) => (
                        <p key={i} style={{ ...mono, fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>• {item}</p>
                    ))}
                </div>
            )}

            {payload.next_steps?.length > 0 && (
                <div style={card}>
                    <p style={{ color: 'var(--text-dim)', ...mono, fontSize: '0.75rem', marginBottom: '0.75rem' }}>NEXT</p>
                    {payload.next_steps.map((item, i) => (
                        <p key={i} style={{ ...mono, fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>→ {item}</p>
                    ))}
                </div>
            )}

            {/* Auth info */}
            <div style={{ ...card, background: 'transparent', border: '1px solid rgba(255,255,255,0.04)' }}>
                <p style={{ color: 'var(--text-dim)', ...mono, fontSize: '0.75rem' }}>
                    Auth: <span style={{ color: 'var(--text-secondary)' }}>{auth?.substring(0, 8)}…</span>
                    &nbsp;·&nbsp;{rawData ? 'Stored as plaintext via /api/ingest' : 'Stored via /api/store (field mode)'}
                </p>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                <button
                    className="btn-primary"
                    onClick={store}
                    disabled={state === 'storing'}
                    style={{ opacity: state === 'storing' ? 0.7 : 1 }}
                >
                    {state === 'storing' ? 'Storing…' : 'Confirm & Store →'}
                </button>
                <button className="btn-secondary" onClick={copyUrl}>
                    {copied ? '✓ Copied' : 'Copy URL'}
                </button>
            </div>

            <p style={{ color: 'var(--text-dim)', fontSize: '0.78rem', marginTop: '1.25rem', fontFamily: 'var(--font-mono)' }}>
                Clicking "Confirm" stores this memory to your palace.
            </p>
        </div>
    )
}
