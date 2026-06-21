
---
Task ID: maowo-refactor
Agent: Z.ai Code (main)
Task: 将单猫网站重构为多猫管理的「猫窝」，每只猫有专属小窝；示例猫改为小河(美短)；删除饼饼示例数据

Work Log:
- 重新设计 Prisma schema：所有子模型加 catId + Cat 关联(onDelete: Cascade)，Cat 不再固定 id
- 删除旧 db 重建，重新 seed 为单只示例猫「小河」(美国短毛猫/银虎斑)，生成 5 张小河专属图片
- 新增 API：/api/cats (列表+创建)、/api/cats/[id] (GET/PUT/DELETE，删除级联)
- 所有子资源 API(diary/weight/health/album/milestones/messages/ai/*)加 catId 过滤，POST 带 catId
- AI 三个接口根据 catId 动态读取猫咪档案(品种/花色/性格/简介)生成：LLM日记、艺术照(品种映射英文名)、看图说话
- 新建 Zustand store (cat-store.ts) 管理多猫状态 + useSelectedCat hook
- 新建 CatSwitcher 组件：顶部猫咪切换条 + 添加猫咪 + 编辑/删除当前猫
- 重构 HeroSection 用 store 取选中猫，顶部嵌入切换器
- 所有 section 组件改用 useSelectedCatId，无选中猫时返回 null
- 新建 CatSite 容器组件：加载猫咪列表，无猫时显示引导添加空状态
- layout metadata 改为「猫窝 · 每只猫都有专属的小窝」
- lint 通过；重启 dev server 解决 PrismaClient 连接旧库缓存问题

Stage Summary:
- 已实现完整多猫管理：切换、添加、编辑、删除(级联)
- 示例数据仅小河一只，饼饼已清除
- Agent Browser 验证：切换猫数据隔离正确、添加饼饼成功、删除饼饼级联清理、AI 日记按小河美短设定生成、移动端适配正常、footer 正常
- 产出文件：schema.prisma、seed.ts、/api/cats、/api/cats/[id]、cat-store.ts、cat-switcher.tsx、cat-site.tsx 及所有重构后的 section
