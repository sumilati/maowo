import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { vlmChat } from '@/lib/zai'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const catId: string = body.catId
    const imageUrl: string = body.imageUrl
    if (!catId) return NextResponse.json({ error: '缺少 catId' }, { status: 400 })
    if (!imageUrl) return NextResponse.json({ error: '请提供图片' }, { status: 400 })

    const cat = await db.cat.findUnique({ where: { id: catId } })
    if (!cat) return NextResponse.json({ error: '猫咪不存在' }, { status: 404 })

    let fullUrl = imageUrl
    if (imageUrl.startsWith('/')) {
      const host = req.headers.get('host') || 'localhost:3000'
      const proto = req.headers.get('x-forwarded-proto') || 'http'
      fullUrl = `${proto}://${host}${imageUrl}`
    }

    const prompt = `这是一张名叫"${cat.name}"的猫咪的照片。请以这只猫咪第一人称的口吻，写一段50字以内的内心独白，描述它此刻在做什么、想什么。要可爱、生动、有画面感。只输出独白本身，不要引号和解释。`

    const caption = await vlmChat(prompt, fullUrl)

    const saved = await db.imageCaption.create({
      data: { catId, imageUrl, caption },
    })

    return NextResponse.json({ id: saved.id, imageUrl, caption })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const catId = req.nextUrl.searchParams.get('catId')
    const where = catId ? { catId } : {}
    const list = await db.imageCaption.findMany({ where, orderBy: { createdAt: 'desc' }, take: 30 })
    return NextResponse.json(list)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
