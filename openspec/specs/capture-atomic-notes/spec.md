# capture-atomic-notes Specification

## Purpose
TBD - created by archiving change zettelkasten-workflow-wizard. Update Purpose after archive.
## Requirements
### Requirement: Create atomic fleeting notes
插件 MUST 提供命令创建“闪念笔记（fleeting）”原子文件，并将其标记为收集箱（inbox）待处理状态。

#### Scenario: Create a new fleeting note
- **WHEN** 用户执行命令 `1| 新建闪念笔记（fleeting）`
- **THEN** 插件创建一个新的 Markdown 文件并在编辑器中打开
- **THEN** 新文件的 frontmatter MUST 包含 `zk_type: fleeting` 与 `zk_status: inbox`

### Requirement: Create atomic literature notes
插件 MUST 提供命令创建“文献笔记（literature）”原子文件，并将其标记为收集箱（inbox）待处理状态。

#### Scenario: Create a new literature note
- **WHEN** 用户执行命令 `2| 新建文献笔记（literature）`
- **THEN** 插件创建一个新的 Markdown 文件并在编辑器中打开
- **THEN** 新文件的 frontmatter MUST 包含 `zk_type: literature` 与 `zk_status: inbox`

### Requirement: Captured note filenames are consistent and unique
插件创建的新笔记文件名 MUST 使用“类型前缀 + 本地时间戳”以保持一致且避免冲突。

#### Scenario: Generate a unique filename
- **WHEN** 插件创建闪念笔记或文献笔记
- **THEN** 闪念笔记文件名 MUST 匹配 `F-YYYYMMDDHHmmss.md`
- **THEN** 文献笔记文件名 MUST 匹配 `L-YYYYMMDDHHmmss.md`
- **THEN** 若同名文件已存在，插件 MUST 使用新的时间戳生成不同文件名

### Requirement: New notes respect the vault's default new file location
插件创建新笔记时 MUST 遵循 Obsidian 的默认新建文件位置（尊重用户在 Obsidian 中的设置），而不是强制固定目录结构。

#### Scenario: Create in the configured default location
- **WHEN** 用户执行创建笔记命令
- **THEN** 插件创建的文件 MUST 位于 Obsidian 配置的默认新建文件目录（若未配置则位于 vault 根目录）

