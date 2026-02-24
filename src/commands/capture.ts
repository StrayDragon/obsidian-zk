import {Notice} from "obsidian";
import type ZkWorkflowWizardPlugin from "../main";
import {t} from "../i18n";
import {createAtomicNote} from "../services/atomic-note";

export async function newFleetingNote(plugin: ZkWorkflowWizardPlugin) {
	try {
		await createAtomicNote(plugin, "fleeting");
	} catch (error) {
		console.error(error);
		new Notice(t("notices.createFleetingNoteFailed"));
	}
}

export async function newLiteratureNote(plugin: ZkWorkflowWizardPlugin) {
	try {
		await createAtomicNote(plugin, "literature");
	} catch (error) {
		console.error(error);
		new Notice(t("notices.createLiteratureNoteFailed"));
	}
}
