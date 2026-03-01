export function OnboardingComic() {
  return (
    <div className="comic-panel">
      <div className="comic-panel-inner">
        <div className="comic-step">
          <div className="comic-step-number">1</div>
          <div className="comic-step-content">
            <h3>Install the Skill</h3>
            <p>Run the CLI to add Memory Palace to your agent stack.</p>
          </div>
        </div>
        <div className="comic-step">
          <div className="comic-step-number">2</div>
          <div className="comic-step-content">
            <h3>Connect Your Agent</h3>
            <p>Point your AI to the Memory Palace MCP server.</p>
          </div>
        </div>
        <div className="comic-step">
          <div className="comic-step-number">3</div>
          <div className="comic-step-content">
            <h3>Remember Everything</h3>
            <p>Your agent now has persistent, structured recall.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
