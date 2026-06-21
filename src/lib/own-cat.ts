import { db } from './db'
import { requireUserId } from './session'

// 校验：当前登录用户拥有该 catId。返回 userId 或 401/403 Response
export async function ownCat(catId: string): Promise<string | Response> {
  const uid = await requireUserId()
  if (uid instanceof Response) return uid
  const cat = await db.cat.findUnique({ where: { id: catId }, select: { userId: true } })
  if (!cat) return new Response(JSON.stringify({ error: '猫咪不存在' }), { status: 404, headers: { 'Content-Type': 'application/json' } })
  if (cat.userId !== uid) return new Response(JSON.stringify({ error: '无权操作' }), { status: 403, headers: { 'Content-Type': 'application/json' } })
  return uid
}
