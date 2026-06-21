'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Loader2, Trash2, Flag, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useSelectedCatId } from './use-cat-id'
import { fmtDate, type MilestoneEntry } from '@/lib/types'
import { SectionTitle, Loading, Empty } from './diary-section'

const ICONS = ['🎂', '🏠', '🛁', '✂️', '🎉', '🏆', '🎈', '🐱', '🍖', '🏥', '✈️', '🎁']

export function MilestoneSection() {
  const { toast } = useToast()
  const catId = useSelectedCatId()
  const [list, setList] = useState<MilestoneEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  const load = useCallback(async () => {
    if (!catId) { setList([]); setLoading(false); return }
    setLoading(true)
    const res = await fetch(`/api/milestones?catId=${catId}`)
    setList(await res.json())
    setLoading(false)
  }, [catId])

  useEffect(() => { load() }, [load])

  async function remove(id: string) {
    await fetch(`/api/milestones?id=${id}`, { method: 'DELETE' })
    load()
    toast({ title: '已删除' })
  }

  if (!catId) return null

  return (
    <section id="milestone" className="scroll-mt-20">
      <div className="flex items-center justify-between">
        <SectionTitle icon={<Flag className="h-5 w-5" />} title="猫生里程碑" desc="重要时刻" />
        <AddDialog catId={catId} open={open} setOpen={setOpen} onSaved={() => { load(); toast({ title: '已添加' }) }} />
      </div>

      {loading ? (
        <Loading />
      ) : list.length === 0 ? (
        <Empty text="还没有里程碑" />
      ) : (
        <div className="relative space-y-5 pl-8 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-amber-300 before:to-rose-200">
          {list.map((m, i) => (
            <div key={m.id} className="relative">
              <span className="absolute -left-[1.6rem] top-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-amber-400 text-sm shadow-md">
                {m.icon || '🐾'}
              </span>
              <Card className="border-amber-100/60 p-4 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="font-bold text-stone-800">{m.title}</h3>
                      {i === list.length - 1 && (
                        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-medium text-rose-600">最新</span>
                      )}
                    </div>
                    <div className="mb-1 flex items-center gap-1 text-xs text-stone-500">
                      <CalendarDays className="h-3 w-3" /> {fmtDate(m.date)}
                    </div>
                    {m.description && <p className="text-sm text-stone-600">{m.description}</p>}
                  </div>
                  <button onClick={() => remove(m.id)} className="text-stone-300 hover:text-rose-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </Card>
            </div>
          ))}
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
    title: '', description: '', icon: '🎉',
  })

  async function save() {
    if (!form.title.trim()) {
      toast({ title: '请填写标题', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/milestones', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, catId }),
      })
      if (!res.ok) throw new Error('失败')
      setOpen(false)
      setForm({ date: new Date().toISOString().slice(0, 10), title: '', description: '', icon: '🎉' })
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
          <Plus className="mr-1 h-4 w-4" /> 添加里程碑
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>添加里程碑</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-2">
          <Field label="日期"><Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></Field>
          <Field label="标题"><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="第一次洗澡" /></Field>
          <Field label="描述（可选）"><Textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></Field>
          <Field label="图标">
            <div className="flex flex-wrap gap-1.5">
              {ICONS.map(ic => (
                <button key={ic} onClick={() => setForm(f => ({ ...f, icon: ic }))} className={`flex h-9 w-9 items-center justify-center rounded-lg border text-lg transition-all ${form.icon === ic ? 'border-amber-400 bg-amber-50' : 'border-stone-200'}`}>
                  {ic}
                </button>
              ))}
            </div>
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
