import {Plugin} from "obsidian";
import {registerCommands} from "./commands/register";
import {DEFAULT_SETTINGS, ZkSettingTab, type ZkPluginSettings} from "./settings";
import {ZkIndex} from "./services/zk-index";

export default class ZkWorkflowWizardPlugin extends Plugin {
	settings: ZkPluginSettings = {...DEFAULT_SETTINGS};
	private indexPromise?: Promise<ZkIndex>;

	async onload() {
		await this.loadSettings();

		registerCommands(this);
		this.addSettingTab(new ZkSettingTab(this.app, this));
	}

	async getIndex(): Promise<ZkIndex> {
		if (!this.indexPromise) {
			this.indexPromise = (async () => {
				const index = new ZkIndex(this);
				await index.initialize();
				return index;
			})();
		}
		return this.indexPromise;
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<ZkPluginSettings>,
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
