import { SiteNav } from '@/components/cat-site/site-nav'
import { SiteFooter } from '@/components/cat-site/site-footer'
import { HeroSection } from '@/components/cat-site/hero-section'
import { DiarySection } from '@/components/cat-site/diary-section'
import { WeightSection } from '@/components/cat-site/weight-section'
import { HealthSection } from '@/components/cat-site/health-section'
import { AlbumSection } from '@/components/cat-site/album-section'
import { AIPlaySection } from '@/components/cat-site/ai-play-section'
import { MilestoneSection } from '@/components/cat-site/milestone-section'
import { MessageSection } from '@/components/cat-site/message-section'
import { HeartPulse, Stethoscope } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <SiteNav />
      <main className="mx-auto w-full max-w-6xl flex-1 space-y-16 px-4 py-8 sm:px-6 sm:py-10">
        <HeroSection />
        <DiarySection />

        {/* 健康中心：体重 + 健康记录 */}
        <section id="health" className="scroll-mt-20">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
              <HeartPulse className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-stone-800 sm:text-2xl">健康中心</h2>
              <p className="text-sm text-stone-500">体重曲线 · 疫苗驱虫体检 · 智能提醒</p>
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <WeightSection />
            <HealthSection />
          </div>
        </section>

        <AlbumSection />
        <AIPlaySection />
        <MilestoneSection />
        <MessageSection />
      </main>
      <SiteFooter />
    </div>
  )
}
