import type { Metadata } from 'next'
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

export const metadata: Metadata = {
  title: '클랫 — 학원 선생님을 위한 수업 관리 도구',
  description:
    '수업 기록, 학생 추적, 학부모 알림을 하나의 흐름으로. 수업은 가르치는 것만으로도 충분해야 합니다.',
  openGraph: {
    title: '클랫 — 학원 선생님을 위한 수업 관리 도구',
    description: '수업 외 행정에 쓰던 시간, 클랫이 돌려드립니다.',
    type: 'website',
  },
}

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
