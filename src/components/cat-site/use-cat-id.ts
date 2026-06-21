'use client'

import { useCatStore } from '@/lib/cat-store'

// 所有 section 用这个 hook 拿当前猫 id；为空时 section 应返回 null
export function useSelectedCatId(): string | null {
  return useCatStore((s) => s.selectedCatId)
}
