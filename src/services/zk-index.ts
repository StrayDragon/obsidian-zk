import {getAllTags, TFile} from "obsidian";
import type ZkWorkflowWizardPlugin from "../main";
import {ZK_FRONTMATTER_KEYS, type ZkStatus, type ZkType} from "../model/zk";

export interface ZkIndexedNote {
	file: TFile;
	zkType?: ZkType;
	zkStatus?: ZkStatus;
	zkId?: string;
	zkSource?: string;
	tags: Set<string>;
}

function asZkType(value: unknown): ZkType | undefined {
	if (
		value === "fleeting" ||
		value === "literature" ||
		value === "permanent" ||
		value === "index" ||
		value === "project"
	) {
		return value;
	}
	return undefined;
}

function asZkStatus(value: unknown): ZkStatus | undefined {
	if (value === "inbox" || value === "processing" || value === "done" || value === "archived") {
		return value;
	}
	return undefined;
}

function asString(value: unknown): string | undefined {
	return typeof value === "string" && value.trim() ? value : undefined;
}

function normalizeTag(raw: string): string {
	return raw.startsWith("#") ? raw.slice(1) : raw;
}

export class ZkIndex {
	private readonly notesByPath = new Map<string, ZkIndexedNote>();
	private readonly zkIdToPaths = new Map<string, Set<string>>();
	private readonly pathToZkId = new Map<string, string>();

	constructor(private readonly plugin: ZkWorkflowWizardPlugin) {}

	async initialize() {
		for (const file of this.plugin.app.vault.getMarkdownFiles()) {
			this.upsert(file);
		}

		this.plugin.registerEvent(
			this.plugin.app.metadataCache.on("changed", (file) => {
				this.upsert(file);
			}),
		);

		this.plugin.registerEvent(
			this.plugin.app.vault.on("delete", (file) => {
				if (file instanceof TFile) {
					this.remove(file.path);
				}
			}),
		);

		this.plugin.registerEvent(
			this.plugin.app.vault.on("rename", (file, oldPath) => {
				if (file instanceof TFile) {
					this.remove(oldPath);
					this.upsert(file);
				}
			}),
		);
	}

	getInboxItems(): ZkIndexedNote[] {
		return [...this.notesByPath.values()]
			.filter((note) => note.zkStatus === "inbox")
			.sort((a, b) => {
				const ctimeDiff = a.file.stat.ctime - b.file.stat.ctime;
				if (ctimeDiff !== 0) return ctimeDiff;
				return a.file.path.localeCompare(b.file.path);
			});
	}

	getAllNotes(): ZkIndexedNote[] {
		return [...this.notesByPath.values()];
	}

	getDuplicateZkIdGroups(): Array<{zkId: string; files: TFile[]}> {
		const groups: Array<{zkId: string; files: TFile[]}> = [];
		for (const [zkId, paths] of this.zkIdToPaths.entries()) {
			if (paths.size <= 1) continue;
			const files: TFile[] = [];
			for (const path of paths) {
				const note = this.notesByPath.get(path);
				if (note) files.push(note.file);
			}
			groups.push({zkId, files});
		}

		return groups.sort((a, b) => a.zkId.localeCompare(b.zkId));
	}

	getNote(file: TFile): ZkIndexedNote | undefined {
		return this.notesByPath.get(file.path);
	}

	getZkIdConflicts(zkId: string, exceptPath?: string): TFile[] {
		const paths = this.zkIdToPaths.get(zkId);
		if (!paths) return [];
		const conflicts: TFile[] = [];
		for (const path of paths) {
			if (exceptPath && path === exceptPath) continue;
			const note = this.notesByPath.get(path);
			if (note) conflicts.push(note.file);
		}
		return conflicts;
	}

	isZkIdAvailable(zkId: string, exceptPath?: string): boolean {
		return this.getZkIdConflicts(zkId, exceptPath).length === 0;
	}

	getAllZkIds(): string[] {
		return [...this.zkIdToPaths.keys()];
	}

	getNotesWithZkId(): ZkIndexedNote[] {
		return [...this.notesByPath.values()].filter((note) => note.zkId);
	}

	refreshFile(file: TFile) {
		this.upsert(file);
	}

	getRelatedSuggestions(file: TFile, limit: number): Array<{file: TFile; reason: string; score: number}> {
		const current = this.notesByPath.get(file.path);
		if (!current) return [];

		const currentSource = current.zkSource;
		const currentTags = new Set([...current.tags].filter((t) => !t.startsWith("zk/")));

		const suggestions: Array<{file: TFile; reason: string; score: number}> = [];
		for (const note of this.notesByPath.values()) {
			if (note.file.path === file.path) continue;
			if (!note.zkId && note.zkType !== "permanent") continue;

			let score = 0;
			const reasons: string[] = [];

			if (currentSource && note.zkSource && note.zkSource === currentSource) {
				score += 10;
				reasons.push("同来源");
			}

			const sharedTags: string[] = [];
			for (const tag of note.tags) {
				if (tag.startsWith("zk/")) continue;
				if (currentTags.has(tag)) sharedTags.push(tag);
			}
			if (sharedTags.length > 0) {
				score += Math.min(5, sharedTags.length);
				reasons.push(`共享标签: ${sharedTags.slice(0, 3).join(", ")}${sharedTags.length > 3 ? "…" : ""}`);
			}

			if (score > 0) {
				suggestions.push({
					file: note.file,
					reason: reasons.join("；"),
					score,
				});
			}
		}

		return suggestions
			.sort((a, b) => {
				if (b.score !== a.score) return b.score - a.score;
				return a.file.path.localeCompare(b.file.path);
			})
			.slice(0, limit);
	}

	private remove(path: string) {
		const oldId = this.pathToZkId.get(path);
		if (oldId) {
			this.pathToZkId.delete(path);
			const paths = this.zkIdToPaths.get(oldId);
			if (paths) {
				paths.delete(path);
				if (paths.size === 0) this.zkIdToPaths.delete(oldId);
			}
		}

		this.notesByPath.delete(path);
	}

	private upsert(file: TFile) {
		const cache = this.plugin.app.metadataCache.getFileCache(file);
		const frontmatter = cache?.frontmatter ?? {};

		const zkType = asZkType(frontmatter[ZK_FRONTMATTER_KEYS.type]);
		const zkStatus = asZkStatus(frontmatter[ZK_FRONTMATTER_KEYS.status]);
		const zkId = asString(frontmatter[ZK_FRONTMATTER_KEYS.id]);
		const zkSource = asString(frontmatter[ZK_FRONTMATTER_KEYS.source]);

		const tags = new Set<string>();
		if (cache) {
			const allTags = getAllTags(cache) ?? [];
			for (const tag of allTags) tags.add(normalizeTag(tag));
		}

		const note: ZkIndexedNote = {
			file,
			zkType,
			zkStatus,
			zkId,
			zkSource,
			tags,
		};

		this.notesByPath.set(file.path, note);

		const oldId = this.pathToZkId.get(file.path);
		if (oldId && oldId !== zkId) {
			this.pathToZkId.delete(file.path);
			const oldPaths = this.zkIdToPaths.get(oldId);
			if (oldPaths) {
				oldPaths.delete(file.path);
				if (oldPaths.size === 0) this.zkIdToPaths.delete(oldId);
			}
		}

		if (zkId) {
			this.pathToZkId.set(file.path, zkId);
			const paths = this.zkIdToPaths.get(zkId) ?? new Set<string>();
			paths.add(file.path);
			this.zkIdToPaths.set(zkId, paths);
		}
	}
}
