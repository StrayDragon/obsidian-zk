import type {ZkStatus, ZkType} from "../model/zk";

const TYPE_TAGS: Array<{tag: string; type: ZkType}> = [
	{tag: "zk/permanent", type: "permanent"},
	{tag: "zk/literature", type: "literature"},
	{tag: "zk/fleeting", type: "fleeting"},
	{tag: "zk/index", type: "index"},
	{tag: "zk/project", type: "project"},
];

const STATUS_TAGS: Array<{tag: string; status: ZkStatus}> = [
	{tag: "zk/inbox", status: "inbox"},
	{tag: "zk/processing", status: "processing"},
	{tag: "zk/done", status: "done"},
	{tag: "zk/archived", status: "archived"},
];

function hasTag(tags: Iterable<string>, expected: string): boolean {
	if (tags instanceof Set) return tags.has(expected);
	for (const tag of tags) {
		if (tag === expected) return true;
	}
	return false;
}

export function getEffectiveZkType(note: {zkType?: ZkType; tags: Iterable<string>}): ZkType | undefined {
	for (const {tag, type} of TYPE_TAGS) {
		if (hasTag(note.tags, tag)) return type;
	}
	return note.zkType;
}

export function getEffectiveZkStatus(note: {zkStatus?: ZkStatus; tags: Iterable<string>}): ZkStatus | undefined {
	for (const {tag, status} of STATUS_TAGS) {
		if (hasTag(note.tags, tag)) return status;
	}
	return note.zkStatus;
}

export function getUserTags(note: {tags: Iterable<string>}): string[] {
	const user: string[] = [];
	for (const tag of note.tags) {
		if (tag.startsWith("zk/")) continue;
		user.push(tag);
	}
	return user.sort((a, b) => a.localeCompare(b));
}

