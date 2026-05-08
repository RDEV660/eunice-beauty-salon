import { useScrollToHash } from '../hooks/useScrollToHash'
import { ContactSection } from '../sections/ContactSection'
import { GalleryTeaserSection } from '../sections/GalleryTeaserSection'
import { HeroSection } from '../sections/HeroSection'
import { MapSection } from '../sections/MapSection'
import { ServicesSection } from '../sections/ServicesSection'
import { TestimonialsSection } from '../sections/TestimonialsSection'
import { SiteFooter } from '../sections/SiteFooter'

export function HomePage() {
  useScrollToHash()
  return (
    <div className="relative isolate min-h-svh bg-[#050505]">
      <main className="relative">
        <HeroSection />
        <GalleryTeaserSection />
        <ServicesSection />
        <TestimonialsSection />
        <MapSection />
        <ContactSection />
      </main>
      <SiteFooter />
    </div>
  )
}
