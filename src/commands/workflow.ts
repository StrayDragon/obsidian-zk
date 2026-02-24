import {Notice} from "obsidian";
import type ZkWorkflowWizardPlugin from "../main";
import {InboxModal} from "../ui/inbox-modal";
import {ProcessWizardModal} from "../ui/process-wizard-modal";
import {AssignZkIdModal} from "../ui/assign-zk-id-modal";
import {ZK_DASHBOARD_VIEW_TYPE} from "../views/dashboard-view";

export function openInbox(plugin: ZkWorkflowWizardPlugin) {
	new InboxModal(plugin).open();
}

export async function openDashboard(plugin: ZkWorkflowWizardPlugin) {
	const leaf = plugin.app.workspace.getLeaf("tab");
	await leaf.setViewState({type: ZK_DASHBOARD_VIEW_TYPE, active: true});
	await plugin.app.workspace.revealLeaf(leaf);
}

export async function processNextInboxItem(plugin: ZkWorkflowWizardPlugin) {
	try {
		const index = await plugin.getIndex();
		const items = index.getInboxItems();
		const next = items[0]?.file;
		if (!next) {
			new Notice("收集箱为空。");
			return;
		}
		new ProcessWizardModal(plugin, next).open();
	} catch (error) {
		console.error(error);
		new Notice("处理失败，请查看控制台。");
	}
}

export async function processCurrentNote(plugin: ZkWorkflowWizardPlugin) {
	const file = plugin.app.workspace.getActiveFile();
	if (!file) {
		new Notice("没有活动文件。");
		return;
	}
	new ProcessWizardModal(plugin, file).open();
}

export async function assignZkIdCurrentNote(plugin: ZkWorkflowWizardPlugin) {
	const file = plugin.app.workspace.getActiveFile();
	if (!file) {
		new Notice("没有活动文件。");
		return;
	}
	new AssignZkIdModal(plugin, file).open();
}
