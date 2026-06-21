import { create } from 'zustand'
import type { CatProfile } from './types'

type View = 'dashboard' | 'detail'

interface CatStore {
  cats: CatProfile[]
  selectedCatId: string | null
  view: View
  loadingCats: boolean
  setCats: (cats: CatProfile[]) => void
  setLoadingCats: (v: boolean) => void
  selectCat: (id: string) => void
  goToDashboard: () => void
  upsertCat: (cat: CatProfile) => void
  removeCat: (id: string) => void
}

export const useCatStore = create<CatStore>((set, get) => ({
  cats: [],
  selectedCatId: null,
  view: 'dashboard',
  loadingCats: true,
  setCats: (cats) =>
    set((state) => ({
      cats,
      selectedCatId:
        state.selectedCatId && cats.some((c) => c.id === state.selectedCatId)
          ? state.selectedCatId
          : cats[0]?.id ?? null,
      loadingCats: false,
    })),
  setLoadingCats: (v) => set({ loadingCats: v }),
  selectCat: (id) => set({ selectedCatId: id, view: 'detail' }),
  goToDashboard: () => set({ view: 'dashboard' }),
  upsertCat: (cat) =>
    set((state) => {
      const exists = state.cats.some((c) => c.id === cat.id)
      const cats = exists
        ? state.cats.map((c) => (c.id === cat.id ? cat : c))
        : [...state.cats, cat]
      return { cats, selectedCatId: state.selectedCatId ?? cat.id }
    }),
  removeCat: (id) =>
    set((state) => {
      const cats = state.cats.filter((c) => c.id !== id)
      const selectedCatId =
        state.selectedCatId === id ? cats[0]?.id ?? null : state.selectedCatId
      return { cats, selectedCatId, view: cats.length === 0 ? 'dashboard' : state.view }
    }),
}))

export function useSelectedCat(): CatProfile | null {
  return useCatStore((s) => s.cats.find((c) => c.id === s.selectedCatId) ?? null)
}
