'use client'

import { useEffect, useState } from 'react'
import {
  Home, Cat as CatIcon, Images, Settings, Plus, BookOpen,
  Scale, Stethoscope, Camera, X,
} from 'lucide-react'
import { useCatStore } from '@/lib/cat-store'

// 移动端底部导航 + 中间快记浮按（仅手机端显示）
export function MobileTabBar() {
  const { view, cats, selectedCatId, goToDashboard, selectCat, openQuickAction } = useCatStore()
  const [menuOpen, setMenuOpen] = useState(false)

  // 当选中某只猫时，"小窝" tab 高亮
  const inDetail = view === 'detail' && selectedCatId

  function tabClick(tab: 'home' | 'cats' | 'album' | 'settings') {
    if (tab === 'home') {
      goToDashboard()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (tab === 'cats') {
      // 如果有猫，进第一只猫；否则回首页（可添加）
      if (cats.length > 0) {
        selectCat(selectedCatId || cats[0].id)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        goToDashboard()
      }
    } else if (tab === 'album') {
      // 进第一只猫并滚到相册
      if (cats.length > 0) {
        selectCat(selectedCatId || cats[0].id)
        setTimeout(() => document.getElementById('album')?.scrollIntoView({ behavior: 'smooth' }), 100)
      }
    } else if (tab === 'settings') {
      // 滚到留言区（"我的"区，含设置入口感）
      if (cats.length > 0 && inDetail) {
        document.getElementById('messages')?.scrollIntoView({ behavior: 'smooth' })
      } else {
        goToDashboard()
      }
    }
  }

  return (
    <>
      {/* 快捷菜单浮层 */}
      {menuOpen && <QuickMenu onClose={() => setMenuOpen(false)} onPick={(type) => {
        setMenuOpen(false)
        const cid = selectedCatId || cats[0]?.id
        if (cid) openQuickAction({ catId: cid, type })
      }} />}

      {/* 底部 Tab 栏（仅手机端） */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-amber-100/80 bg-cream/95 px-2 pb-[env(safe-area-inset-bottom)] pt-1.5 backdrop-blur-md md:hidden dark:border-amber-900/30 dark:bg-[#1a1714]/95">
        <TabButton icon={<Home className="h-5 w-5" />} label="首页" active={view === 'dashboard'} onClick={() => tabClick('home')} />
        <TabButton icon={<CatIcon className="h-5 w-5" />} label="小窝" active={!!inDetail} onClick={() => tabClick('cats')} />

        {/* 中间快记按钮 */}
        <button
          onClick={() => setMenuOpen(v => !v)}
          className={`relative -mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg transition-transform active:scale-95 ${menuOpen ? 'rotate-45' : ''}`}
          aria-label="快捷记录"
        >
          <Plus className="h-7 w-7" />
        </button>

        <TabButton icon={<Images className="h-5 w-5" />} label="相册" onClick={() => tabClick('album')} />
        <TabButton icon={<Settings className="h-5 w-5" />} label="更多" onClick={() => tabClick('settings')} />
      </nav>
    </>
  )
}

function TabButton({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 flex-col items-center gap-0.5 py-1 transition-colors ${active ? 'text-amber-600 dark:text-amber-400' : 'text-stone-400 dark:text-stone-500'}`}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  )
}

// 快捷菜单：选择要记录的类型
function QuickMenu({ onClose, onPick }: { onClose: () => void; onPick: (type: 'diary' | 'weight' | 'health' | 'photo') => void }) {
  const items = [
    { type: 'diary' as const, label: '写日记', desc: '记下今天的趣事', icon: <BookOpen className="h-5 w-5" />, color: 'bg-rose-100 text-rose-600' },
    { type: 'weight' as const, label: '记体重', desc: '快速记录今日体重', icon: <Scale className="h-5 w-5" />, color: 'bg-amber-100 text-amber-600' },
    { type: 'health' as const, label: '健康记录', desc: '疫苗/驱虫/体检', icon: <Stethoscope className="h-5 w-5" />, color: 'bg-teal-100 text-teal-600' },
    { type: 'photo' as const, label: '传照片', desc: '添加萌照到相册', icon: <Camera className="h-5 w-5" />, color: 'bg-purple-100 text-purple-600' },
  ]
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm md:hidden" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-t-3xl bg-cream p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl animate-in slide-in-from-bottom dark:bg-[#252220]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-stone-800 dark:text-stone-100">快捷记录</h3>
          <button onClick={onClose} className="rounded-full p-1 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {items.map((it) => (
            <button
              key={it.type}
              onClick={() => onPick(it.type)}
              className="flex flex-col items-start gap-1.5 rounded-2xl border border-amber-100/60 bg-white/70 p-4 text-left shadow-sm transition-all active:scale-95 dark:border-amber-900/30 dark:bg-white/5"
            >
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${it.color}`}>{it.icon}</span>
              <span className="text-sm font-semibold text-stone-800 dark:text-stone-100">{it.label}</span>
              <span className="text-xs text-stone-500 dark:text-stone-400">{it.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
