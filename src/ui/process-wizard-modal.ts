import {Modal, Notice, Setting, TFile} from "obsidian";
import type ZkWorkflowWizardPlugin from "../main";
import {t} from "../i18n";
import {generateTopLevelZkId, generateZkIdAfterAnchor} from "../services/zk-id";
import {promoteToPermanent, setZkStatus} from "../services/zk-frontmatter";
import {upsertRelatedLinksSection} from "../services/related-links";
import {getZkFieldLabel, getZkStatusLabel, getZkTypeLabel} from "../utils/zk-labels";
import {FileSuggestModal} from "./suggest/file-suggest-modal";

export class ProcessWizardModal extends Modal {
	private anchorFile?: TFile;
	private zkId = "";
	private readonly relatedFilesByPath = new Map<string, TFile>();

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
		this.contentEl.createEl("h2", {text: t("modals.processWizard.title")});
		this.contentEl.createEl("p", {text: t("modals.processWizard.target", {filename: this.file.basename})});

		const index = await this.plugin.getIndex();
		const note = index.getNote(this.file);

		const typeLabel = getZkTypeLabel(note?.zkType);
		const statusLabel = getZkStatusLabel(note?.zkStatus);
		this.contentEl.createEl("p", {
			text: t("modals.processWizard.typeStatusLine", {
				typeField: getZkFieldLabel("type"),
				typeLabel,
				statusField: getZkFieldLabel("status"),
				statusLabel,
			}),
		});

		if (note?.zkStatus !== "inbox") {
			this.contentEl.createEl("p", {
				text: t("modals.processWizard.notInboxTip", {
					statusField: getZkFieldLabel("status"),
					inboxStatus: getZkStatusLabel("inbox"),
				}),
			});
			new Setting(this.contentEl).addButton((btn) =>
				btn
					.setButtonText(
						t("modals.processWizard.markAsInboxButton", {inboxStatus: getZkStatusLabel("inbox")}),
					)
					.onClick(() => {
					void this.markAsInbox();
				}),
			);
		}

		this.contentEl.createEl("h3", {
			text: t("modals.processWizard.step1Title", {fieldId: getZkFieldLabel("id")}),
		});

		const currentZkId = note?.zkId ?? "";
		if (!this.zkId) this.zkId = currentZkId;

		const conflicts = this.zkId.trim()
			? index.getZkIdConflicts(this.zkId.trim(), this.file.path)
			: [];

		new Setting(this.contentEl)
			.setName(t("modals.processWizard.method.name"))
			.setDesc(t("modals.processWizard.method.desc"))
			.addButton((btn) =>
				btn.setButtonText(t("modals.processWizard.method.newChain")).onClick(() => {
					this.anchorFile = undefined;
					this.zkId = generateTopLevelZkId(index, this.file.path);
					void this.render();
				}),
			)
			.addButton((btn) =>
				btn.setButtonText(t("modals.processWizard.method.pickAnchor")).onClick(() => {
					void this.pickAnchor();
				}),
			);

		new Setting(this.contentEl)
			.setName(t("modals.assignZkId.idInput.name"))
			.setDesc(
				conflicts.length > 0
					? t("modals.processWizard.idInput.conflict", {
							paths: conflicts.map((f) => f.path).join(", "),
						})
					: t("modals.processWizard.idInput.desc"),
			)
			.addText((text) =>
				text.setValue(this.zkId).onChange((value) => {
					this.zkId = value;
					void this.render();
				}),
			);

		this.contentEl.createEl("h3", {
			text: t("modals.processWizard.step2Title", {heading: this.plugin.settings.relatedSectionHeading}),
		});

		if (this.relatedFilesByPath.size > 0) {
			this.contentEl.createEl("p", {text: t("modals.processWizard.selectedHeading")});
			for (const related of this.relatedFilesByPath.values()) {
				new Setting(this.contentEl)
					.setName(related.basename)
					.setDesc(related.path)
					.addButton((btn) =>
						btn.setButtonText(t("common.remove")).onClick(() => {
							this.relatedFilesByPath.delete(related.path);
							void this.render();
						}),
					);
			}
		}

