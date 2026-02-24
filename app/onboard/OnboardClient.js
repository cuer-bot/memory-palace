'use client'

import { useState } from 'react'

export default function OnboardClient({ content }) {
    const [copied, setCopied] = useState(false)

    const copy = async () => {
        await navigator.clipboard.writeText(content)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const download = () => {
        const blob = new Blob([content], { type: 'text/markdown' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'memory-palace-onboard.md'
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div style={{
            minHeight: '100vh',
            padding: '2rem',
            maxWidth: '800px',
            margin: '0 auto',
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
                <div>
                    <a href="/" style={{
                        color: 'var(--gold-dim)',
                        textDecoration: 'none',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.8rem',
                    }}>← m.cuer.ai</a>
                    <h1 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.8rem',
                        fontWeight: 400,
                        marginTop: '0.5rem',
                    }}>Agent Onboarding</h1>
                    <p style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        color: 'var(--text-dim)',
                        marginTop: '0.25rem',
                    }}>Run once per agent environment → get a personal skill fork</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="copy-btn" onClick={download}>↓ Download</button>
                    <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={copy}>
                        {copied ? '✓ Copied' : 'Copy'}
                    </button>
                </div>
            </div>

            <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '12px',
                padding: '2rem',
            }}>
                <pre style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.82rem',
                    lineHeight: 1.8,
                    color: 'var(--text-secondary)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                }}>
                    {content}
                </pre>
            </div>

            <p style={{
                textAlign: 'center',
                marginTop: '2rem',
                fontSize: '0.85rem',
                color: 'var(--text-dim)',
            }}>
                Give this to any agent for first-time setup.&nbsp;
                <a href="/skill" style={{ color: 'var(--gold-dim)', textDecoration: 'none' }}>Full skill →</a>
            </p>
        </div>
    )
}
