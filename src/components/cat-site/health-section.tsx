'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Loader2, Trash2, Stethoscope, BellRing, CalendarClock, Zap } from 'lucide-react'
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
import { useSelectedCatId } from './use-cat-id'
import { useCatStore } from '@/lib/cat-store'
import { HEALTH_TYPE_MAP, fmtDate, type HealthEntry } from '@/lib/types'
import { Loading, Empty } from './diary-section'

export function HealthSection() {
  const { toast } = useToast()
  const catId = useSelectedCatId()
  const openQuickAction = useCatStore(s => s.openQuickAction)
  const [list, setList] = useState<HealthEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  const load = useCallback(async () => {
    if (!catId) { setList([]); setLoading(false); return }
    setLoading(true)
    const res = await fetch(`/api/health?catId=${catId}`)
    setList(await res.json())
    setLoading(false)
  }, [catId])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const handler = () => load()
    window.addEventListener('health:changed', handler)
    return () => window.removeEventListener('health:changed', handler)
  }, [load])

  async function remove(id: string) {
    await fetch(`/api/health?id=${id}`, { method: 'DELETE' })
    load()
    toast({ title: '已删除' })
  }

  if (!catId) return null

  const now = Date.now()
  const reminders = list
    .filter(h => h.nextDate)
    .map(h => ({ ...h, daysLeft: Math.ceil((new Date(h.nextDate!).getTime() - now) / 86400000) }))
    .filter(h => h.daysLeft <= 30 && h.daysLeft >= -7)
    .sort((a, b) => a.daysLeft - b.daysLeft)

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-bold text-stone-800 dark:text-stone-100">
          <Stethoscope className="h-5 w-5 text-amber-500" /> 健康档案
        </h3>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
            onClick={() => catId && openQuickAction({ catId, type: 'health' })}
          >
            <Zap className="mr-1 h-4 w-4" /> 快速记录
          </Button>
          <AddDialog catId={catId} open={open} setOpen={setOpen} onSaved={() => { load(); toast({ title: '已记录' }) }} />
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <>
          {reminders.length > 0 && (
            <Card className="mb-4 border-amber-200 bg-amber-50/60 p-4 shadow-sm">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-700">
                <BellRing className="h-4 w-4" /> 近期提醒
              </div>
              <div className="flex flex-wrap gap-2">
                {reminders.map(r => {
                  const t = HEALTH_TYPE_MAP[r.type]
                  const overdue = r.daysLeft < 0
                  return (
                    <span key={r.id} className={`rounded-full px-3 py-1 text-xs font-medium ${overdue ? 'bg-rose-100 text-rose-700' : 'bg-white text-amber-700'}`}>
                      {t?.emoji} {r.title} · {overdue ? `已过期 ${-r.daysLeft} 天` : `${r.daysLeft} 天后`}
                    </span>
                  )
                })}
              </div>
            </Card>
          )}

          {list.length === 0 ? (
            <Empty text="还没有健康记录" />
          ) : (
            <div className="space-y-2">
              {list.map(h => {
                const t = HEALTH_TYPE_MAP[h.type] || { label: h.type, emoji: '📋', color: 'bg-stone-100 text-stone-700' }
                const daysLeft = h.nextDate ? Math.ceil((new Date(h.nextDate).getTime() - now) / 86400000) : null
                return (
                  <Card key={h.id} className="border-amber-100/60 p-4 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <Badge className={t.color}>{t.emoji} {t.label}</Badge>
                          <span className="text-sm font-bold text-stone-800">{h.title}</span>
                        </div>
                        <div className="text-xs text-stone-500">{fmtDate(h.date)}</div>
                        {h.description && <p className="mt-1 text-sm text-stone-600">{h.description}</p>}
                        {h.nextDate && (
                          <div className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ${daysLeft !== null && daysLeft < 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                            <CalendarClock className="h-3 w-3" />
                            下次：{fmtDate(h.nextDate)}
                            {daysLeft !== null && (daysLeft < 0 ? `（已过期 ${-daysLeft} 天）` : `（${daysLeft} 天后）`)}
                          </div>
                        )}
                      </div>
                      <button onClick={() => remove(h.id)} className="text-stone-300 hover:text-rose-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function AddDialog({ catId, open, setOpen, onSaved }: { catId: string; open: boolean; setOpen: (v: boolean) => void; onSaved: () => void }) {
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
      setOpen(false)
      setForm({ date: new Date().toISOString().slice(0, 10), type: 'vaccine', title: '', description: '', nextDate: '' })
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
        <Button size="sm" variant="outline" className="border-amber-200 text-amber-700 hover:bg-amber-50">
          <Plus className="mr-1 h-4 w-4" /> 添加记录
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>添加健康记录</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <Field label="日期"><Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></Field>
            <Field label="类型">
              <select className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {Object.entries(HEALTH_TYPE_MAP).map(([k, v]) => (
                  <option key={k} value={k}>{v.emoji} {v.label}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="标题"><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="狂犬疫苗接种" /></Field>
          <Field label="详情"><Textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></Field>
          <Field label="下次日期（可选）"><Input type="date" value={form.nextDate} onChange={e => setForm(f => ({ ...f, nextDate: e.target.value }))} /></Field>
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
