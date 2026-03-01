"use client"

import { useState, useCallback } from "react"
import { InstallTerminal } from "./install-terminal"
import { OnboardingComic } from "./onboarding-comic"

export function HeroSection() {
  const [copied, setCopied] = useState(false)

  const handleCopySkill = useCallback(() => {
    navigator.clipboard.writeText("npm i -g @mempalace")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [])

  return (
    <section className="hero-landing">
      {/* Floating neural particles background */}
      <div className="neural-bg" aria-hidden="true">
        {[
          { left: "8%",  top: "15%", delay: "0s",   dur: "4.2s" },
          { left: "22%", top: "28%", delay: "1.2s", dur: "5.1s" },
          { left: "35%", top: "12%", delay: "2.8s", dur: "3.8s" },
          { left: "12%", top: "55%", delay: "0.5s", dur: "6.0s" },
          { left: "40%", top: "42%", delay: "3.1s", dur: "4.5s" },
          { left: "6%",  top: "72%", delay: "1.8s", dur: "5.5s" },
          { left: "28%", top: "65%", delay: "4.0s", dur: "3.5s" },
          { left: "18%", top: "85%", delay: "0.8s", dur: "4.8s" },
          { left: "42%", top: "22%", delay: "2.2s", dur: "6.2s" },
          { left: "33%", top: "78%", delay: "3.5s", dur: "4.0s" },
          { left: "10%", top: "38%", delay: "1.5s", dur: "5.8s" },
          { left: "25%", top: "48%", delay: "4.5s", dur: "3.3s" },
          { left: "38%", top: "58%", delay: "0.3s", dur: "4.7s" },
          { left: "15%", top: "92%", delay: "2.5s", dur: "5.3s" },
          { left: "30%", top: "32%", delay: "3.8s", dur: "6.5s" },
          { left: "5%",  top: "45%", delay: "1.0s", dur: "4.1s" },
          { left: "20%", top: "18%", delay: "4.2s", dur: "5.6s" },
          { left: "44%", top: "75%", delay: "2.0s", dur: "3.9s" },
        ].map((dot, i) => (
          <div
            key={i}
            className="neural-dot"
            style={{
              left: dot.left,
              top: dot.top,
              animationDelay: dot.delay,
              animationDuration: dot.dur,
            }}
          />
        ))}
        <svg className="neural-lines" viewBox="0 0 500 500" preserveAspectRatio="none">
          <path d="M50,100 Q150,50 200,200 T400,300" stroke="var(--gold-dim)" strokeWidth="0.5" fill="none" opacity="0.3" />
          <path d="M100,400 Q200,300 300,350 T450,150" stroke="var(--accent-green)" strokeWidth="0.5" fill="none" opacity="0.2" />
          <path d="M30,250 Q180,180 250,280 T420,200" stroke="var(--gold)" strokeWidth="0.4" fill="none" opacity="0.15" />
        </svg>
      </div>

      {/* Main hero panel */}
      <div className="hero-panel">
        <div className="hero-panel-border" aria-hidden="true" />
        <h1 className="hero-landing-title">
          <em>Elevate</em> Your Agent{"'"}s Mind
        </h1>
        <p className="hero-landing-subtitle">
          Integrate the CueR Memory Palace skill and unlock structured
          long-term memory for your AI.
        </p>
      </div>

      {/* Content row */}
      <div className="hero-content-row">
        <InstallTerminal onCopy={handleCopySkill} copied={copied} />
        <OnboardingComic />
      </div>

      {/* Action buttons */}
      <div className="hero-cta-row">
        <button
          className="sketch-btn sketch-btn--teal"
          onClick={handleCopySkill}
          aria-label="Copy skill install command"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            <rect x="2" y="2" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          {copied ? "Copied!" : "Copy Skill"}
        </button>
        <a
          href="https://github.com/cuer-bot/memory-palace"
          target="_blank"
          rel="noopener noreferrer"
          className="sketch-btn sketch-btn--teal"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 2v8M8 10l3-3M8 10l-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Download Skill
        </a>
      </div>

      {/* Isometric palace illustration (right side) */}
      <div className="palace-illustration" aria-hidden="true">
        <div className="palace-building">
          <div className="palace-roof" />
          <div className="palace-columns">
            <div className="palace-column" />
            <div className="palace-column" />
            <div className="palace-column" />
            <div className="palace-column" />
          </div>
          <div className="palace-base" />
          <div className="palace-logo">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="12" stroke="var(--gold)" strokeWidth="2" fill="none" />
              <circle cx="16" cy="16" r="5" stroke="var(--gold)" strokeWidth="1.5" fill="none" />
              <circle cx="16" cy="16" r="2" fill="var(--gold)" />
            </svg>
          </div>
        </div>
        <div className="palace-floor">
          <div className="palace-room" />
          <div className="palace-room" />
          <div className="palace-room" />
          <div className="palace-room" />
        </div>
      </div>
    </section>
  )
}
