'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Cat, Loader2, Mail, Lock, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

export default function LoginPage() {
  const router = useRouter()
  const search = useSearchParams()
  const { toast } = useToast()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', name: '' })

  useEffect(() => {
    if (search.get('registered')) {
      toast({ title: '注册成功，请登录' })
    }
  }, [search, toast])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.email || !form.password) {
      toast({ title: '请填写邮箱和密码', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      if (mode === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || '注册失败')
        toast({ title: '注册成功！正在登录…' })
      }
      const result = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      })
      if (result?.error) {
        throw new Error(mode === 'register' ? '自动登录失败，请手动登录' : '邮箱或密码错误')
      }
      router.push('/')
      router.refresh()
    } catch (err) {
      toast({ title: '操作失败', description: (err as Error).message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-100 via-orange-50 to-rose-50 p-4">
      <Card className="w-full max-w-md border-amber-100/60 p-8 shadow-lg">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-amber-400 text-white shadow-md">
            <Cat className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-stone-800">猫窝</h1>
          <p className="mt-1 text-sm text-stone-500">每只猫都有专属的小窝</p>
        </div>

        {/* 切换 Tab */}
        <div className="mb-5 flex rounded-full bg-amber-50 p-1">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${mode === 'login' ? 'bg-amber-500 text-white shadow-sm' : 'text-stone-500'}`}
          >
            登录
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${mode === 'register' ? 'bg-amber-500 text-white shadow-sm' : 'text-stone-500'}`}
          >
            注册
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === 'register' && (
            <div className="grid gap-1.5">
              <Label className="text-xs text-stone-500">昵称（可选）</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <Input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="铲屎官"
                  className="pl-9"
                />
              </div>
            </div>
          )}
          <div className="grid gap-1.5">
            <Label className="text-xs text-stone-500">邮箱</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <Input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com"
                className="pl-9"
                required
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs text-stone-500">密码 {mode === 'register' && '（至少 6 位）'}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <Input
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••"
                className="pl-9"
                required
              />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-amber-500 hover:bg-amber-600">
            {loading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}
            {mode === 'login' ? '登录' : '注册并登录'}
          </Button>
        </form>

        <p className="mt-5 text-center text-xs text-stone-400">
          {mode === 'login' ? '还没有账号？点击上方"注册"' : '已有账号？点击上方"登录"'}
        </p>
      </Card>
    </div>
  )
}
