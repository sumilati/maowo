'use client'

import { Suspense, useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Cat, Loader2, Mail, Lock, User } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

function LoginForm() {
  const router = useRouter()
  const search = useSearchParams()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', name: '' })
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (search.get('registered')) {
      toast.success('注册成功，请登录')
    }
  }, [search])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg('')
    if (!form.email || !form.password) {
      setErrorMsg('请填写邮箱和密码')
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
      }
      // 手动调用 credentials callback，让浏览器正确接收 set-cookie
      const csrfRes = await fetch('/api/auth/csrf', { credentials: 'include' })
      const { csrfToken } = await csrfRes.json()
      const body = new URLSearchParams({
        email: form.email,
        password: form.password,
        csrfToken,
        json: 'true',
      })
      const cbRes = await fetch('/api/auth/callback/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        credentials: 'include',
        body: body.toString(),
      })
      const cbData = await cbRes.json().catch(() => ({}))
      // 失败时 callback 返回的 url 含 error
      if (cbData.url && cbData.url.includes('error=')) {
        throw new Error(mode === 'register' ? '注册成功，请用刚注册的账号登录' : '邮箱或密码错误，请重试')
      }
      // 验证 session 是否真的建立
      const sess = await fetch('/api/auth/session', { credentials: 'include' }).then(r => r.json())
      if (!sess?.user) {
        throw new Error('登录失败，请重试')
      }
      toast.success('登录成功，正在跳转…')
      setTimeout(() => {
        router.push('/')
        router.refresh()
      }, 200)
    } catch (err) {
      setErrorMsg((err as Error).message)
      toast.error('登录失败', { description: (err as Error).message })
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
          {errorMsg && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
              {errorMsg}
            </div>
          )}
          <Button type="submit" disabled={loading} className="w-full bg-amber-500 hover:bg-amber-600">
            {loading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}
            {mode === 'login' ? '登录' : '注册并登录'}
          </Button>
        </form>

        <p className="mt-5 text-center text-xs text-stone-400">
          {mode === 'login' ? '还没有账号？点击上方"注册"' : '已有账号？点击上方"登录"'}
        </p>

        {mode === 'login' && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50/60 px-4 py-3 text-center text-xs text-stone-500">
            <div className="mb-1 font-medium text-amber-700">体验账号</div>
            邮箱：demo@maowo.com<br />
            密码：123456
          </div>
        )}
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
