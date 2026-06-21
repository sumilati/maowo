'use client'

import { useEffect, useState, useCallback } from 'react'
import { Send, Loader2, Trash2, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useSelectedCatId } from './use-cat-id'
import { fmtDate, type MessageEntry } from '@/lib/types'
import { SectionTitle, Loading, Empty } from './diary-section'

const AVATARS = ['😸', '😹', '😻', '😼', '🙀', '🐾', '🐟', '🦴', '❤️', '✨']

export function MessageSection() {
  const { toast } = useToast()
  const catId = useSelectedCatId()
  const [list, setList] = useState<MessageEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [form, setForm] = useState({ name: '', content: '', avatar: '😸' })

  const load = useCallback(async () => {
    if (!catId) { setList([]); setLoading(false); return }
    setLoading(true)
    const res = await fetch(`/api/messages?catId=${catId}`)
    setList(await res.json())
    setLoading(false)
  }, [catId])

  useEffect(() => { load() }, [load])

  async function send() {
    if (!catId) return
    if (!form.content.trim()) {
      toast({ title: '说点什么吧', variant: 'destructive' })
      return
    }
    setSending(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, catId }),
      })
      if (!res.ok) throw new Error('失败')
      setForm(f => ({ ...f, content: '' }))
      load()
      toast({ title: '留言成功' })
    } catch (e) {
      toast({ title: '失败', description: (e as Error).message, variant: 'destructive' })
    } finally {
      setSending(false)
    }
  }

  async function remove(id: string) {
    await fetch(`/api/messages?id=${id}`, { method: 'DELETE' })
    load()
  }

  if (!catId) return null

  return (
    <section id="messages" className="scroll-mt-20">
      <SectionTitle icon={<MessageCircle className="h-5 w-5" />} title="撸猫留言板" desc="来跟猫咪打个招呼吧" />

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="border-amber-100/60 p-5 shadow-sm lg:col-span-2">
          <div className="space-y-3">
            <div>
              <Label className="mb-1.5 block text-xs text-stone-500">你的昵称</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="匿名访客" />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs text-stone-500">选个头像</Label>
              <div className="flex flex-wrap gap-1.5">
                {AVATARS.map(a => (
                  <button key={a} onClick={() => setForm(f => ({ ...f, avatar: a }))} className={`flex h-9 w-9 items-center justify-center rounded-lg border text-lg transition-all ${form.avatar === a ? 'border-amber-400 bg-amber-50' : 'border-stone-200'}`}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block text-xs text-stone-500">想说的话</Label>
              <Textarea rows={4} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="好可爱呀～" />
            </div>
            <Button onClick={send} disabled={sending} className="w-full bg-amber-500 hover:bg-amber-600">
              {sending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Send className="mr-1 h-4 w-4" />}
              发表留言
            </Button>
          </div>
        </Card>

        <div className="lg:col-span-3">
          {loading ? <Loading /> : list.length === 0 ? <Empty text="还没有留言，快来抢沙发" /> : (
            <div className="max-h-[28rem] space-y-3 overflow-y-auto pr-1">
              {list.map(m => (
                <Card key={m.id} className="border-amber-100/60 p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 text-xl">
                      {m.avatar || '🐾'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="font-semibold text-stone-800">{m.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-stone-400">{fmtDate(m.createdAt)}</span>
                          <button onClick={() => remove(m.id)} className="text-stone-300 hover:text-rose-500">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed text-stone-600">{m.content}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
