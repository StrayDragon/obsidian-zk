import {ItemView, Setting, TFile, type WorkspaceLeaf} from "obsidian";
import type ZkWorkflowWizardPlugin from "../main";
import {InboxModal} from "../ui/inbox-modal";
import {ProcessWizardModal} from "../ui/process-wizard-modal";
import {AssignZkIdModal} from "../ui/assign-zk-id-modal";

export const ZK_DASHBOARD_VIEW_TYPE = "zk-dashboard";

function countBy<T extends string>(values: Array<T | undefined>): Record<T, number> {
	const out = {} as Record<T, number>;
	for (const value of values) {
		if (!value) continue;
		out[value] = (out[value] ?? 0) + 1;
	}
	return out;
}

function openFile(plugin: ZkWorkflowWizardPlugin, file: TFile) {
	void plugin.app.workspace.getLeaf(false).openFile(file);
}

export class ZkDashboardView extends ItemView {
	private rerenderTimer?: number;

	constructor(
		leaf: WorkspaceLeaf,
		private readonly plugin: ZkWorkflowWizardPlugin,
	) {
		super(leaf);
	}

	getViewType(): string {
		return ZK_DASHBOARD_VIEW_TYPE;
	}

	getDisplayText(): string {
		return "Zk 概览";
	}

	getIcon(): string {
		return "bar-chart-2";
	}

	async onOpen() {
		this.registerEvent(
			this.plugin.app.metadataCache.on("changed", () => {
				this.scheduleRender();
			}),
		);
		this.registerEvent(
			this.plugin.app.vault.on("rename", () => {
				this.scheduleRender();
			}),
		);
		this.registerEvent(
			this.plugin.app.vault.on("delete", () => {
				this.scheduleRender();
			}),
		);

		await this.render();
	}

	async onClose() {
		this.contentEl.empty();
		if (this.rerenderTimer != null) window.clearTimeout(this.rerenderTimer);
	}

	private scheduleRender() {
		if (this.rerenderTimer != null) return;
		this.rerenderTimer = window.setTimeout(() => {
			this.rerenderTimer = undefined;
			void this.render();
		}, 200);
	}

	private async render() {
		this.contentEl.empty();

		const header = this.contentEl.createDiv({cls: "zk-dashboard-header"});
		header.createEl("h2", {text: "Zk 概览"});
		new Setting(header).addButton((btn) =>
			btn.setButtonText("刷新").onClick(() => {
				void this.render();
			}),
		);

		const index = await this.plugin.getIndex();
		const notes = index.getAllNotes();

		const zkNotes = notes.filter((n) => n.zkType || n.zkStatus || n.zkId || n.zkSource);
		const byType = countBy(zkNotes.map((n) => n.zkType));
		const byStatus = countBy(zkNotes.map((n) => n.zkStatus));

		const permanent = notes.filter((n) => n.zkType === "permanent");
		const permanentMissingId = permanent.filter((n) => !n.zkId);
		const literature = notes.filter((n) => n.zkType === "literature");
		const literatureMissingSource = literature.filter((n) => !n.zkSource);
		const duplicateIdGroups = index.getDuplicateZkIdGroups();

		this.contentEl.createEl("p", {text: `Zk 笔记：${zkNotes.length} 条`});

		const quick = this.contentEl.createDiv({cls: "zk-dashboard-actions"});
		new Setting(quick)
			.setName("快捷操作")
			.addButton((btn) =>
				btn.setButtonText("打开收集箱").onClick(() => {
					new InboxModal(this.plugin).open();
				}),
			)
			.addButton((btn) =>
				btn.setButtonText("处理下一条").onClick(() => {
					const first = index.getInboxItems()[0]?.file;
					if (!first) return;
					new ProcessWizardModal(this.plugin, first).open();
				}),
			)
			.addButton((btn) =>
				btn.setButtonText("处理当前").onClick(() => {
					const file = this.plugin.app.workspace.getActiveFile();
					if (!file) return;
					new ProcessWizardModal(this.plugin, file).open();
				}),
			);

		this.contentEl.createEl("h3", {text: "统计"});

		const stats = this.contentEl.createEl("ul");
		stats.createEl("li", {text: `收集箱（inbox）：${byStatus.inbox ?? 0}`});
		stats.createEl("li", {text: `永久笔记：${byType.permanent ?? 0}`});
		stats.createEl("li", {text: `文献笔记：${byType.literature ?? 0}`});
		stats.createEl("li", {text: `闪念笔记：${byType.fleeting ?? 0}`});
		stats.createEl("li", {text: `已归档：${byStatus.archived ?? 0}`});

		this.contentEl.createEl("h3", {text: "数据健康"});

		const health = this.contentEl.createEl("ul");
		health.createEl("li", {text: `永久笔记缺少卡片 ID：${permanentMissingId.length}`});
		health.createEl("li", {text: `文献笔记缺少来源：${literatureMissingSource.length}`});
		health.createEl("li", {text: `卡片 ID 冲突组数：${duplicateIdGroups.length}`});

		if (permanentMissingId.length > 0) {
			const section = this.contentEl.createDiv();
			section.createEl("p", {text: "缺少卡片 ID（点击打开，或在笔记中运行分配命令）"});
			for (const note of permanentMissingId.slice(0, 10)) {
				new Setting(section)
					.setName(note.file.basename)
					.setDesc(note.file.path)
					.addButton((btn) =>
						btn.setButtonText("打开").onClick(() => openFile(this.plugin, note.file)),
					)
					.addButton((btn) =>
						btn.setButtonText("分配").onClick(() => new AssignZkIdModal(this.plugin, note.file).open()),
					);
			}
			if (permanentMissingId.length > 10) {
				section.createEl("p", {text: "仅显示前 10 条。"});
			}
		}

		if (duplicateIdGroups.length > 0) {
			const section = this.contentEl.createDiv();
			section.createEl("p", {text: "卡片 ID 冲突（同一 ID 被多个文件使用）"});
			for (const group of duplicateIdGroups.slice(0, 10)) {
				const groupEl = section.createEl("details");
				groupEl.createEl("summary", {text: `卡片 ID：${group.zkId}（${group.files.length}）`});
				for (const file of group.files) {
					new Setting(groupEl)
						.setName(file.basename)
						.setDesc(file.path)
						.addButton((btn) => btn.setButtonText("打开").onClick(() => openFile(this.plugin, file)));
				}
			}
			if (duplicateIdGroups.length > 10) {
				section.createEl("p", {text: "仅显示前 10 组。"});
			}
		}
	}
}
