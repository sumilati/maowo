// 共享类型定义

export type Mood = 'happy' | 'sleepy' | 'naughty' | 'cute' | 'grumpy' | 'curious'

export const MOOD_MAP: Record<string, { label: string; emoji: string; color: string }> = {
  happy: { label: '开心', emoji: '😸', color: 'bg-amber-100 text-amber-700' },
  sleepy: { label: '犯困', emoji: '😴', color: 'bg-indigo-100 text-indigo-700' },
  naughty: { label: '捣蛋', emoji: '😼', color: 'bg-rose-100 text-rose-700' },
  cute: { label: '卖萌', emoji: '🥺', color: 'bg-pink-100 text-pink-700' },
  grumpy: { label: '傲娇', emoji: '😾', color: 'bg-stone-100 text-stone-700' },
  curious: { label: '好奇', emoji: '👀', color: 'bg-emerald-100 text-emerald-700' },
}

export const HEALTH_TYPE_MAP: Record<string, { label: string; emoji: string; color: string }> = {
  vaccine: { label: '疫苗', emoji: '💉', color: 'bg-teal-100 text-teal-700' },
  deworm: { label: '驱虫', emoji: '🐛', color: 'bg-lime-100 text-lime-700' },
  checkup: { label: '体检', emoji: '🩺', color: 'bg-cyan-100 text-cyan-700' },
}

export const TAG_MAP: Record<string, { label: string; emoji: string }> = {
  portrait: { label: '写真', emoji: '📸' },
  sleep: { label: '睡觉', emoji: '💤' },
  eat: { label: '干饭', emoji: '🐟' },
  play: { label: '玩耍', emoji: '🧶' },
  daze: { label: '发呆', emoji: '🌙' },
  naughty: { label: '拆家', emoji: '💥' },
}

export interface CatProfile {
  id: string
  name: string
  breed: string | null
  gender: string | null
  birthday: string | null
  neutered: boolean
  bio: string | null
  motto: string | null
  avatar: string | null
  traits: string[]
  color: string | null
}

export interface DiaryEntry {
  id: string
  date: string
  title: string
  content: string
  mood: string | null
  imageUrl: string | null
}

export interface WeightEntry {
  id: string
  date: string
  weight: number
  note: string | null
}

export interface HealthEntry {
  id: string
  date: string
  type: string
  title: string
  description: string | null
  nextDate: string | null
}

export interface AlbumEntry {
  id: string
  url: string
  title: string | null
  tag: string | null
  source: string
  createdAt: string
}

export interface MilestoneEntry {
  id: string
  date: string
  title: string
  description: string | null
  icon: string | null
}

export interface MessageEntry {
  id: string
  name: string
  content: string
  avatar: string | null
  createdAt: string
}

export interface AIDiaryEntry {
  id: string
  keywords: string
  content: string
  createdAt: string
}

export interface AIArtworkEntry {
  id: string
  prompt: string
  url: string
  style: string | null
  createdAt: string
}

export interface ImageCaptionEntry {
  id: string
  imageUrl: string
  caption: string
  createdAt: string
}

// 仪表盘聚合数据
export interface DashboardCat {
  id: string
  name: string
  breed: string | null
  color: string | null
  gender: string | null
  birthday: string | null
  avatar: string | null
  motto: string | null
  neutered: boolean
  traits: string[]
  diaryCount: number
  photoCount: number
  latestDiary: { id: string; title: string; date: string; mood: string | null } | null
  latestWeight: { weight: number; date: string } | null
  reminders: { id: string; title: string; type: string; nextDate: string; daysLeft: number | null }[]
}

export interface DashboardData {
  cats: DashboardCat[]
  stats: { catCount: number; totalDiaries: number; totalPhotos: number; totalMessages: number; totalAiContents: number }
  recentDiaries: {
    id: string; catId: string; catName: string; catAvatar: string | null; catColor: string | null
    title: string; content: string; date: string; mood: string | null
  }[]
  reminders: {
    id: string; catId: string; catName: string; catAvatar: string | null
    title: string; type: string; nextDate: string; daysLeft: number | null
  }[]
}

// 计算年龄
export function calcAge(birthday: string | null): { years: number; months: number; days: number; totalDays: number } {
  if (!birthday) return { years: 0, months: 0, days: 0, totalDays: 0 }
  const birth = new Date(birthday)
  const now = new Date()
  let years = now.getFullYear() - birth.getFullYear()
  let months = now.getMonth() - birth.getMonth()
  let days = now.getDate() - birth.getDate()
  if (days < 0) {
    months -= 1
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    days += prevMonth.getDate()
  }
  if (months < 0) {
    years -= 1
    months += 12
  }
  const totalDays = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24))
  return { years, months, days, totalDays }
}

// 距离下个生日天数
export function daysToNextBirthday(birthday: string | null): number {
  if (!birthday) return -1
  const birth = new Date(birthday)
  const now = new Date()
  const next = new Date(now.getFullYear(), birth.getMonth(), birth.getDate())
  if (next < now) next.setFullYear(now.getFullYear() + 1)
  return Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

// 格式化日期
export function fmtDate(d: string | Date): string {
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}
