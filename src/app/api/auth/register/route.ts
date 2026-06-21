import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: '请填写邮箱和密码' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: '密码至少 6 位' }, { status: 400 })
    }
    const exists = await db.user.findUnique({ where: { email } })
    if (exists) {
      return NextResponse.json({ error: '该邮箱已注册' }, { status: 400 })
    }
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await db.user.create({
      data: { email, name: name || null, passwordHash },
    })
    return NextResponse.json({ id: user.id, email: user.email, name: user.name })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
