'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Loader2, Trash2, Images } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { ImageUpload } from './image-upload'
import { TAG_MAP, type AlbumEntry } from '@/lib/types'
import { SectionTitle, Loading } from './diary-section'

export function AlbumSection() {
  const { toast } = useToast()
  const [list, setList] = useState<AlbumEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<string>('all')
  const [preview, setPreview] = useState<AlbumEntry | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/album')
    const data = await res.json()
    setList(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function remove(id: string) {
    await fetch(`/api/album?id=${id}`, { method: 'DELETE' })
    load()
    toast({ title: '已删除' })
  }

  const filtered = filter === 'all' ? list : list.filter(p => p.tag === filter)
  const tags = ['all', ...Object.keys(TAG_MAP)]

  return (
    <section id="album" className="scroll-mt-20">
      <div className="flex items-center justify-between">
        <SectionTitle icon={<Images className="h-5 w-5" />} title="萌照相册" desc="饼饼的可爱瞬间合集" />
        <AddDialog open={open} setOpen={setOpen} onSaved={() => { load(); toast({ title: '已添加' }) }} />
      </div>

      {/* 筛选 */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {tags.map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${filter === t ? 'bg-amber-500 text-white' : 'bg-amber-50 text-stone-600 hover:bg-amber-100'}`}
          >
            {t === 'all' ? '全部' : `${TAG_MAP[t].emoji} ${TAG_MAP[t].label}`}
          </button>
        ))}
      </div>

      {loading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-amber-200 text-stone-400">
          <span className="text-4xl">📸</span>
          <p className="text-sm">还没有照片</p>
        </div>
      ) : (
        <div className="columns-2 gap-3 sm:columns-3 lg:columns-4 [&>*]:mb-3">
          {filtered.map(p => {
            const tag = p.tag ? TAG_MAP[p.tag] : null
            return (
              <div key={p.id} className="group relative break-inside-avoid overflow-hidden rounded-2xl shadow-sm">
                <img src={p.url} alt={p.title || ''} className="w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                {(p.title || tag) && (
                  <div className="absolute bottom-0 left-0 right-0 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {tag && <span className="mr-1 text-xs">{tag.emoji}</span>}
                    {p.title && <span className="text-xs font-medium">{p.title}</span>}
                  </div>
                )}
                {p.source === 'ai' && (
                  <span className="absolute right-2 top-2 rounded-full bg-purple-500/90 px-2 py-0.5 text-[10px] font-medium text-white">AI</span>
                )}
                <button
                  onClick={() => setPreview(p)}
                  className="absolute inset-0 cursor-zoom-in"
                  aria-label="查看大图"
                />
                <button
                  onClick={() => remove(p.id)}
                  className="absolute right-2 top-8 rounded-full bg-white/90 p-1.5 text-rose-500 opacity-0 shadow transition-opacity group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* 大图预览 */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setPreview(null)}>
          <img src={preview.url} alt="" className="max-h-[90vh] max-w-full rounded-2xl object-contain" />
          <button className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-stone-700">✕</button>
        </div>
      )}
    </section>
  )
}

function AddDialog({ open, setOpen, onSaved }: { open: boolean; setOpen: (v: boolean) => void; onSaved: () => void }) {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ url: '', title: '', tag: 'portrait' })

  async function save() {
    if (!form.url) {
      toast({ title: '请先上传图片', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/album', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('失败')
      setOpen(false)
      setForm({ url: '', title: '', tag: 'portrait' })
      onSaved()
    } catch (e) {
      toast({ title: '失败', description: (e as Error).message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-amber-500 hover:bg-amber-600">
          <Plus className="mr-1 h-4 w-4" /> 添加照片
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>添加照片</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="flex items-center gap-3">
            {form.url ? (
              <img src={form.url} alt="" className="h-20 w-20 rounded-lg object-cover" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-amber-200 text-2xl">📷</div>
            )}
            <ImageUpload onUploaded={(url) => setForm(f => ({ ...f, url }))} label="上传照片" />
          </div>
          <Field label="标题（可选）"><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="睡到模糊" /></Field>
          <Field label="标签">
            <select className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm" value={form.tag} onChange={e => setForm(f => ({ ...f, tag: e.target.value }))}>
              {Object.entries(TAG_MAP).map(([k, v]) => (
                <option key={k} value={k}>{v.emoji} {v.label}</option>
              ))}
            </select>
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
          <Button onClick={save} disabled={saving} className="bg-amber-500 hover:bg-amber-600">
            {saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />} 保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs text-stone-500">{label}</Label>
      {children}
    </div>
  )
}
