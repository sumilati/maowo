import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { llmChat } from '@/lib/zai'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const keywords: string = (body.keywords || '').trim()
    const mood: string = body.mood || '傲娇又可爱'
    if (!keywords) {
      return NextResponse.json({ error: '请输入今天发生的关键词' }, { status: 400 })
    }

    const catName = body.catName || '饼饼'
    const systemPrompt = `你是一只名叫"${catName}"的橘白田园猫，今年2岁多，公猫，已绝育。性格：贪吃、黏人、爱睡觉、傲娇、偶尔拆家、嘴硬心软。你正在用第一人称写今天的日记。要求：1) 用猫咪的口吻，傲娇又可爱；2) 150-300字；3) 偶尔用"喵""呜"等语气词但不要过度；4) 开头直接进入内容，不要"亲爱的日记"之类的套话；5) 可以吐槽铲屎官；6) 今日心情基调：${mood}。只输出日记正文，不要标题和解释。`

    const content = await llmChat(systemPrompt, `今天发生的事（关键词）：${keywords}\n\n请用我的口吻写一篇今日日记。`)

    const saved = await db.aIDiary.create({
      data: { keywords, content },
    })

    return NextResponse.json({ id: saved.id, content, keywords })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const list = await db.aIDiary.findMany({ orderBy: { createdAt: 'desc' }, take: 20 })
    return NextResponse.json(list)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
