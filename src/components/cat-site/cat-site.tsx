'use client'

import { useEffect } from 'react'
import { Loader2, Cat as CatIcon, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteNav } from './site-nav'
import { SiteFooter } from './site-footer'
import { DashboardView } from './dashboard-view'
import { HeroSection } from './hero-section'
import { DiarySection } from './diary-section'
import { WeightSection } from './weight-section'
import { HealthSection } from './health-section'
import { AlbumSection } from './album-section'
import { AIPlaySection } from './ai-play-section'
import { MilestoneSection } from './milestone-section'
import { MessageSection } from './message-section'
import { useCatStore } from '@/lib/cat-store'
import { HeartPulse } from 'lucide-react'

export function CatSite() {
  const { cats, loadingCats, view, selectedCatId, setCats, goToDashboard, selectCat } = useCatStore()

  useEffect(() => {
    fetch('/api/cats')
      .then(r => r.json())
      .then((data) => setCats(data))
      .catch(() => setCats([]))
  }, [setCats])

  if (loadingCats) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <Loader2 className="h-10 w-10 animate-spin text-amber-400" />
      </div>
    )
  }

  // 无猫：引导添加
  if (cats.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-cream">
        <SiteNav />
        <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-amber-100 text-amber-500">
            <CatIcon className="h-12 w-12" />
          </div>
          <h1 className="mb-3 text-2xl font-bold text-stone-800">欢迎来到猫窝</h1>
          <p className="mb-8 max-w-md text-stone-500">
            这里可以记录每只猫咪的成长日记、体重健康、萌照相册，还能用 AI 给它们写日记、画艺术照。
            点击下方按钮，添加你的第一只猫咪吧。
          </p>
          <div className="rounded-xl border border-amber-200 bg-white/70 px-6 py-4">
            <p className="mb-3 text-sm text-stone-600">点击顶部的「添加猫咪」按钮开始</p>
            <EmptyAddButton onCreated={(c) => selectCat(c.id)} />
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  // 仪表盘视图
  if (view === 'dashboard' || !selectedCatId) {
    return (
      <div className="flex min-h-screen flex-col bg-cream">
        <SiteNav />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
          <DashboardView />
        </main>
        <SiteFooter />
      </div>
    )
  }

  // 猫咪详情视图
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <SiteNav />
      <main className="mx-auto w-full max-w-6xl flex-1 space-y-16 px-4 py-8 sm:px-6 sm:py-10">
        {/* 返回仪表盘 */}
        <div>
          <Button variant="ghost" size="sm" onClick={goToDashboard} className="text-stone-500 hover:bg-amber-50 hover:text-amber-700">
            <ArrowLeft className="mr-1 h-4 w-4" /> 返回猫窝总览
          </Button>
        </div>
        <HeroSection />
        <DiarySection />

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

// 空状态用的添加按钮（简化版，只触发 CatSwitcher 里的添加）
import { CatSwitcher } from './cat-switcher'
function EmptyAddButton({ onCreated }: { onCreated: (cat: { id: string }) => void }) {
  return (
    <div className="flex justify-center">
      <CatSwitcher />
    </div>
  )
}
