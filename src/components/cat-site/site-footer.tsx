import { Heart, Cat } from 'lucide-react'

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-amber-100 bg-cream/60">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex flex-col items-center justify-between gap-3 text-sm text-stone-500 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-400/90 text-white">
              <Cat className="h-4 w-4" />
            </span>
            <span>饼饼的小窝 · 用爱记录每一喵</span>
          </div>
          <div className="flex items-center gap-1">
            <span>由铲屎官倾情打造</span>
            <Heart className="h-3.5 w-3.5 fill-rose-400 text-rose-400" />
          </div>
        </div>
      </div>
    </footer>
  )
}
