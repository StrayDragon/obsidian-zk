import {Modal, Notice, Setting, TFile} from "obsidian";
import type ZkWorkflowWizardPlugin from "../main";
import {setZkStatus} from "../services/zk-frontmatter";
import {ProcessWizardModal} from "./process-wizard-modal";

function getTypeLabel(type?: string): string {
	switch (type) {
		case "fleeting":
			return "闪念";
		case "literature":
			return "文献";
		case "permanent":
			return "永久";
		case "index":
			return "索引";
		case "project":
			return "项目";
		default:
			return "未标记";
	}
}

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
		header.createEl("h2", {text: "收集箱"});
		new Setting(header).addButton((btn) =>
			btn.setButtonText("刷新").onClick(() => {
				void this.render();
			}),
		);

		const index = await this.plugin.getIndex();
		const inbox = index.getInboxItems();

		this.contentEl.createEl("p", {text: `待处理：${inbox.length} 条`});

		if (inbox.length === 0) {
			this.contentEl.createEl("p", {text: "收集箱为空。请先新建一条闪念或文献笔记。"});
			return;
		}

		for (const item of inbox) {
			const file = item.file;
			const typeLabel = getTypeLabel(item.zkType);
			const source = item.zkSource ? `；来源：${item.zkSource}` : "";

			new Setting(this.contentEl)
				.setName(file.basename)
				.setDesc(`类型：${typeLabel}${source}`)
				.addButton((btn) =>
					btn.setButtonText("打开").onClick(() => {
						void this.openFile(file);
					}),
				)
				.addButton((btn) =>
					btn.setButtonText("处理").onClick(() => {
						this.close();
						new ProcessWizardModal(this.plugin, file).open();
					}),
				)
				.addButton((btn) =>
					btn.setButtonText("归档").onClick(() => {
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
			new Notice("已归档。");
			void this.render();
		} catch (error) {
			console.error(error);
			new Notice("归档失败，请查看控制台。");
		}
	}
}
