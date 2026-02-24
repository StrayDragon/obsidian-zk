import {ItemView, Setting, TFile, type WorkspaceLeaf} from "obsidian";
import type ZkWorkflowWizardPlugin from "../main";
import {t} from "../i18n";
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
		return t("commands.openDashboard");
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
		header.createEl("h2", {text: t("commands.openDashboard")});
		const headerRight = header.createDiv({cls: "zk-dashboard-headerRight"});
		const updatedText = t("views.dashboard.updatedAt", {time: new Date().toLocaleTimeString()});
		headerRight.createDiv({
			cls: "zk-dashboard-updated",
			text: updatedText,
		});
		const refreshButton = headerRight.createEl("button", {
			cls: "zk-dashboard-btn",
			text: t("common.refresh"),
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
		headline.createEl("div", {text: t("views.dashboard.notesCount", {count: zkNotes.length})});

		const quick = this.contentEl.createDiv({cls: "zk-dashboard-actions"});
		new Setting(quick)
			.setName(t("views.dashboard.quickActions"))
			.addButton((btn) =>
				btn
					.setButtonText(t("views.dashboard.action.openInbox", {inbox: getZkStatusLabel("inbox")}))
					.onClick(() => {
						new InboxModal(this.plugin).open();
					}),
			)
			.addButton((btn) =>
				btn
					.setButtonText(t("views.dashboard.action.processNext", {inbox: getZkStatusLabel("inbox")}))
					.onClick(() => {
						const first = index.getInboxItems()[0]?.file;
						if (!first) return;
						new ProcessWizardModal(this.plugin, first).open();
					}),
			)
			.addButton((btn) =>
				btn
					.setButtonText(
						t("views.dashboard.action.processCurrent", {permanent: getZkTypeLabel("permanent")}),
					)
					.onClick(() => {
						const file = this.plugin.app.workspace.getActiveFile();
						if (!file) return;
						new ProcessWizardModal(this.plugin, file).open();
					}),
			);

		this.contentEl.createEl("h3", {text: t("views.dashboard.section.stats")});

		const statsGrid = this.contentEl.createDiv({cls: "zk-dashboard-grid"});
		this.createCard(statsGrid, {
			title: getZkStatusLabel("inbox"),
			value: String(byStatus.inbox ?? 0),
			subtitle: t("views.dashboard.subtitle.clickToViewList"),
			onClick: () => this.showPanel("inbox"),
		});
		this.createCard(statsGrid, {title: getZkTypeLabel("permanent"), value: String(byType.permanent ?? 0)});
		this.createCard(statsGrid, {title: getZkTypeLabel("literature"), value: String(byType.literature ?? 0)});
		this.createCard(statsGrid, {title: getZkTypeLabel("fleeting"), value: String(byType.fleeting ?? 0)});
		this.createCard(statsGrid, {title: getZkStatusLabel("archived"), value: String(byStatus.archived ?? 0)});

		this.contentEl.createEl("h3", {text: t("views.dashboard.section.health")});

		const healthGrid = this.contentEl.createDiv({cls: "zk-dashboard-grid"});
		this.createCard(healthGrid, {
			title: t("views.dashboard.health.missingId.title", {
				permanent: getZkTypeLabel("permanent"),
				idField: getZkFieldLabel("id"),
			}),
			value: String(permanentMissingId.length),
			subtitle: t("views.dashboard.subtitle.clickToViewList"),
			mod: permanentMissingId.length > 0 ? "warning" : undefined,
			onClick: () => this.showPanel("missing-id"),
		});
		this.createCard(healthGrid, {
			title: t("views.dashboard.health.missingSource.title", {
				literature: getZkTypeLabel("literature"),
				sourceField: getZkFieldLabel("source"),
			}),
			value: String(literatureMissingSource.length),
			subtitle: t("views.dashboard.subtitle.clickToViewList"),
			mod: literatureMissingSource.length > 0 ? "warning" : undefined,
			onClick: () => this.showPanel("missing-source"),
		});
		this.createCard(healthGrid, {
			title: t("views.dashboard.health.duplicateIds.title", {idField: getZkFieldLabel("id")}),
			value: String(duplicateIdGroups.length),
			subtitle: t("views.dashboard.subtitle.clickToViewConflicts"),
			mod: duplicateIdGroups.length > 0 ? "danger" : undefined,
			onClick: () => this.showPanel("duplicate-ids"),
		});

		this.contentEl.createEl("h3", {text: t("views.dashboard.section.lists")});

		const panels = this.contentEl.createDiv({cls: "zk-dashboard-panels"});
		const panelEls: Partial<Record<ZkDashboardPanel, HTMLDetailsElement>> = {};

		const inboxPanel = panels.createEl("details", {cls: "zk-dashboard-panel"});
		panelEls["inbox"] = inboxPanel;
		inboxPanel.createEl("summary", {
			text: t("views.dashboard.panel.inbox.summary", {
				inbox: getZkStatusLabel("inbox"),
				count: byStatus.inbox ?? 0,
			}),
		});
		inboxPanel.open = this.activePanel === "inbox";
		{
			const content = inboxPanel.createDiv({cls: "zk-dashboard-panelBody"});
			const inboxItems = index.getInboxItems();
			if (inboxItems.length === 0) {
				content.createEl("p", {
					text: t("notices.queueEmpty", {queue: getZkStatusLabel("inbox")}),
				});
			} else {
				for (const note of inboxItems.slice(0, 20)) {
					new Setting(content)
						.setName(note.file.basename)
						.setDesc(note.file.path)
						.addButton((btn) =>
							btn.setButtonText(t("common.open")).onClick(() => openFile(this.plugin, note.file)),
						)
						.addButton((btn) =>
							btn
								.setButtonText(t("common.process"))
								.onClick(() => new ProcessWizardModal(this.plugin, note.file).open()),
						);
				}
				if (inboxItems.length > 20) {
					content.createEl("p", {text: t("views.dashboard.panel.showingFirstItems", {count: 20})});
				}
			}
			new Setting(content).addButton((btn) =>
				btn
					.setButtonText(t("views.dashboard.action.openInbox", {inbox: getZkStatusLabel("inbox")}))
					.onClick(() => new InboxModal(this.plugin).open()),
			);
		}

		const missingIdPanel = panels.createEl("details", {cls: "zk-dashboard-panel"});
		panelEls["missing-id"] = missingIdPanel;
		missingIdPanel.createEl("summary", {
			text: t("views.dashboard.panel.missingId.summary", {
				permanent: getZkTypeLabel("permanent"),
				idField: getZkFieldLabel("id"),
				count: permanentMissingId.length,
			}),
		});
		missingIdPanel.open = this.activePanel === "missing-id";
		{
			const content = missingIdPanel.createDiv({cls: "zk-dashboard-panelBody"});
			content.createEl("p", {
				text: t("views.dashboard.panel.missingId.tip", {idField: getZkFieldLabel("id")}),
			});

			if (permanentMissingId.length === 0) {
				content.createEl("p", {text: t("views.dashboard.noIssues")});
			} else {
				for (const note of permanentMissingId.slice(0, 20)) {
					new Setting(content)
						.setName(note.file.basename)
						.setDesc(note.file.path)
						.addButton((btn) =>
							btn.setButtonText(t("common.open")).onClick(() => openFile(this.plugin, note.file)),
						)
						.addButton((btn) =>
							btn
								.setButtonText(t("common.assign"))
								.onClick(() => new AssignZkIdModal(this.plugin, note.file).open()),
						);
				}
				if (permanentMissingId.length > 20) {
					content.createEl("p", {text: t("views.dashboard.panel.showingFirstItems", {count: 20})});
				}
			}
		}

		const missingSourcePanel = panels.createEl("details", {cls: "zk-dashboard-panel"});
		panelEls["missing-source"] = missingSourcePanel;
		missingSourcePanel.createEl("summary", {
			text: t("views.dashboard.panel.missingSource.summary", {
				literature: getZkTypeLabel("literature"),
				sourceField: getZkFieldLabel("source"),
				count: literatureMissingSource.length,
			}),
		});
		missingSourcePanel.open = this.activePanel === "missing-source";
		{
			const content = missingSourcePanel.createDiv({cls: "zk-dashboard-panelBody"});
			content.createEl("p", {
				text: t("views.dashboard.panel.missingSource.tip", {
					literature: getZkTypeLabel("literature"),
					sourceField: getZkFieldLabel("source"),
				}),
			});

			if (literatureMissingSource.length === 0) {
				content.createEl("p", {text: t("views.dashboard.noIssues")});
			} else {
				for (const note of literatureMissingSource.slice(0, 20)) {
					new Setting(content)
						.setName(note.file.basename)
						.setDesc(note.file.path)
						.addButton((btn) =>
							btn.setButtonText(t("common.open")).onClick(() => openFile(this.plugin, note.file)),
						);
				}
				if (literatureMissingSource.length > 20) {
					content.createEl("p", {text: t("views.dashboard.panel.showingFirstItems", {count: 20})});
				}
			}
		}

		const duplicateIdsPanel = panels.createEl("details", {cls: "zk-dashboard-panel"});
		panelEls["duplicate-ids"] = duplicateIdsPanel;
		duplicateIdsPanel.createEl("summary", {
			text: t("views.dashboard.panel.duplicateIds.summary", {
				idField: getZkFieldLabel("id"),
				count: duplicateIdGroups.length,
			}),
		});
		duplicateIdsPanel.open = this.activePanel === "duplicate-ids";
		{
			const content = duplicateIdsPanel.createDiv({cls: "zk-dashboard-panelBody"});
			content.createEl("p", {
				text: t("views.dashboard.panel.duplicateIds.tip", {idField: getZkFieldLabel("id")}),
			});

			if (duplicateIdGroups.length === 0) {
				content.createEl("p", {text: t("views.dashboard.noIssues")});
			} else {
				for (const group of duplicateIdGroups.slice(0, 20)) {
					const groupEl = content.createEl("details");
					groupEl.createEl("summary", {
						text: t("views.dashboard.panel.duplicateIds.groupSummary", {
							idField: getZkFieldLabel("id"),
							zkId: group.zkId,
							count: group.files.length,
						}),
					});
					for (const file of group.files) {
						new Setting(groupEl)
							.setName(file.basename)
							.setDesc(file.path)
							.addButton((btn) =>
								btn.setButtonText(t("common.open")).onClick(() => openFile(this.plugin, file)),
							);
					}
				}
				if (duplicateIdGroups.length > 20) {
					content.createEl("p", {text: t("views.dashboard.panel.showingFirstGroups", {count: 20})});
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
