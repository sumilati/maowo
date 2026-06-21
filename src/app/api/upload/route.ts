import { NextRequest, NextResponse } from 'next/server'
import fs from 'node:fs'
import path from 'node:path'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: '未收到文件' }, { status: 400 })
    }

    // 限制类型
    const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: '仅支持 png/jpeg/webp/gif 图片' }, { status: 400 })
    }

    // 限制大小 8MB
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: '图片不能超过 8MB' }, { status: 400 })
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

    const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
    const filename = `upload_${Date.now()}.${ext}`
    const filepath = path.join(uploadsDir, filename)

    const buffer = Buffer.from(await file.arrayBuffer())
    fs.writeFileSync(filepath, buffer)

    return NextResponse.json({ url: `/uploads/${filename}` })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
