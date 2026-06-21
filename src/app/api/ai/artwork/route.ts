import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateImageBase64 } from '@/lib/zai'
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const userPrompt: string = (body.prompt || '').trim()
    const style: string = body.style || 'oil'
    if (!userPrompt) {
      return NextResponse.json({ error: '请描述你想要的画面' }, { status: 400 })
    }

    const styleSuffix = STYLE_PRESETS[style] || STYLE_PRESETS.oil
    const fullPrompt = `A cute orange and white tabby cat named Bingbing, ${userPrompt}, ${styleSuffix}, high quality, detailed, adorable, centered composition`

    const base64 = await generateImageBase64(fullPrompt, '1024x1024')

    // 保存到 public/uploads
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })
    const filename = `artwork_${Date.now()}.png`
    const filepath = path.join(uploadsDir, filename)
    fs.writeFileSync(filepath, Buffer.from(base64, 'base64'))
    const url = `/uploads/${filename}`

    const saved = await db.aIArtwork.create({
      data: { prompt: userPrompt, url, style },
    })

    // 同时加入相册，方便统一浏览
    await db.albumPhoto.create({
      data: { url, title: userPrompt.slice(0, 20), tag: 'portrait', source: 'ai' },
    })

    return NextResponse.json({ id: saved.id, url, prompt: userPrompt, style })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const list = await db.aIArtwork.findMany({ orderBy: { createdAt: 'desc' }, take: 30 })
    return NextResponse.json(list)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
