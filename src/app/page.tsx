import Header from '@/components/landing/Header'
import HeroSection from '@/components/landing/HeroSection'
import TrustBar from '@/components/landing/TrustBar'
import FeatureMarquee from '@/components/landing/FeatureMarquee'
import ProblemSection from '@/components/landing/ProblemSection'
import AboutSection from '@/components/landing/AboutSection'
import SolutionSection from '@/components/landing/SolutionSection'
import StepsSection from '@/components/landing/StepsSection'
import CtaSection from '@/components/landing/CtaSection'
import Footer from '@/components/landing/Footer'
import MobileStickyCta from '@/components/landing/MobileStickyCta'
import * as s from './landing.css'

export default function LandingPage() {
  return (
    <main className={s.page}>
      <Header />
      <HeroSection />
      <TrustBar />
      <FeatureMarquee />
      <ProblemSection />
      <AboutSection />
      <SolutionSection />
      <StepsSection />
      <CtaSection />
      <Footer />
      <MobileStickyCta />
    </main>
  )
}
