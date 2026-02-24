## ADDED Requirements

### Requirement: All user-visible UI copy is sourced from the i18n layer
插件 MUST 将所有用户可见文案（命令名称、Modal/View 文案、设置页文案、Notice/提示文案等）集中到 `ui-i18n` 提供的 i18n 字典，并通过 `t(key, params?)` 输出。

#### Scenario: Command names come from i18n
- **WHEN** 插件注册命令到 Obsidian 命令面板
- **THEN** 每个命令的 `name` MUST 来自 `t()` 的返回值，而不是硬编码字符串

#### Scenario: Settings copy comes from i18n
- **WHEN** 用户打开插件设置页
- **THEN** 设置页中所有用户可见文本（标题、描述、选项文案）MUST 来自 `t()` 的返回值
