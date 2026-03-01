"use client"

import Link from "next/link"

const navItems = [
  { label: "FAQ", href: "#faq", variant: "stone" as const },
  { label: "Troubleshooting", href: "#troubleshooting", variant: "parchment" as const },
  { label: "Blog", href: "#blog", variant: "sand" as const },
  { label: "Dashboard", href: "#dashboard", variant: "slate" as const },
  { label: "Login", href: "#login", variant: "copper" as const },
]

const variantStyles: Record<string, string> = {
  stone: "nav-tab--stone",
  parchment: "nav-tab--parchment",
  sand: "nav-tab--sand",
  slate: "nav-tab--slate",
  copper: "nav-tab--copper",
}

export function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="navbar-brand" aria-label="CueR Memory Palace home">
          <div className="brand-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="16" cy="16" r="14" stroke="var(--gold)" strokeWidth="2.5" fill="none" />
              <circle cx="16" cy="16" r="6" stroke="var(--gold)" strokeWidth="2" fill="none" />
              <circle cx="16" cy="16" r="2" fill="var(--gold)" />
              <line x1="16" y1="2" x2="16" y2="8" stroke="var(--gold)" strokeWidth="2" />
            </svg>
          </div>
          <span className="brand-text">CueR Memory Palace.</span>
        </Link>
        <nav className="navbar-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`nav-tab ${variantStyles[item.variant]}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
