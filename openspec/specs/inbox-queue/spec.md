# inbox-queue Specification

## Purpose
TBD - created by archiving change zettelkasten-workflow-wizard. Update Purpose after archive.
## Requirements
### Requirement: Inbox items are defined by frontmatter status
插件 MUST 将 `zk_status: inbox` 的 Markdown 文件视为收集箱（inbox）待处理项，并可区分其 `zk_type`。

#### Scenario: Identify inbox items
- **WHEN** 用户打开收集箱（inbox）队列界面
- **THEN** 队列 MUST 仅包含 frontmatter 中 `zk_status` 等于 `inbox` 的 Markdown 文件
- **THEN** 队列中的每一项 MUST 显示其 `zk_type`（至少区分 fleeting 与 literature）

### Requirement: Provide an Inbox UI entrypoint
插件 MUST 提供命令打开收集箱（inbox）队列界面，以便用户查看与选择待处理项。

#### Scenario: Open inbox UI
- **WHEN** 用户执行命令 `3| 打开收集箱（inbox）`
- **THEN** 插件 MUST 打开一个界面（例如 Modal）列出所有收集箱（inbox）项

### Requirement: Process next inbox item
插件 MUST 提供命令“一键处理下一条收集箱（inbox）笔记”，默认按最早创建优先（先进先出）选择待处理项。

#### Scenario: Process next item (FIFO)
- **WHEN** 用户执行命令 `4| 处理下一条 · 收集箱（inbox）`
- **THEN** 插件 MUST 选择队列中创建时间最早的 inbox 文件作为处理目标并启动处理向导

### Requirement: Archive an inbox item without deleting it
插件 MUST 允许用户将某条 inbox 项标记为 `archived`，并且 MUST 不删除文件。

#### Scenario: Archive an item
- **WHEN** 用户在收集箱（inbox）队列中对某条项目执行“Archive”操作
- **THEN** 该文件的 `zk_status` MUST 被更新为 `archived`
- **THEN** 该文件 MUST 从收集箱（inbox）队列中消失

