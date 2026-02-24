## ADDED Requirements

### Requirement: Provide a zh-only i18n layer for UI copy
插件 MUST 提供一个仅中文（zh）的 i18n 文案层，并通过 `t(key, params?)` API 为 UI 提供文案。

#### Scenario: Fetch a UI string by key
- **WHEN** 代码调用 `t("commands.openInbox")`
- **THEN** `t()` MUST 返回对应的中文文案字符串
- **THEN** 当该 key 表达 Zk 概念标签时，返回的文案 MUST 以“中文（English token）/中文（zk_key）”形式呈现关键概念提示（例如“收集箱（inbox）”）

### Requirement: Support simple string interpolation
`t()` MUST 支持最小的插值能力，用于把变量安全地注入到文案中。

#### Scenario: Interpolate variables
- **WHEN** 代码调用 `t("notices.createdFile", { filename: "F-20260224120000.md" })`
- **THEN** `t()` MUST 将 `{filename}` 替换为传入的值并返回最终字符串

### Requirement: Missing keys are handled safely
当 key 未定义时，插件 MUST 以可诊断但不会导致崩溃的方式处理。

#### Scenario: Missing key fallback
- **WHEN** 代码调用 `t("missing.key")` 且字典中不存在该 key
- **THEN** 插件 MUST 不抛出未捕获异常
- **THEN** `t()` MUST 返回可用于定位问题的占位文本（例如 key 本身）
