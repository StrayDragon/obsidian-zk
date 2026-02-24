import {Modal, Notice, Setting, TFile} from "obsidian";
import type ZkWorkflowWizardPlugin from "../main";
import {t} from "../i18n";
import {generateTopLevelZkId, generateZkIdAfterAnchor} from "../services/zk-id";
import {assignZkId} from "../services/zk-frontmatter";
import {getZkFieldLabel} from "../utils/zk-labels";
import {FileSuggestModal} from "./suggest/file-suggest-modal";

export class AssignZkIdModal extends Modal {
	private anchorFile?: TFile;
	private zkId = "";

	constructor(
		private readonly plugin: ZkWorkflowWizardPlugin,
		private readonly file: TFile,
	) {
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
		this.contentEl.createEl("h2", {
			text: t("modals.assignZkId.title", {fieldId: getZkFieldLabel("id")}),
		});
		this.contentEl.createEl("p", {
			text: t("modals.assignZkId.target", {filename: this.file.basename}),
		});

		const index = await this.plugin.getIndex();
		const current = index.getNote(this.file);
		const currentZkId = current?.zkId ?? "";
		if (!this.zkId) this.zkId = currentZkId;

		const conflictFiles = this.zkId.trim()
			? index.getZkIdConflicts(this.zkId.trim(), this.file.path)
			: [];

		new Setting(this.contentEl)
			.setName(t("modals.assignZkId.method.name"))
			.setDesc(t("modals.assignZkId.method.desc"))
			.addButton((btn) =>
				btn.setButtonText(t("modals.assignZkId.method.newChain")).onClick(() => {
					this.anchorFile = undefined;
					this.zkId = generateTopLevelZkId(index, this.file.path);
					void this.render();
				}),
			)
			.addButton((btn) =>
				btn.setButtonText(t("modals.assignZkId.method.pickAnchor")).onClick(() => {
					void this.pickAnchor();
				}),
			);

		new Setting(this.contentEl)
			.setName(t("modals.assignZkId.idInput.name"))
			.setDesc(
				conflictFiles.length > 0
					? t("modals.assignZkId.idInput.conflict", {
							paths: conflictFiles.map((f) => f.path).join(", "),
						})
					: t("modals.assignZkId.idInput.desc"),
			)
			.addText((text) =>
				text.setValue(this.zkId).onChange((value) => {
					this.zkId = value;
					void this.render();
				}),
			);

		const footer = this.contentEl.createDiv({cls: "zk-modal-footer"});
		new Setting(footer)
			.addButton((btn) =>
				btn
					.setButtonText(t("modals.assignZkId.writeButton"))
					.setCta()
					.onClick(() => {
						void this.apply();
					}),
			)
			.addButton((btn) => btn.setButtonText(t("common.cancel")).onClick(() => this.close()));
	}

	private async pickAnchor() {
		const index = await this.plugin.getIndex();
		const items = index
			.getNotesWithZkId()
			.map((n) => n.file)
			.filter((f) => f.path !== this.file.path);

		new FileSuggestModal(
			this.plugin.app,
			items,
			(file) => {
				this.anchorFile = file;
				const anchorId = index.getNote(file)?.zkId;
				if (!anchorId) {
					new Notice(t("notices.anchorMissingId", {fieldId: getZkFieldLabel("id")}));
					return;
				}
				this.zkId = generateZkIdAfterAnchor(anchorId, index, this.file.path);
				void this.render();
			},
			{
				placeholder: t("modals.assignZkId.pickAnchor.placeholder"),
				emptyStateText: t("modals.assignZkId.pickAnchor.empty"),
			},
		).open();
	}

	private async apply() {
		const index = await this.plugin.getIndex();
		const desired = this.zkId.trim();
		if (!desired) {
			new Notice(t("notices.fieldRequired", {field: getZkFieldLabel("id")}));
			return;
		}

		const conflicts = index.getZkIdConflicts(desired, this.file.path);
		if (conflicts.length > 0) {
			const first = conflicts[0];
			new Notice(
				t("notices.zkIdConflict", {
					path: first ? first.path : t("common.unknown"),
				}),
			);
			return;
		}

		try {
			await assignZkId(this.plugin, this.file, desired);
			index.refreshFile(this.file);
			new Notice(t("notices.zkIdWritten", {fieldId: getZkFieldLabel("id")}));
			this.close();
		} catch (error) {
			console.error(error);
			new Notice(t("notices.writeFailed"));
		}
	}
}
