import type {TFile} from "obsidian";
import type ZkWorkflowWizardPlugin from "../main";
import {ZK_FRONTMATTER_KEYS, type ZkType} from "../model/zk";
import {buildFrontmatterBlock} from "../utils/frontmatter";
import {formatLocalTimestamp} from "../utils/timestamp";

const FILENAME_PREFIX_BY_TYPE: Record<Extract<ZkType, "fleeting" | "literature">, string> = {
	fleeting: "F",
	literature: "L",
};

export async function createAtomicNote(
	plugin: ZkWorkflowWizardPlugin,
	type: Extract<ZkType, "fleeting" | "literature">,
): Promise<TFile> {
	const {app} = plugin;
	const sourcePath = app.workspace.getActiveFile()?.path ?? "";

	let candidateTime = new Date();
	while (true) {
		const baseName = `${FILENAME_PREFIX_BY_TYPE[type]}-${formatLocalTimestamp(candidateTime)}.md`;
		const parent = app.fileManager.getNewFileParent(sourcePath, baseName);
		const fullPath = parent.path ? `${parent.path}/${baseName}` : baseName;

		if (app.vault.getAbstractFileByPath(fullPath) == null) {
			const frontmatter: Record<string, unknown> = {
				[ZK_FRONTMATTER_KEYS.type]: type,
				[ZK_FRONTMATTER_KEYS.status]: "inbox",
			};

			if (plugin.settings.writeZkTags) {
				frontmatter.tags = [`zk/${type}`, "zk/inbox"];
			}

			if (type === "literature") {
				frontmatter[ZK_FRONTMATTER_KEYS.source] = "";
			}

			const file = await app.vault.create(fullPath, `${buildFrontmatterBlock(frontmatter)}\n`);
			await app.workspace.getLeaf(false).openFile(file);
			return file;
		}

		candidateTime = new Date(candidateTime.getTime() + 1000);
	}
}
