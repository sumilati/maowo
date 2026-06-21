'use client'

import { useEffect, useState, useCallback } from 'react'
import { Sparkles, Wand2, Eye, Loader2, Bot, BookPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { ImageUpload } from './image-upload'
import { useSelectedCatId } from './use-cat-id'
import { fmtDate, type AIDiaryEntry, type AIArtworkEntry, type ImageCaptionEntry } from '@/lib/types'
import { SectionTitle, Loading, Empty } from './diary-section'

export function AIPlaySection() {
  const catId = useSelectedCatId()
  if (!catId) return null
  return (
    <section id="ai" className="scroll-mt-20">
      <SectionTitle icon={<Bot className="h-5 w-5" />} title="AI 玩乐实验室" desc="用 AI 给猫咪写日记、画艺术照、看图说话" />
      <Tabs defaultValue="diary" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-amber-50">
          <TabsTrigger value="diary" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
            <Sparkles className="mr-1 h-4 w-4" /> AI 日记
          </TabsTrigger>
          <TabsTrigger value="art" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
            <Wand2 className="mr-1 h-4 w-4" /> AI 艺术照
          </TabsTrigger>
          <TabsTrigger value="caption" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
            <Eye className="mr-1 h-4 w-4" /> 看图说话
          </TabsTrigger>
        </TabsList>
        <TabsContent value="diary" className="mt-4"><AIDiaryPanel catId={catId} /></TabsContent>
        <TabsContent value="art" className="mt-4"><AIArtworkPanel catId={catId} /></TabsContent>
        <TabsContent value="caption" className="mt-4"><AICaptionPanel catId={catId} /></TabsContent>
      </Tabs>
    </section>
  )
}

/* ============ AI 第一人称日记 ============ */
function AIDiaryPanel({ catId }: { catId: string }) {
  const { toast } = useToast()
  const [list, setList] = useState<AIDiaryEntry[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [keywords, setKeywords] = useState('')
  const [mood, setMood] = useState('傲娇又可爱')
  const [result, setResult] = useState<string>('')
  const [resultId, setResultId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoadingList(true)
    const res = await fetch(`/api/ai/diary?catId=${catId}`)
    setList(await res.json())
    setLoadingList(false)
  }, [catId])

  useEffect(() => { load() }, [load])

  async function gen() {
    if (!keywords.trim()) {
      toast({ title: '请输入今天的关键词', variant: 'destructive' })
      return
    }
    setGenerating(true)
    setResult('')
    setResultId(null)
    try {
      const res = await fetch('/api/ai/diary', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ catId, keywords, mood }),
      })
      if (!res.ok) throw new Error('生成失败')
      const data = await res.json()
      setResult(data.content)
      setResultId(data.id)
      load()
    } catch (e) {
      toast({ title: '生成失败', description: (e as Error).message, variant: 'destructive' })
    } finally {
      setGenerating(false)
    }
  }

  const moods = ['傲娇又可爱', '开心到飞起', '有点小烦躁', '困得不行', '好奇又兴奋', '想吃好吃的']

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="border-amber-100/60 p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-700">
          <Sparkles className="h-4 w-4 text-amber-500" /> 让 AI 用猫咪的口吻写日记
        </div>
        <div className="space-y-3">
          <div>
            <Label className="mb-1.5 block text-xs text-stone-500">今天的关键词（发生了什么）</Label>
            <Textarea rows={3} value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="比如：偷吃了小鱼干、被铲屎官骂、在窗台看鸟、抓烂了沙发…" />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-stone-500">心情基调</Label>
            <div className="flex flex-wrap gap-1.5">
              {moods.map(m => (
                <button key={m} onClick={() => setMood(m)} className={`rounded-full px-3 py-1 text-xs transition-colors ${mood === m ? 'bg-amber-500 text-white' : 'bg-amber-50 text-stone-600 hover:bg-amber-100'}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={gen} disabled={generating} className="w-full bg-amber-500 hover:bg-amber-600">
            {generating ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> 猫咪正在构思…</> : <><Sparkles className="mr-1 h-4 w-4" /> 生成日记</>}
          </Button>
        </div>
        {result && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/50 p-4">
            <div className="mb-2 flex items-center justify-between gap-1.5">
              <span className="flex items-center gap-1.5 text-xs font-medium text-amber-700">
                <span className="text-base">🐾</span> 今日日记
              </span>
              <Button
                size="sm"
                variant="outline"
                className="h-7 border-amber-200 px-2 text-xs text-amber-700 hover:bg-amber-100"
                disabled={!resultId}
                onClick={async () => {
                  if (!resultId) return
                  try {
                    const res = await fetch(`/api/ai/diary/${resultId}/convert`, { method: 'POST' })
                    if (!res.ok) throw new Error('转存失败')
                    toast({ title: '已转存到成长日记', description: '已自动添加到成长日记区' })
                    // 通知日记区刷新
                    window.dispatchEvent(new CustomEvent('diary:changed'))
                  } catch {
                    toast({ title: '转存失败', variant: 'destructive' })
                  }
                }}
              >
                <BookPlus className="mr-1 h-3 w-3" /> 转存到日记
              </Button>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-stone-700">{result}</p>
          </div>
        )}
      </Card>

      <Card className="border-amber-100/60 p-5 shadow-sm">
        <div className="mb-3 text-sm font-semibold text-stone-700">历史日记</div>
        {loadingList ? <Loading /> : list.length === 0 ? <Empty text="还没有 AI 日记" /> : (
          <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
            {list.map(d => (
              <div key={d.id} className="rounded-xl border border-amber-100/60 bg-white/60 p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs text-stone-400">{fmtDate(d.createdAt)}</span>
                  <Badge variant="outline" className="border-amber-200 text-amber-600">AI</Badge>
                </div>
                <div className="mb-1 text-xs text-stone-400">关键词：{d.keywords}</div>
                <p className="line-clamp-4 text-sm leading-relaxed text-stone-600">{d.content}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

/* ============ AI 艺术照 ============ */
const STYLES = [
  { key: 'oil', label: '油画', emoji: '🎨' },
  { key: 'astronaut', label: '宇航员', emoji: '🚀' },
  { key: 'renaissance', label: '文艺复兴', emoji: '🖼️' },
  { key: 'samurai', label: '武士', emoji: '⚔️' },
  { key: 'chef', label: '大厨', emoji: '👨‍🍳' },
  { key: 'superhero', label: '超级英雄', emoji: '🦸' },
  { key: 'pixel', label: '像素风', emoji: '👾' },
  { key: 'watercolor', label: '水彩', emoji: '💧' },
]

function AIArtworkPanel({ catId }: { catId: string }) {
  const { toast } = useToast()
  const [list, setList] = useState<AIArtworkEntry[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState('oil')
  const [result, setResult] = useState<AIArtworkEntry | null>(null)

  const load = useCallback(async () => {
    setLoadingList(true)
    const res = await fetch(`/api/ai/artwork?catId=${catId}`)
    setList(await res.json())
    setLoadingList(false)
  }, [catId])

  useEffect(() => { load() }, [load])

  async function gen() {
    if (!prompt.trim()) {
      toast({ title: '请描述画面', variant: 'destructive' })
      return
    }
    setGenerating(true)
    setResult(null)
    try {
      const res = await fetch('/api/ai/artwork', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ catId, prompt, style }),
      })
      if (!res.ok) throw new Error('生成失败')
      const data = await res.json()
      setResult(data)
      setPrompt('')
      load()
    } catch (e) {
      toast({ title: '生成失败', description: (e as Error).message, variant: 'destructive' })
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="border-amber-100/60 p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-700">
          <Wand2 className="h-4 w-4 text-amber-500" /> 生成专属艺术照
        </div>
        <div className="space-y-3">
          <div>
            <Label className="mb-1.5 block text-xs text-stone-500">选择风格</Label>
            <div className="grid grid-cols-4 gap-1.5">
              {STYLES.map(s => (
                <button key={s.key} onClick={() => setStyle(s.key)} className={`flex flex-col items-center gap-0.5 rounded-lg border p-2 text-xs transition-all ${style === s.key ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-stone-200 text-stone-500 hover:border-amber-200'}`}>
                  <span className="text-lg">{s.emoji}</span>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-stone-500">画面描述（在做什么）</Label>
            <Input value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="戴皇冠坐在王座上" />
          </div>
          <Button onClick={gen} disabled={generating} className="w-full bg-amber-500 hover:bg-amber-600">
            {generating ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> 正在创作…</> : <><Wand2 className="mr-1 h-4 w-4" /> 开始创作</>}
          </Button>
        </div>
        {generating && (
          <div className="mt-4 flex h-48 items-center justify-center rounded-xl border border-dashed border-amber-200 bg-amber-50/40">
            <div className="text-center text-stone-400">
              <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-amber-400" />
              <p className="text-sm">AI 正在挥毫泼墨…</p>
            </div>
          </div>
        )}
        {result && !generating && (
          <div className="mt-4">
            <img loading="lazy" src={result.url} alt={result.prompt} className="w-full rounded-xl shadow-md" />
            <p className="mt-1.5 text-center text-xs text-stone-400">「{result.prompt}」· 已自动加入相册</p>
          </div>
        )}
      </Card>

      <Card className="border-amber-100/60 p-5 shadow-sm">
        <div className="mb-3 text-sm font-semibold text-stone-700">艺术照集</div>
        {loadingList ? <Loading /> : list.length === 0 ? <Empty text="还没有 AI 艺术照" /> : (
          <div className="grid max-h-96 grid-cols-2 gap-2 overflow-y-auto pr-1">
            {list.map(a => (
              <div key={a.id} className="relative overflow-hidden rounded-lg">
                <img loading="lazy" src={a.url} alt={a.prompt} className="aspect-square w-full object-cover" />
                <span className="absolute right-1 top-1 rounded-full bg-purple-500/90 px-1.5 py-0.5 text-[9px] text-white">{STYLES.find(s => s.key === a.style)?.label || 'AI'}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

/* ============ 看图说话 ============ */
function AICaptionPanel({ catId }: { catId: string }) {
  const { toast } = useToast()
  const [list, setList] = useState<ImageCaptionEntry[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [result, setResult] = useState('')

  const load = useCallback(async () => {
    setLoadingList(true)
    const res = await fetch(`/api/ai/caption?catId=${catId}`)
    setList(await res.json())
    setLoadingList(false)
  }, [catId])

  useEffect(() => { load() }, [load])

  async function gen() {
    if (!imageUrl) {
      toast({ title: '请先上传一张照片', variant: 'destructive' })
      return
    }
    setGenerating(true)
    setResult('')
    try {
      const res = await fetch('/api/ai/caption', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ catId, imageUrl }),
      })
      if (!res.ok) throw new Error('生成失败')
      const data = await res.json()
      setResult(data.caption)
      load()
    } catch (e) {
      toast({ title: '生成失败', description: (e as Error).message, variant: 'destructive' })
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="border-amber-100/60 p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-700">
          <Eye className="h-4 w-4 text-amber-500" /> AI 猜猫咪在想什么
        </div>
        <div className="space-y-3">
          <div className="flex flex-col items-center gap-3">
            {imageUrl ? (
              <img loading="lazy" src={imageUrl} alt="" className="h-48 w-full rounded-xl object-cover" />
            ) : (
              <div className="flex h-48 w-full items-center justify-center rounded-xl border-2 border-dashed border-amber-200 text-4xl">📸</div>
            )}
            <ImageUpload onUploaded={(url) => setImageUrl(url)} label="上传一张照片" />
          </div>
          <Button onClick={gen} disabled={generating} className="w-full bg-amber-500 hover:bg-amber-600">
            {generating ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> AI 正在观察…</> : <><Eye className="mr-1 h-4 w-4" /> 猜猜在想啥</>}
          </Button>
        </div>
        {result && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/50 p-4">
            <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-amber-700">
              <span className="text-base">💭</span> 内心独白
            </div>
            <p className="text-sm leading-relaxed text-stone-700">「{result}」</p>
          </div>
        )}
      </Card>

      <Card className="border-amber-100/60 p-5 shadow-sm">
        <div className="mb-3 text-sm font-semibold text-stone-700">历史记录</div>
        {loadingList ? <Loading /> : list.length === 0 ? <Empty text="还没有记录" /> : (
          <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
            {list.map(c => (
              <div key={c.id} className="flex gap-3 rounded-xl border border-amber-100/60 bg-white/60 p-3">
                <img loading="lazy" src={c.imageUrl} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0">
                  <p className="text-sm leading-relaxed text-stone-700">「{c.caption}」</p>
                  <span className="text-xs text-stone-400">{fmtDate(c.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
