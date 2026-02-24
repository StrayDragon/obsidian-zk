## 1. i18n 基础设施

- [x] 1.1 新增 `src/i18n/`：提供 `zh` 字典与 `t(key, params?)`（含 `{name}` 级别插值与缺失 key fallback）
- [x] 1.2 为 `t()` 增加最小单元测试：插值、缺失 key 不崩溃、关键概念 key 返回包含“中文（token）”提示

## 2. UI 文案迁移

- [x] 2.1 设计并落地 key 命名规范（按 commands/settings/modals/views/notices 分组），建立首批 key 覆盖现有用户可见文案
- [x] 2.2 将命令名称与命令相关 Notice 文案迁移到 `t()`（满足 `ui-copy-consistency`：不再硬编码）
- [x] 2.3 将设置页标题/描述/选项文案迁移到 `t()`（满足 `ui-copy-consistency`：不再硬编码）
- [x] 2.4 将 Modal/View 的用户可见文案迁移到 `t()`（按钮、提示、空状态、统计/筛选标签等）
- [x] 2.5 复查 `zk_*` 字段/值相关文案：确保继续使用规范写法（例如“收集箱（inbox）”、“类型（zk_type）”），并避免出现同义词漂移

## 3. 验证与验收

- [x] 3.1 运行 `pnpm run lint`、`pnpm run test`、`pnpm run build`
- [x] 3.2 手动验收：命令面板、收集箱（inbox）、处理向导（process wizard）、概览（dashboard）、图书馆索引（library index）、设置页中所有用户可见文案均为“中文（English token）”且术语一致
