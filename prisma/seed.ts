import { PrismaClient } from '@prisma/client'

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

  // 1. 小河档案（示例猫 - 美短）
  const xiaohe = await db.cat.create({
    data: {
      name: '小河',
      breed: '美国短毛猫',
      gender: '公',
      birthday: '2023-03-15',
      neutered: true,
      bio: '一只活泼好动的银虎斑美短，好奇心旺盛，最爱追逗猫棒和趴在窗台看鸟。嗓门大，话多，干饭积极，偶尔拆家。',
      motto: '世界那么大，本喵都要瞅瞅',
      avatar: '/uploads/xiaohe-avatar.png',
      color: '银虎斑',
      traits: JSON.stringify(['好奇', '活泼', '爱说话', '追光少年', '黏人']),
    },
  })
  const cid = xiaohe.id

  // 2. 成长日记
  const diaries = [
    { date: new Date('2024-11-01'), title: '追到了逗猫棒', content: '今天铲屎官新买了个羽毛逗猫棒，我扑了半天终于按住了。那个羽毛在我爪下乱抖的样子真是有趣，本喵玩到累瘫。', mood: 'happy', imageUrl: '/uploads/xiaohe-play.png' },
    { date: new Date('2024-11-10'), title: '窗台观鸟日记', content: '今天窗台来了三只麻雀，我在玻璃后面 chirp 了半天，喉咙都哑了。铲屎官笑我，哼，他不懂狩猎的乐趣。', mood: 'curious', imageUrl: '/uploads/xiaohe-daze.png' },
    { date: new Date('2024-11-15'), title: '干饭第一名', content: '今天的罐头是鸡肉味的，本喵三口就消灭干净。铲屎官说该控制体重了，我才不听，饿了就喵给他听。', mood: 'happy', imageUrl: '/uploads/xiaohe-eat.png' },
  ]
  for (const d of diaries) await db.diary.create({ data: { ...d, catId: cid } })

  // 3. 体重记录
  const weights = [
    { date: '2024-06-01', weight: 3.8, note: '体检称重' },
    { date: '2024-07-01', weight: 3.9 },
    { date: '2024-08-01', weight: 4.0 },
    { date: '2024-09-01', weight: 4.1, note: '夏天吃多了' },
    { date: '2024-10-01', weight: 4.2 },
    { date: '2024-11-01', weight: 4.15, note: '稳定' },
  ]
  for (const w of weights) await db.weightRecord.create({ data: { ...w, catId: cid, date: new Date(w.date) } })

  // 4. 健康记录
  const healths = [
    { date: '2024-03-15', type: 'vaccine', title: '猫三联接种', description: '年度疫苗，状态良好', nextDate: new Date('2025-03-15') },
    { date: '2024-10-01', type: 'deworm', title: '体内驱虫', description: '使用海乐妙，无异常', nextDate: new Date('2025-01-01') },
    { date: '2024-06-01', type: 'checkup', title: '年度体检', description: '各项指标正常，牙齿健康', nextDate: new Date('2025-06-01') },
  ]
  for (const h of healths) await db.healthRecord.create({ data: { ...h, catId: cid, date: new Date(h.date) } })

  // 5. 相册
  const photos = [
    { url: '/uploads/xiaohe-avatar.png', title: '本喵的盛世美颜', tag: 'portrait' },
    { url: '/uploads/xiaohe-sleep.png', title: '睡到打呼', tag: 'sleep' },
    { url: '/uploads/xiaohe-eat.png', title: '干饭中勿扰', tag: 'eat' },
    { url: '/uploads/xiaohe-play.png', title: '逗猫棒大战', tag: 'play' },
    { url: '/uploads/xiaohe-daze.png', title: '窗台思考猫生', tag: 'daze' },
  ]
  for (const p of photos) await db.albumPhoto.create({ data: { ...p, catId: cid } })

  // 6. 里程碑
  const milestones = [
    { date: '2023-03-15', title: '小河出生', description: '来到这个世界的第一天', icon: '🎂' },
    { date: '2023-05-20', title: '来到新家', description: '正式成为铲屎官家的一员', icon: '🏠' },
    { date: '2023-08-01', title: '第一次洗澡', description: '虽然挣扎但还算配合', icon: '🛁' },
    { date: '2024-01-10', title: '完成绝育', description: '从此成为无欲无求的小公公', icon: '✂️' },
    { date: '2024-03-15', title: '一岁生日', description: '吃了顿丰盛的猫饭庆祝', icon: '🎉' },
  ]
  for (const m of milestones) await db.milestone.create({ data: { ...m, catId: cid, date: new Date(m.date) } })

  // 7. 留言
  const messages = [
    { name: '小七', content: '小河也太帅了吧！银虎斑好好看！', avatar: '😸' },
    { name: '阿伟', content: '这美短养得真壮实，干饭王实锤', avatar: '😹' },
    { name: '栗子', content: '求小河同款逗猫棒链接～', avatar: '😻' },
  ]
  for (const m of messages) await db.message.create({ data: { ...m, catId: cid } })

  console.log('seed 完成！示例猫：小河')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await db.$disconnect() })
