'use client'

import { Cat } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'

const NAV_ITEMS = [
  { id: 'home', label: '小窝' },
  { id: 'diary', label: '日记' },
  { id: 'health', label: '健康' },
  { id: 'album', label: '相册' },
  { id: 'ai', label: 'AI 玩乐' },
  { id: 'milestone', label: '里程碑' },
  { id: 'messages', label: '留言' },
]

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-amber-100/80 bg-cream/80 backdrop-blur-md dark:border-amber-900/30">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <a href="#home" className="flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400 text-white shadow-sm">
            <Cat className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <div className="text-base font-bold text-stone-800 dark:text-stone-100">猫窝</div>
            <div className="hidden text-[10px] text-stone-500 sm:block dark:text-stone-400">每只猫都有专属的小窝</div>
          </div>
        </a>
        {/* 桌面端文字导航 */}
        <nav className="hidden items-center gap-1 overflow-x-auto scroll-hide md:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium text-stone-600 transition-colors hover:bg-amber-100 hover:text-amber-700 dark:text-stone-300 dark:hover:bg-amber-900/30 dark:hover:text-amber-300"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
