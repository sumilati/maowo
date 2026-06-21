'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Loader2, Trash2, TrendingUp, Scale } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { fmtDate, type WeightEntry } from '@/lib/types'
import { SectionTitle, Loading, Empty } from './diary-section'

export function WeightSection() {
  const { toast } = useToast()
  const [list, setList] = useState<WeightEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/weight')
    const data = await res.json()
    setList(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function remove(id: string) {
    await fetch(`/api/weight?id=${id}`, { method: 'DELETE' })
    load()
    toast({ title: '已删除' })
  }

  const chartData = list.map(w => ({
    date: fmtDate(w.date).slice(5),
    weight: w.weight,
    note: w.note,
  }))

  const latest = list.length ? list[list.length - 1] : null
  const prev = list.length > 1 ? list[list.length - 2] : null
  const delta = latest && prev ? +(latest.weight - prev.weight).toFixed(2) : 0
  const avg = list.length ? +(list.reduce((s, w) => s + w.weight, 0) / list.length).toFixed(2) : 0

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-bold text-stone-800">
          <Scale className="h-5 w-5 text-amber-500" /> 体重曲线
        </h3>
        <AddDialog open={open} setOpen={setOpen} onSaved={() => { load(); toast({ title: '已记录' }) }} />
      </div>

      {loading ? (
        <Loading />
      ) : list.length === 0 ? (
        <Empty text="还没有体重记录" />
      ) : (
        <>
          {/* 统计 */}
          <div className="mb-4 grid grid-cols-3 gap-3">
            <MiniStat label="最新体重" value={latest ? `${latest.weight} kg` : '—'} />
            <MiniStat label="较上次" value={delta === 0 ? '持平' : `${delta > 0 ? '+' : ''}${delta} kg`} tone={delta > 0 ? 'text-rose-500' : delta < 0 ? 'text-emerald-500' : 'text-stone-500'} />
            <MiniStat label="平均体重" value={`${avg} kg`} />
          </div>

          {/* 图表 */}
          <Card className="border-amber-100/60 p-4 shadow-sm">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#fef3c7" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#a8a29e' }} tickLine={false} axisLine={{ stroke: '#fde68a' }} />
                  <YAxis domain={['dataMin - 0.3', 'dataMax + 0.3']} tick={{ fontSize: 11, fill: '#a8a29e' }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #fde68a', fontSize: 12 }}
                    formatter={(v: number) => [`${v} kg`, '体重']}
                  />
                  <ReferenceLine y={4.5} stroke="#fbbf24" strokeDasharray="4 4" label={{ value: '健康区间', fontSize: 10, fill: '#d97706', position: 'right' }} />
                  <Line type="monotone" dataKey="weight" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* 记录列表 */}
          <div className="mt-4 max-h-64 space-y-2 overflow-y-auto pr-1">
            {[...list].reverse().map((w) => (
              <div key={w.id} className="flex items-center justify-between rounded-xl border border-amber-100/60 bg-white/60 px-4 py-2.5">
                <div>
                  <span className="text-sm font-medium text-stone-700">{fmtDate(w.date)}</span>
                  {w.note && <span className="ml-2 text-xs text-stone-400">{w.note}</span>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-amber-600">{w.weight} kg</span>
                  <button onClick={() => remove(w.id)} className="text-stone-300 hover:text-rose-500">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function MiniStat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <Card className="border-amber-100/60 p-3 text-center shadow-sm">
      <div className="text-xs text-stone-500">{label}</div>
      <div className={`text-base font-bold ${tone || 'text-stone-800'}`}>{value}</div>
    </Card>
  )
}

function AddDialog({ open, setOpen, onSaved }: { open: boolean; setOpen: (v: boolean) => void; onSaved: () => void }) {
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
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('失败')
      setOpen(false)
      setForm({ date: new Date().toISOString().slice(0, 10), weight: '', note: '' })
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
          <Plus className="mr-1 h-4 w-4" /> 记录体重
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader><DialogTitle>记录体重</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-2">
          <Field label="日期"><Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></Field>
          <Field label="体重 (kg)"><Input type="number" step="0.05" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} placeholder="4.5" /></Field>
          <Field label="备注（可选）"><Input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="体检称重" /></Field>
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
