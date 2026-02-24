import type {FrontMatterCache, TFile} from "obsidian";
import type ZkWorkflowWizardPlugin from "../main";
import {ZK_FRONTMATTER_KEYS, type ZkStatus, type ZkType} from "../model/zk";

function normalizeTag(tag: string): string {
	const trimmed = tag.trim();
	if (!trimmed) return "";
	return trimmed.startsWith("#") ? trimmed.slice(1) : trimmed;
}

function readFrontmatterTags(frontmatter: FrontMatterCache): string[] {
	const raw: unknown = frontmatter.tags;
	if (raw == null) return [];
	if (typeof raw === "string") return raw.split(",").map(normalizeTag).filter(Boolean);
	if (Array.isArray(raw)) return raw.map((v) => (typeof v === "string" ? normalizeTag(v) : "")).filter(Boolean);
	return [];
}

function writeFrontmatterTags(frontmatter: FrontMatterCache, tags: string[]) {
	if (tags.length === 0) {
		delete frontmatter.tags;
		return;
	}
	frontmatter.tags = tags;
}

export function upsertZkTags(
	frontmatter: FrontMatterCache,
	desired: {type: ZkType; status: ZkStatus},
	enabled: boolean,
) {
	if (!enabled) return;

	const tags = new Set(readFrontmatterTags(frontmatter));
	for (const tag of [...tags]) {
		if (tag.startsWith("zk/")) tags.delete(tag);
	}

	tags.add(`zk/${desired.type}`);
	tags.add(`zk/${desired.status}`);
	writeFrontmatterTags(frontmatter, [...tags].sort((a, b) => a.localeCompare(b)));
}

export async function setZkStatus(
	plugin: ZkWorkflowWizardPlugin,
	file: TFile,
	status: ZkStatus,
	typeForTags?: ZkType,
) {
	await plugin.app.fileManager.processFrontMatter(file, (frontmatter) => {
		const fm = frontmatter as FrontMatterCache;
		fm[ZK_FRONTMATTER_KEYS.status] = status;
		const typeValue = fm[ZK_FRONTMATTER_KEYS.type] as ZkType | undefined;
		const effectiveType = typeForTags ?? typeValue;
		if (effectiveType) {
			upsertZkTags(fm, {type: effectiveType, status}, plugin.settings.writeZkTags);
		}
	});
}

export async function promoteToPermanent(
	plugin: ZkWorkflowWizardPlugin,
	file: TFile,
	zkId: string,
) {
	await plugin.app.fileManager.processFrontMatter(file, (frontmatter) => {
		const fm = frontmatter as FrontMatterCache;
		fm[ZK_FRONTMATTER_KEYS.type] = "permanent";
		fm[ZK_FRONTMATTER_KEYS.status] = "done";
		fm[ZK_FRONTMATTER_KEYS.id] = zkId;
		upsertZkTags(fm, {type: "permanent", status: "done"}, plugin.settings.writeZkTags);
	});
}

export async function assignZkId(plugin: ZkWorkflowWizardPlugin, file: TFile, zkId: string) {
	await plugin.app.fileManager.processFrontMatter(file, (frontmatter) => {
		const fm = frontmatter as FrontMatterCache;
		fm[ZK_FRONTMATTER_KEYS.id] = zkId;
	});
}
