'use client'

import { Cake, Ruler, Heart, Sparkles, PawPrint } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CatSwitcher } from './cat-switcher'
import { useSelectedCat } from '@/lib/cat-store'
import { calcAge, daysToNextBirthday, fmtDate } from '@/lib/types'

export function HeroSection() {
  const cat = useSelectedCat()

  if (!cat) return null

  const age = calcAge(cat.birthday)
  const daysToBday = daysToNextBirthday(cat.birthday)

  return (
    <section id="home" className="scroll-mt-20">
      {/* 猫咪切换器 */}
      <div className="mb-4">
        <CatSwitcher />
      </div>

      {/* 顶部 hero 横幅 */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-100 via-orange-50 to-rose-50 px-6 py-10 sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-8 h-44 w-44 rounded-full bg-rose-200/40 blur-3xl" />
        <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-center">
          {/* 头像 */}
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-full bg-amber-300/40 blur-xl" />
            {cat.avatar ? (
              <img loading="lazy"
                src={cat.avatar}
                alt={cat.name}
                className="relative h-32 w-32 rounded-full border-4 border-white object-cover shadow-lg sm:h-40 sm:w-40"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
              />
            ) : (
              <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-amber-200 text-5xl shadow-lg sm:h-40 sm:w-40">
                🐱
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-amber-400 text-white shadow">
              <PawPrint className="h-4 w-4" />
            </div>
          </div>

          {/* 名字 + 座右铭 */}
          <div className="flex-1 text-center sm:text-left">
            <div className="mb-1 flex items-center justify-center gap-2 sm:justify-start">
              <h1 className="text-3xl font-extrabold tracking-tight text-stone-800 sm:text-4xl">
                {cat.name}
              </h1>
              <Badge className="bg-amber-400 text-white hover:bg-amber-500">
                {cat.color || ''} · {cat.gender === '公' ? '♂' : cat.gender === '母' ? '♀' : ''} {cat.gender || ''}
              </Badge>
            </div>
            {cat.breed && <p className="mb-2 text-sm text-stone-500">{cat.breed}</p>}
            {cat.motto && (
              <p className="mb-3 inline-block rounded-full bg-white/70 px-4 py-1.5 text-sm font-medium text-amber-700 shadow-sm">
                「{cat.motto}」
              </p>
            )}
            {cat.bio && <p className="max-w-xl text-sm leading-relaxed text-stone-600">{cat.bio}</p>}
            {cat.traits.length > 0 && (
              <div className="mt-3 flex flex-wrap justify-center gap-1.5 sm:justify-start">
                {cat.traits.map((t) => (
                  <span key={t} className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-stone-600 shadow-sm">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={<Cake className="h-5 w-5" />}
          label="年龄"
          value={age.years > 0 ? `${age.years}岁${age.months}月` : `${age.months}月${age.days}天`}
          tint="bg-rose-50 text-rose-600"
        />
        <StatCard
          icon={<Sparkles className="h-5 w-5" />}
          label="距下个生日"
          value={daysToBday >= 0 ? `${daysToBday} 天` : '—'}
          tint="bg-amber-50 text-amber-600"
        />
        <StatCard
          icon={<Ruler className="h-5 w-5" />}
          label="出生日期"
          value={cat.birthday ? fmtDate(cat.birthday) : '未填'}
          tint="bg-teal-50 text-teal-600"
        />
        <StatCard
          icon={<Heart className="h-5 w-5" />}
          label="绝育状态"
          value={cat.neutered ? '已绝育' : '未绝育'}
          tint="bg-pink-50 text-pink-600"
        />
      </div>
    </section>
  )
}

function StatCard({ icon, label, value, tint }: { icon: React.ReactNode; label: string; value: string; tint: string }) {
  return (
    <Card className="flex items-center gap-3 border-amber-100/60 p-4 shadow-sm">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tint}`}>{icon}</span>
      <div className="min-w-0">
        <div className="text-xs text-stone-500">{label}</div>
        <div className="truncate text-base font-bold text-stone-800">{value}</div>
      </div>
    </Card>
  )
}
