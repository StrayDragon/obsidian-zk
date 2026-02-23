# Zk（Obsidian 插件）

卡片盒笔记法工作流向导：从收集箱（inbox）到永久笔记（permanent），分配卡片 ID（zk_id），补齐关联链接，然后继续往前推。

这个插件默认离线工作：不联网、不上传内容。它做的事很“笨”，但省心——帮你把 `frontmatter` 和“关联”段落维护好，正文怎么写还是你说了算。

## 主要功能

- 收集：一键新建闪念笔记（fleeting）/ 文献笔记（literature）（默认状态：收集箱（inbox），即 `zk_status: inbox`）
- 生成的文件名是 `F-YYYYMMDDHHmmss.md` / `L-YYYYMMDDHHmmss.md`，存放位置遵循 Obsidian 的“新笔记默认位置”设置
- 处理：用“处理向导（process wizard）”把收集箱（inbox）里的笔记升级为永久笔记（permanent）（写入 `zk_*` 字段）
- 关联：把你选的相关卡片写入到 `## 关联`（标题可自定义），自动去重
- 视图：
  - **概览（dashboard）**：统计 + 数据健康（缺卡片 ID（zk_id）、缺来源（zk_source）、ID 冲突）
  - **图书馆索引（library index）**：按类型（zk_type）/ 状态（zk_status）/ 标签（tags）筛选，支持搜索

## 安装（BRAT 从 GitHub 直接装）

1. 打开 **Settings → Community plugins**，安装并启用 **BRAT**。
2. 打开 **Settings → BRAT**，选择 **Add beta plugin**。
3. 填入仓库地址（形如 `StrayDragon/obsidian-zm`，或你的 fork），确认添加。
4. 回到 **Settings → Community plugins**，启用 **Zk**。

如果你发了 GitHub Release，BRAT 会优先拉取发布包里的 `manifest.json` / `main.js` / `styles.css`。

## 快速上手（建议按命令编号走）

在命令面板（`Ctrl/Cmd+P`）里搜 “Zk”，你会看到这些命令：

- `1| 新建闪念笔记（fleeting）`
- `2| 新建文献笔记（literature）`
- `3| 打开收集箱（inbox）`
- `4| 处理下一条 · 收集箱（inbox）`
- `5| 处理当前笔记 · 升级为永久笔记（permanent）`
- `工具 - 分配卡片 ID（当前笔记）`
- `概览（dashboard）`
- `图书馆索引（library index）`

一个常见流程：

1. 用 `1` 或 `2` 新建一条收集箱（inbox）笔记（`zk_status: inbox`）（先写内容，别纠结格式）。
2. 用 `3` 打开收集箱（inbox），或直接用 `4` 处理下一条。
3. 在“处理向导（process wizard）”里：
   - 分配卡片 ID（zk_id）（新链 / 选锚点）
   - 选几条相关卡片（可用建议，也可搜索）
   - 点“完成升级”

完成后，这条笔记会被升级为永久笔记（permanent）（`zk_type: permanent`），并把状态更新为已完成（done）（`zk_status: done`），同时在 `## 关联` 下追加你选的链接列表。

## 设置项

位置：**Settings → Zk**

- 关联章节标题：默认是“关联”，也就是 `## 关联`
- 写入 `zk/*` 标签：开启后会写入类似 `#zk/inbox`（收集箱（inbox）/ `zk_status: inbox`）、`#zk/permanent`（永久笔记（permanent）/ `zk_type: permanent`）的辅助标签
- 候选建议数量上限：相关卡片建议的最大条数

## 数据格式（写入到 frontmatter）

插件主要使用这些字段：

- `zk_type`（类型）：闪念笔记（fleeting）/ 文献笔记（literature）/ 永久笔记（permanent）/ 索引笔记（index）/ 项目笔记（project）
- `zk_status`（状态）：收集箱（inbox）/ 处理中（processing）/ 已完成（done）/ 已归档（archived）
- `zk_id`（卡片 ID）：主要给永久笔记（permanent）用
- `zk_source`（来源）：主要给文献笔记（literature）用

“相关卡片建议”目前比较简单：同来源（`zk_source` 相同）和共享标签会加分（`zk/*` 这类标签不会参与计算）。

## 开发与构建

依赖：Node.js 18+，包管理器用 pnpm。

```bash
pnpm install
pnpm run dev      # watch
pnpm run build    # 生产构建
pnpm run test     # 单测
pnpm run lint
```

本地调试（把插件文件链接进你的 Vault）：

```bash
pnpm run vault:dev -- --vault "/path/to/YourVault"
```
