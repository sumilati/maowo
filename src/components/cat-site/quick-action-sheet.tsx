'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { ImageUpload } from './image-upload'
import { useCatStore, useSelectedCat } from '@/lib/cat-store'
import { MOOD_MAP, HEALTH_TYPE_MAP } from '@/lib/types'

type QuickType = 'diary' | 'weight' | 'health' | 'photo'

const TITLE_MAP: Record<QuickType, string> = {
  diary: '✏️ 写日记',
  weight: '⚖️ 记体重',
  health: '🩺 健康记录',
  photo: '📸 传照片',
}

// 统一的快捷记录弹窗
export function QuickActionSheet() {
  const { quickAction, closeQuickAction } = useCatStore()
  const cat = useSelectedCat()

  return (
    <Dialog open={!!quickAction} onOpenChange={(v) => !v && closeQuickAction()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {quickAction && TITLE_MAP[quickAction.type]}
            {cat && <span className="ml-1.5 text-sm font-normal text-stone-400">· {cat.name}</span>}
          </DialogTitle>
        </DialogHeader>
        {quickAction && cat && (
          <QuickForm key={quickAction.type + cat.id} catId={cat.id} type={quickAction.type} onDone={closeQuickAction} />
        )}
      </DialogContent>
    </Dialog>
  )
}

function QuickForm({ catId, type, onDone }: { catId: string; type: QuickType; onDone: () => void }) {
  if (type === 'diary') return <DiaryForm catId={catId} onDone={onDone} />
  if (type === 'weight') return <WeightForm catId={catId} onDone={onDone} />
  if (type === 'health') return <HealthForm catId={catId} onDone={onDone} />
  return <PhotoForm catId={catId} onDone={onDone} />
}

function DiaryForm({ catId, onDone }: { catId: string; onDone: () => void }) {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    title: '', content: '', mood: 'happy', imageUrl: '',
  })

  async function save() {
    if (!form.title.trim() || !form.content.trim()) {
      toast({ title: '请填写标题和内容', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/diary', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, catId }),
      })
      if (!res.ok) throw new Error('失败')
      toast({ title: '日记已添加' })
      window.dispatchEvent(new CustomEvent('diary:changed'))
      onDone()
    } catch (e) {
      toast({ title: '失败', description: (e as Error).message, variant: 'destructive' })
    } finally { setSaving(false) }
  }

  return (
    <div className="grid gap-4 py-2">
      <div className="grid grid-cols-2 gap-3">
        <Field label="日期"><Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></Field>
        <Field label="心情">
          <select className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-base" value={form.mood} onChange={e => setForm(f => ({ ...f, mood: e.target.value }))}>
            {Object.entries(MOOD_MAP).map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
          </select>
        </Field>
      </div>
      <Field label="标题"><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="今天发生了什么" /></Field>
      <Field label="内容"><Textarea rows={4} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} /></Field>
      <div className="flex items-center gap-3">
        {form.imageUrl && <img loading="lazy" src={form.imageUrl} alt="" className="h-14 w-14 rounded-lg object-cover" />}
        <ImageUpload onUploaded={(url) => setForm(f => ({ ...f, imageUrl: url }))} label="配图（可选）" />
      </div>
      <Button onClick={save} disabled={saving} className="h-11 bg-amber-500 hover:bg-amber-600">
        {saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />} 保存
      </Button>
    </div>
  )
}

function WeightForm({ catId, onDone }: { catId: string; onDone: () => void }) {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    weight: '', note: '',
  })

  async function save() {
    if (!form.weight || isNaN(Number(form.weight))) {
      toast({ title: '请输入有效体重', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/weight', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, catId }),
      })
      if (!res.ok) throw new Error('失败')
      toast({ title: '体重已记录' })
      window.dispatchEvent(new CustomEvent('weight:changed'))
      onDone()
    } catch (e) {
      toast({ title: '失败', description: (e as Error).message, variant: 'destructive' })
    } finally { setSaving(false) }
  }

  return (
    <div className="grid gap-4 py-2">
      <Field label="日期"><Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></Field>
      <Field label="体重 (kg)">
        <Input type="number" inputMode="decimal" step="0.05" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} placeholder="4.5" className="text-base" />
      </Field>
      <Field label="备注（可选）"><Input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="体检称重" /></Field>
      <Button onClick={save} disabled={saving} className="h-11 bg-amber-500 hover:bg-amber-600">
        {saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />} 保存
      </Button>
    </div>
  )
}

