## Why

很多人理解了卡片盒笔记法的理念，却很难在 Obsidian 里把“闪念/文献 → 永久笔记 → 建立关联 → 逐步写作”的流程变成每天稳定可执行的动作。Obsidian 已有双向链接与标签，但缺少一个面向流程的引导与最小化的结构约定，从而导致笔记难以沉淀为可复用的论证链与写作素材。

## What Changes

- 增加一组稳定的命令（Commands），用于快速创建原子化的闪念笔记与文献笔记，并以统一的 frontmatter 字段标记类型与处理状态。
- 增加“收集箱（inbox）队列”界面，用于聚合待处理笔记并触发处理流程（打开/处理/归档）。
- 增加“处理向导（Process Wizard）”，将单条收集箱（inbox）笔记**就地改写/升级**为永久笔记：写入 `zk_id`、更新 `zk_type/zk_status`、协助插入相关双向链接。
- 增加卢曼式可分支 `zk_id` 的生成与冲突检测能力（frontmatter 存储，不侵入标题/正文）。
- 增加“相关卡片选择与建议”能力：至少支持基于文件名的模糊选择，并提供轻量规则召回（标签/来源等）；为后续 RAG 召回预留扩展点（本变更不实现 RAG）。

## Capabilities

### New Capabilities

- `capture-atomic-notes`: 通过命令创建原子化的闪念/文献笔记文件，并写入统一的 `zk_*` frontmatter 元数据与基础标签。
- `inbox-queue`: 聚合 `zk_status: inbox` 的笔记为队列，并提供打开/处理/归档等操作入口。
- `process-wizard`: 以向导方式将收集箱（inbox）笔记就地升级为永久笔记（写入 `zk_id`、建立链接、更新状态）。
- `luhmann-id`: 生成/校验卢曼式可分支 `zk_id`，并维护 `zk_id -> 文件` 的索引以避免冲突。
- `related-note-suggestions`: 在处理过程中提供“选择相关卡片”的 UI，并给出轻量可解释的候选建议（未来可替换/扩展为 RAG 提供者）。

### Modified Capabilities

（无）

## Impact

- 代码影响：主要新增/重构 `src/` 下的命令、UI（Modal）、元数据读写与索引服务模块；`main.ts` 将保持生命周期与注册逻辑最小化。
- 数据影响：在用户笔记中新增并维护 frontmatter 字段（例如 `zk_type/zk_status/zk_id/zk_source`），并可能写入少量约定标签；卸载插件后这些字段仍会保留（不做自动清理）。
- 性能影响：需要对大量 Markdown 文件读取元数据用于队列与 `zk_id` 去重，必须依赖 `MetadataCache` 并采用增量更新，避免全库频繁扫描。
- 安全与隐私：默认离线工作，不进行网络请求；后续如引入 RAG，将要求显式开关与清晰披露。
