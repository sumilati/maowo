import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { requireUserId } from '@/lib/session'

export async function POST(req: NextRequest) {
  const uid = await requireUserId()
  if (uid instanceof Response) return uid
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: '未收到文件' }, { status: 400 })
    }

    const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: '仅支持 png/jpeg/webp/gif 图片' }, { status: 400 })
    }

    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: '图片不能超过 8MB' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
    const filename = `uploads/upload_${Date.now()}.${ext}`

    const blob = await put(filename, file, {
      access: 'public',
      contentType: file.type,
    })

    return NextResponse.json({ url: blob.url })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
