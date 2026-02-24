import {Modal, Notice, Setting, TFile} from "obsidian";
import type ZkWorkflowWizardPlugin from "../main";
import {t} from "../i18n";
import {setZkStatus} from "../services/zk-frontmatter";
import {getZkFieldLabel, getZkStatusLabel, getZkTypeLabel} from "../utils/zk-labels";
import {ProcessWizardModal} from "./process-wizard-modal";

export class InboxModal extends Modal {
	constructor(private readonly plugin: ZkWorkflowWizardPlugin) {
		super(plugin.app);
	}

	onOpen() {
		void this.render();
	}

	onClose() {
		this.contentEl.empty();
	}

	private async render() {
		this.contentEl.empty();

		const header = this.contentEl.createDiv({cls: "zk-inbox-header"});
		header.createEl("h2", {text: getZkStatusLabel("inbox")});
		new Setting(header).addButton((btn) =>
			btn.setButtonText(t("common.refresh")).onClick(() => {
				void this.render();
			}),
		);

		const index = await this.plugin.getIndex();
		const inbox = index.getInboxItems();

		this.contentEl.createEl("p", {
			text: t("modals.inbox.statusLine", {
				field: getZkFieldLabel("status"),
				value: getZkStatusLabel("inbox"),
			}),
		});
		this.contentEl.createEl("p", {text: t("modals.inbox.pendingLine", {count: inbox.length})});

		if (inbox.length === 0) {
			this.contentEl.createEl("p", {
				text: t("modals.inbox.emptyState", {
					inbox: getZkStatusLabel("inbox"),
					fleeting: getZkTypeLabel("fleeting"),
					literature: getZkTypeLabel("literature"),
				}),
			});
			return;
		}

		for (const item of inbox) {
			const file = item.file;
			const typeLabel = getZkTypeLabel(item.zkType);
			const source = item.zkSource
				? t("modals.inbox.itemSource", {
						sourceField: getZkFieldLabel("source"),
						source: item.zkSource,
					})
				: "";

			new Setting(this.contentEl)
				.setName(file.basename)
				.setDesc(
					t("modals.inbox.itemDesc", {typeField: getZkFieldLabel("type"), typeLabel, source}),
				)
				.addButton((btn) =>
					btn.setButtonText(t("common.open")).onClick(() => {
						void this.openFile(file);
					}),
				)
				.addButton((btn) =>
					btn.setButtonText(t("common.process")).onClick(() => {
						this.close();
						new ProcessWizardModal(this.plugin, file).open();
					}),
				)
				.addButton((btn) =>
					btn.setButtonText(t("modals.inbox.archiveButton")).onClick(() => {
						void this.archiveFile(file);
					}),
				);
		}
	}

	private async openFile(file: TFile) {
		await this.plugin.app.workspace.getLeaf(false).openFile(file);
		this.close();
	}

	private async archiveFile(file: TFile) {
		try {
			await setZkStatus(this.plugin, file, "archived");
			new Notice(
				t("notices.fieldUpdated", {
					field: getZkFieldLabel("status"),
					value: getZkStatusLabel("archived"),
				}),
			);
			void this.render();
		} catch (error) {
			console.error(error);
			new Notice(t("notices.archiveFailed"));
		}
	}
}
