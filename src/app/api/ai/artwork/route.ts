import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateImageBase64 } from '@/lib/zai'
import { ownCat } from '@/lib/own-cat'
import fs from 'node:fs'
import path from 'node:path'

const STYLE_PRESETS: Record<string, string> = {
  oil: 'oil painting style, brushstrokes visible, rich colors, classical art',
  astronaut: 'wearing a tiny astronaut suit, outer space background, stars, sci-fi',
  renaissance: 'renaissance portrait painting style, dramatic lighting, ornate frame',
  samurai: 'wearing a tiny samurai armor, cherry blossoms, japanese ukiyo-e style',
  chef: 'wearing a chef hat and apron, kitchen background, cooking',
  superhero: 'wearing a tiny superhero cape, city skyline at sunset, comic style',
  pixel: '16-bit pixel art style, retro game sprite, vibrant colors',
  watercolor: 'soft watercolor painting style, pastel colors, dreamy',
}

function buildSubject(cat: { color: string | null; breed: string | null; name: string }): string {
  const colorDesc = cat.color || 'tabby'
  const breedMap: Record<string, string> = {
    '美国短毛猫': 'American Shorthair cat', '美短': 'American Shorthair cat',
    '英国短毛猫': 'British Shorthair cat', '英短': 'British Shorthair cat',
    '布偶猫': 'Ragdoll cat', '布偶': 'Ragdoll cat',
    '橘猫': 'orange tabby cat', '狸花猫': 'Chinese Li Hua tabby cat', '狸花': 'Chinese Li Hua tabby cat',
    '暹罗猫': 'Siamese cat', '暹罗': 'Siamese cat',
    '波斯猫': 'Persian cat', '波斯': 'Persian cat',
    '缅因猫': 'Maine Coon cat', '缅因': 'Maine Coon cat',
  }
  const breedEn = breedMap[cat.breed || ''] || 'cat'
  const colorMap: Record<string, string> = {
    '银虎斑': 'silver tabby', '橘白': 'orange and white', '橘': 'orange',
    '纯白': 'pure white', '纯黑': 'black', '黑白': 'black and white',
    '三花': 'calico', '玳瑁': 'tortoiseshell', '重点色': 'colorpoint', '蓝': 'blue gray',
  }
  const colorEn = colorMap[colorDesc] || colorDesc
  return `A cute ${colorEn} ${breedEn} named ${cat.name}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const catId: string = body.catId
    const userPrompt: string = (body.prompt || '').trim()
    const style: string = body.style || 'oil'
    if (!catId) return NextResponse.json({ error: '缺少 catId' }, { status: 400 })
    if (!userPrompt) return NextResponse.json({ error: '请描述你想要的画面' }, { status: 400 })
    const ok = await ownCat(catId)
    if (ok instanceof Response) return ok

    const cat = await db.cat.findUnique({ where: { id: catId } })
    if (!cat) return NextResponse.json({ error: '猫咪不存在' }, { status: 404 })

    const subject = buildSubject(cat)
    const styleSuffix = STYLE_PRESETS[style] || STYLE_PRESETS.oil
    const fullPrompt = `${subject}, ${userPrompt}, ${styleSuffix}, high quality, detailed, adorable, centered composition`
    const base64 = await generateImageBase64(fullPrompt, '1024x1024')

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })
    const filename = `artwork_${Date.now()}.png`
    fs.writeFileSync(path.join(uploadsDir, filename), Buffer.from(base64, 'base64'))
    const url = `/api/uploads/${filename}`

    const saved = await db.aIArtwork.create({ data: { catId, prompt: userPrompt, url, style } })
    await db.albumPhoto.create({ data: { catId, url, title: userPrompt.slice(0, 20), tag: 'portrait', source: 'ai' } })

    return NextResponse.json({ id: saved.id, url, prompt: userPrompt, style })
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
    const list = await db.aIArtwork.findMany({ where: { catId }, orderBy: { createdAt: 'desc' }, take: 30 })
    return NextResponse.json(list)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
