const tiers = [
  {
    number: "1",
    title: "Visual Analysis",
    cost: "~1,000 tokens",
    description:
      "The agent looks at the memory image. Recognizes the character, reads whiteboard text, infers the scene. Fast, cheap, approximate.",
    highlight: false,
  },
  {
    number: "2",
    title: "State JSON",
    cost: "Structured index",
    description:
      "The agent reads the palace state file — precise summaries, artifact paths, linked chain of memories. Compact and machine-readable.",
    highlight: false,
  },
  {
    number: "3",
    title: "QR Scan — Lossless Recall",
    cost: "Powered by CueR.ai",
    description:
      "The agent scans the QR code embedded in the image, follows the URL, and retrieves the exact prompt that generated the image — zero information loss.",
    highlight: true,
  },
]

export function ArchitectureSection() {
  return (
    <section className="section" id="troubleshooting">
      <div className="section-label">Architecture</div>
      <h2 className="section-title">Three tiers of recall</h2>
      <p className="section-body">
        Every memory can be accessed at three levels of fidelity. Agents start
        cheap and go deeper only when they need to.
      </p>

      <div className="tier-stack">
        {tiers.map((tier, i) => (
          <div key={tier.number}>
            <div
              className={`tier-card ${tier.highlight ? "tier-card-highlight" : ""}`}
            >
              <div className="tier-header">
                <div
                  className="tier-number"
                  style={tier.highlight ? { color: "var(--gold)" } : undefined}
                >
                  {tier.number}
                </div>
                <div className="tier-meta">
                  <h3>{tier.title}</h3>
                  <span
                    className="tier-cost"
                    style={
                      tier.highlight ? { color: "var(--gold)" } : undefined
                    }
                  >
                    {tier.cost}
                  </span>
                </div>
              </div>
              <p>{tier.description}</p>
            </div>
            {i < tiers.length - 1 && (
              <div className="tier-connector">
                <svg width="2" height="32" viewBox="0 0 2 32">
                  <line
                    x1="1"
                    y1="0"
                    x2="1"
                    y2="32"
                    stroke="var(--gold-dim)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
