import {Modal, Notice, Setting, TFile} from "obsidian";
import type ZkWorkflowWizardPlugin from "../main";
import {generateTopLevelZkId, generateZkIdAfterAnchor} from "../services/zk-id";
import {promoteToPermanent, setZkStatus} from "../services/zk-frontmatter";
import {upsertRelatedLinksSection} from "../services/related-links";
import {FileSuggestModal} from "./suggest/file-suggest-modal";

function getTypeLabel(type?: string): string {
	switch (type) {
		case "fleeting":
			return "闪念";
		case "literature":
			return "文献";
		case "permanent":
			return "永久";
		default:
			return "未标记";
	}
}

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
		this.contentEl.createEl("h2", {text: "处理向导"});
		this.contentEl.createEl("p", {text: `目标：${this.file.basename}`});

		const index = await this.plugin.getIndex();
		const note = index.getNote(this.file);

		const typeLabel = getTypeLabel(note?.zkType);
		const status = note?.zkStatus ?? "未标记";
		this.contentEl.createEl("p", {text: `类型：${typeLabel}；状态：${status}`});

		if (note?.zkStatus !== "inbox") {
			this.contentEl.createEl("p", {
				text: "提示：当前文件未标记为收集箱（inbox）笔记。你仍然可以将其标记为 inbox 后再继续。",
			});
			new Setting(this.contentEl).addButton((btn) =>
				btn.setButtonText("标记为 inbox").onClick(() => {
					void this.markAsInbox();
				}),
			);
		}

		this.contentEl.createEl("h3", {text: "1) 分配卡片 ID"});

		const currentZkId = note?.zkId ?? "";
		if (!this.zkId) this.zkId = currentZkId;

		const conflicts = this.zkId.trim()
			? index.getZkIdConflicts(this.zkId.trim(), this.file.path)
			: [];

		new Setting(this.contentEl)
			.setName("生成方式")
			.setDesc("建议：新链用于开启一个新论证链；选锚点用于接续/分支已有讨论。")
			.addButton((btn) =>
				btn.setButtonText("新链").onClick(() => {
					this.anchorFile = undefined;
					this.zkId = generateTopLevelZkId(index, this.file.path);
					void this.render();
				}),
			)
			.addButton((btn) =>
				btn.setButtonText("选锚点…").onClick(() => {
					void this.pickAnchor();
				}),
			);

		new Setting(this.contentEl)
			.setName("卡片 ID（可编辑）")
			.setDesc(
				conflicts.length > 0
					? `冲突：${conflicts.map((f) => f.path).join(", ")}`
					: "将写入 frontmatter 的卡片 ID 字段（不会写入标题/正文）。",
			)
			.addText((text) =>
				text.setValue(this.zkId).onChange((value) => {
					this.zkId = value;
					void this.render();
				}),
			);

		this.contentEl.createEl("h3", {text: "2) 选择相关卡片（写入到“## 关联”）"});

		if (this.relatedFilesByPath.size > 0) {
			this.contentEl.createEl("p", {text: "已选择："});
			for (const related of this.relatedFilesByPath.values()) {
				new Setting(this.contentEl)
					.setName(related.basename)
					.setDesc(related.path)
					.addButton((btn) =>
						btn.setButtonText("移除").onClick(() => {
							this.relatedFilesByPath.delete(related.path);
							void this.render();
						}),
					);
			}
		}

		new Setting(this.contentEl)
			.setName("添加相关卡片")
			.setDesc("你可以从建议添加，或搜索任意笔记。")
			.addButton((btn) =>
				btn.setButtonText("搜索添加…").onClick(() => {
					void this.pickRelatedFile();
				}),
			);

		const suggestions = index
			.getRelatedSuggestions(this.file, this.plugin.settings.suggestionsLimit)
			.filter((s) => !this.relatedFilesByPath.has(s.file.path));

		if (suggestions.length > 0) {
			this.contentEl.createEl("p", {text: "建议（可解释）："});
			for (const suggestion of suggestions) {
				new Setting(this.contentEl)
					.setName(suggestion.file.basename)
					.setDesc(suggestion.reason)
					.addButton((btn) =>
						btn.setButtonText("添加").onClick(() => {
							this.relatedFilesByPath.set(suggestion.file.path, suggestion.file);
							void this.render();
						}),
					);
			}
		}

		this.contentEl.createEl("h3", {text: "3) 完成升级"});
		this.contentEl.createEl("p", {
			text: "插件不会替你改写正文内容；只会写入 frontmatter（zk_* 字段）与维护“## 关联”链接段。",
		});

		const canFinalize = this.zkId.trim() !== "" && conflicts.length === 0;

		const footer = this.contentEl.createDiv({cls: "zk-modal-footer"});
		new Setting(footer)
			.addButton((btn) =>
				btn
					.setButtonText("完成升级")
					.setCta()
					.setDisabled(!canFinalize)
					.onClick(() => {
						void this.finalize();
					}),
			)
			.addButton((btn) => btn.setButtonText("取消").onClick(() => this.close()));
	}

	private async markAsInbox() {
		try {
			await setZkStatus(this.plugin, this.file, "inbox");
			const index = await this.plugin.getIndex();
			index.refreshFile(this.file);
			new Notice("已标记为 inbox。");
			void this.render();
		} catch (error) {
			console.error(error);
			new Notice("写入失败，请查看控制台。");
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
						new Notice("所选锚点没有卡片 ID。");
						return;
					}
					this.zkId = generateZkIdAfterAnchor(anchorId, index, this.file.path);
					void this.render();
				},
				{
					placeholder: "选择锚点卡片（已有卡片 ID）…",
					emptyStateText: "没有可用的锚点卡片",
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
				placeholder: "搜索要关联的卡片…",
			},
		).open();
	}

	private async finalize() {
		const index = await this.plugin.getIndex();
		const desiredId = this.zkId.trim();

		if (!desiredId) {
			new Notice("卡片 ID 不能为空。");
			return;
		}

		const conflicts = index.getZkIdConflicts(desiredId, this.file.path);
		if (conflicts.length > 0) {
			const first = conflicts[0];
			new Notice(`卡片 ID 冲突：${first ? first.path : "未知"}`);
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
			new Notice("已升级为永久笔记。");
			this.close();
		} catch (error) {
			console.error(error);
			new Notice("处理失败，请查看控制台。");
		}
	}
}
