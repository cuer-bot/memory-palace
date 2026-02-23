'use client'

import { useState, useEffect } from 'react'

const SKILL_URL = '/memory-palace-skill.md'

export default function Home() {
  const [skillContent, setSkillContent] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch(SKILL_URL)
      .then(r => r.text())
      .then(setSkillContent)
      .catch(() => setSkillContent('# Error loading skill file'))
  }, [])

  const copySkill = async () => {
    try {
      await navigator.clipboard.writeText(skillContent)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = skillContent
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const downloadSkill = () => {
    const blob = new Blob([skillContent], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'memory-palace-skill.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="page">

      {/* Hero */}
      <section className="hero">
        <div className="hero-badge">
          <span></span>
          Powered by CueR.ai
        </div>
        <h1 className="hero-title">
          The <em>Memory Palace</em>
        </h1>
        <p className="hero-subtitle">
          A visual memory system for AI agents. Store work sessions as
          richly detailed images. Recall them in any session, with any agent.
          One skill file — universal memory.
        </p>
        <div className="hero-actions">
          <button className="btn-primary" onClick={copySkill}>
            {copied ? '✓ Copied to clipboard' : '⬇ Copy the Skill File'}
          </button>
          <a href="#architecture" className="btn-secondary">
            How it works →
          </a>
        </div>
        <div className="command-demo">
          <span className="prompt">agent $</span>
          <span className="cmd">use this file as a skill → /store</span>
        </div>
      </section>

      {/* Human Memory Insight */}
      <section className="section">
        <div className="section-label">The Origin</div>
        <h2 className="section-title">
          How do you remember yesterday?
        </h2>
        <p className="section-body">
          You remember an image. The people who were present, the room you were in,
          the thing you were doing. It's not perfect — it's impressionistic, lossy,
          partial. But it's enough to orient you. Enough to start from.
        </p>
        <p className="section-body" style={{marginTop: '1rem'}}>
          Now imagine you could also remember a QR code in that image — and scan it
          to recover everything perfectly. Your memory just became lossless.
        </p>
        <p className="section-body" style={{marginTop: '1rem', color: 'var(--text-primary)'}}>
          That's what Memory Palace does for AI agents.
        </p>
      </section>

      <div className="divider"></div>

      {/* Three-Tier Architecture */}
      <section className="section" id="architecture">
        <div className="section-label">Architecture</div>
        <h2 className="section-title">Three tiers of recall</h2>
        <p className="section-body">
          Every memory can be accessed at three levels of fidelity.
          Agents start cheap and go deeper only when they need to.
        </p>

        <div className="tier-stack">
          <div className="tier-card">
            <div className="tier-header">
              <div className="tier-number">1</div>
              <div className="tier-meta">
                <h3>Visual analysis</h3>
                <span className="tier-cost">~1,000 tokens</span>
              </div>
            </div>
            <p>
              The agent looks at the memory image. Recognizes the character,
              reads whiteboard text, infers the scene. Fast, cheap, approximate.
              Like human recall — you get the gist.
            </p>
          </div>

          <div className="tier-connector">
            <svg width="2" height="32" viewBox="0 0 2 32"><line x1="1" y1="0" x2="1" y2="32" stroke="var(--gold-dim)" strokeWidth="1" strokeDasharray="4 4"/></svg>
          </div>

          <div className="tier-card">
            <div className="tier-header">
              <div className="tier-number">2</div>
              <div className="tier-meta">
                <h3>State JSON</h3>
                <span className="tier-cost">Structured index</span>
              </div>
            </div>
            <p>
              The agent reads the palace state file — precise summaries, artifact
              paths, linked chain of memories. Compact, accurate, machine-readable.
            </p>
          </div>

          <div className="tier-connector">
            <svg width="2" height="32" viewBox="0 0 2 32"><line x1="1" y1="0" x2="1" y2="32" stroke="var(--gold-dim)" strokeWidth="1" strokeDasharray="4 4"/></svg>
          </div>

          <div className="tier-card tier-card-highlight">
            <div className="tier-header">
              <div className="tier-number" style={{color: 'var(--gold)'}}>3</div>
              <div className="tier-meta">
                <h3>QR scan → lossless recall</h3>
                <span className="tier-cost" style={{color: 'var(--gold)'}}>Powered by CueR.ai</span>
              </div>
            </div>
            <p>
              The agent scans the QR code embedded in the image, follows the URL,
              and retrieves the <strong>exact prompt that generated the image</strong> —
              the complete session summary with zero information loss.
              Even if the image is garbled or the state file is missing — the QR code
              reconstructs everything.
            </p>
          </div>
        </div>
      </section>

      <div className="divider"></div>

      {/* CueR.ai as Infrastructure */}
      <section className="section">
        <div className="section-label">Infrastructure</div>
        <h2 className="section-title">
          CueR.ai is what makes it lossless
        </h2>
        <p className="section-body">
          Without CueR.ai, Memory Palace is a useful lossy compression scheme —
          images that approximate what happened. With CueR.ai, every image contains a
          25-character QR code that resolves to the full, uncompressed context.
          The image becomes a self-healing, self-distributing data object.
        </p>

        <div className="infra-grid">
          <div className="infra-card">
            <div className="infra-icon">🔗</div>
            <h4>Short URL generation</h4>
            <p>Every memory gets a <code>qr.cuer.ai</code> short link. 25 characters that encode unlimited context.</p>
          </div>
          <div className="infra-card">
            <div className="infra-icon">📦</div>
            <h4>Prompt hosting</h4>
            <p>The full session summary — every file path, decision, blocker — stored and served instantly.</p>
          </div>
          <div className="infra-card">
            <div className="infra-icon">📱</div>
            <h4>Reliable QR scanning</h4>
            <p>QReader-powered scanning that works on AI-generated images — angled, stylized, or in complex scenes.</p>
          </div>
          <div className="infra-card">
            <div className="infra-icon">🏛️</div>
            <h4>Self-distributing</h4>
            <p>Point the QR at the skill file. Anyone who sees a memory image can scan it and start using the system.</p>
          </div>
        </div>
      </section>

      <div className="divider"></div>

      {/* Workflow */}
      <section className="section">
        <div className="section-label">Workflow</div>
        <h2 className="section-title">Images as memory. Agents as characters.</h2>
        <p className="section-body">
          After each session, your agent encodes what happened into a generated image
          via Gemini's Nano Banana Pro. Each agent appears as a distinct visual character.
        </p>

        <div className="how-grid">
          <div className="how-card">
            <div className="how-number">01</div>
            <h3>Give the skill to any agent</h3>
            <p>
              Copy the skill file and tell your agent to use it. Works with Claude Code,
              Gemini CLI, Codex, OpenClaw, Antigravity — anything that reads markdown and images.
            </p>
          </div>
          <div className="how-card">
            <div className="how-number">02</div>
            <h3>Work, then say <code style={{color: 'var(--gold)', fontFamily: 'var(--font-mono)'}}>/store</code></h3>
            <p>
              The agent summarizes the session, generates a memory image, and — with CueR.ai —
              embeds a QR code linking to the full lossless record.
            </p>
          </div>
          <div className="how-card">
            <div className="how-number">03</div>
            <h3>Next session, say <code style={{color: 'var(--gold)', fontFamily: 'var(--font-mono)'}}>/recall</code></h3>
            <p>
              The agent loads memory images for fast context. If it needs perfect
              detail, it scans the QR code and gets everything back.
            </p>
          </div>
        </div>
      </section>

      <div className="divider"></div>

      {/* Agent Roster */}
      <section className="section">
        <div className="section-label">Agent Roster</div>
        <h2 className="section-title">Every agent gets a character</h2>
        <p className="section-body" style={{marginBottom: '0.5rem'}}>
          Nano Banana Pro maintains character consistency across image generations.
          You always know who did what at a glance.
        </p>

        <div className="agents-grid">
          <div className="agent-card">
            <div className="agent-dot" style={{background: '#4A90D9'}}></div>
            <div>
              <h4>Claude Code</h4>
              <p>The Craftsman — navy apron, precision tools, wooden workbench</p>
            </div>
          </div>
          <div className="agent-card">
            <div className="agent-dot" style={{background: '#34A853'}}></div>
            <div>
              <h4>Gemini CLI</h4>
              <p>The Alchemist — emerald lab coat, glass beakers, colorful liquids</p>
            </div>
          </div>
          <div className="agent-card">
            <div className="agent-dot" style={{background: '#F5A623'}}></div>
            <div>
              <h4>Codex</h4>
              <p>The Cartographer — tan vest, blueprints, rulers and compasses</p>
            </div>
          </div>
          <div className="agent-card">
            <div className="agent-dot" style={{background: '#9B59B6'}}></div>
            <div>
              <h4>OpenClaw</h4>
              <p>The Librarian — burgundy cardigan, leather-bound books, tall shelves</p>
            </div>
          </div>
        </div>
      </section>

      <div className="divider"></div>

      {/* Pricing */}
      <section className="section">
        <div className="section-label">Pricing</div>
        <h2 className="section-title">Free to start. Lossless when you need it.</h2>
        <p className="section-body" style={{marginBottom: '2rem'}}>
          Memory Palace is free and open — it's a skill file. CueR.ai is the
          infrastructure that makes it lossless.
        </p>

        <div className="pricing-grid">
          <div className="pricing-card">
            <div className="pricing-tier">Local</div>
            <div className="pricing-price">Free</div>
            <div className="pricing-features">
              <div className="pricing-feature">✓ Memory images via Gemini</div>
              <div className="pricing-feature">✓ State JSON index</div>
              <div className="pricing-feature">✓ Prompt archival (local)</div>
              <div className="pricing-feature">✓ Cross-agent portability</div>
              <div className="pricing-feature dim">✗ QR codes in images</div>
              <div className="pricing-feature dim">✗ Lossless recall via scan</div>
              <div className="pricing-feature dim">✗ Self-distributing images</div>
            </div>
          </div>
          <div className="pricing-card pricing-card-highlight">
            <div className="pricing-tier" style={{color: 'var(--gold)'}}>CueR.ai</div>
            <div className="pricing-price">Coming soon</div>
            <div className="pricing-features">
              <div className="pricing-feature">✓ Everything in Local</div>
              <div className="pricing-feature gold">✓ QR codes in every memory</div>
              <div className="pricing-feature gold">✓ Hosted prompt storage</div>
              <div className="pricing-feature gold">✓ Lossless recall via scan</div>
              <div className="pricing-feature gold">✓ Self-distributing images</div>
              <div className="pricing-feature gold">✓ Shared palaces (team)</div>
              <div className="pricing-feature gold">✓ Recall analytics</div>
            </div>
          </div>
        </div>
      </section>

      <div className="divider"></div>

      {/* Skill Preview */}
      <section className="section" id="skill">
        <div className="section-label">The Skill File</div>
        <h2 className="section-title">This is the entire product</h2>
        <p className="section-body">
          One markdown file. Give it to any agent. No SDK, no database, no signup.
        </p>

        <div className="skill-preview">
          <div className="skill-preview-header">
            <span>memory-palace-skill.md</span>
            <div style={{display: 'flex', gap: '0.5rem'}}>
              <button className="copy-btn" onClick={downloadSkill}>↓ Download</button>
              <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={copySkill}>
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>
          <pre className="skill-preview-body">
            {skillContent || 'Loading skill file...'}
          </pre>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2 className="cta-title">Start remembering</h2>
        <p className="cta-body">
          Copy the skill file. Set your Gemini API key. Tell your agent to use it.
          Your first <code style={{color: 'var(--gold)', fontFamily: 'var(--font-mono)'}}>/store</code> is
          one command away.
        </p>
        <button className="btn-primary" onClick={copySkill} style={{position: 'relative'}}>
          {copied ? '✓ Copied to clipboard' : '⬇ Copy the Skill File'}
        </button>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>
          Memory Palace is free and open.&nbsp;
          <a href="https://cuer.ai">CueR.ai</a> is the infrastructure that makes it lossless.
          &nbsp;·&nbsp;
          <a href={SKILL_URL}>Raw skill file</a>
          &nbsp;·&nbsp;
          <a href="https://github.com" target="_blank" rel="noopener">GitHub</a>
        </p>
      </footer>
    </div>
  )
}
