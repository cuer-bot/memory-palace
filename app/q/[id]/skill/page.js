import { createSupabaseAdmin } from '../../../../lib/supabase'

export const dynamic = 'force-dynamic'

export default async function ForkSkillPage({ params }) {
    const { id: shortId } = await params

    let forkSkill = null
    let error = null

    try {
        const supabase = createSupabaseAdmin()
        const { data, error: dbError } = await supabase
            .from('memories')
            .select('ciphertext, agent, created_at')
            .eq('short_id', shortId)
            .single()

        if (dbError || !data) {
            error = 'Memory not found.'
        } else {
            try {
                const payload = JSON.parse(data.ciphertext)
                forkSkill = payload?.metadata?.fork_skill || null
                if (!forkSkill) error = 'This memory does not contain a skill fork.'
            } catch {
                error = 'This memory is encrypted and cannot be read as a skill fork.'
            }
        }
    } catch (e) {
        error = 'Failed to load skill fork.'
    }

    if (error) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                fontFamily: 'var(--font-mono)',
            }}>
                <div style={{ textAlign: 'center', maxWidth: '480px' }}>
                    <p style={{ color: 'var(--accent-red)', marginBottom: '0.75rem', fontSize: '0.85rem' }}>⚠ {error}</p>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                        Skill forks are created by running <code>/onboard</code> with a Memory Palace agent.
                    </p>
                </div>
            </div>
        )
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
                alignItems: 'flex-start',
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
                        fontSize: '1.6rem',
                        fontWeight: 400,
                        marginTop: '0.4rem',
                    }}>Skill Fork</h1>
                    <p style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        color: 'var(--text-dim)',
                        marginTop: '0.25rem',
                    }}>{shortId}</p>
                </div>
                <a
                    href={`/q/${shortId}`}
                    style={{
                        color: 'var(--accent-blue)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.78rem',
                        textDecoration: 'none',
                    }}
                    target="_blank" rel="noreferrer"
                >
                    View capsule →
                </a>
            </div>

            <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '12px',
                padding: '2rem',
            }}>
                {/* Content is SSR — visible to agent browsing tools without JS */}
                <pre style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.82rem',
                    lineHeight: 1.8,
                    color: 'var(--text-secondary)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                }}>
                    {forkSkill}
                </pre>
            </div>

            <p style={{
                textAlign: 'center',
                marginTop: '1.5rem',
                fontSize: '0.8rem',
                color: 'var(--text-dim)',
                fontFamily: 'var(--font-mono)',
            }}>
                This is your personalized Memory Palace skill.
                Fetch this URL at the start of each session.
            </p>
        </div>
    )
}
