import {Modal, Notice, Setting, TFile} from "obsidian";
import type ZkWorkflowWizardPlugin from "../main";
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
		this.contentEl.createEl("h2", {text: `分配${getZkFieldLabel("id")}`});
		this.contentEl.createEl("p", {text: `目标：${this.file.basename}`});

		const index = await this.plugin.getIndex();
		const current = index.getNote(this.file);
		const currentZkId = current?.zkId ?? "";
		if (!this.zkId) this.zkId = currentZkId;

		const conflictFiles = this.zkId.trim()
			? index.getZkIdConflicts(this.zkId.trim(), this.file.path)
			: [];

		new Setting(this.contentEl)
			.setName("生成方式")
			.setDesc("选择创建新链，或基于某条锚点卡片生成后继/分支 ID。")
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
			.setName("卡片 ID（zk_id，可编辑）")
			.setDesc(
				conflictFiles.length > 0
					? `冲突：${conflictFiles.map((f) => f.path).join(", ")}`
					: "写入 frontmatter 的 zk_id 字段。",
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
					.setButtonText("写入")
					.setCta()
					.onClick(() => {
						void this.apply();
					}),
			)
			.addButton((btn) => btn.setButtonText("取消").onClick(() => this.close()));
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
						new Notice(`所选锚点没有${getZkFieldLabel("id")}。`);
						return;
					}
				this.zkId = generateZkIdAfterAnchor(anchorId, index, this.file.path);
				void this.render();
			},
				{
					placeholder: "选择锚点卡片（已有 zk_id）…",
					emptyStateText: "没有可用的锚点卡片（zk_id）",
				},
			).open();
	}

		private async apply() {
			const index = await this.plugin.getIndex();
			const desired = this.zkId.trim();
			if (!desired) {
				new Notice("卡片 ID（zk_id）不能为空。");
				return;
			}

			const conflicts = index.getZkIdConflicts(desired, this.file.path);
			if (conflicts.length > 0) {
				const first = conflicts[0];
				new Notice(`卡片 ID（zk_id）冲突：${first ? first.path : "未知"}`);
				return;
			}

		try {
				await assignZkId(this.plugin, this.file, desired);
				index.refreshFile(this.file);
				new Notice("已写入卡片 ID（zk_id）。");
				this.close();
			} catch (error) {
				console.error(error);
			new Notice("写入失败，请查看控制台。");
		}
	}
}
