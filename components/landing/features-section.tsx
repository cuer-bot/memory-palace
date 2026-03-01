const features = [
  {
    number: "01",
    title: "Structured Memory Tiers",
    description:
      "Five distinct memory layers — from ephemeral scratch to permanent vault — each with its own lifecycle and retrieval priority.",
  },
  {
    number: "02",
    title: "Agent-Native MCP Server",
    description:
      "Expose memory operations as tools via the Model Context Protocol. Your agent calls save, recall, and forget just like any other skill.",
  },
  {
    number: "03",
    title: "Encrypted by Default",
    description:
      "AES-256-GCM encryption on every memory artifact. Keys rotate automatically. Your agent's memories stay private.",
  },
]

export function FeaturesSection() {
  return (
    <section className="section" id="faq">
      <div className="section-label">How It Works</div>
      <h2 className="section-title">
        Memory, <em style={{ color: "var(--gold)", fontStyle: "italic" }}>Architected</em>
      </h2>
      <p className="section-body">
        CueR Memory Palace gives your AI agent a structured, persistent memory system
        inspired by the ancient Method of Loci — reimagined for the age of agents.
      </p>
      <div className="how-grid">
        {features.map((feature) => (
          <div key={feature.number} className="how-card">
            <div className="how-number">{feature.number}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
