# related-note-suggestions Specification

## Purpose
TBD - created by archiving change zettelkasten-workflow-wizard. Update Purpose after archive.
## Requirements
### Requirement: Provide a UI to pick related notes
插件 MUST 提供一个 UI 让用户为当前笔记选择 1 个或多个“相关卡片”，用于插入双向链接。

#### Scenario: Pick related notes via fuzzy file search
- **WHEN** 用户在处理向导中进入“Select related notes”步骤
- **THEN** 插件 MUST 提供基于文件名的模糊搜索以选择 Markdown 文件
- **THEN** 候选列表 MUST 排除当前正在处理的文件

### Requirement: Provide lightweight rule-based suggestions
插件 MUST 在相关卡片选择界面提供轻量的候选建议，至少覆盖“共享 tags（排除 `zk/*`）”与 `zk_source` 匹配两类规则。

#### Scenario: Suggest by shared tags
- **WHEN** 当前文件与其他文件共享至少 1 个非 `zk/*` 标签
- **THEN** 插件 MUST 将这些文件作为候选建议展示

#### Scenario: Suggest by source match
- **WHEN** 当前文件 frontmatter 中存在非空 `zk_source`，且其他文件 `zk_source` 完全一致
- **THEN** 插件 MUST 将这些文件作为候选建议展示

### Requirement: Never create links without explicit user confirmation
插件 MUST 不在未经用户确认的情况下自动插入相关链接。

#### Scenario: User must confirm
- **WHEN** 插件展示相关卡片候选或建议
- **THEN** 插件 MUST 仅在用户明确选择并确认完成后才写入 `## 关联` 链接列表

