# ui-copy-consistency Specification

## Purpose
TBD - created by archiving change zettelkasten-workflow-wizard. Update Purpose after archive.
## Requirements
### Requirement: Use bilingual terminology for Zk concepts
插件 MUST 在所有用户可见界面中，对 `zk_*` 概念使用“中文（token）/中文（zk_key）”格式展示，以帮助用户把 UI 与 frontmatter 建立稳定映射关系。

本规范定义以下规范写法（canonical forms）：

- 字段名：类型（`zk_type`）、状态（`zk_status`）、卡片 ID（`zk_id`）、来源（`zk_source`）
- `zk_status` 值：收集箱（`inbox`）、处理中（`processing`）、已完成（`done`）、已归档（`archived`）
- `zk_type` 值：闪念笔记（`fleeting`）、文献笔记（`literature`）、永久笔记（`permanent`）、索引笔记（`index`）、项目笔记（`project`）

#### Scenario: Command palette uses bilingual terminology
- **WHEN** 用户在命令面板中搜索本插件命令
- **THEN** 所有核心工作流命令名称 MUST 包含对应的 token（例如“收集箱（`inbox`）”、“闪念笔记（`fleeting`）”）
- **THEN** 以下命令名称 MUST 精确匹配：
  - `1| 新建闪念笔记（fleeting）`
  - `2| 新建文献笔记（literature）`
  - `3| 打开收集箱（inbox）`
  - `4| 处理下一条 · 收集箱（inbox）`
  - `5| 处理当前笔记 · 升级为永久笔记（permanent）`
  - `工具 - 分配卡片 ID（当前笔记）`

#### Scenario: Inbox UI uses the canonical status label
- **WHEN** 用户打开收集箱（`inbox`）队列界面
- **THEN** 界面中 MUST 使用“收集箱（`inbox`）”作为 `zk_status: inbox` 的唯一用户可见名称
- **THEN** 该界面 MUST 不出现只显示“收集箱”或只显示“inbox”的用户可见文案

#### Scenario: Process wizard shows frontmatter keys and values in canonical form
- **WHEN** 用户打开处理向导（Process Wizard）
- **THEN** 处理向导 MUST 以“类型（`zk_type`）/状态（`zk_status`）”的形式展示字段名
- **THEN** 处理向导中展示的类型与状态 MUST 使用规范写法（例如“闪念笔记（`fleeting`）”、“收集箱（`inbox`）”）

#### Scenario: Filters and summaries use bilingual status/type labels
- **WHEN** 用户在概览（Dashboard）或图书馆索引（Library index）中查看统计、筛选或分组摘要
- **THEN** 所有涉及 `zk_type/zk_status` 的用户可见文案 MUST 使用规范写法（中文 + token）

#### Scenario: Settings and README help users build the UI ↔ frontmatter mapping
- **WHEN** 用户查看插件设置页或 `README.md`
- **THEN** 文档与设置说明 MUST 明确展示 `zk_type/zk_status/zk_id/zk_source` 与其对应的用户可见名称（中文 + token）

### Requirement: All user-visible UI copy is sourced from the i18n layer
插件 MUST 将所有用户可见文案（命令名称、Modal/View 文案、设置页文案、Notice/提示文案等）集中到 `ui-i18n` 提供的 i18n 字典，并通过 `t(key, params?)` 输出。

#### Scenario: Command names come from i18n
- **WHEN** 插件注册命令到 Obsidian 命令面板
- **THEN** 每个命令的 `name` MUST 来自 `t()` 的返回值，而不是硬编码字符串

#### Scenario: Settings copy comes from i18n
- **WHEN** 用户打开插件设置页
- **THEN** 设置页中所有用户可见文本（标题、描述、选项文案）MUST 来自 `t()` 的返回值

