'use client'

import { Cat } from 'lucide-react'

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
    <header className="sticky top-0 z-50 border-b border-amber-100/80 bg-cream/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <a href="#home" className="flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400 text-white shadow-sm">
            <Cat className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <div className="text-base font-bold text-stone-800">猫窝</div>
            <div className="text-[10px] text-stone-500">每只猫都有专属的小窝</div>
          </div>
        </a>
        <nav className="flex items-center gap-1 overflow-x-auto scroll-hide">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium text-stone-600 transition-colors hover:bg-amber-100 hover:text-amber-700"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}
