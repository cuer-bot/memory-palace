"use client"

interface InstallTerminalProps {
  onCopy: () => void
  copied: boolean
}

export function InstallTerminal({ onCopy, copied }: InstallTerminalProps) {
  return (
    <div className="terminal-device">
      <div className="terminal-handle" aria-hidden="true" />
      <div className="terminal-screen">
        <code className="terminal-text">
          <span className="terminal-prompt">$</span>{" "}
          npm i -g <span className="terminal-package">@mempalace</span>
        </code>
        <button
          className="terminal-copy-btn"
          onClick={onCopy}
          aria-label="Copy install command"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <rect x="6" y="6" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <rect x="2" y="2" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span className="terminal-copy-label">{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
    </div>
  )
}
