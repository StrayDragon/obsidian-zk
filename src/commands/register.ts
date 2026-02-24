import type ZkWorkflowWizardPlugin from "../main";
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
		name: "1| 新建闪念笔记",
		callback: () => void newFleetingNote(plugin),
	});

	plugin.addCommand({
		id: "zk-new-literature-note",
		name: "2| 新建文献笔记",
		callback: () => void newLiteratureNote(plugin),
	});

	plugin.addCommand({
		id: "zk-open-inbox",
		name: "3| 打开收集箱",
		callback: () => openInbox(plugin),
	});

	plugin.addCommand({
		id: "zk-open-dashboard",
		name: "概览 | 统计面板",
		callback: () => void openDashboard(plugin),
	});

	plugin.addCommand({
		id: "zk-open-library-index",
		name: "索引 | 图书馆索引",
		callback: () => void openLibraryIndex(plugin),
	});

	plugin.addCommand({
		id: "zk-process-next-inbox-item",
		name: "4| 处理下一条（收集箱）",
		callback: () => void processNextInboxItem(plugin),
	});

	plugin.addCommand({
		id: "zk-process-current-note",
		name: "5| 处理当前笔记（升级为永久笔记）",
		callback: () => void processCurrentNote(plugin),
	});

	plugin.addCommand({
		id: "zk-assign-zk-id-current-note",
		name: "工具 | 分配卡片 ID（当前笔记）",
		callback: () => void assignZkIdCurrentNote(plugin),
	});
}
