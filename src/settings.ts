import {App, PluginSettingTab, Setting} from "obsidian";
import ZkWorkflowWizardPlugin from "./main";
import {t} from "./i18n";
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

		new Setting(containerEl).setName(t("settings.workflow.heading")).setHeading();

		new Setting(containerEl)
			.setName(t("settings.relatedSectionHeading.name"))
			.setDesc(t("settings.relatedSectionHeading.desc"))
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
			.setName(t("settings.writeZkTags.name"))
			.setDesc(
				t("settings.writeZkTags.desc", {
					statusField: getZkFieldLabel("status"),
					inboxStatus: getZkStatusLabel("inbox"),
					typeField: getZkFieldLabel("type"),
					permanentType: getZkTypeLabel("permanent"),
				}),
			)
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.writeZkTags).onChange(async (value) => {
					this.plugin.settings.writeZkTags = value;
					await this.plugin.saveSettings();
				}),
			);

		new Setting(containerEl)
			.setName(t("settings.suggestionsLimit.name"))
			.setDesc(t("settings.suggestionsLimit.desc"))
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
