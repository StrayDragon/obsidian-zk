// NOTE: This plugin intentionally ships with zh-only i18n to reduce maintenance cost.
// All user-visible UI copy MUST be sourced via `t()`.
//
// Bilingual hints are reserved for Zk method proper nouns only:
// - Zk frontmatter keys: 中文（zk_key）
// - Zk type/status tokens: 中文（token）
// Avoid adding 中文（English） noise for generic UI copy like “最后更新”“刷新”“下一条”.
//
// Key naming convention:
// - `common.*` shared UI labels (buttons, etc.)
// - `labels.*` canonical Zk concept labels
// - `commands.*` command palette names
// - `settings.*` settings tab copy
// - `modals.*` modal copy
// - `views.*` view copy
// - `notices.*` notice/toast copy

export const ZH_STRINGS = {
	"common.refresh": "刷新",
	"common.cancel": "取消",
	"common.add": "添加",
	"common.remove": "移除",
	"common.open": "打开",
	"common.process": "处理",
	"common.assign": "分配",
	"common.all": "全部",
	"common.reset": "重置",
	"common.resetFiltersAria": "重置筛选",
	"common.showMore": "显示更多",
	"common.separator.dot": " · ",

	"labels.field.type": "类型（zk_type）",
	"labels.field.status": "状态（zk_status）",
	"labels.field.id": "卡片 ID（zk_id）",
	"labels.field.source": "来源（zk_source）",

	"labels.zkStatus.inbox": "收集箱（inbox）",
	"labels.zkStatus.processing": "处理中（processing）",
	"labels.zkStatus.done": "已完成（done）",
	"labels.zkStatus.archived": "已归档（archived）",
	"labels.zkStatus.unknown": "未标记",

	"labels.zkType.fleeting": "闪念笔记（fleeting）",
	"labels.zkType.literature": "文献笔记（literature）",
	"labels.zkType.permanent": "永久笔记（permanent）",
	"labels.zkType.index": "索引笔记（index）",
	"labels.zkType.project": "项目笔记（project）",
	"labels.zkType.unknown": "未标记",

	"commands.newFleetingNote": "1| 新建闪念笔记（fleeting）",
	"commands.newLiteratureNote": "2| 新建文献笔记（literature）",
	"commands.openInbox": "3| 打开收集箱（inbox）",
	"commands.processNextInboxItem": "4| 处理下一条 · 收集箱（inbox）",
	"commands.processCurrentNote": "5| 处理当前笔记 · 升级为永久笔记（permanent）",
	"commands.assignZkIdCurrentNote": "工具 - 分配卡片 ID（当前笔记）",
	"commands.openDashboard": "概览",
	"commands.openLibraryIndex": "图书馆索引",

	"notices.createFleetingNoteFailed": "创建闪念笔记（fleeting）失败，请查看控制台。",
	"notices.createLiteratureNoteFailed": "创建文献笔记（literature）失败，请查看控制台。",
	"notices.queueEmpty": "{queue}为空。",
	"notices.operationFailed": "操作失败，请查看控制台。",
	"notices.noActiveFile": "没有活动文件。",
	"notices.fieldUpdated": "{field}已更新为 {value}。",
	"notices.archiveFailed": "归档失败，请查看控制台。",

	"settings.workflow.heading": "工作流设置",
	"settings.relatedSectionHeading.name": "关联章节标题",
	"settings.relatedSectionHeading.desc":
		"插件会把相关双向链接写入该标题下，例如“## 关联”。",
	"settings.writeZkTags.name": "写入 zk/* 标签",
	"settings.writeZkTags.desc":
		"启用后创建/处理笔记时会写入辅助标签，例如 #zk/inbox 对应 {statusField} = {inboxStatus}；#zk/permanent 对应 {typeField} = {permanentType}。",
	"settings.suggestionsLimit.name": "候选建议数量上限",
	"settings.suggestionsLimit.desc": "相关卡片建议的最大条数（建议 10–50）。",

	"suggest.file.placeholder": "搜索文件…",
	"suggest.file.empty": "没有匹配结果。",
	"suggestions.related.sameSource": "同来源",
	"suggestions.related.sharedTags": "共享标签：{tags}{ellipsis}",
	"suggestions.related.joiner": "；",

	"modals.inbox.statusLine": "{field}：{value}",
	"modals.inbox.pendingLine": "待处理：{count} 条",
	"modals.inbox.emptyState": "{inbox}为空。请先新建一条{fleeting}或{literature}。",
	"modals.inbox.itemDesc": "{typeField}：{typeLabel}{source}",
	"modals.inbox.itemSource": "；{sourceField}：{source}",
	"modals.inbox.archiveButton": "归档",

	"modals.assignZkId.title": "分配{fieldId}",
	"modals.assignZkId.target": "目标：{filename}",
	"modals.assignZkId.method.name": "生成方式",
	"modals.assignZkId.method.desc":
		"选择创建新链，或基于某条锚点卡片生成后继/分支 ID。",
	"modals.assignZkId.method.newChain": "新链",
	"modals.assignZkId.method.pickAnchor": "选锚点…",
	"modals.assignZkId.idInput.name": "卡片 ID（zk_id，可编辑）",
	"modals.assignZkId.idInput.conflict": "冲突：{paths}",
	"modals.assignZkId.idInput.desc": "写入 frontmatter 的 zk_id 字段。",
	"modals.assignZkId.writeButton": "写入",
	"modals.assignZkId.pickAnchor.placeholder": "选择锚点卡片（已有 zk_id）…",
	"modals.assignZkId.pickAnchor.empty": "没有可用的锚点卡片（已有 zk_id）",

	"modals.processWizard.title": "处理向导",
	"modals.processWizard.target": "目标：{filename}",
	"modals.processWizard.typeStatusLine": "{typeField}：{typeLabel}；{statusField}：{statusLabel}",
	"modals.processWizard.notInboxTip":
		"提示：当前文件的{statusField}不是 {inboxStatus}。你仍然可以将其标记为 {inboxStatus} 后再继续。",
	"modals.processWizard.markAsInboxButton": "标记为 {inboxStatus}",
	"modals.processWizard.step1Title": "1) 分配{fieldId}",
	"modals.processWizard.method.name": "生成方式",
	"modals.processWizard.method.desc":
		"建议：新链用于开启一个新论证链；选锚点用于接续/分支已有讨论。",
	"modals.processWizard.method.newChain": "新链",
	"modals.processWizard.method.pickAnchor": "选锚点…",
	"modals.processWizard.idInput.conflict": "冲突：{paths}",
	"modals.processWizard.idInput.desc":
		"将写入 frontmatter 的 zk_id 字段（不会写入标题/正文）。",
	"modals.processWizard.step2Title": "2) 选择相关卡片（写入到“## {heading}”）",
	"modals.processWizard.selectedHeading": "已选择：",
	"modals.processWizard.addRelated.name": "添加相关卡片",
	"modals.processWizard.addRelated.desc": "你可以从建议添加，或搜索任意笔记。",
	"modals.processWizard.addRelated.searchButton": "搜索添加…",
	"modals.processWizard.suggestionsHeading": "建议（可解释）：",
	"modals.processWizard.pickRelated.placeholder": "搜索要关联的卡片…",
	"modals.processWizard.step3Title": "3) 完成升级",
	"modals.processWizard.step3Desc":
		"插件不会替你改写正文内容；只会写入 frontmatter（zk_type/zk_status/zk_id 等字段）与维护“## {heading}”链接段。",
	"modals.processWizard.finalizeButton": "完成升级",

	"common.unknown": "未知",
	"notices.anchorMissingId": "所选锚点没有{fieldId}。",
	"notices.fieldRequired": "{field}不能为空。",
	"notices.zkIdConflict": "卡片 ID（zk_id）冲突：{path}",
	"notices.zkIdWritten": "已写入{fieldId}。",
	"notices.writeFailed": "写入失败，请查看控制台。",
	"notices.promotedToPermanent": "已升级为{permanent}；{statusField}已更新为 {done}。",

	"views.dashboard.notesCount": "Zk 笔记：{count} 条",
	"views.dashboard.quickActions": "快捷操作",
	"views.dashboard.section.stats": "统计",
	"views.dashboard.section.health": "数据健康",
	"views.dashboard.section.lists": "列表",
	"views.dashboard.subtitle.clickToViewList": "点击查看列表",
	"views.dashboard.subtitle.clickToViewConflicts": "点击查看冲突组",
	"views.dashboard.health.missingId.title": "{permanent}缺{idField}",
	"views.dashboard.health.missingSource.title": "{literature}缺{sourceField}",
	"views.dashboard.health.duplicateIds.title": "{idField}冲突组数",
	"views.dashboard.action.openInbox": "打开{inbox}",
	"views.dashboard.action.processNext": "处理下一条 · {inbox}",
	"views.dashboard.action.processCurrent": "处理当前笔记 · 升级为{permanent}",
	"views.dashboard.panel.showingFirstItems": "仅显示前 {count} 条。",
	"views.dashboard.panel.showingFirstGroups": "仅显示前 {count} 组。",
	"views.dashboard.panel.inbox.summary": "{inbox}：{count} 条",
	"views.dashboard.panel.missingId.summary": "{permanent}缺{idField}：{count} 条",
	"views.dashboard.panel.missingId.tip": "提示：点击打开，或直接分配{idField}。",
	"views.dashboard.panel.missingSource.summary": "{literature}缺{sourceField}：{count} 条",
	"views.dashboard.panel.missingSource.tip":
		"建议：为{literature}补齐{sourceField}，方便后续检索与召回。",
	"views.dashboard.panel.duplicateIds.summary": "{idField}冲突：{count} 组",
	"views.dashboard.panel.duplicateIds.tip": "同一{idField}被多个文件使用会影响链式组织与召回。",
	"views.dashboard.panel.duplicateIds.groupSummary": "{idField}：{zkId}（{count}）",
	"views.dashboard.noIssues": "没有发现问题。",
	"views.dashboard.updatedAt": "最后更新：{time}",

	"views.libraryIndex.updatedAt": "最后更新：{time}",
	"views.libraryIndex.filters.searchLabel": "搜索",
	"views.libraryIndex.filters.searchPlaceholder":
		"搜索文件名、{idField}、{sourceField}或标签…",
	"views.libraryIndex.filters.searchAria": "搜索",
	"views.libraryIndex.filters.typeAria": "类型",
	"views.libraryIndex.filters.statusAria": "状态",
	"views.libraryIndex.filters.tagLabel": "标签",
	"views.libraryIndex.filters.tagAria": "标签",
	"views.libraryIndex.tagOption.all": "全部标签",
	"views.libraryIndex.match": "匹配 {matched} / 总计 {total}",
	"views.libraryIndex.empty": "没有匹配的笔记。",
	"views.libraryIndex.group.typePart": "{typeLabel}（{count}）",
	"views.libraryIndex.group.inboxPart": "{inboxLabel} {count}",
	"views.libraryIndex.chip.ariaLabel": "筛选标签：{tag}",
	"views.libraryIndex.entry.idPart": "{idField}：{id}",
	"views.libraryIndex.entry.sourcePart": "{sourceField}：{source}",
} as const;
