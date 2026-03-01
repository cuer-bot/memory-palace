const agents = [
  {
    name: "Claude",
    desc: "Anthropic's Claude with persistent context across sessions.",
    color: "var(--accent-blue)",
  },
  {
    name: "GPT-4",
    desc: "OpenAI models with long-term structured recall.",
    color: "var(--accent-green)",
  },
  {
    name: "Gemini",
    desc: "Google's Gemini with organized memory tiers.",
    color: "var(--gold)",
  },
  {
    name: "Custom Agents",
    desc: "Any MCP-compatible agent can plug in instantly.",
    color: "var(--accent-red)",
  },
]

export function AgentsSection() {
  return (
    <section className="section">
      <div className="section-label">Compatible Agents</div>
      <h2 className="section-title">Works With Your Stack</h2>
      <p className="section-body">
        Memory Palace integrates with any agent that speaks MCP. Here are a few that work out of the box.
      </p>
      <div className="agents-grid">
        {agents.map((agent) => (
          <div key={agent.name} className="agent-card">
            <div className="agent-dot" style={{ background: agent.color }} />
            <div>
              <h4>{agent.name}</h4>
              <p>{agent.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
