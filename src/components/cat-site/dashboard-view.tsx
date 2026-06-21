'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Cat as CatIcon, Plus, BookOpen, Images, MessageCircle, Bot,
  BellRing, ChevronRight, Scale, CalendarClock, Sparkles, Heart, PawPrint,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCatStore } from '@/lib/cat-store'
import { CatSwitcher } from './cat-switcher'
import {
  calcAge, daysToNextBirthday, fmtDate, MOOD_MAP, HEALTH_TYPE_MAP,
  type DashboardData,
} from '@/lib/types'

export function DashboardView() {
  const { cats, selectCat } = useCatStore()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/dashboard')
      const d = await res.json()
      setData(d)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  if (loading || !data) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-bounce text-5xl">🐾</div>
      </div>
    )
  }

  const { stats, cats: catStats, recentDiaries, reminders } = data

  return (
    <div className="space-y-10">
      {/* 欢迎区 */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-100 via-orange-50 to-rose-50 px-6 py-8 sm:px-10 sm:py-12">
        <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-8 h-48 w-48 rounded-full bg-rose-200/40 blur-3xl" />
        <div className="relative">
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400 text-white shadow-sm">
              <PawPrint className="h-6 w-6" />
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-stone-800 sm:text-3xl">
              欢迎来到猫窝
            </h1>
          </div>
          <p className="mb-5 max-w-xl text-sm leading-relaxed text-stone-600 sm:text-base">
            这里是所有小可爱的总览。每只猫都有自己的专属小窝，记录成长、健康和趣事。点击下方任一猫咪，进入它的小窝看看吧。
          </p>
          {/* 猫咪切换条（含添加按钮）—— 这里作为快捷入口 */}
          <CatSwitcher />
        </div>
      </section>

      {/* 全局统计 */}
      <section>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard icon={<CatIcon className="h-5 w-5" />} label="猫咪" value={stats.catCount} tint="bg-amber-50 text-amber-600" />
          <StatCard icon={<BookOpen className="h-5 w-5" />} label="日记" value={stats.totalDiaries} tint="bg-rose-50 text-rose-600" />
          <StatCard icon={<Images className="h-5 w-5" />} label="照片" value={stats.totalPhotos} tint="bg-teal-50 text-teal-600" />
          <StatCard icon={<Bot className="h-5 w-5" />} label="AI 创作" value={stats.totalAiContents} tint="bg-purple-50 text-purple-600" />
          <StatCard icon={<MessageCircle className="h-5 w-5" />} label="留言" value={stats.totalMessages} tint="bg-pink-50 text-pink-600" />
        </div>
      </section>

      {/* 猫咪卡片墙 */}
      <section>
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
            <Heart className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-stone-800 sm:text-2xl">我的猫咪</h2>
            <p className="text-sm text-stone-500">点击进入专属小窝</p>
          </div>
        </div>

        {catStats.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-amber-200 text-stone-400">
            <span className="text-4xl">🐱</span>
            <p className="text-sm">还没有猫咪，点上方「添加猫咪」开始记录吧</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {catStats.map((c) => (
              <CatCard key={c.id} cat={c} onClick={() => selectCat(c.id)} />
            ))}
          </div>
        )}
      </section>

      {/* 近期动态 + 健康提醒 双栏 */}
      <section className="grid gap-6 lg:grid-cols-5">
        {/* 近期动态时间线 */}
        <div className="lg:col-span-3">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <Sparkles className="h-4 w-4" />
            </span>
            <h2 className="text-lg font-bold text-stone-800">近期动态</h2>
          </div>
          {recentDiaries.length === 0 ? (
            <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-amber-200 text-sm text-stone-400">
              还没有动态
            </div>
          ) : (
            <div className="space-y-3">
              {recentDiaries.map((d) => {
                const mood = d.mood ? MOOD_MAP[d.mood] : null
                return (
                  <Card
                    key={d.id}
                    className="cursor-pointer border-amber-100/60 p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                    onClick={() => selectCat(d.catId)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0">
                        {d.catAvatar ? (
                          <img loading="lazy" src={d.catAvatar} alt={d.catName} className="h-10 w-10 rounded-full object-cover" />
                        ) : (
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-lg">🐱</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-stone-800">{d.catName}</span>
                          {mood && <Badge className={mood.color}>{mood.emoji} {mood.label}</Badge>}
                          <span className="text-xs text-stone-400">{fmtDate(d.date)}</span>
                        </div>
                        <h3 className="mb-0.5 text-sm font-bold text-stone-700 dark:text-stone-200">{d.title}</h3>
                        <p className="line-clamp-2 text-xs leading-relaxed text-stone-500 dark:text-stone-400">{d.content}</p>
                        <span className="mt-1 inline-block text-[10px] font-medium text-amber-600 dark:text-amber-400">点击查看 ›</span>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 self-center text-stone-300" />
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* 健康提醒 */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <BellRing className="h-4 w-4" />
            </span>
            <h2 className="text-lg font-bold text-stone-800">健康提醒</h2>
          </div>
          {reminders.length === 0 ? (
            <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-amber-200 text-sm text-stone-400">
              近期没有到期提醒 🎉
            </div>
          ) : (
            <div className="space-y-2">
              {reminders.slice(0, 8).map((r) => {
                const t = HEALTH_TYPE_MAP[r.type] || { label: r.type, emoji: '📋', color: 'bg-stone-100 text-stone-700' }
                const overdue = (r.daysLeft ?? 0) < 0
                return (
                  <Card
                    key={r.id}
                    className="cursor-pointer border-amber-100/60 p-3 shadow-sm transition-colors hover:bg-amber-50/40"
                    onClick={() => selectCat(r.catId)}
                  >
                    <div className="flex items-center gap-2">
                      {r.catAvatar ? (
                        <img loading="lazy" src={r.catAvatar} alt={r.catName} className="h-7 w-7 rounded-full object-cover" />
                      ) : (
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-sm">🐱</span>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-stone-400">{r.catName}</span>
                          <Badge className={`${t.color} px-1.5 py-0 text-[10px]`}>{t.emoji} {t.label}</Badge>
                        </div>
                        <div className="truncate text-sm font-medium text-stone-700">{r.title}</div>
                      </div>
                      <div className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${overdue ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                        {overdue ? `过期${-(r.daysLeft ?? 0)}天` : `${r.daysLeft}天后`}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function StatCard({ icon, label, value, tint }: { icon: React.ReactNode; label: string; value: number; tint: string }) {
  return (
    <Card className="flex items-center gap-3 border-amber-100/60 p-4 shadow-sm">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tint}`}>{icon}</span>
      <div className="min-w-0">
        <div className="text-xs text-stone-500">{label}</div>
        <div className="text-xl font-bold text-stone-800">{value}</div>
      </div>
    </Card>
  )
}

function CatCard({ cat, onClick }: { cat: DashboardData['cats'][number]; onClick: () => void }) {
  const age = calcAge(cat.birthday)
  const daysToBday = daysToNextBirthday(cat.birthday)
  const ageText = cat.birthday
    ? age.years > 0 ? `${age.years}岁${age.months}月` : `${age.months}月${age.days}天`
    : '—'

  return (
    <Card
      className="group cursor-pointer overflow-hidden border-amber-100/60 p-0 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
      onClick={onClick}
    >
      {/* 顶部头像区 */}
      <div className="relative h-24 overflow-hidden bg-gradient-to-br from-amber-100 to-rose-100">
        <div className="pointer-events-none absolute inset-0 opacity-50">
          <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/40 blur-2xl" />
        </div>
        <div className="absolute -bottom-7 left-5">
          {cat.avatar ? (
            <img loading="lazy" src={cat.avatar} alt={cat.name} className="h-16 w-16 rounded-full border-4 border-white object-cover shadow-md" />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-amber-200 text-3xl shadow-md">🐱</span>
          )}
        </div>
        {cat.reminders.length > 0 && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-medium text-rose-600 shadow-sm">
            <BellRing className="h-3 w-3" /> {cat.reminders.length}提醒
          </span>
        )}
      </div>

      {/* 内容 */}
      <div className="px-5 pb-5 pt-9">
        <div className="mb-1 flex items-center gap-2">
          <h3 className="text-lg font-bold text-stone-800">{cat.name}</h3>
          <span className="text-xs text-stone-400">
            {cat.color} · {cat.gender}
          </span>
        </div>
        {cat.breed && <p className="mb-2 text-xs text-stone-500">{cat.breed}</p>}
        {cat.motto && (
          <p className="mb-3 line-clamp-1 text-xs italic text-amber-600">「{cat.motto}」</p>
        )}

        {/* 状态条 */}
        <div className="mb-3 grid grid-cols-3 gap-2 text-center">
          <MiniInfo icon={<CalendarClock className="h-3 w-3" />} label="年龄" value={ageText} />
          <MiniInfo icon={<Scale className="h-3 w-3" />} label="体重" value={cat.latestWeight ? `${cat.latestWeight.weight}kg` : '—'} />
          <MiniInfo icon={<Sparkles className="h-3 w-3" />} label="生日" value={daysToBday >= 0 ? `${daysToBday}天` : '—'} />
        </div>

        {/* 最新动态 */}
        {cat.latestDiary ? (
          <div className="rounded-lg bg-amber-50/50 p-2.5">
            <div className="mb-0.5 flex items-center gap-1 text-[10px] text-stone-400">
              <BookOpen className="h-2.5 w-2.5" /> 最近日记
            </div>
            <p className="line-clamp-1 text-xs font-medium text-stone-600">{cat.latestDiary.title}</p>
          </div>
        ) : (
          <div className="rounded-lg bg-stone-50 p-2.5 text-center text-[11px] text-stone-400">
            还没有日记，快去写一篇吧
          </div>
        )}

        {/* 统计 footer */}
        <div className="mt-3 flex items-center justify-between border-t border-amber-50 pt-2 text-[11px] text-stone-400">
          <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {cat.diaryCount} 篇日记</span>
          <span className="flex items-center gap-1"><Images className="h-3 w-3" /> {cat.photoCount} 张照片</span>
          <span className="flex items-center gap-1 font-medium text-amber-600 group-hover:text-amber-700">
            进入小窝 <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Card>
  )
}

function MiniInfo({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-stone-50 px-1.5 py-1.5">
      <div className="mb-0.5 flex items-center justify-center gap-1 text-[9px] text-stone-400">{icon}{label}</div>
      <div className="truncate text-[11px] font-semibold text-stone-700">{value}</div>
    </div>
  )
}