		new Setting(this.contentEl)
			.setName(t("modals.processWizard.addRelated.name"))
			.setDesc(t("modals.processWizard.addRelated.desc"))
			.addButton((btn) =>
				btn.setButtonText(t("modals.processWizard.addRelated.searchButton")).onClick(() => {
					void this.pickRelatedFile();
				}),
			);

		const suggestions = index
			.getRelatedSuggestions(this.file, this.plugin.settings.suggestionsLimit)
			.filter((s) => !this.relatedFilesByPath.has(s.file.path));

		if (suggestions.length > 0) {
			this.contentEl.createEl("p", {text: t("modals.processWizard.suggestionsHeading")});
			for (const suggestion of suggestions) {
				new Setting(this.contentEl)
					.setName(suggestion.file.basename)
					.setDesc(suggestion.reason)
					.addButton((btn) =>
						btn.setButtonText(t("common.add")).onClick(() => {
							this.relatedFilesByPath.set(suggestion.file.path, suggestion.file);
							void this.render();
						}),
					);
			}
		}

		this.contentEl.createEl("h3", {text: t("modals.processWizard.step3Title")});
		this.contentEl.createEl("p", {
			text: t("modals.processWizard.step3Desc", {heading: this.plugin.settings.relatedSectionHeading}),
		});

		const canFinalize = this.zkId.trim() !== "" && conflicts.length === 0;

		const footer = this.contentEl.createDiv({cls: "zk-modal-footer"});
		new Setting(footer)
			.addButton((btn) =>
				btn
					.setButtonText(t("modals.processWizard.finalizeButton"))
					.setCta()
					.setDisabled(!canFinalize)
					.onClick(() => {
						void this.finalize();
					}),
			)
			.addButton((btn) => btn.setButtonText(t("common.cancel")).onClick(() => this.close()));
	}

	private async markAsInbox() {
		try {
			await setZkStatus(this.plugin, this.file, "inbox");
			const index = await this.plugin.getIndex();
			index.refreshFile(this.file);
			new Notice(
				t("notices.fieldUpdated", {
					field: getZkFieldLabel("status"),
					value: getZkStatusLabel("inbox"),
				}),
			);
			void this.render();
		} catch (error) {
			console.error(error);
			new Notice(t("notices.writeFailed"));
		}
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

	private async pickRelatedFile() {
		const items = this.plugin.app.vault
			.getMarkdownFiles()
			.filter((f) => f.path !== this.file.path && !this.relatedFilesByPath.has(f.path));

		new FileSuggestModal(
			this.plugin.app,
			items,
			(file) => {
				this.relatedFilesByPath.set(file.path, file);
				void this.render();
			},
			{
				placeholder: t("modals.processWizard.pickRelated.placeholder"),
			},
		).open();
	}

	private async finalize() {
		const index = await this.plugin.getIndex();
		const desiredId = this.zkId.trim();

		if (!desiredId) {
			new Notice(t("notices.fieldRequired", {field: getZkFieldLabel("id")}));
			return;
		}

		const conflicts = index.getZkIdConflicts(desiredId, this.file.path);
		if (conflicts.length > 0) {
			const first = conflicts[0];
			new Notice(
				t("notices.zkIdConflict", {path: first ? first.path : t("common.unknown")}),
			);
			return;
		}

		try {
			await promoteToPermanent(this.plugin, this.file, desiredId);

			const related = [...this.relatedFilesByPath.values()];
			await upsertRelatedLinksSection(
				this.plugin.app,
				this.file,
				related,
				this.plugin.settings.relatedSectionHeading,
			);

			index.refreshFile(this.file);
			new Notice(
				t("notices.promotedToPermanent", {
					permanent: getZkTypeLabel("permanent"),
					statusField: getZkFieldLabel("status"),
					done: getZkStatusLabel("done"),
				}),
			);
			this.close();
		} catch (error) {
			console.error(error);
			new Notice(t("notices.operationFailed"));
		}
	}
}
