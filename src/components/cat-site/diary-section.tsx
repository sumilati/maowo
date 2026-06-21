'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Loader2, Trash2, CalendarDays, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { ImageUpload } from './image-upload'
import { useSelectedCatId } from './use-cat-id'
import { MOOD_MAP, fmtDate, type DiaryEntry } from '@/lib/types'

export function DiarySection() {
  const { toast } = useToast()
  const catId = useSelectedCatId()
  const [list, setList] = useState<DiaryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  const load = useCallback(async () => {
    if (!catId) { setList([]); setLoading(false); return }
    setLoading(true)
    const res = await fetch(`/api/diary?catId=${catId}`)
    setList(await res.json())
    setLoading(false)
  }, [catId])

  useEffect(() => { load() }, [load])

  async function remove(id: string) {
    if (!confirm('删除这条日记？')) return
    await fetch(`/api/diary?id=${id}`, { method: 'DELETE' })
    load()
    toast({ title: '已删除' })
  }

  if (!catId) return null

  return (
    <section id="diary" className="scroll-mt-20">
      <SectionTitle icon={<BookOpen className="h-5 w-5" />} title="成长日记" desc="记录每天的趣事" />

      <div className="mb-4 flex justify-end">
        <AddDialog catId={catId} open={open} setOpen={setOpen} onSaved={() => { load(); toast({ title: '日记已添加' }) }} />
      </div>

      {loading ? (
        <Loading />
      ) : list.length === 0 ? (
        <Empty text="还没有日记，快写下第一篇吧～" />
      ) : (
        <div className="relative space-y-4 pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-amber-100">
          {list.map((d) => {
            const mood = d.mood ? MOOD_MAP[d.mood] : null
            return (
              <Card key={d.id} className="relative border-amber-100/60 p-5 shadow-sm transition-shadow hover:shadow-md">
                <span className="absolute -left-[1.15rem] top-6 h-3 w-3 rounded-full border-2 border-white bg-amber-400 shadow" />
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm text-stone-500">
                    <CalendarDays className="h-4 w-4" />
                    {fmtDate(d.date)}
                  </div>
                  <div className="flex items-center gap-2">
                    {mood && <Badge className={mood.color}>{mood.emoji} {mood.label}</Badge>}
                    <button onClick={() => remove(d.id)} className="text-stone-300 transition-colors hover:text-rose-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <h3 className="mb-1 text-lg font-bold text-stone-800">{d.title}</h3>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-stone-600">{d.content}</p>
                {d.imageUrl && (
                  <img src={d.imageUrl} alt={d.title} className="mt-3 max-h-64 rounded-xl object-cover shadow-sm" />
                )}
              </Card>
            )
          })}
        </div>
      )}
    </section>
  )
}

function AddDialog({ catId, open, setOpen, onSaved }: { catId: string; open: boolean; setOpen: (v: boolean) => void; onSaved: () => void }) {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    title: '', content: '', mood: 'happy', imageUrl: '',
  })

  function reset() {
    setForm({ date: new Date().toISOString().slice(0, 10), title: '', content: '', mood: 'happy', imageUrl: '' })
  }

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
      if (!res.ok) throw new Error('添加失败')
      setOpen(false)
      reset()
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
          <Plus className="mr-1 h-4 w-4" /> 写日记
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader><DialogTitle>写一篇新日记</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <Field label="日期"><Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></Field>
            <Field label="心情">
              <select className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm" value={form.mood} onChange={e => setForm(f => ({ ...f, mood: e.target.value }))}>
                {Object.entries(MOOD_MAP).map(([k, v]) => (
                  <option key={k} value={k}>{v.emoji} {v.label}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="标题"><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="今天发生了什么" /></Field>
          <Field label="内容"><Textarea rows={5} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} /></Field>
          <div className="flex items-center gap-3">
            {form.imageUrl && <img src={form.imageUrl} alt="" className="h-14 w-14 rounded-lg object-cover" />}
            <ImageUpload onUploaded={(url) => setForm(f => ({ ...f, imageUrl: url }))} label="配图（可选）" />
          </div>
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

export function SectionTitle({ icon, title, desc }: { icon: React.ReactNode; title: string; desc?: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">{icon}</span>
      <div>
        <h2 className="text-xl font-bold text-stone-800 sm:text-2xl">{title}</h2>
        {desc && <p className="text-sm text-stone-500">{desc}</p>}
      </div>
    </div>
  )
}

export function Loading() {
  return (
    <div className="flex h-40 items-center justify-center">
      <Loader2 className="h-7 w-7 animate-spin text-amber-400" />
    </div>
  )
}

export function Empty({ text }: { text: string }) {
  return (
    <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-amber-200 text-stone-400">
      <span className="text-4xl">🐾</span>
      <p className="text-sm">{text}</p>
    </div>
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
