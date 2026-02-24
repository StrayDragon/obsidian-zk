import {ItemView, Setting, TFile, type WorkspaceLeaf} from "obsidian";
import type ZkWorkflowWizardPlugin from "../main";
import {InboxModal} from "../ui/inbox-modal";
import {ProcessWizardModal} from "../ui/process-wizard-modal";
import {AssignZkIdModal} from "../ui/assign-zk-id-modal";
import {getZkFieldLabel, getZkStatusLabel, getZkTypeLabel} from "../utils/zk-labels";

export const ZK_DASHBOARD_VIEW_TYPE = "zk-dashboard";

type ZkDashboardPanel = "inbox" | "missing-id" | "missing-source" | "duplicate-ids";

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
	private activePanel?: ZkDashboardPanel;

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
		return "Zk 概览（dashboard）";
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

	private showPanel(panel: ZkDashboardPanel) {
		this.activePanel = this.activePanel === panel ? undefined : panel;
		void this.render();
	}

	private createCard(
		parent: HTMLElement,
		card: {
			title: string;
			value: string;
			subtitle?: string;
			mod?: "warning" | "danger";
			onClick?: () => void;
		},
	) {
		const clickable = Boolean(card.onClick);
		const el = parent.createEl(clickable ? "button" : "div", {
			cls: [
				"zk-card",
				clickable ? "is-clickable" : "",
				card.mod ? `is-${card.mod}` : "",
			].filter(Boolean),
			attr: clickable ? {type: "button"} : undefined,
		});

		el.createDiv({cls: "zk-card-title", text: card.title});
		el.createDiv({cls: "zk-card-value", text: card.value});
		if (card.subtitle) el.createDiv({cls: "zk-card-subtitle", text: card.subtitle});

		if (card.onClick) {
			el.addEventListener("click", card.onClick);
		}
	}

	private async render() {
		this.contentEl.empty();

		this.contentEl.addClass("zk-dashboard");

		const header = this.contentEl.createDiv({cls: "zk-dashboard-header"});
		header.createEl("h2", {text: "Zk 概览（dashboard）"});
		const headerRight = header.createDiv({cls: "zk-dashboard-headerRight"});
		headerRight.createDiv({
			cls: "zk-dashboard-updated",
			text: `最后更新：${new Date().toLocaleTimeString()}`,
		});
		const refreshButton = headerRight.createEl("button", {
			cls: "zk-dashboard-btn",
			text: "刷新",
			attr: {type: "button"},
		});
		refreshButton.addEventListener("click", () => void this.render());

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

		const headline = this.contentEl.createDiv({cls: "zk-dashboard-headline"});
		headline.createEl("div", {text: `Zk 笔记：${zkNotes.length} 条`});

		const quick = this.contentEl.createDiv({cls: "zk-dashboard-actions"});
		new Setting(quick)
			.setName("快捷操作")
			.addButton((btn) =>
				btn.setButtonText(`打开${getZkStatusLabel("inbox")}`).onClick(() => {
					new InboxModal(this.plugin).open();
				}),
			)
			.addButton((btn) =>
				btn.setButtonText(`处理下一条 · ${getZkStatusLabel("inbox")}`).onClick(() => {
					const first = index.getInboxItems()[0]?.file;
					if (!first) return;
					new ProcessWizardModal(this.plugin, first).open();
				}),
			)
			.addButton((btn) =>
				btn.setButtonText(`处理当前笔记 · 升级为${getZkTypeLabel("permanent")}`).onClick(() => {
					const file = this.plugin.app.workspace.getActiveFile();
					if (!file) return;
					new ProcessWizardModal(this.plugin, file).open();
				}),
			);

		this.contentEl.createEl("h3", {text: "统计"});

		const statsGrid = this.contentEl.createDiv({cls: "zk-dashboard-grid"});
		this.createCard(statsGrid, {
			title: getZkStatusLabel("inbox"),
			value: String(byStatus.inbox ?? 0),
			subtitle: "点击查看列表",
			onClick: () => this.showPanel("inbox"),
		});
		this.createCard(statsGrid, {title: getZkTypeLabel("permanent"), value: String(byType.permanent ?? 0)});
		this.createCard(statsGrid, {title: getZkTypeLabel("literature"), value: String(byType.literature ?? 0)});
		this.createCard(statsGrid, {title: getZkTypeLabel("fleeting"), value: String(byType.fleeting ?? 0)});
		this.createCard(statsGrid, {title: getZkStatusLabel("archived"), value: String(byStatus.archived ?? 0)});

		this.contentEl.createEl("h3", {text: "数据健康"});

		const healthGrid = this.contentEl.createDiv({cls: "zk-dashboard-grid"});
		this.createCard(healthGrid, {
			title: `${getZkTypeLabel("permanent")}缺${getZkFieldLabel("id")}`,
			value: String(permanentMissingId.length),
			subtitle: "点击查看列表",
			mod: permanentMissingId.length > 0 ? "warning" : undefined,
			onClick: () => this.showPanel("missing-id"),
		});
		this.createCard(healthGrid, {
			title: `${getZkTypeLabel("literature")}缺${getZkFieldLabel("source")}`,
			value: String(literatureMissingSource.length),
			subtitle: "点击查看列表",
			mod: literatureMissingSource.length > 0 ? "warning" : undefined,
			onClick: () => this.showPanel("missing-source"),
		});
		this.createCard(healthGrid, {
			title: `${getZkFieldLabel("id")}冲突组数`,
			value: String(duplicateIdGroups.length),
			subtitle: "点击查看冲突组",
			mod: duplicateIdGroups.length > 0 ? "danger" : undefined,
			onClick: () => this.showPanel("duplicate-ids"),
		});

		this.contentEl.createEl("h3", {text: "列表"});

		const panels = this.contentEl.createDiv({cls: "zk-dashboard-panels"});
		const panelEls: Partial<Record<ZkDashboardPanel, HTMLDetailsElement>> = {};

		const inboxPanel = panels.createEl("details", {cls: "zk-dashboard-panel"});
		panelEls["inbox"] = inboxPanel;
		inboxPanel.createEl("summary", {
			text: `${getZkStatusLabel("inbox")}：${byStatus.inbox ?? 0} 条`,
		});
		inboxPanel.open = this.activePanel === "inbox";
		{
			const content = inboxPanel.createDiv({cls: "zk-dashboard-panelBody"});
			const inboxItems = index.getInboxItems();
			if (inboxItems.length === 0) {
				content.createEl("p", {text: `${getZkStatusLabel("inbox")}为空。`});
			} else {
				for (const note of inboxItems.slice(0, 20)) {
					new Setting(content)
						.setName(note.file.basename)
						.setDesc(note.file.path)
						.addButton((btn) => btn.setButtonText("打开").onClick(() => openFile(this.plugin, note.file)))
						.addButton((btn) =>
							btn.setButtonText("处理").onClick(() => new ProcessWizardModal(this.plugin, note.file).open()),
						);
				}
				if (inboxItems.length > 20) {
					content.createEl("p", {text: "仅显示前 20 条。"});
				}
			}
			new Setting(content).addButton((btn) =>
				btn.setButtonText(`打开${getZkStatusLabel("inbox")}`).onClick(() => new InboxModal(this.plugin).open()),
			);
		}

		const missingIdPanel = panels.createEl("details", {cls: "zk-dashboard-panel"});
		panelEls["missing-id"] = missingIdPanel;
		missingIdPanel.createEl("summary", {
			text: `${getZkTypeLabel("permanent")}缺${getZkFieldLabel("id")}：${permanentMissingId.length} 条`,
		});
		missingIdPanel.open = this.activePanel === "missing-id";
		{
			const content = missingIdPanel.createDiv({cls: "zk-dashboard-panelBody"});
			content.createEl("p", {text: `提示：点击打开，或直接分配${getZkFieldLabel("id")}。`});

			if (permanentMissingId.length === 0) {
				content.createEl("p", {text: "没有发现问题。"});
			} else {
				for (const note of permanentMissingId.slice(0, 20)) {
					new Setting(content)
						.setName(note.file.basename)
						.setDesc(note.file.path)
						.addButton((btn) => btn.setButtonText("打开").onClick(() => openFile(this.plugin, note.file)))
						.addButton((btn) =>
							btn.setButtonText("分配").onClick(() => new AssignZkIdModal(this.plugin, note.file).open()),
						);
				}
				if (permanentMissingId.length > 20) {
					content.createEl("p", {text: "仅显示前 20 条。"});
				}
			}
		}

		const missingSourcePanel = panels.createEl("details", {cls: "zk-dashboard-panel"});
		panelEls["missing-source"] = missingSourcePanel;
		missingSourcePanel.createEl("summary", {
			text: `${getZkTypeLabel("literature")}缺${getZkFieldLabel("source")}：${literatureMissingSource.length} 条`,
		});
		missingSourcePanel.open = this.activePanel === "missing-source";
		{
			const content = missingSourcePanel.createDiv({cls: "zk-dashboard-panelBody"});
			content.createEl("p", {
				text: `建议：为${getZkTypeLabel("literature")}补齐${getZkFieldLabel("source")}，方便后续检索与召回。`,
			});

			if (literatureMissingSource.length === 0) {
				content.createEl("p", {text: "没有发现问题。"});
			} else {
				for (const note of literatureMissingSource.slice(0, 20)) {
					new Setting(content)
						.setName(note.file.basename)
						.setDesc(note.file.path)
						.addButton((btn) => btn.setButtonText("打开").onClick(() => openFile(this.plugin, note.file)));
				}
				if (literatureMissingSource.length > 20) {
					content.createEl("p", {text: "仅显示前 20 条。"});
				}
			}
		}

		const duplicateIdsPanel = panels.createEl("details", {cls: "zk-dashboard-panel"});
		panelEls["duplicate-ids"] = duplicateIdsPanel;
		duplicateIdsPanel.createEl("summary", {
			text: `${getZkFieldLabel("id")}冲突：${duplicateIdGroups.length} 组`,
		});
		duplicateIdsPanel.open = this.activePanel === "duplicate-ids";
		{
			const content = duplicateIdsPanel.createDiv({cls: "zk-dashboard-panelBody"});
			content.createEl("p", {text: `同一${getZkFieldLabel("id")}被多个文件使用会影响链式组织与召回。`});

			if (duplicateIdGroups.length === 0) {
				content.createEl("p", {text: "没有发现问题。"});
			} else {
				for (const group of duplicateIdGroups.slice(0, 20)) {
					const groupEl = content.createEl("details");
					groupEl.createEl("summary", {text: `${getZkFieldLabel("id")}：${group.zkId}（${group.files.length}）`});
					for (const file of group.files) {
						new Setting(groupEl)
							.setName(file.basename)
							.setDesc(file.path)
							.addButton((btn) => btn.setButtonText("打开").onClick(() => openFile(this.plugin, file)));
					}
				}
				if (duplicateIdGroups.length > 20) {
					content.createEl("p", {text: "仅显示前 20 组。"});
				}
			}
		}

		if (this.activePanel) {
			const target = panelEls[this.activePanel];
			if (target) {
				window.requestAnimationFrame(() => {
					target.scrollIntoView({block: "start"});
				});
			}
		}
	}
}