function HealthForm({ catId, onDone }: { catId: string; onDone: () => void }) {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    type: 'vaccine', title: '', description: '', nextDate: '',
  })

  async function save() {
    if (!form.title.trim()) {
      toast({ title: '请填写标题', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/health', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, catId }),
      })
      if (!res.ok) throw new Error('失败')
      toast({ title: '健康记录已添加' })
      window.dispatchEvent(new CustomEvent('health:changed'))
      onDone()
    } catch (e) {
      toast({ title: '失败', description: (e as Error).message, variant: 'destructive' })
    } finally { setSaving(false) }
  }

  return (
    <div className="grid gap-4 py-2">
      <div className="grid grid-cols-2 gap-3">
        <Field label="日期"><Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></Field>
        <Field label="类型">
          <select className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-base" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
            {Object.entries(HEALTH_TYPE_MAP).map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
          </select>
        </Field>
      </div>
      <Field label="标题"><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="狂犬疫苗接种" /></Field>
      <Field label="详情（可选）"><Textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></Field>
      <Field label="下次日期（可选）"><Input type="date" value={form.nextDate} onChange={e => setForm(f => ({ ...f, nextDate: e.target.value }))} /></Field>
      <Button onClick={save} disabled={saving} className="h-11 bg-amber-500 hover:bg-amber-600">
        {saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />} 保存
      </Button>
    </div>
  )
}

function PhotoForm({ catId, onDone }: { catId: string; onDone: () => void }) {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [urls, setUrls] = useState<string[]>([])
  const [tag, setTag] = useState('portrait')
  const [title, setTitle] = useState('')

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setUploading(true)
    try {
      const fd = new FormData()
      files.forEach(f => fd.append('files', f))
      const res = await fetch('/api/upload/batch', { method: 'POST', body: fd })
      const data = await res.json()
      const ok = data.results.filter((r: { ok: boolean; url: string }) => r.ok).map((r: { url: string }) => r.url)
      setUrls(prev => [...prev, ...ok])
      if (ok.length < files.length) toast({ title: `${files.length - ok.length} 张失败`, variant: 'destructive' })
    } catch {
      toast({ title: '上传失败', variant: 'destructive' })
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  async function save() {
    if (urls.length === 0) {
      toast({ title: '请先上传照片', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      await Promise.all(urls.map(url =>
        fetch('/api/album', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ catId, url, title: title || null, tag, source: 'upload' }),
        })
      ))
      toast({ title: `${urls.length} 张照片已加入相册` })
      window.dispatchEvent(new CustomEvent('album:changed'))
      onDone()
    } catch (e) {
      toast({ title: '失败', description: (e as Error).message, variant: 'destructive' })
    } finally { setSaving(false) }
  }

  return (
    <div className="grid gap-4 py-2">
      <div className="flex flex-col items-center gap-3">
        {urls.length > 0 ? (
          <div className="grid w-full grid-cols-3 gap-2">
            {urls.map((u, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-lg">
                <img loading="lazy" src={u} alt="" className="h-full w-full object-cover" />
                <button onClick={() => setUrls(prev => prev.filter((_, idx) => idx !== i))} className="absolute right-1 top-1 rounded-full bg-white/90 p-0.5 text-rose-500">
                  <span className="block h-3 w-3 leading-3 text-center">×</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-32 w-full items-center justify-center rounded-xl border-2 border-dashed border-amber-200 text-4xl">📷</div>
        )}
        <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50/40 py-2.5 text-sm font-medium text-amber-700 hover:bg-amber-50">
          {uploading ? <><Loader2 className="h-4 w-4 animate-spin" /> 上传中…</> : <><span className="text-base">＋</span> 选择照片（可多选）</>}
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
        </label>
      </div>
      {urls.length > 0 && (
        <>
          <Field label="标题（可选）"><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="睡到模糊" /></Field>
          <Field label="标签">
            <select className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-base" value={tag} onChange={e => setTag(e.target.value)}>
              {Object.entries({
                portrait: { label: '写真', emoji: '📸' },
                sleep: { label: '睡觉', emoji: '💤' },
                eat: { label: '干饭', emoji: '🐟' },
                play: { label: '玩耍', emoji: '🧶' },
                daze: { label: '发呆', emoji: '🌙' },
                naughty: { label: '拆家', emoji: '💥' },
              }).map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
            </select>
          </Field>
        </>
      )}
      <Button onClick={save} disabled={saving || urls.length === 0} className="h-11 bg-amber-500 hover:bg-amber-600">
        {saving ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> 保存中</> : `保存 ${urls.length} 张`}
      </Button>
    </div>
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
