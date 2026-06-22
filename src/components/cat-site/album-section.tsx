'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Loader2, Trash2, Images, X, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useSelectedCatId } from './use-cat-id'
import { TAG_MAP, type AlbumEntry } from '@/lib/types'
import { SectionTitle, Loading } from './diary-section'

export function AlbumSection() {
  const { toast } = useToast()
  const catId = useSelectedCatId()
  const [list, setList] = useState<AlbumEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<string>('all')
  const [preview, setPreview] = useState<AlbumEntry | null>(null)

  const load = useCallback(async () => {
    if (!catId) { setList([]); setLoading(false); return }
    setLoading(true)
    const res = await fetch(`/api/album?catId=${catId}`)
    setList(await res.json())
    setLoading(false)
  }, [catId])

  useEffect(() => { load() }, [load])

  // 快捷传照片后自动刷新
  useEffect(() => {
    const handler = () => load()
    window.addEventListener('album:changed', handler)
    return () => window.removeEventListener('album:changed', handler)
  }, [load])

  async function remove(id: string) {
    await fetch(`/api/album?id=${id}`, { method: 'DELETE' })
    load()
    toast({ title: '已删除' })
  }

  if (!catId) return null

  const filtered = filter === 'all' ? list : list.filter(p => p.tag === filter)
  const tags = ['all', ...Object.keys(TAG_MAP)]

  return (
    <section id="album" className="scroll-mt-20">
      <div className="flex items-center justify-between">
        <SectionTitle icon={<Images className="h-5 w-5" />} title="萌照相册" desc="可爱瞬间合集" />
        <AddDialog catId={catId} open={open} setOpen={setOpen} onSaved={() => { load(); toast({ title: '已添加' }) }} />
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {tags.map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${filter === t ? 'bg-amber-500 text-white' : 'bg-amber-50 text-stone-600 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-stone-300'}`}
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
                <img loading="lazy" src={p.url} alt={p.title || ''} className="w-full object-cover transition-transform duration-300 group-hover:scale-105" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
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
                <button onClick={() => setPreview(p)} className="absolute inset-0 cursor-zoom-in" aria-label="查看大图" />
                <button onClick={() => remove(p.id)} className="absolute right-2 top-8 rounded-full bg-white/90 p-1.5 text-rose-500 opacity-0 shadow transition-opacity group-hover:opacity-100">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setPreview(null)}>
          <img loading="lazy" src={preview.url} alt="" className="max-h-[90vh] max-w-full rounded-2xl object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
          <button className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-stone-700">✕</button>
        </div>
      )}
    </section>
  )
}

function AddDialog({ catId, open, setOpen, onSaved }: { catId: string; open: boolean; setOpen: (v: boolean) => void; onSaved: () => void }) {
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([])
  const [tag, setTag] = useState('portrait')
  const [title, setTitle] = useState('')
  // 上传结果（每张成功/失败）
  const [uploadResults, setUploadResults] = useState<{ url: string; name: string; ok: boolean; error?: string }[]>([])

  function reset() {
    setUploadedUrls([])
    setUploadResults([])
    setTag('portrait')
    setTitle('')
  }

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setUploading(true)
    setUploadResults([])
    try {
      const fd = new FormData()
      files.forEach(f => fd.append('files', f))
      const res = await fetch('/api/upload/batch', { method: 'POST', body: fd })
      if (!res.ok) throw new Error('上传失败')
      const data = await res.json()
      setUploadResults(data.results)
      const urls = data.results.filter((r: { ok: boolean; url: string }) => r.ok).map((r: { url: string }) => r.url)
      setUploadedUrls(urls)
      if (urls.length < files.length) {
        toast({ title: `上传完成，${files.length - urls.length} 张失败`, variant: 'destructive' })
      } else {
        toast({ title: `${urls.length} 张已上传，确认后保存` })
      }
    } catch (err) {
      toast({ title: '上传失败', description: (err as Error).message, variant: 'destructive' })
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  async function save() {
    if (uploadedUrls.length === 0) {
      toast({ title: '请先上传照片', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      // 批量写入相册
      await Promise.all(uploadedUrls.map(url =>
        fetch('/api/album', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ catId, url, title: title || null, tag, source: 'upload' }),
        })
      ))
      setOpen(false)
      reset()
      onSaved()
    } catch (e) {
      toast({ title: '保存失败', description: (e as Error).message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  function removeUploaded(url: string) {
    setUploadedUrls(urls => urls.filter(u => u !== url))
    setUploadResults(rs => rs.filter(r => r.url !== url))
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset() }}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-amber-500 hover:bg-amber-600">
          <Plus className="mr-1 h-4 w-4" /> 添加照片
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader><DialogTitle>添加照片到相册</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-2">
          {/* 上传区 */}
          <div>
            <Label className="mb-1.5 block text-xs text-stone-500 dark:text-stone-400">选择照片（可多选，最多 20 张）</Label>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-amber-200 bg-amber-50/40 px-4 py-8 text-center transition-colors hover:border-amber-400 hover:bg-amber-50 dark:border-amber-900/40 dark:hover:bg-amber-900/10">
              {uploading ? (
                <><Loader2 className="h-8 w-8 animate-spin text-amber-400" /><span className="text-sm text-stone-500">上传中…</span></>
              ) : (
                <><Images className="h-8 w-8 text-amber-400" /><span className="text-sm font-medium text-stone-600 dark:text-stone-300">点击选择照片</span><span className="text-xs text-stone-400">支持 PNG / JPEG / WebP / GIF，单张 ≤ 8MB</span></>
              )}
              <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple className="hidden" onChange={handleFiles} />
            </label>
          </div>

          {/* 上传结果预览 */}
          {uploadResults.length > 0 && (
            <div>
              <Label className="mb-1.5 block text-xs text-stone-500 dark:text-stone-400">已上传 {uploadedUrls.length} 张（点击 ✕ 移除）</Label>
              <div className="grid grid-cols-3 gap-2">
                {uploadResults.map((r, i) => (
                  <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-stone-200 dark:border-stone-700">
                    {r.ok ? (
                      <>
                        <img loading="lazy" src={r.url} alt={r.name} className="h-full w-full object-cover" />
                        <span className="absolute left-1 top-1 rounded-full bg-emerald-500 p-0.5 text-white"><CheckCircle2 className="h-3 w-3" /></span>
                        <button onClick={() => removeUploaded(r.url)} className="absolute right-1 top-1 rounded-full bg-white/90 p-0.5 text-rose-500 opacity-0 transition-opacity group-hover:opacity-100">
                          <X className="h-3 w-3" />
                        </button>
                      </>
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-rose-50 p-1 text-center dark:bg-rose-900/20">
                        <AlertCircle className="h-5 w-5 text-rose-400" />
                        <span className="line-clamp-2 text-[10px] text-rose-500">{r.error}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 统一标签和标题 */}
          {uploadedUrls.length > 0 && (
            <>
              <Field label="统一标题（可选，留空则无标题）">
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="今天的萌照合集" />
              </Field>
              <Field label="统一标签">
                <select className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-base" value={tag} onChange={e => setTag(e.target.value)}>
                  {Object.entries(TAG_MAP).map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
                </select>
              </Field>
            </>
          )}

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => { setOpen(false); reset() }}>取消</Button>
            <Button onClick={save} disabled={saving || uploadedUrls.length === 0} className="flex-1 bg-amber-500 hover:bg-amber-600">
              {saving ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> 保存中</> : `保存 ${uploadedUrls.length} 张`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs text-stone-500 dark:text-stone-400">{label}</Label>
      {children}
    </div>
  )
}
