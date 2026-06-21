import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    let cat = await db.cat.findUnique({ where: { id: 'default' } })
    if (!cat) {
      cat = await db.cat.create({ data: { id: 'default', name: '饼饼' } })
    }
    return NextResponse.json({ ...cat, traits: JSON.parse(cat.traits || '[]') })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const data: Record<string, unknown> = {}
    for (const k of ['name', 'breed', 'gender', 'birthday', 'neutered', 'bio', 'motto', 'avatar', 'color']) {
      if (body[k] !== undefined) data[k] = body[k]
    }
    if (body.traits !== undefined) {
      data.traits = JSON.stringify(body.traits)
    }
    const cat = await db.cat.upsert({
      where: { id: 'default' },
      create: { id: 'default', ...data },
      update: data,
    })
    return NextResponse.json({ ...cat, traits: JSON.parse(cat.traits || '[]') })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
