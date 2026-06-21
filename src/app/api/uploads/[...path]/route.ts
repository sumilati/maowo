import { NextRequest, NextResponse } from 'next/server'
import fs from 'node:fs'
import path from 'node:path'

// 动态 serve 上传的文件，避免 Next.js dev 对 public/ 新增文件的缓存延迟
export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path: segs } = await params
    const relPath = segs.join('/')
    // 安全：只允许读取 uploads 目录
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    const filePath = path.join(uploadsDir, relPath)
    // 防止路径穿越
    if (!filePath.startsWith(uploadsDir)) {
      return new NextResponse('Forbidden', { status: 403 })
    }
    if (!fs.existsSync(filePath)) {
      return new NextResponse('Not found', { status: 404 })
    }
    const ext = path.extname(filePath).slice(1).toLowerCase()
    const mimeMap: Record<string, string> = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      webp: 'image/webp',
      gif: 'image/gif',
    }
    const mime = mimeMap[ext] || 'application/octet-stream'
    const buffer = fs.readFileSync(filePath)
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mime,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (e) {
    return new NextResponse('Server error', { status: 500 })
  }
}
