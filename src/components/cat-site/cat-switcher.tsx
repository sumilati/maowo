'use client'

import { useState } from 'react'
import { Plus, Cat as CatIcon, Pencil, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { ImageUpload } from './image-upload'
import { useCatStore, useSelectedCat } from '@/lib/cat-store'
import type { CatProfile } from '@/lib/types'

// 顶部猫咪切换条
export function CatSwitcher() {
  const { cats, selectedCatId, selectCat } = useCatStore()
  const selectedCat = useSelectedCat()

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scroll-hide">
      {cats.map((c) => {
        const active = c.id === selectedCatId
        return (
          <button
            key={c.id}
            onClick={() => selectCat(c.id)}
            className={`group flex shrink-0 items-center gap-2 rounded-full border-2 py-1 pl-1 pr-3 transition-all ${
              active
                ? 'border-amber-400 bg-amber-50 shadow-sm'
                : 'border-stone-200 bg-white/60 hover:border-amber-200'
            }`}
          >
            {c.avatar ? (
              <img loading="lazy" src={c.avatar} alt={c.name} className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-base">🐱</span>
            )}
            <span className={`text-sm font-medium ${active ? 'text-amber-700' : 'text-stone-600'}`}>{c.name}</span>
          </button>
        )
      })}
      <CatAddButton onCreated={() => {}} />
      {selectedCat && <CatEditButton />}
    </div>
  )
}

