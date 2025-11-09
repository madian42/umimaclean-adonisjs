import Navbar from '../components/navbar'
import HeroSection from '../components/hero-section'
import HowToSection from '../components/how-to-section'
import ServiceSection from '../components/service-section'
import ReviewSection from '../components/review-section'
import Footer from '../components/footer'
import CtaSection from '../components/cta-section'

export default function Home() {
  return (
    <div className="mx-auto min-h-screen max-w-md bg-background">
      <Navbar />

      <HeroSection />
      <HowToSection />
      <ServiceSection />
      <ReviewSection />
      <CtaSection />

      <Footer />
    </div>
  )
}
