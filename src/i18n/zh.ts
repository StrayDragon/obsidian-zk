// NOTE: This plugin intentionally ships with zh-only i18n to reduce maintenance cost.
// All UI copy MUST be sourced via `t()` and keep the bilingual hint style in-string,
// e.g. 中文（English token） / 中文（zk_key）.
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
	"common.refresh": "刷新（refresh）",
	"common.cancel": "取消（cancel）",
	"common.add": "添加（add）",
	"common.remove": "移除（remove）",
	"common.open": "打开（open）",
	"common.process": "处理（process）",
	"common.assign": "分配（assign）",
	"common.all": "全部（all）",
	"common.reset": "重置（reset）",
	"common.resetFiltersAria": "重置筛选（reset filters）",
	"common.showMore": "显示更多（show more）",
	"common.separator.dot": " · ",

	"labels.field.type": "类型（zk_type）",
	"labels.field.status": "状态（zk_status）",
	"labels.field.id": "卡片 ID（zk_id）",
	"labels.field.source": "来源（zk_source）",

	"labels.zkStatus.inbox": "收集箱（inbox）",
	"labels.zkStatus.processing": "处理中（processing）",
	"labels.zkStatus.done": "已完成（done）",
	"labels.zkStatus.archived": "已归档（archived）",
	"labels.zkStatus.unknown": "未标记（unknown）",

	"labels.zkType.fleeting": "闪念笔记（fleeting）",
	"labels.zkType.literature": "文献笔记（literature）",
	"labels.zkType.permanent": "永久笔记（permanent）",
	"labels.zkType.index": "索引笔记（index）",
	"labels.zkType.project": "项目笔记（project）",
	"labels.zkType.unknown": "未标记（unknown）",

	"commands.newFleetingNote": "1| 新建闪念笔记（fleeting）",
	"commands.newLiteratureNote": "2| 新建文献笔记（literature）",
	"commands.openInbox": "3| 打开收集箱（inbox）",
	"commands.processNextInboxItem": "4| 处理下一条 · 收集箱（inbox）",
	"commands.processCurrentNote": "5| 处理当前笔记 · 升级为永久笔记（permanent）",
	"commands.assignZkIdCurrentNote": "工具 - 分配卡片 ID（当前笔记）",
	"commands.openDashboard": "概览（dashboard）",
	"commands.openLibraryIndex": "图书馆索引（library index）",

	"notices.createFleetingNoteFailed": "创建闪念笔记（fleeting）失败，请查看控制台（console）。",
	"notices.createLiteratureNoteFailed": "创建文献笔记（literature）失败，请查看控制台（console）。",
	"notices.queueEmpty": "{queue}为空（empty）。",
	"notices.operationFailed": "操作失败（failed），请查看控制台（console）。",
	"notices.noActiveFile": "没有活动文件（no active file）。",
	"notices.fieldUpdated": "{field}已更新为 {value}（updated）。",
	"notices.archiveFailed": "归档（archive）失败，请查看控制台（console）。",

	"settings.workflow.heading": "工作流设置（workflow）",
	"settings.relatedSectionHeading.name": "关联章节标题（related heading）",
	"settings.relatedSectionHeading.desc":
		"插件会把相关双向链接（related links）写入该标题下，例如“## 关联”。",
	"settings.writeZkTags.name": "写入 zk/* 标签（tags）",
	"settings.writeZkTags.desc":
		"启用后创建/处理笔记时会写入辅助标签（tags），例如 #zk/inbox 对应 {statusField} = {inboxStatus}；#zk/permanent 对应 {typeField} = {permanentType}。",
	"settings.suggestionsLimit.name": "候选建议数量上限（limit）",
	"settings.suggestionsLimit.desc": "相关卡片建议的最大条数（max suggestions）（建议 10–50）。",

	"suggest.file.placeholder": "搜索文件（search）…",
	"suggest.file.empty": "没有匹配结果（no matches）。",
	"suggestions.related.sameSource": "同来源（same source）",
	"suggestions.related.sharedTags": "共享标签（shared tags）：{tags}{ellipsis}",
	"suggestions.related.joiner": "；",

	"modals.inbox.statusLine": "{field}：{value}",
	"modals.inbox.pendingLine": "待处理（pending）：{count} 条",
	"modals.inbox.emptyState": "{inbox}为空（empty）。请先新建一条{fleeting}或{literature}。",
	"modals.inbox.itemDesc": "{typeField}：{typeLabel}{source}",
	"modals.inbox.itemSource": "；{sourceField}：{source}",
	"modals.inbox.archiveButton": "归档（archived）",

	"modals.assignZkId.title": "分配{fieldId}（assign）",
	"modals.assignZkId.target": "目标（target）：{filename}",
	"modals.assignZkId.method.name": "生成方式（generation）",
	"modals.assignZkId.method.desc":
		"选择创建新链（new chain），或基于某条锚点卡片（anchor）生成后继/分支 ID。",
	"modals.assignZkId.method.newChain": "新链（new chain）",
	"modals.assignZkId.method.pickAnchor": "选锚点（pick anchor）…",
	"modals.assignZkId.idInput.name": "卡片 ID（zk_id，可编辑 editable）",
	"modals.assignZkId.idInput.conflict": "冲突（conflict）：{paths}",
	"modals.assignZkId.idInput.desc": "写入 frontmatter 的 zk_id 字段（frontmatter）。",
	"modals.assignZkId.writeButton": "写入（write）",
	"modals.assignZkId.pickAnchor.placeholder": "选择锚点卡片（anchor，已有 zk_id）…",
	"modals.assignZkId.pickAnchor.empty": "没有可用的锚点卡片（anchor · zk_id）",

	"modals.processWizard.title": "处理向导（process wizard）",
	"modals.processWizard.target": "目标（target）：{filename}",
	"modals.processWizard.typeStatusLine": "{typeField}：{typeLabel}；{statusField}：{statusLabel}",
	"modals.processWizard.notInboxTip":
		"提示（tip）：当前文件的{statusField}不是 {inboxStatus}。你仍然可以将其标记为 {inboxStatus} 后再继续。",
	"modals.processWizard.markAsInboxButton": "标记为 {inboxStatus}",
	"modals.processWizard.step1Title": "1) 分配{fieldId}",
	"modals.processWizard.method.name": "生成方式（generation）",
	"modals.processWizard.method.desc":
		"建议（tip）：新链用于开启一个新论证链；选锚点用于接续/分支已有讨论。",
	"modals.processWizard.method.newChain": "新链（new chain）",
	"modals.processWizard.method.pickAnchor": "选锚点（pick anchor）…",
	"modals.processWizard.idInput.conflict": "冲突（conflict）：{paths}",
	"modals.processWizard.idInput.desc":
		"将写入 frontmatter 的 zk_id 字段（不会写入标题/正文）（frontmatter）。",
	"modals.processWizard.step2Title": "2) 选择相关卡片（related）（写入到“## {heading}”）",
	"modals.processWizard.selectedHeading": "已选择（selected）：",
	"modals.processWizard.addRelated.name": "添加相关卡片（add related）",
	"modals.processWizard.addRelated.desc": "你可以从建议（suggestions）添加，或搜索任意笔记（search）。",
	"modals.processWizard.addRelated.searchButton": "搜索添加（search）…",
	"modals.processWizard.suggestionsHeading": "建议（suggestions，可解释 explainable）：",
	"modals.processWizard.pickRelated.placeholder": "搜索要关联的卡片（search related）…",
	"modals.processWizard.step3Title": "3) 完成升级（finalize）",
	"modals.processWizard.step3Desc":
		"插件不会替你改写正文内容；只会写入 frontmatter（zk_type/zk_status/zk_id 等字段）与维护“## {heading}”链接段。",
	"modals.processWizard.finalizeButton": "完成升级（finalize）",

	"common.unknown": "未知（unknown）",
	"notices.anchorMissingId": "所选锚点（anchor）没有{fieldId}。",
	"notices.fieldRequired": "{field}不能为空（required）。",
	"notices.zkIdConflict": "卡片 ID（zk_id）冲突（conflict）：{path}",
	"notices.zkIdWritten": "已写入{fieldId}（written）。",
	"notices.writeFailed": "写入失败（write failed），请查看控制台（console）。",
	"notices.promotedToPermanent": "已升级为{permanent}；{statusField}已更新为 {done}（updated）。",

	"views.dashboard.notesCount": "Zk 笔记（zk notes）：{count} 条",
	"views.dashboard.quickActions": "快捷操作（quick actions）",
	"views.dashboard.section.stats": "统计（stats）",
	"views.dashboard.section.health": "数据健康（data health）",
	"views.dashboard.section.lists": "列表（lists）",
	"views.dashboard.subtitle.clickToViewList": "点击查看列表（click to view）",
	"views.dashboard.subtitle.clickToViewConflicts": "点击查看冲突组（click to view）",
	"views.dashboard.health.missingId.title": "{permanent}缺{idField}",
	"views.dashboard.health.missingSource.title": "{literature}缺{sourceField}",
	"views.dashboard.health.duplicateIds.title": "{idField}冲突组数",
	"views.dashboard.action.openInbox": "打开{inbox}",
	"views.dashboard.action.processNext": "处理下一条（next） · {inbox}",
	"views.dashboard.action.processCurrent": "处理当前笔记（current） · 升级为{permanent}",
	"views.dashboard.panel.showingFirstItems": "仅显示前 {count} 条（showing first）。",
	"views.dashboard.panel.showingFirstGroups": "仅显示前 {count} 组（showing first）。",
	"views.dashboard.panel.inbox.summary": "{inbox}：{count} 条",
	"views.dashboard.panel.missingId.summary": "{permanent}缺{idField}：{count} 条",
	"views.dashboard.panel.missingId.tip": "提示（tip）：点击打开（open），或直接分配{idField}（assign）。",
	"views.dashboard.panel.missingSource.summary": "{literature}缺{sourceField}：{count} 条",
	"views.dashboard.panel.missingSource.tip":
		"建议（tip）：为{literature}补齐{sourceField}，方便后续检索与召回（search & recall）。",
	"views.dashboard.panel.duplicateIds.summary": "{idField}冲突（conflicts）：{count} 组",
	"views.dashboard.panel.duplicateIds.tip": "同一{idField}被多个文件使用会影响链式组织与召回（recall）。",
	"views.dashboard.panel.duplicateIds.groupSummary": "{idField}：{zkId}（{count}）",
	"views.dashboard.noIssues": "没有发现问题（no issues）。",
	"views.dashboard.updatedAt": "最后更新（updated）：{time}",

	"views.libraryIndex.updatedAt": "最后更新（updated）：{time}",
	"views.libraryIndex.filters.searchLabel": "搜索（search）",
	"views.libraryIndex.filters.searchPlaceholder":
		"搜索文件名（filename）、{idField}、{sourceField}或标签（tags）…",
	"views.libraryIndex.filters.searchAria": "搜索（search）",
	"views.libraryIndex.filters.typeAria": "类型（type）",
	"views.libraryIndex.filters.statusAria": "状态（status）",
	"views.libraryIndex.filters.tagLabel": "标签（tags）",
	"views.libraryIndex.filters.tagAria": "标签（tags）",
	"views.libraryIndex.tagOption.all": "全部标签（all tags）",
	"views.libraryIndex.match": "匹配（matched） {matched} / 总计（total） {total}",
	"views.libraryIndex.empty": "没有匹配的笔记（no matches）。",
	"views.libraryIndex.group.typePart": "{typeLabel}（{count}）",
	"views.libraryIndex.group.inboxPart": "{inboxLabel} {count}",
	"views.libraryIndex.chip.ariaLabel": "筛选标签（filter tag）：{tag}",
	"views.libraryIndex.entry.idPart": "{idField}：{id}",
	"views.libraryIndex.entry.sourcePart": "{sourceField}：{source}",
} as const;
