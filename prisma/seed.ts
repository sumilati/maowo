import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
  console.log('开始 seed...')

  await db.message.deleteMany()
  await db.milestone.deleteMany()
  await db.albumPhoto.deleteMany()
  await db.healthRecord.deleteMany()
  await db.weightRecord.deleteMany()
  await db.diary.deleteMany()
  await db.aIDiary.deleteMany()
  await db.aIArtwork.deleteMany()
  await db.imageCaption.deleteMany()
  await db.cat.deleteMany()
  await db.user.deleteMany()

  // 创建 demo 用户
  const passwordHash = await bcrypt.hash('123456', 10)
  const demoUser = await db.user.create({
    data: { email: 'demo@maowo.com', name: '铲屎官', passwordHash },
  })
  const uid = demoUser.id

  // 小河档案
  const xiaohe = await db.cat.create({
    data: {
      userId: uid,
      name: '小河',
      breed: '美国短毛猫',
      gender: '公',
      birthday: '2023-03-15',
      neutered: true,
      bio: '一只活泼好动的银虎斑美短，好奇心旺盛，最爱追逗猫棒和趴在窗台看鸟。嗓门大，话多，干饭积极，偶尔拆家。',
      motto: '世界那么大，本喵都要瞅瞅',
      avatar: '',
      color: '银虎斑',
      traits: JSON.stringify(['好奇', '活泼', '爱说话', '追光少年', '黏人']),
    },
  })
  const cid = xiaohe.id

  const diaries = [
    { date: new Date('2024-11-01'), title: '追到了逗猫棒', content: '今天铲屎官新买了个羽毛逗猫棒，我扑了半天终于按住了。那个羽毛在我爪下乱抖的样子真是有趣，本喵玩到累瘫。', mood: 'happy', imageUrl: '' },
    { date: new Date('2024-11-10'), title: '窗台观鸟日记', content: '今天窗台来了三只麻雀，我在玻璃后面 chirp 了半天，喉咙都哑了。铲屎官笑我，哼，他不懂狩猎的乐趣。', mood: 'curious', imageUrl: '' },
    { date: new Date('2024-11-15'), title: '干饭第一名', content: '今天的罐头是鸡肉味的，本喵三口就消灭干净。铲屎官说该控制体重了，我才不听，饿了就喵给他听。', mood: 'happy', imageUrl: '' },
  ]
  for (const d of diaries) await db.diary.create({ data: { ...d, catId: cid } })

  const weights = [
    { date: '2024-06-01', weight: 3.8, note: '体检称重' },
    { date: '2024-07-01', weight: 3.9 },
    { date: '2024-08-01', weight: 4.0 },
    { date: '2024-09-01', weight: 4.1, note: '夏天吃多了' },
    { date: '2024-10-01', weight: 4.2 },
    { date: '2024-11-01', weight: 4.15, note: '稳定' },
  ]
  for (const w of weights) await db.weightRecord.create({ data: { ...w, catId: cid, date: new Date(w.date) } })

  const healths = [
    { date: '2024-03-15', type: 'vaccine', title: '猫三联接种', description: '年度疫苗，状态良好', nextDate: new Date('2025-03-15') },
    { date: '2024-10-01', type: 'deworm', title: '体内驱虫', description: '使用海乐妙，无异常', nextDate: new Date('2025-01-01') },
    { date: '2024-06-01', type: 'checkup', title: '年度体检', description: '各项指标正常，牙齿健康', nextDate: new Date('2025-06-01') },
  ]
  for (const h of healths) await db.healthRecord.create({ data: { ...h, catId: cid, date: new Date(h.date) } })

  const photos = [
    { url: '', title: '本喵的盛世美颜', tag: 'portrait' },
    { url: '', title: '睡到打呼', tag: 'sleep' },
    { url: '', title: '干饭中勿扰', tag: 'eat' },
    { url: '', title: '逗猫棒大战', tag: 'play' },
    { url: '', title: '窗台思考猫生', tag: 'daze' },
  ]
  for (const p of photos) await db.albumPhoto.create({ data: { ...p, catId: cid } })

  const milestones = [
    { date: '2023-03-15', title: '小河出生', description: '来到这个世界的第一天', icon: '🎂' },
    { date: '2023-05-20', title: '来到新家', description: '正式成为铲屎官家的一员', icon: '🏠' },
    { date: '2023-08-01', title: '第一次洗澡', description: '虽然挣扎但还算配合', icon: '🛁' },
    { date: '2024-01-10', title: '完成绝育', description: '从此成为无欲无求的小公公', icon: '✂️' },
    { date: '2024-03-15', title: '一岁生日', description: '吃了顿丰盛的猫饭庆祝', icon: '🎉' },
  ]
  for (const m of milestones) await db.milestone.create({ data: { ...m, catId: cid, date: new Date(m.date) } })

  const messages = [
    { name: '小七', content: '小河也太帅了吧！银虎斑好好看！', avatar: '😸' },
    { name: '阿伟', content: '这美短养得真壮实，干饭王实锤', avatar: '😹' },
    { name: '栗子', content: '求小河同款逗猫棒链接～', avatar: '😻' },
  ]
  for (const m of messages) await db.message.create({ data: { ...m, catId: cid } })

  console.log('seed 完成！demo 账号: demo@maowo.com / 密码: 123456')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await db.$disconnect() })
