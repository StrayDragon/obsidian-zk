import {Notice} from "obsidian";
import type ZkWorkflowWizardPlugin from "../main";
import {InboxModal} from "../ui/inbox-modal";
import {ProcessWizardModal} from "../ui/process-wizard-modal";
import {AssignZkIdModal} from "../ui/assign-zk-id-modal";
import {ZK_DASHBOARD_VIEW_TYPE} from "../views/dashboard-view";
import {ZK_LIBRARY_INDEX_VIEW_TYPE} from "../views/library-index-view";
import {getZkStatusLabel} from "../utils/zk-labels";
import {t} from "../i18n";

export function openInbox(plugin: ZkWorkflowWizardPlugin) {
	new InboxModal(plugin).open();
}

export async function openDashboard(plugin: ZkWorkflowWizardPlugin) {
	const leaf = plugin.app.workspace.getLeaf("tab");
	await leaf.setViewState({type: ZK_DASHBOARD_VIEW_TYPE, active: true});
	await plugin.app.workspace.revealLeaf(leaf);
}

export async function openLibraryIndex(plugin: ZkWorkflowWizardPlugin) {
	const leaf = plugin.app.workspace.getLeaf("tab");
	await leaf.setViewState({type: ZK_LIBRARY_INDEX_VIEW_TYPE, active: true});
	await plugin.app.workspace.revealLeaf(leaf);
}

export async function processNextInboxItem(plugin: ZkWorkflowWizardPlugin) {
	try {
		const index = await plugin.getIndex();
		const items = index.getInboxItems();
		const next = items[0]?.file;
		if (!next) {
			new Notice(t("notices.queueEmpty", {queue: getZkStatusLabel("inbox")}));
			return;
		}
		new ProcessWizardModal(plugin, next).open();
	} catch (error) {
		console.error(error);
		new Notice(t("notices.operationFailed"));
	}
}

export async function processCurrentNote(plugin: ZkWorkflowWizardPlugin) {
	const file = plugin.app.workspace.getActiveFile();
	if (!file) {
		new Notice(t("notices.noActiveFile"));
		return;
	}
	new ProcessWizardModal(plugin, file).open();
}

export async function assignZkIdCurrentNote(plugin: ZkWorkflowWizardPlugin) {
	const file = plugin.app.workspace.getActiveFile();
	if (!file) {
		new Notice(t("notices.noActiveFile"));
		return;
	}
	new AssignZkIdModal(plugin, file).open();
}
