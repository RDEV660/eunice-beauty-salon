import { useScrollToHash } from '../hooks/useScrollToHash'
import { ContactSection } from '../sections/ContactSection'
import { GallerySection } from '../sections/GallerySection'
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
        <GallerySection />
        <ServicesSection />
        <TestimonialsSection />
        <MapSection />
        <ContactSection />
      </main>
      <SiteFooter />
    </div>
  )
}
