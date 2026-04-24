import { useScrollToHash } from '../hooks/useScrollToHash'
import { ContactSection } from '../sections/ContactSection'
import { HeroSection } from '../sections/HeroSection'
import { MapSection } from '../sections/MapSection'
import { ServicesSection } from '../sections/ServicesSection'
import { SiteFooter } from '../sections/SiteFooter'

export function HomePage() {
  useScrollToHash()
  return (
    <div className="relative isolate min-h-svh bg-[#050505]">
      <main className="relative">
        <HeroSection />
        <ServicesSection />
        <MapSection />
        <ContactSection />
      </main>
      <SiteFooter />
    </div>
  )
}
