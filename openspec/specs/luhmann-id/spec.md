# luhmann-id Specification

## Purpose
TBD - created by archiving change zettelkasten-workflow-wizard. Update Purpose after archive.
## Requirements
### Requirement: Store `zk_id` only in frontmatter
插件 MUST 将永久笔记的卢曼式 ID 存储在 frontmatter 的 `zk_id` 字段中，并且 MUST 不将该 ID 写入标题或正文首行。

#### Scenario: Write `zk_id` in frontmatter
- **WHEN** 插件为某条永久笔记分配 ID
- **THEN** 该文件 frontmatter MUST 包含 `zk_id: "<non-empty string>"`
- **THEN** 插件 MUST 不修改该文件的标题来包含 `zk_id`

### Requirement: `zk_id` must be unique within the vault
插件 MUST 维护 `zk_id -> 文件` 的索引，并在分配 ID 时确保唯一性。

#### Scenario: Detect an ID conflict
- **WHEN** 用户尝试为当前文件设置一个 `zk_id`，且 vault 内已有其他文件使用相同 `zk_id`
- **THEN** 插件 MUST 视为冲突并阻止完成处理向导
- **THEN** 插件 MUST 向用户展示冲突提示（至少包含冲突文件）

### Requirement: Generate a new top-level `zk_id` when no anchor is provided
当用户未提供锚点（anchor）时，插件 MUST 生成新的顶层数字 ID：`max(top-level) + 1`（若不存在任何 ID，则从 `1` 开始）。

#### Scenario: Generate top-level ID
- **WHEN** 用户在处理向导中选择“无锚点，创建新链”
- **THEN** 插件生成的 `zk_id` MUST 为纯数字字符串
- **THEN** 该数字 MUST 大于 vault 内所有现有 `zk_id` 的顶层数字部分

### Requirement: Generate `zk_id` after an anchor note
当用户选择一个锚点笔记（其拥有 `zk_id`）时，插件 MUST 基于锚点生成一个“后继/分支”ID，并确保其唯一。

#### Scenario: Prefer numeric suffix increment
- **WHEN** 锚点 `zk_id` 以数字结尾且 `<anchor with incremented numeric suffix>` 不冲突
- **THEN** 插件 MUST 生成“数字后缀自增”的 `zk_id`（例如 `22` → `23`，`21/3d7a6` → `21/3d7a7`）

#### Scenario: Fallback to letter branch when conflict
- **WHEN** 数字后缀自增会产生冲突
- **THEN** 插件 MUST 生成字母分支 `a/b/c...`（例如 `22` → `22a`，若冲突则 `22b`）

### Requirement: Provide a command to assign or repair `zk_id` for the current note
插件 MUST 提供命令用于为当前永久笔记分配（或修复）`zk_id`，以便用户在冲突或缺失时手动触发。

#### Scenario: Assign ID via command
- **WHEN** 用户执行命令 `工具 - 分配卡片 ID（当前笔记）`
- **THEN** 插件 MUST 引导用户选择“新链”或“基于锚点生成”
- **THEN** 插件 MUST 在不冲突的前提下写入 `zk_id`

