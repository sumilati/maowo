import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const catId = req.nextUrl.searchParams.get('catId')
    const where = catId ? { catId } : {}
    const list = await db.healthRecord.findMany({ where, orderBy: { date: 'desc' } })
    return NextResponse.json(list)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.catId) return NextResponse.json({ error: '缺少 catId' }, { status: 400 })
    const item = await db.healthRecord.create({
      data: {
        catId: body.catId,
        date: new Date(body.date || Date.now()),
        type: body.type,
        title: body.title,
        description: body.description || null,
        nextDate: body.nextDate ? new Date(body.nextDate) : null,
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
    await db.healthRecord.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
