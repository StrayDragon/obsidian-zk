import type ZkWorkflowWizardPlugin from "../main";
import {t} from "../i18n";
import {newFleetingNote, newLiteratureNote} from "./capture";
import {
	assignZkIdCurrentNote,
	openDashboard,
	openLibraryIndex,
	openInbox,
	processCurrentNote,
	processNextInboxItem,
} from "./workflow";

export function registerCommands(plugin: ZkWorkflowWizardPlugin) {
	plugin.addCommand({
		id: "zk-new-fleeting-note",
		name: t("commands.newFleetingNote"),
		callback: () => void newFleetingNote(plugin),
	});

	plugin.addCommand({
		id: "zk-new-literature-note",
		name: t("commands.newLiteratureNote"),
		callback: () => void newLiteratureNote(plugin),
	});

	plugin.addCommand({
		id: "zk-open-inbox",
		name: t("commands.openInbox"),
		callback: () => openInbox(plugin),
	});

	plugin.addCommand({
		id: "zk-open-dashboard",
		name: t("commands.openDashboard"),
		callback: () => void openDashboard(plugin),
	});

	plugin.addCommand({
		id: "zk-open-library-index",
		name: t("commands.openLibraryIndex"),
		callback: () => void openLibraryIndex(plugin),
	});

	plugin.addCommand({
		id: "zk-process-next-inbox-item",
		name: t("commands.processNextInboxItem"),
		callback: () => void processNextInboxItem(plugin),
	});

	plugin.addCommand({
		id: "zk-process-current-note",
		name: t("commands.processCurrentNote"),
		callback: () => void processCurrentNote(plugin),
	});

	plugin.addCommand({
		id: "zk-assign-zk-id-current-note",
		name: t("commands.assignZkIdCurrentNote"),
		callback: () => void assignZkIdCurrentNote(plugin),
	});
}
