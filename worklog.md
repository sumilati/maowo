
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

---
Task ID: dashboard-improvements
Agent: Z.ai Code (main)
Task: 新增仪表盘首页（不再一上来进单只猫）+ 主动改进项

Work Log:
- 新建 /api/dashboard 聚合接口：所有猫概览(含每只猫的日记数/照片数/最新日记/最新体重/近期提醒)、全局统计、近期6条动态时间线、30天内健康提醒汇总
- cat-store 新增 view 状态('dashboard'|'detail')，selectCat 自动切到 detail，goToDashboard 返回，removeCat 后若无猫回 dashboard
- 新建 DashboardView 组件：欢迎区+5项全局统计卡片+猫咪卡片墙(每只猫一张富信息卡：头像/品种/座右铭/年龄/体重/距生日/最新日记/日记照片数/提醒角标)+近期动态时间线(可点击进对应猫)+健康提醒汇总(可点击进对应猫)
- 改造 CatSite：默认 view=dashboard 显示仪表盘；点击猫咪卡片 selectCat 进 detail；detail 顶部有「返回猫窝总览」按钮
- 改进1：AI 日记一键转存到成长日记——新建 /api/ai/diary/[id]/convert，AI 日记结果区加「转存到日记」按钮，转存后派发 diary:changed 事件，DiarySection 监听自动刷新
- 改进2：暗色模式——启用 next-themes(已装未用)，新建 ThemeProvider + ThemeToggle(日/月图标)，导航栏加切换按钮，globals.css 补充暗色覆盖(cream背景/stone文字/white背景/amber边框/card/输入框/dialog/渐变hero)
- 改进3：健康提醒过滤优化——过期超过7天的不再显示在"近期提醒"，避免示例数据长期显示"过期几百天"
- lint 通过；Agent Browser 验证：仪表盘正常、点卡片进详情、返回仪表盘、暗色切换、AI日记生成+转存自动刷新日记区、移动端适配

Stage Summary:
- 首页改为仪表盘总览，点猫咪进专属小窝，体验更合理
- 打通 AI 日记 → 成长日记 数据流（一键转存+自动刷新）
- 暗色模式完整可用
- 提醒逻辑更合理
- 产出：/api/dashboard、/api/ai/diary/[id]/convert、dashboard-view.tsx、theme-provider.tsx、theme-toggle.tsx，更新 cat-store/cat-site/diary-section/ai-play-section/health-section/site-nav/globals.css/layout

---
Task ID: mobile-optimization
Agent: Z.ai Code (main)
Task: 手机端为主场景的体验优化

Work Log:
- 新建 MobileTabBar 组件：手机端底部 4+1 Tab（首页/小窝/[中间凸起+快记]/相册/更多），md:hidden 仅手机显示
- 中间+号按钮点击弹出 QuickMenu 底部菜单（写日记/记体重/健康记录/传照片），点击后打开对应快捷表单
- 新建 QuickActionSheet：统一快捷记录弹窗，根据 type 渲染 DiaryForm/WeightForm/HealthForm/PhotoForm（各自独立组件避免 hooks 条件调用）
- cat-store 加 quickAction 状态 + openQuickAction/closeQuickAction
- 简化 SiteNav：桌面端保留文字导航(md:flex)，手机端只留 logo+主题切换，文字导航收进底部 Tab
- cat-site 各视图 main 加 pb-28 md:pb-10 给底部 Tab 留空间，三个视图都挂载 MobileTabBar + QuickActionSheet
- 数字输入框加 inputmode="decimal"（体重）优化手机键盘
- 近期动态卡片加"点击查看 ›"提示
- 所有 <img> 加 loading="lazy" 懒加载
- 底部 Tab 栏用 pb-[env(safe-area-inset-bottom)] 适配 iOS home 条
- lint 通过；Agent Browser 手机端验证：顶部简化、底部Tab、+号快捷菜单、记体重表单提交入库、Tab切换(首页↔小窝↔相册)、暗色模式Tab栏适配、footer不被遮挡

Stage Summary:
- 手机端从"顶部拥挤导航+无快捷操作"升级为"底部Tab导航+一键快记"，单手操作友好
- 凸起+号按钮是核心记录入口，4 种记录类型一键直达
- 底部安全区适配、图片懒加载、数字键盘优化
- 桌面端体验保持不变（md 断点切换）
- 产出：mobile-tab-bar.tsx、quick-action-sheet.tsx，更新 site-nav/cat-site/cat-store/dashboard-view 及所有 img 懒加载