// 添加猫咪按钮 + 弹窗
function CatAddButton({ onCreated }: { onCreated: () => void }) {
  const { upsertCat, selectCat } = useCatStore()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', breed: '', gender: '公', birthday: '',
    neutered: true, motto: '', bio: '', avatar: '', color: '', traits: '',
  })

  function reset() {
    setForm({ name: '', breed: '', gender: '公', birthday: '', neutered: true, motto: '', bio: '', avatar: '', color: '', traits: '' })
  }

  async function save() {
    if (!form.name.trim()) {
      toast({ title: '请给猫咪起个名字', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const traits = form.traits.split(/[,，、\s]+/).map(s => s.trim()).filter(Boolean)
      const res = await fetch('/api/cats', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, traits }),
      })
      if (!res.ok) throw new Error('创建失败')
      const cat: CatProfile = await res.json()
      upsertCat(cat)
      selectCat(cat.id)
      setOpen(false)
      reset()
      onCreated()
      toast({ title: `欢迎 ${cat.name} 入住猫窝！` })
    } catch (e) {
      toast({ title: '失败', description: (e as Error).message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="shrink-0 border-dashed border-amber-300 text-amber-600 hover:bg-amber-50">
          <Plus className="mr-1 h-4 w-4" /> 添加猫咪
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><CatIcon className="h-5 w-5 text-amber-500" /> 添加一只新猫咪</DialogTitle>
        </DialogHeader>
        <CatForm form={form} setForm={setForm} />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
          <Button onClick={save} disabled={saving} className="bg-amber-500 hover:bg-amber-600">
            {saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />} 创建
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// 编辑/删除当前猫
function CatEditButton() {
  const cat = useSelectedCat()!
  const { upsertCat, removeCat, cats, selectCat } = useCatStore()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: cat.name, breed: cat.breed || '', gender: cat.gender || '公',
    birthday: cat.birthday || '', neutered: cat.neutered, motto: cat.motto || '',
    bio: cat.bio || '', avatar: cat.avatar || '', color: cat.color || '',
    traits: cat.traits.join('、'),
  })

  // 每次打开同步
  if (open && form.name !== cat.name && form.avatar === '') {
    // 仅初次打开初始化，下面用 effect 更稳妥
  }

  function syncFromCat() {
    setForm({
      name: cat.name, breed: cat.breed || '', gender: cat.gender || '公',
      birthday: cat.birthday || '', neutered: cat.neutered, motto: cat.motto || '',
      bio: cat.bio || '', avatar: cat.avatar || '', color: cat.color || '',
      traits: cat.traits.join('、'),
    })
  }

  async function save() {
    setSaving(true)
    try {
      const traits = form.traits.split(/[,，、\s]+/).map(s => s.trim()).filter(Boolean)
      const res = await fetch(`/api/cats/${cat.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, traits }),
      })
      if (!res.ok) throw new Error('保存失败')
      const updated: CatProfile = await res.json()
      upsertCat(updated)
      setOpen(false)
      toast({ title: '档案已更新' })
    } catch (e) {
      toast({ title: '失败', description: (e as Error).message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  async function del() {
    if (!confirm(`确定删除「${cat.name}」吗？TA 的所有日记、相册、健康记录等都会被一并删除，且无法恢复。`)) return
    try {
      const res = await fetch(`/api/cats/${cat.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('删除失败')
      removeCat(cat.id)
      const next = cats.find(c => c.id !== cat.id)
      if (next) selectCat(next.id)
      setOpen(false)
      toast({ title: `${cat.name} 已离开猫窝` })
    } catch (e) {
      toast({ title: '失败', description: (e as Error).message, variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v) syncFromCat() }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="shrink-0 text-stone-400 hover:text-amber-600">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>编辑「{cat.name}」</DialogTitle>
        </DialogHeader>
        <CatForm form={form} setForm={setForm} />
        <DialogFooter className="sm:justify-between">
          <Button variant="destructive" size="sm" onClick={del} className="mr-auto">
            <Trash2 className="mr-1 h-4 w-4" /> 删除这只猫
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
            <Button onClick={save} disabled={saving} className="bg-amber-500 hover:bg-amber-600">
              {saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />} 保存
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// 共享表单
function CatForm({ form, setForm }: { form: {
  name: string; breed: string; gender: string; birthday: string; neutered: boolean;
  motto: string; bio: string; avatar: string; color: string; traits: string;
}; setForm: React.Dispatch<React.SetStateAction<any>> }) {
  return (
    <div className="grid gap-4 py-2">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-amber-100 bg-amber-50">
          {form.avatar ? <img loading="lazy" src={form.avatar} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-2xl">🐱</div>}
        </div>
        <ImageUpload onUploaded={(url) => setForm((f: any) => ({ ...f, avatar: url }))} label="上传头像" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="名字"><Input value={form.name} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))} /></Field>
        <Field label="品种"><Input value={form.breed} onChange={e => setForm((f: any) => ({ ...f, breed: e.target.value }))} placeholder="美国短毛猫" /></Field>
        <Field label="性别">
          <select className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm" value={form.gender} onChange={e => setForm((f: any) => ({ ...f, gender: e.target.value }))}>
            <option value="公">公</option>
            <option value="母">母</option>
          </select>
        </Field>
        <Field label="出生日期"><Input type="date" value={form.birthday} onChange={e => setForm((f: any) => ({ ...f, birthday: e.target.value }))} /></Field>
        <Field label="花色"><Input value={form.color} onChange={e => setForm((f: any) => ({ ...f, color: e.target.value }))} placeholder="银虎斑" /></Field>
        <Field label="绝育">
          <div className="flex h-9 items-center">
            <Switch checked={form.neutered} onCheckedChange={v => setForm((f: any) => ({ ...f, neutered: v }))} />
            <span className="ml-2 text-sm text-stone-600">{form.neutered ? '已绝育' : '未绝育'}</span>
          </div>
        </Field>
      </div>
      <Field label="座右铭"><Input value={form.motto} onChange={e => setForm((f: any) => ({ ...f, motto: e.target.value }))} placeholder="世界那么大，本喵都要瞅瞅" /></Field>
      <Field label="性格标签（用顿号分隔）"><Input value={form.traits} onChange={e => setForm((f: any) => ({ ...f, traits: e.target.value }))} placeholder="好奇、活泼、爱说话" /></Field>
      <Field label="简介"><Textarea rows={3} value={form.bio} onChange={e => setForm((f: any) => ({ ...f, bio: e.target.value }))} /></Field>
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
