import {Notice} from "obsidian";
import type ZkWorkflowWizardPlugin from "../main";
import {createAtomicNote} from "../services/atomic-note";

export async function newFleetingNote(plugin: ZkWorkflowWizardPlugin) {
	try {
		await createAtomicNote(plugin, "fleeting");
	} catch (error) {
		console.error(error);
		new Notice("创建闪念笔记失败，请查看控制台。");
	}
}

export async function newLiteratureNote(plugin: ZkWorkflowWizardPlugin) {
	try {
		await createAtomicNote(plugin, "literature");
	} catch (error) {
		console.error(error);
		new Notice("创建文献笔记失败，请查看控制台。");
	}
}

