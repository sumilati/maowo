import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 把一条 AI 日记转存为成长日记
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const ai = await db.aIDiary.findUnique({ where: { id } })
    if (!ai) return NextResponse.json({ error: 'AI 日记不存在' }, { status: 404 })

    const diary = await db.diary.create({
      data: {
        catId: ai.catId,
        date: new Date(),
        title: `AI 日记：${ai.keywords.slice(0, 16)}`,
        content: ai.content,
        mood: 'cute',
      },
    })
    return NextResponse.json({ ok: true, diaryId: diary.id, catId: ai.catId })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
