import type { Metadata, Viewport } from "next"
import { Cormorant_Garamond, DM_Sans, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "CueR Memory Palace — Structured Long-Term Memory for AI Agents",
  description:
    "Integrate the CueR Memory Palace skill and unlock structured long-term memory for your AI. Elevate your agent's mind with persistent, organized recall.",
  openGraph: {
    title: "CueR Memory Palace — Structured Long-Term Memory for AI Agents",
    description:
      "Store agent memories with structure. Recall them in any session, with any agent.",
    url: "https://m.cuer.ai",
    siteName: "CueR Memory Palace",
    type: "website",
  },
}

export const viewport: Viewport = {
  themeColor: "#07060b",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
