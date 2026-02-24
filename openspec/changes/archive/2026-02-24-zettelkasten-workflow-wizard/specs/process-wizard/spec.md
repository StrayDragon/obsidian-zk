## ADDED Requirements

### Requirement: Start the process wizard from the current note
插件 MUST 支持从当前活动文件启动处理向导，用于将收集箱（inbox）笔记升级为永久（permanent）笔记。

#### Scenario: Start processing the current inbox note
- **WHEN** 用户执行命令 `5| 处理当前笔记 · 升级为永久笔记（permanent）`
- **THEN** 若当前文件 `zk_status` 等于 `inbox`，插件 MUST 打开处理向导并以该文件为目标

### Requirement: Start the process wizard from the inbox queue
插件 MUST 支持从收集箱（inbox）队列启动处理向导（例如“处理下一条”或从列表选择）。

#### Scenario: Start processing from inbox list
- **WHEN** 用户在收集箱（inbox）队列界面选择某条项目并执行“Process”
- **THEN** 插件 MUST 打开处理向导并以所选文件为目标

### Requirement: Promote an inbox note in place
处理向导完成后，插件 MUST 就地更新目标文件的元数据，将其升级为永久笔记，而不是新建第二份 permanent 文件。

#### Scenario: Promote to permanent in the same file
- **WHEN** 用户在处理向导中完成并确认“Finalize”
- **THEN** 目标文件 frontmatter 的 `zk_type` MUST 被设置为 `permanent`
- **THEN** 目标文件 frontmatter 的 `zk_status` MUST 被设置为 `done`

### Requirement: Assign a unique `zk_id` during promotion
当目标文件被升级为永久笔记时，插件 MUST 为其写入唯一的 `zk_id`（frontmatter），并在冲突时阻止完成。

#### Scenario: Assign `zk_id` successfully
- **WHEN** 用户在处理向导中完成“Assign ID”步骤并点击“Finalize”
- **THEN** 插件 MUST 在目标文件 frontmatter 中写入非空字符串 `zk_id`
- **THEN** 在 vault 中不存在其他文件拥有相同的 `zk_id`

### Requirement: Insert related links into a dedicated section
处理向导中用户选择的相关卡片 MUST 被写入到目标文件正文的固定章节 `## 关联` 下，以 `- [[...]]` 列表形式存储，并且 MUST 去重。

#### Scenario: Create the related section when missing
- **WHEN** 用户在处理向导中选择了至少 1 个相关卡片并完成
- **THEN** 若目标文件正文中不存在标题为 `## 关联` 的章节，插件 MUST 在文件末尾创建该章节
- **THEN** 插件 MUST 在该章节下插入 `- [[<file>]]` 形式的链接列表

#### Scenario: Deduplicate related links
- **WHEN** 用户重复选择同一相关卡片并完成
- **THEN** `## 关联` 章节中的链接列表 MUST 不出现重复条目

### Requirement: Do not overwrite user-authored content
插件 MUST 不主动改写用户在正文中撰写的内容；除 `## 关联` 章节的创建/维护外，处理向导 MUST 保持正文其余部分不变。

#### Scenario: Preserve note body
- **WHEN** 用户完成处理向导
- **THEN** 插件对正文的修改 MUST 仅限于为 `## 关联` 章节追加/去重链接
