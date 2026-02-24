## Context

本插件已经通过 `ui-copy-consistency` 规范把关键概念（例如“收集箱（inbox）”、`zk_*` 字段）统一为稳定的双语提示写法。但在工程实践中，用户可见文案仍然散落在命令注册、Modal/View、设置、Notice 等多个模块中：新增功能或小改动很容易让同一概念出现不同说法（例如 inbox/收件箱/收集箱），进而破坏“UI ↔ frontmatter”概念映射。

同时我们希望保持维护成本最低：目前不做真正的多语言切换，只需要一个“文案单一事实来源（single source of truth）”，并让文案天然携带 English token 作为概念提示。

## Goals / Non-Goals

**Goals:**
- 引入轻量 i18n/文案注册表：所有用户可见文案通过 `t(key)` 获取。
- 只提供中文字典（`zh`），但文案保持“中文（English token）/中文（zk_key）”的规范写法。
- 以 TypeScript 类型约束减少缺 key、误拼写 key、重复定义等问题。
- 支持最小插值能力（例如将文件名、数字、字段名插入到文案中）。
- 迁移现有 UI 文案至 i18n，不改变用户可见行为与含义。

**Non-Goals:**
- 不提供语言切换 UI 或自动跟随系统语言。
- 不引入复杂的 ICU/plural rules、日期本地化等高级能力。
- 不承诺一次性迁移所有内部/调试用字符串（以“用户可见”为边界）。

## Decisions

1) 自研最小 i18n（不引入第三方库）
- **Why**：插件体积与依赖控制优先；只需要 key → string 与简单插值，第三方库会带来额外体积与维护面。
- **Alternative**：引入 i18next / lingui 等成熟方案；放弃（超出需求）。

2) 单语言字典（仅 `zh`），但文案内保留 English token
- **Why**：用户要求“任何用户操作 UI 可见都要有中英文提示”，且希望 i18n 只维护中文；因此将 English token 作为文案的一部分，而不是单独的 `en` 语言包。
- **Alternative**：维护 `zh` + `en`；放弃（维护成本更高）。

3) 类型安全的 key（编译期发现缺失）
- **Why**：缺 key 最终会暴露在 UI；通过 `as const` 字典与 `keyof` 推导，尽可能在编译期发现问题。
- **Alternative**：纯字符串 key + runtime fallback；保留 fallback，但优先类型约束。

4) 插值采用简单 `{name}` 替换
- **Why**：满足 95% 场景（文件名、数字、字段名等），实现可解释且可控。
- **Alternative**：ICU message format；放弃（复杂度高）。

5) 与现有“概念标签（labels）”模块协作而非重复
- **Why**：像 `zk_status/zk_type/zk_*` 这类规范写法已经集中在 helper 中；i18n 用于承接更广泛的 UI 文案，并可在字典中复用 labels 输出，避免出现两套来源。
- **Alternative**：把 labels 彻底迁入 i18n；可作为后续演进，但本变更以最小改动为主。

## Risks / Trade-offs

- [迁移不彻底] → 通过 `ui-copy-consistency` 增强要求 + code review checklist，持续把新增文案纳入 i18n。
- [缺 key 导致 UI 显示 key] → 类型约束 + 开发期断言（dev build 可选抛错），并在测试中覆盖关键路径。
- [过度抽象降低可读性] → key 命名规则清晰、就近分组（commands/settings/modals/views/notices），避免“一个 key 管太多场景”。

