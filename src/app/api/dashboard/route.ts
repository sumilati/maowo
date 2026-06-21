import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUserId } from '@/lib/session'

export async function GET() {
  const uid = await requireUserId()
  if (uid instanceof Response) return uid
  try {
    const cats = await db.cat.findMany({ where: { userId: uid }, orderBy: { createdAt: 'asc' } })

    const catStats = await Promise.all(
      cats.map(async (c) => {
        const [diaryCount, photoCount, latestDiary, latestWeight, upcomingHealth] = await Promise.all([
          db.diary.count({ where: { catId: c.id } }),
          db.albumPhoto.count({ where: { catId: c.id } }),
          db.diary.findFirst({ where: { catId: c.id }, orderBy: { date: 'desc' } }),
          db.weightRecord.findFirst({ where: { catId: c.id }, orderBy: { date: 'desc' } }),
          db.healthRecord.findMany({
            where: { catId: c.id, nextDate: { gte: new Date() } },
            orderBy: { nextDate: 'asc' },
          }),
        ])
        const now = Date.now()
        const reminders = upcomingHealth
          .map(h => ({
            id: h.id, title: h.title, type: h.type, nextDate: h.nextDate,
            daysLeft: h.nextDate ? Math.ceil((new Date(h.nextDate).getTime() - now) / 86400000) : null,
          }))
          .filter(r => r.daysLeft !== null && r.daysLeft <= 30 && r.daysLeft >= -7)
        return {
          id: c.id, name: c.name, breed: c.breed, color: c.color, gender: c.gender,
          birthday: c.birthday, avatar: c.avatar, motto: c.motto, neutered: c.neutered,
          traits: JSON.parse(c.traits || '[]'),
          diaryCount, photoCount,
          latestDiary: latestDiary ? { id: latestDiary.id, title: latestDiary.title, date: latestDiary.date, mood: latestDiary.mood } : null,
          latestWeight: latestWeight ? { weight: latestWeight.weight, date: latestWeight.date } : null,
          reminders,
        }
      })
    )

    const recentDiaries = await db.diary.findMany({
      where: { cat: { userId: uid } },
      orderBy: { date: 'desc' },
      take: 6,
      include: { cat: { select: { name: true, avatar: true, color: true } } },
    })

    const [totalDiaries, totalPhotos, totalMessages, totalAiContents] = await Promise.all([
      db.diary.count({ where: { cat: { userId: uid } } }),
      db.albumPhoto.count({ where: { cat: { userId: uid } } }),
      db.message.count({ where: { cat: { userId: uid } } }),
      db.aIDiary.count({ where: { cat: { userId: uid } } }),
    ])

    const now = Date.now()
    const thirtyDaysLater = new Date(now + 30 * 86400000)
    const allUpcoming = await db.healthRecord.findMany({
      where: { cat: { userId: uid }, nextDate: { lte: thirtyDaysLater } },
      orderBy: { nextDate: 'asc' },
      include: { cat: { select: { name: true, avatar: true } } },
    })
    const allReminders = allUpcoming
      .map(h => ({
        id: h.id, catId: h.catId, catName: h.cat.name, catAvatar: h.cat.avatar,
        title: h.title, type: h.type, nextDate: h.nextDate,
        daysLeft: h.nextDate ? Math.ceil((new Date(h.nextDate).getTime() - now) / 86400000) : null,
      }))
      .filter(r => r.daysLeft !== null && r.daysLeft >= -7)

    return NextResponse.json({
      cats: catStats,
      stats: { catCount: cats.length, totalDiaries, totalPhotos, totalMessages, totalAiContents },
      recentDiaries: recentDiaries.map(d => ({
        id: d.id, catId: d.catId, catName: d.cat.name, catAvatar: d.cat.avatar, catColor: d.cat.color,
        title: d.title, content: d.content, date: d.date, mood: d.mood,
      })),
      reminders: allReminders,
    })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
