"use client"

import { useState, useEffect } from "react"

const SKILL_URL = "/memory-palace-skill.md"

export function SkillPreviewSection() {
  const [skillContent, setSkillContent] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch(SKILL_URL)
      .then((r) => r.text())
      .then(setSkillContent)
      .catch(() => setSkillContent("# Error loading skill file"))
  }, [])

  const copySkill = async () => {
    try {
      await navigator.clipboard.writeText(skillContent)
    } catch {
      const ta = document.createElement("textarea")
      ta.value = skillContent
      document.body.appendChild(ta)
      ta.select()
      document.execCommand("copy")
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const downloadSkill = () => {
    const blob = new Blob([skillContent], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "memory-palace-skill.md"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="section" id="skill">
      <div className="section-label">The Skill File</div>
      <h2 className="section-title">This is the entire product</h2>
      <p className="section-body">
        One markdown file. Give it to any agent. No SDK, no database, no signup.
      </p>

      <div className="skill-preview">
        <div className="skill-preview-header">
          <span>memory-palace-skill.md</span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className="copy-btn" onClick={downloadSkill}>
              {"↓ Download"}
            </button>
            <button
              className={`copy-btn ${copied ? "copied" : ""}`}
              onClick={copySkill}
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
        <pre className="skill-preview-body">
          {skillContent || "Loading skill file..."}
        </pre>
      </div>
    </section>
  )
}
