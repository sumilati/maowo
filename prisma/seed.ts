import { PrismaClient } from '@prisma/client'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const db = new PrismaClient()

async function main() {
  console.log('开始 seed...')

  // 清空旧数据
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

  // 1. 猫咪档案
  await db.cat.create({
    data: {
      id: 'default',
      name: '饼饼',
      breed: '橘白田园猫',
      gender: '公',
      birthday: '2022-05-20',
      neutered: true,
      bio: '一只爱吃爱睡爱发呆的橘白小胖子，被铲屎官宠上天的主子。表面高冷，实际黏人，干饭速度全小区第一。',
      motto: '干饭第一名，睡觉争冠军',
      avatar: '/uploads/avatar.png',
      color: '橘白',
      traits: JSON.stringify(['贪吃', '黏人', '爱睡觉', '怕黄瓜', '话痨', '拆家小能手']),
    },
  })

  // 2. 成长日记
  const diaries = [
    {
      date: new Date('2024-11-01'),
      title: '偷吃铲屎官的饼干',
      content: '今天趁铲屎官不注意，跳上桌把那块小饼干叼走了。吃得满地渣，还被抓个正着。但我表情管理满分，假装无事发生。',
      mood: 'naughty',
      imageUrl: '/uploads/album-eat.png',
    },
    {
      date: new Date('2024-11-10'),
      title: '窗边的午后',
      content: '今天阳光特别好，趴在窗台晒了一下午太阳。看见一只麻雀，激动得尾巴抖了半天，结果它飞走了，我又接着睡。',
      mood: 'sleepy',
      imageUrl: '/uploads/album-daze.png',
    },
    {
      date: '2024-11-15',
      title: '新玩具到手',
      content: '铲屎官买了个新毛线球，我扑上去就是一顿猛揍。玩了二十分钟累瘫，这玩意儿真上头。',
      mood: 'happy',
      imageUrl: '/uploads/album-play.png',
    },
  ]
  for (const d of diaries) {
    await db.diary.create({ data: { ...d, date: new Date(d.date) } })
  }

  // 3. 体重记录
  const weights = [
    { date: '2024-06-01', weight: 4.2, note: '体检称重' },
    { date: '2024-07-01', weight: 4.3 },
    { date: '2024-08-01', weight: 4.5, note: '夏天吃多了' },
    { date: '2024-09-01', weight: 4.6 },
    { date: '2024-10-01', weight: 4.8, note: '该控制了' },
    { date: '2024-11-01', weight: 4.7, note: '减肥初见成效' },
  ]
  for (const w of weights) {
    await db.weightRecord.create({ data: { ...w, date: new Date(w.date) } })
  }

  // 4. 健康记录
  const healths = [
    {
      date: '2024-03-10',
      type: 'vaccine',
      title: '狂犬疫苗接种',
      description: '年度狂犬疫苗，状态良好',
      nextDate: new Date('2025-03-10'),
    },
    {
      date: '2024-10-15',
      type: 'deworm',
      title: '体内驱虫',
      description: '使用海乐妙，无异常',
      nextDate: new Date('2025-01-15'),
    },
    {
      date: '2024-06-01',
      type: 'checkup',
      title: '年度体检',
      description: '血常规、生化均正常，轻度牙结石建议关注',
      nextDate: new Date('2025-06-01'),
    },
  ]
  for (const h of healths) {
    await db.healthRecord.create({ data: { ...h, date: new Date(h.date) } })
  }

  // 5. 相册
  const photos = [
    { url: '/uploads/avatar.png', title: '本喵的盛世美颜', tag: 'portrait', source: 'upload' },
    { url: '/uploads/album-sleep.png', title: '睡到模糊', tag: 'sleep', source: 'upload' },
    { url: '/uploads/album-eat.png', title: '干饭中勿扰', tag: 'eat', source: 'upload' },
    { url: '/uploads/album-play.png', title: '毛线球大战', tag: 'play', source: 'upload' },
    { url: '/uploads/album-daze.png', title: '思考猫生', tag: 'daze', source: 'upload' },
  ]
  for (const p of photos) {
    await db.albumPhoto.create({ data: p })
  }

  // 6. 里程碑
  const milestones = [
    { date: '2022-05-20', title: '饼饼出生', description: '在这个世界的第一天', icon: '🎂' },
    { date: '2022-07-15', title: '来到新家', description: '正式成为铲屎官家的一员', icon: '🏠' },
    { date: '2022-09-01', title: '第一次洗澡', description: '虽然挣扎但还算配合', icon: '🛁' },
    { date: '2023-02-14', title: '完成绝育', description: '从此成为无欲无求的小公公', icon: '✂️' },
    { date: '2024-05-20', title: '两岁生日', description: '吃了顿丰盛的猫饭庆祝', icon: '🎉' },
  ]
  for (const m of milestones) {
    await db.milestone.create({ data: { ...m, date: new Date(m.date) } })
  }

  // 7. 留言
  const messages = [
    { name: '小七', content: '饼饼也太可爱了吧！想撸！', avatar: '😸' },
    { name: '阿伟', content: '这橘猫养得真圆润，干饭王实锤', avatar: '😹' },
    { name: '栗子', content: '求饼饼同款猫粮推荐～', avatar: '😻' },
  ]
  for (const m of messages) {
    await db.message.create({ data: m })
  }

  console.log('seed 完成！')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
