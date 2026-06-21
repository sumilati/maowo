import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ownCat } from '@/lib/own-cat'

export async function GET(req: NextRequest) {
  try {
    const catId = req.nextUrl.searchParams.get('catId')
    if (!catId) return NextResponse.json([])
    const ok = await ownCat(catId)
    if (ok instanceof Response) return ok
    const list = await db.albumPhoto.findMany({ where: { catId }, orderBy: { createdAt: 'desc' } })
    return NextResponse.json(list)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.catId) return NextResponse.json({ error: '缺少 catId' }, { status: 400 })
    const ok = await ownCat(body.catId)
    if (ok instanceof Response) return ok
    const item = await db.albumPhoto.create({
      data: {
        catId: body.catId,
        url: body.url,
        title: body.title || null,
        tag: body.tag || null,
        source: body.source || 'upload',
      },
    })
    return NextResponse.json(item)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: '缺少 id' }, { status: 400 })
    const item = await db.albumPhoto.findUnique({ where: { id }, select: { catId: true } })
    if (!item) return NextResponse.json({ error: '不存在' }, { status: 404 })
    const ok = await ownCat(item.catId)
    if (ok instanceof Response) return ok
    await db.albumPhoto.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
