'use client'

import { useEffect, useState } from 'react'
import { Pencil, Cake, Ruler, Heart, Sparkles, Loader2, PawPrint } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { ImageUpload } from './image-upload'
import { calcAge, daysToNextBirthday, fmtDate, type CatProfile } from '@/lib/types'

export function HeroSection() {
  const { toast } = useToast()
  const [cat, setCat] = useState<CatProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/cat')
    const data = await res.json()
    setCat(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  if (loading || !cat) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
      </div>
    )
  }

  const age = calcAge(cat.birthday)
  const daysToBday = daysToNextBirthday(cat.birthday)

  return (
    <section id="home" className="scroll-mt-20">
      {/* 顶部 hero 横幅 */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-100 via-orange-50 to-rose-50 px-6 py-10 sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-8 h-44 w-44 rounded-full bg-rose-200/40 blur-3xl" />
        <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-center">
          {/* 头像 */}
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-full bg-amber-300/40 blur-xl" />
            {cat.avatar ? (
              <img
                src={cat.avatar}
                alt={cat.name}
                className="relative h-32 w-32 rounded-full border-4 border-white object-cover shadow-lg sm:h-40 sm:w-40"
              />
            ) : (
              <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-amber-200 text-5xl shadow-lg sm:h-40 sm:w-40">
                🐱
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-amber-400 text-white shadow">
              <PawPrint className="h-4 w-4" />
            </div>
          </div>

          {/* 名字 + 座右铭 */}
          <div className="flex-1 text-center sm:text-left">
            <div className="mb-1 flex items-center justify-center gap-2 sm:justify-start">
              <h1 className="text-3xl font-extrabold tracking-tight text-stone-800 sm:text-4xl">
                {cat.name}
              </h1>
              <Badge className="bg-amber-400 text-white hover:bg-amber-500">
                {cat.color || '橘白'} · {cat.gender === '公' ? '♂' : cat.gender === '母' ? '♀' : ''} {cat.gender || ''}
              </Badge>
            </div>
            {cat.breed && <p className="mb-2 text-sm text-stone-500">{cat.breed}</p>}
            {cat.motto && (
              <p className="mb-3 inline-block rounded-full bg-white/70 px-4 py-1.5 text-sm font-medium text-amber-700 shadow-sm">
                「{cat.motto}」
              </p>
            )}
            {cat.bio && <p className="max-w-xl text-sm leading-relaxed text-stone-600">{cat.bio}</p>}
            {cat.traits.length > 0 && (
              <div className="mt-3 flex flex-wrap justify-center gap-1.5 sm:justify-start">
                {cat.traits.map((t) => (
                  <span key={t} className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-stone-600 shadow-sm">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 编辑按钮 */}
          <div className="sm:self-start">
            <EditDialog
              cat={cat}
              open={open}
              setOpen={setOpen}
              saving={saving}
              setSaving={setSaving}
              onSaved={() => { load(); toast({ title: '档案已更新' }) }}
              toast={toast}
            />
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={<Cake className="h-5 w-5" />}
          label="年龄"
          value={age.years > 0 ? `${age.years}岁${age.months}月` : `${age.months}月${age.days}天`}
          tint="bg-rose-50 text-rose-600"
        />
        <StatCard
          icon={<Sparkles className="h-5 w-5" />}
          label="距下个生日"
          value={daysToBday >= 0 ? `${daysToBday} 天` : '—'}
          tint="bg-amber-50 text-amber-600"
        />
        <StatCard
          icon={<Ruler className="h-5 w-5" />}
          label="出生日期"
          value={cat.birthday ? fmtDate(cat.birthday) : '未填'}
          tint="bg-teal-50 text-teal-600"
        />
        <StatCard
          icon={<Heart className="h-5 w-5" />}
          label="绝育状态"
          value={cat.neutered ? '已绝育' : '未绝育'}
          tint="bg-pink-50 text-pink-600"
        />
      </div>
    </section>
  )
}

function StatCard({ icon, label, value, tint }: { icon: React.ReactNode; label: string; value: string; tint: string }) {
  return (
    <Card className="flex items-center gap-3 border-amber-100/60 p-4 shadow-sm">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tint}`}>{icon}</span>
      <div className="min-w-0">
        <div className="text-xs text-stone-500">{label}</div>
        <div className="truncate text-base font-bold text-stone-800">{value}</div>
      </div>
    </Card>
  )
}

function EditDialog({
  cat, open, setOpen, saving, setSaving, onSaved, toast,
}: {
  cat: CatProfile
  open: boolean
  setOpen: (v: boolean) => void
  saving: boolean
  setSaving: (v: boolean) => void
  onSaved: () => void
  toast: ReturnType<typeof useToast>['toast']
}) {
  const [form, setForm] = useState({
    name: cat.name, breed: cat.breed || '', gender: cat.gender || '公',
    birthday: cat.birthday || '', neutered: cat.neutered, motto: cat.motto || '',
    bio: cat.bio || '', avatar: cat.avatar || '', color: cat.color || '橘白',
    traits: cat.traits.join('、'),
  })

  // 每次打开时同步
  useEffect(() => {
    if (open) {
      setForm({
        name: cat.name, breed: cat.breed || '', gender: cat.gender || '公',
        birthday: cat.birthday || '', neutered: cat.neutered, motto: cat.motto || '',
        bio: cat.bio || '', avatar: cat.avatar || '', color: cat.color || '橘白',
        traits: cat.traits.join('、'),
      })
    }
  }, [open, cat])

  async function save() {
    setSaving(true)
    try {
      const traits = form.traits.split(/[,，、\s]+/).map(s => s.trim()).filter(Boolean)
      const res = await fetch('/api/cat', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, traits }),
      })
      if (!res.ok) throw new Error('保存失败')
      setOpen(false)
      onSaved()
    } catch (e) {
      toast({ title: '保存失败', description: (e as Error).message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-amber-200 bg-white/80 text-amber-700 hover:bg-amber-50">
          <Pencil className="mr-1 h-4 w-4" /> 编辑档案
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>编辑饼饼的档案</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-amber-100 bg-amber-50">
              {form.avatar ? <img src={form.avatar} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-2xl">🐱</div>}
            </div>
            <ImageUpload onUploaded={(url) => setForm(f => ({ ...f, avatar: url }))} label="更换头像" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="名字"><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></Field>
            <Field label="品种"><Input value={form.breed} onChange={e => setForm(f => ({ ...f, breed: e.target.value }))} placeholder="橘白田园猫" /></Field>
            <Field label="性别">
              <select className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm" value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                <option value="公">公</option>
                <option value="母">母</option>
              </select>
            </Field>
            <Field label="出生日期"><Input type="date" value={form.birthday} onChange={e => setForm(f => ({ ...f, birthday: e.target.value }))} /></Field>
            <Field label="花色"><Input value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} placeholder="橘白" /></Field>
            <Field label="绝育">
              <div className="flex h-9 items-center">
                <Switch checked={form.neutered} onCheckedChange={v => setForm(f => ({ ...f, neutered: v }))} />
                <span className="ml-2 text-sm text-stone-600">{form.neutered ? '已绝育' : '未绝育'}</span>
              </div>
            </Field>
          </div>
          <Field label="座右铭"><Input value={form.motto} onChange={e => setForm(f => ({ ...f, motto: e.target.value }))} placeholder="干饭第一名" /></Field>
          <Field label="性格标签（用顿号分隔）"><Input value={form.traits} onChange={e => setForm(f => ({ ...f, traits: e.target.value }))} placeholder="贪吃、黏人、爱睡觉" /></Field>
          <Field label="简介"><Textarea rows={3} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} /></Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
          <Button onClick={save} disabled={saving} className="bg-amber-500 hover:bg-amber-600">
            {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}
            保存
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
