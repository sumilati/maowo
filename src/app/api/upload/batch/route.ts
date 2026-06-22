import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { requireUserId } from '@/lib/session'

const ALLOWED = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
const MAX_SIZE = 8 * 1024 * 1024

export async function POST(req: NextRequest) {
  const uid = await requireUserId()
  if (uid instanceof Response) return uid
  try {
    const formData = await req.formData()
    const files = formData.getAll('files').filter(f => f instanceof File) as File[]

    if (files.length === 0) {
      return NextResponse.json({ error: '未收到文件' }, { status: 400 })
    }

    if (files.length > 20) {
      return NextResponse.json({ error: '一次最多上传 20 张' }, { status: 400 })
    }

    const results: { url: string; name: string; ok: boolean; error?: string }[] = []

    for (const file of files) {
      if (!ALLOWED.includes(file.type)) {
        results.push({ url: '', name: file.name, ok: false, error: '格式不支持' })
        continue
      }
      if (file.size > MAX_SIZE) {
        results.push({ url: '', name: file.name, ok: false, error: '超过 8MB' })
        continue
      }
      try {
        const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
        const filename = `uploads/upload_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`
        const blob = await put(filename, file, {
          access: 'public',
          contentType: file.type,
        })
        results.push({ url: blob.url, name: file.name, ok: true })
      } catch (e) {
        results.push({ url: '', name: file.name, ok: false, error: (e as Error).message })
      }
    }

    return NextResponse.json({ results })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
