## Context

目标是在 Obsidian 内提供一个“卡片盒工作流教练（workflow coach）”：把卡片盒笔记法中最难坚持、最容易拖延的环节（从闪念/文献到永久笔记的转化，以及建立关联）变成一组可执行、可重复、低摩擦的操作。

约束与已选偏好：

- 笔记以**原子文件**形式存在：每个 Markdown 文件代表一个想法或一个引用单元。
- 永久化采用**就地改写/升级**：不新建第二份 permanent 文件，而是通过更新 frontmatter/tags 将当前文件从 `fleeting/literature` 升级为 `permanent`。
- `zk_id` 仅存于 frontmatter（不写入标题/正文）。
- 移动端以只读为主；核心命令在移动端可运行即可，不追求完整 UI 体验。
- 召回缺口后续可能用 RAG 补齐；本变更仅提供规则召回与可扩展接口，不接入外部模型服务。

## Goals / Non-Goals

**Goals:**

- 提供稳定的 Commands，快速创建闪念/文献笔记（原子文件），并统一写入最小 frontmatter 元数据。
- 提供 Inbox 队列与处理向导，帮助用户把 inbox 笔记稳定转化为永久笔记，并在转化过程中建立至少 1 条关联链接。
- 提供卢曼式可分支 `zk_id` 的生成策略与冲突检测，确保 ID 在库内唯一。
- 提供“相关卡片选择与建议”的 UI：先支持模糊查找 + 规则建议，后续可无痛扩展 RAG 提供者。
- 保持离线、轻依赖、性能可控：大库场景下避免频繁全量扫描，优先使用 `MetadataCache` 与事件驱动更新。

**Non-Goals:**

- 不实现语义检索/RAG 与任何第三方网络服务调用。
- 不自动生成/改写用户正文内容（不做“AI 改写”）；正文由用户在编辑器中完成，插件只负责引导与结构化落地。
- 不强制文件夹组织结构（默认不移动目录）；仅依赖 frontmatter/tags 进行组织与过滤。
- 不实现复杂的自定义 Workspace View（MVP 以 Commands + Modal 为主；需要时再演进）。

## Decisions

1. **最小数据模型（frontmatter 为主）**
   - 使用 `zk_type` 区分 `fleeting | literature | permanent | index | project`（本变更主要覆盖前三类）。
   - 使用 `zk_status` 区分处理状态：`inbox | processing | done | archived`。
   - 使用 `zk_id` 存储卢曼式 ID（仅 permanent 需要）。
   - 文献来源使用 `zk_source`（literature/permanent 可用）。
   - 可选写入 tags（例如 `zk/fleeting`、`zk/literature`、`zk/permanent`、`zk/inbox`）以便用户使用 Obsidian 原生标签体系筛选。

2. **就地升级（in-place promotion）**
   - 处理向导完成后，直接更新当前文件的 frontmatter 与 tags，将其升级为永久笔记。
   - 不在向导中要求用户在 Modal 内编写长正文；向导强调“检查点”和“结构化动作”（分配 ID、建立链接、更新状态）。

3. **创建位置与命名**
   - 新建笔记的目标目录遵循 Obsidian 的新建文件默认位置（尊重用户偏好）。
   - 文件名使用前缀 + 时间戳确保唯一与一致（例如 `F-YYYYMMDDHHmmss.md`、`L-YYYYMMDDHHmmss.md`），用户可随后自行重命名。

4. **UI 形态**
   - MVP 采用 Commands + Modal（InboxModal、ProcessWizardModal、RelatedNotePickerModal），避免自定义 View 的持续维护成本。
   - 关键命令提供快捷键入口（让“日常流程”可肌肉记忆化）。

5. **命令命名与固定顺序（中文 + 序号）**
   - 所有用户可见命令名称使用前缀 `Zk:`，核心工作流命令按 1–5 编号，以便在命令面板中形成固定顺序与肌肉记忆：
     - `Zk: 1| 新建闪念笔记`
     - `Zk: 2| 新建文献笔记`
     - `Zk: 3| 打开收集箱`
     - `Zk: 4| 处理下一条（收集箱）`
     - `Zk: 5| 处理当前笔记（升级为永久笔记）`
   - 非主流程的维护类命令使用 `Zk: 工具 - ...`（例如 `Zk: 工具 - 分配卡片 ID（当前笔记）`）。

6. **索引与性能**
   - 使用 `MetadataCache` 读取 frontmatter/tags/outlinks 信息，构建轻量索引：
     - `zk_id -> TFile`（用于唯一性校验）
     - Inbox 列表（用于队列 UI）
   - 通过 vault/metadata 事件增量更新索引（必要时对更新做 debounce），避免每次打开 UI 都全库扫描。

7. **`zk_id` 生成策略（可实现且可解释）**
   - 生成 `zk_id` 需要可重复、可预测，并能在任意点插入分支。
   - 基本策略：
     - 无锚点时生成新的顶层数字 ID（max(top-level)+1）。
     - 有锚点时优先尝试“数字后缀自增”，冲突则回退到字母分支（`a/b/c...`）。
   - 冲突时阻止完成，并提示用户选择其他锚点或手动输入 ID。

8. **链接插入的落点**
   - 为了可控与可去重，将“处理时选择的相关卡片”写入正文的固定章节 `## 关联` 下（以 `- [[...]]` 列表形式）。
   - 若章节不存在则创建；若已存在则追加缺失项并去重。

9. **召回扩展点（为 RAG 预留）**
   - 定义 `RelatedNoteProvider` 接口：输入当前文件与上下文，输出候选卡片（含分数与理由）。
   - MVP 内置 provider：
     - 规则建议：基于共享 tags（排除 `zk/*` 标签）与 `zk_source` 匹配生成候选。
     - 全量模糊选择：用户通过文件名模糊检索选择任意卡片（作为兜底）。
   - 未来新增 `RagProvider` 时只需要实现接口并在设置中启用；默认保持离线与本地处理。

## Risks / Trade-offs

- **YAML/frontmatter 写回风险** → 使用 `fileManager.processFrontMatter` 进行结构化修改；失败时不写回并通过 Notice 告知。
- **大库性能风险（索引/建议）** → 索引增量更新 + 限制候选数量 + UI 打开时懒加载；避免读取全文内容。
- **`zk_id` 规则一旦发布难以改变** → 规则先做“可解释的最小实现”，并在文档中说明；后续复杂规则以新增策略而不是替换默认策略实现。
- **自动写 tags 可能与用户习惯冲突** → tags 仅作为辅助；以 frontmatter 字段为权威（必要时提供关闭 tag 写入的设置）。
- **移动端体验不一致** → MVP 以命令可用为主；Modal 与复杂交互不作为移动端强保证。
