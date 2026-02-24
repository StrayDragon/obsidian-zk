import {App, PluginSettingTab, Setting} from "obsidian";
import ZkWorkflowWizardPlugin from "./main";
import {getZkFieldLabel, getZkStatusLabel, getZkTypeLabel} from "./utils/zk-labels";

export interface ZkPluginSettings {
	relatedSectionHeading: string;
	writeZkTags: boolean;
	suggestionsLimit: number;
}

export const DEFAULT_SETTINGS: ZkPluginSettings = {
	relatedSectionHeading: "关联",
	writeZkTags: false,
	suggestionsLimit: 20,
};

export class ZkSettingTab extends PluginSettingTab {
	plugin: ZkWorkflowWizardPlugin;

	constructor(app: App, plugin: ZkWorkflowWizardPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;
		containerEl.empty();

		new Setting(containerEl).setName("工作流设置").setHeading();

		new Setting(containerEl)
			.setName("关联章节标题")
			.setDesc("插件会把相关双向链接写入该标题下，例如“## 关联”。")
			.addText((text) =>
				text
					.setPlaceholder(DEFAULT_SETTINGS.relatedSectionHeading)
					.setValue(this.plugin.settings.relatedSectionHeading)
					.onChange(async (value) => {
						this.plugin.settings.relatedSectionHeading =
							value.trim() || DEFAULT_SETTINGS.relatedSectionHeading;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("写入 zk/* 标签")
			.setDesc(
				`启用后创建/处理笔记时会写入辅助标签（例如 #zk/inbox 对应 ${getZkFieldLabel("status")} = ${getZkStatusLabel("inbox")}；#zk/permanent 对应 ${getZkFieldLabel("type")} = ${getZkTypeLabel("permanent")}）。`,
			)
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.writeZkTags).onChange(async (value) => {
					this.plugin.settings.writeZkTags = value;
					await this.plugin.saveSettings();
				}),
			);

		new Setting(containerEl)
			.setName("候选建议数量上限")
			.setDesc("相关卡片建议的最大条数（建议 10–50）。")
				.addText((text) =>
					text.setValue(String(this.plugin.settings.suggestionsLimit)).onChange(async (value) => {
						const asNumber = Number.parseInt(value, 10);
						this.plugin.settings.suggestionsLimit = Number.isFinite(asNumber)
						? Math.max(1, asNumber)
						: DEFAULT_SETTINGS.suggestionsLimit;
					await this.plugin.saveSettings();
					}),
				);
	}
}
