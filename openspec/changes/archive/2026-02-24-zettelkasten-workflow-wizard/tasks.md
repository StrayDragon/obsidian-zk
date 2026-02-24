## 1. 基础结构与清理

- [x] 1.1 将示例插件代码最小化：移除 ribbon/statusbar/demo commands，仅保留生命周期与注册入口
- [x] 1.2 按模块拆分 `src/`：`commands/`、`ui/`、`services/`、`model/`、`utils/`，并保持 `src/main.ts` 仅做注册
- [x] 1.3 新增/更新插件设置结构（最小必需）：关联章节标题（默认 `关联`）、是否写入 `zk/*` 标签、候选建议数量上限

## 2. 数据模型与元数据写入

- [x] 2.1 定义 `zk_*` 字段与枚举（`zk_type`、`zk_status` 等）并集中管理
- [x] 2.2 实现 frontmatter 读写工具（基于 `fileManager.processFrontMatter`），确保幂等与安全
- [x] 2.3 实现正文 `## 关联` 章节写入与去重工具

## 3. `zk_id` 索引与生成（luhmann-id）

- [x] 3.1 实现 `zk_id -> file` 索引构建：从 `MetadataCache` 初始化并监听更新事件增量维护
- [x] 3.2 实现 `zk_id` 生成器：顶层新链（max+1）、基于锚点的自增与分支回退、冲突检测
- [x] 3.3 添加命令 `工具 - 分配卡片 ID（当前笔记）` 并完成交互与写入

## 4. Capture（capture-atomic-notes）

- [x] 4.1 添加命令 `1| 新建闪念笔记（fleeting）`：在默认新建位置创建 `F-YYYYMMDDHHmmss.md`，写入 `zk_type/zk_status`
- [x] 4.2 添加命令 `2| 新建文献笔记（literature）`：在默认新建位置创建 `L-YYYYMMDDHHmmss.md`，写入 `zk_type/zk_status/zk_source`

## 5. 收集箱（inbox）队列（inbox-queue）

- [x] 5.1 实现 inbox 查询（`zk_status: inbox`）与 FIFO 排序（按创建时间）
- [x] 5.2 实现 `3| 打开收集箱（inbox）` Modal：列出 inbox 项并支持打开/处理/归档
- [x] 5.3 实现 `4| 处理下一条 · 收集箱（inbox）`：选择最早创建项并启动处理向导

## 6. 处理向导（process-wizard）

- [x] 6.1 实现命令 `5| 处理当前笔记 · 升级为永久笔记（permanent）`：校验当前文件为 inbox 后启动向导
- [x] 6.2 实现 ProcessWizardModal：选择锚点（可选）→ 分配 `zk_id` → 选择相关卡片 → Finalize
- [x] 6.3 Finalize 阶段就地升级：写入 `zk_type: permanent`、`zk_status: done`、`zk_id`，并维护 `## 关联` 链接列表

## 7. 相关卡片选择与建议（related-note-suggestions）

- [x] 7.1 实现相关卡片选择 UI：模糊搜索 Markdown 文件，排除当前文件，支持多选
- [x] 7.2 实现规则建议 provider：共享非 `zk/*` 标签、`zk_source` 完全匹配，并限制候选数量
- [x] 7.3 确保所有链接写入都需要用户明确确认（不做静默自动链接）

## 8. 手动验收与文档

- [x] 8.1 按每个 spec 的 Scenario 在真实 vault 中手动验收（创建/队列/处理/ID 冲突/链接去重）
- [x] 8.2 更新 `README.md`：工作流说明、字段约定、命令清单、隐私声明（默认离线；RAG 未来可选）

## 9. 术语与文案一致化（中文 + token 常驻）

- [x] 9.1 定义并集中管理 UI 术语映射：`zk_type/zk_status` 与 `zk_id/zk_source` 等字段的“中文（token）/中文（zk_key）”展示格式
- [x] 9.2 统一命令面板文案：命令名不包含插件名；核心命令按 1–5 编号并遵循“中文（token）”规范；与 specs 中的命令名称保持一致
- [x] 9.3 统一核心 UI 文案：收集箱（inbox）Modal、处理向导（Process Wizard）、概览（Dashboard）、图书馆索引（Library index）、设置页中涉及 `zk_*` 概念的文案全部改为“中文（token）/中文（zk_key）”
- [x] 9.4 更新 `README.md` 的字段值对照表：明确 `zk_type/zk_status/zk_id/zk_source` 与 UI 文案的对应关系（中文 + token 常驻）
- [x] 9.5 手动验收：在命令/Modal/View/设置/Notice/README 中全局搜索 `inbox|processing|done|archived|fleeting|literature|permanent|index|project|zk_`，确认用户可见处均符合一致化规范
