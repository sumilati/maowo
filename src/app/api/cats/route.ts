import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUserId } from '@/lib/session'

export async function GET() {
  const uid = await requireUserId()
  if (uid instanceof Response) return uid
  try {
    const cats = await db.cat.findMany({ where: { userId: uid }, orderBy: { createdAt: 'asc' } })
    return NextResponse.json(cats.map(c => ({ ...c, traits: JSON.parse(c.traits || '[]') })))
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const uid = await requireUserId()
  if (uid instanceof Response) return uid
  try {
    const body = await req.json()
    const data: Record<string, unknown> = { userId: uid }
    for (const k of ['name', 'breed', 'gender', 'birthday', 'neutered', 'bio', 'motto', 'avatar', 'color']) {
      if (body[k] !== undefined) data[k] = body[k]
    }
    data.traits = JSON.stringify(body.traits || [])
    const cat = await db.cat.create({ data: data as never })
    return NextResponse.json({ ...cat, traits: JSON.parse(cat.traits || '[]') })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
