export function CtaSection() {
  return (
    <section className="cta-section">
      <h2 className="cta-title">
        Build an Agent That <em style={{ color: "var(--gold)", fontStyle: "italic" }}>Remembers</em>
      </h2>
      <p className="cta-body">
        Stop losing context between conversations. Give your AI the gift of structured,
        persistent memory.
      </p>
      <div className="command-demo">
        <span className="prompt">$</span>
        <span className="cmd">npm i -g @mempalace</span>
      </div>

      <footer className="footer" style={{ marginTop: "6rem" }}>
        <p>
          Built by{" "}
          <a href="https://github.com/cuer-bot" target="_blank" rel="noopener noreferrer">
            CueR
          </a>{" "}
          &middot; Open Source &middot; MIT License
        </p>
      </footer>
    </section>
  )
}
