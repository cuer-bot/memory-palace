import { Navbar } from "@/components/landing/navbar"
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { ArchitectureSection } from "@/components/landing/architecture-section"
import { AgentsSection } from "@/components/landing/agents-section"
import { SkillPreviewSection } from "@/components/landing/skill-preview-section"
import { CtaSection } from "@/components/landing/cta-section"

export default function LandingPage() {
  return (
    <div className="page">
      <Navbar />
      <HeroSection />
      <div className="divider" />
      <FeaturesSection />
      <div className="divider" />
      <ArchitectureSection />
      <div className="divider" />
      <AgentsSection />
      <div className="divider" />
      <SkillPreviewSection />
      <div className="divider" />
      <CtaSection />
    </div>
  )
}
