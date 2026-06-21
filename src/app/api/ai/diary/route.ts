import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { llmChat } from '@/lib/zai'
import { ownCat } from '@/lib/own-cat'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const catId: string = body.catId
    const keywords: string = (body.keywords || '').trim()
    const mood: string = body.mood || '傲娇又可爱'
    if (!catId) return NextResponse.json({ error: '缺少 catId' }, { status: 400 })
    if (!keywords) return NextResponse.json({ error: '请输入今天发生的关键词' }, { status: 400 })
    const ok = await ownCat(catId)
    if (ok instanceof Response) return ok

    const cat = await db.cat.findUnique({ where: { id: catId } })
    if (!cat) return NextResponse.json({ error: '猫咪不存在' }, { status: 404 })

    const traits = JSON.parse(cat.traits || '[]')
    const ageInfo = cat.birthday ? `生日${cat.birthday}` : ''
    const breedInfo = cat.breed || '猫'
    const genderInfo = cat.gender === '母' ? '母猫' : '公猫'
    const traitsInfo = traits.length ? `性格：${traits.join('、')}` : ''
    const bioInfo = cat.bio ? `简介：${cat.bio}` : ''

    const systemPrompt = `你是一只名叫"${cat.name}"的${cat.color || ''}${breedInfo}，${genderInfo}，${cat.neutered ? '已绝育' : '未绝育'}，${ageInfo}。${traitsInfo}。${bioInfo}。你正在用第一人称写今天的日记。要求：1) 用猫咪的口吻，贴合你的性格设定；2) 150-300字；3) 偶尔用"喵""呜"等语气词但不要过度；4) 开头直接进入内容，不要"亲爱的日记"之类的套话；5) 可以吐槽铲屎官；6) 今日心情基调：${mood}。只输出日记正文，不要标题和解释。`

    const content = await llmChat(systemPrompt, `今天发生的事（关键词）：${keywords}\n\n请用我的口吻写一篇今日日记。`)

    const saved = await db.aIDiary.create({ data: { catId, keywords, content } })
    return NextResponse.json({ id: saved.id, content, keywords })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const catId = req.nextUrl.searchParams.get('catId')
    if (!catId) return NextResponse.json([])
    const ok = await ownCat(catId)
    if (ok instanceof Response) return ok
    const list = await db.aIDiary.findMany({ where: { catId }, orderBy: { createdAt: 'desc' }, take: 20 })
    return NextResponse.json(list)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
