import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

export async function getUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions)
  return (session?.user as { id?: string } | undefined)?.id ?? null
}

// 强制要求登录，返回 userId 或抛 401 响应
export async function requireUserId(): Promise<string | Response> {
  const uid = await getUserId()
  if (!uid) {
    return new Response(JSON.stringify({ error: '未登录' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  return uid
}
