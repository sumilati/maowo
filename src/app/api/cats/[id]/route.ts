import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUserId } from '@/lib/session'

async function ownCat(uid: string, catId: string) {
  const cat = await db.cat.findUnique({ where: { id: catId } })
  return cat && cat.userId === uid ? cat : null
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const uid = await requireUserId()
  if (uid instanceof Response) return uid
  try {
    const { id } = await params
    const cat = await ownCat(uid, id)
    if (!cat) return NextResponse.json({ error: '猫咪不存在' }, { status: 404 })
    return NextResponse.json({ ...cat, traits: JSON.parse(cat.traits || '[]') })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const uid = await requireUserId()
  if (uid instanceof Response) return uid
  try {
    const { id } = await params
    const cat = await ownCat(uid, id)
    if (!cat) return NextResponse.json({ error: '猫咪不存在' }, { status: 404 })
    const body = await req.json()
    const data: Record<string, unknown> = {}
    for (const k of ['name', 'breed', 'gender', 'birthday', 'neutered', 'bio', 'motto', 'avatar', 'color']) {
      if (body[k] !== undefined) data[k] = body[k]
    }
    if (body.traits !== undefined) data.traits = JSON.stringify(body.traits)
    const updated = await db.cat.update({ where: { id }, data: data as never })
    return NextResponse.json({ ...updated, traits: JSON.parse(updated.traits || '[]') })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const uid = await requireUserId()
  if (uid instanceof Response) return uid
  try {
    const { id } = await params
    const cat = await ownCat(uid, id)
    if (!cat) return NextResponse.json({ error: '猫咪不存在' }, { status: 404 })
    await db.cat.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
