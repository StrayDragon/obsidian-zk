import type {ZkStatus, ZkType} from "../model/zk";

export type LibraryTypeGroup = ZkType | "unknown";

export type LibraryTypeFilter = "all" | ZkType | "unknown";
export type LibraryStatusFilter = "all" | ZkStatus | "unknown";
export type LibraryTagFilter = string | undefined;

export interface LibraryEntry<TFileLike = unknown> {
	file: TFileLike;
	path: string;
	basename: string;
	zkId?: string;
	zkSource?: string;
	effectiveType?: ZkType;
	effectiveStatus?: ZkStatus;
	userTags: string[];
	allTags: string[];
}

export interface LibraryFilters {
	query: string;
	type: LibraryTypeFilter;
	status: LibraryStatusFilter;
	tag: LibraryTagFilter;
}

export interface TagCount {
	tag: string;
	count: number;
}

export function filterEntriesForTagFacets<TFileLike>(
	entries: Array<LibraryEntry<TFileLike>>,
	filters: Pick<LibraryFilters, "query" | "type" | "status">,
): Array<LibraryEntry<TFileLike>> {
	const normalized = normalizeQuery(filters.query);
	return entries.filter((entry) => {
		if (!matchesQuery(entry, normalized)) return false;
		if (!matchesType(entry, filters.type)) return false;
		if (!matchesStatus(entry, filters.status)) return false;
		return true;
	});
}

export function filterLibraryEntries<TFileLike>(
	entries: Array<LibraryEntry<TFileLike>>,
	filters: LibraryFilters,
): Array<LibraryEntry<TFileLike>> {
	const normalized = normalizeQuery(filters.query);
	return entries.filter((entry) => {
		if (!matchesQuery(entry, normalized)) return false;
		if (!matchesType(entry, filters.type)) return false;
		if (!matchesStatus(entry, filters.status)) return false;
		if (!matchesUserTag(entry, filters.tag)) return false;
		return true;
	});
}

export function computeUserTagCounts<TFileLike>(entries: Array<LibraryEntry<TFileLike>>): TagCount[] {
	const counts = new Map<string, number>();
	for (const entry of entries) {
		for (const tag of entry.userTags) {
			counts.set(tag, (counts.get(tag) ?? 0) + 1);
		}
	}

	return [...counts.entries()]
		.map(([tag, count]) => ({tag, count}))
		.sort((a, b) => {
			if (b.count !== a.count) return b.count - a.count;
			return a.tag.localeCompare(b.tag);
		});
}

export function groupByType<TFileLike>(
	entries: Array<LibraryEntry<TFileLike>>,
): Map<LibraryTypeGroup, Array<LibraryEntry<TFileLike>>> {
	const groups = new Map<LibraryTypeGroup, Array<LibraryEntry<TFileLike>>>();
	for (const entry of entries) {
		const key: LibraryTypeGroup = entry.effectiveType ?? "unknown";
		const arr = groups.get(key) ?? [];
		arr.push(entry);
		groups.set(key, arr);
	}
	return groups;
}

export function sortEntriesInPlace<TFileLike>(entries: Array<LibraryEntry<TFileLike>>) {
	entries.sort((a, b) => {
		const aId = a.zkId;
		const bId = b.zkId;
		if (aId && bId) {
			const idDiff = aId.localeCompare(bId, undefined, {numeric: true, sensitivity: "base"});
			if (idDiff !== 0) return idDiff;
		} else if (aId) {
			return -1;
		} else if (bId) {
			return 1;
		}

		const nameDiff = a.basename.localeCompare(b.basename, undefined, {numeric: true, sensitivity: "base"});
		if (nameDiff !== 0) return nameDiff;

		return a.path.localeCompare(b.path, undefined, {numeric: true, sensitivity: "base"});
	});
}

function normalizeQuery(value: string): string {
	return value.trim().toLocaleLowerCase();
}

function matchesQuery<TFileLike>(entry: LibraryEntry<TFileLike>, query: string): boolean {
	if (!query) return true;
	const fields: Array<string | undefined> = [entry.basename, entry.path, entry.zkId, entry.zkSource];
	for (const field of fields) {
		if (!field) continue;
		if (field.toLocaleLowerCase().includes(query)) return true;
	}
	for (const tag of entry.allTags) {
		if (tag.toLocaleLowerCase().includes(query)) return true;
	}
	return false;
}

function matchesType<TFileLike>(entry: LibraryEntry<TFileLike>, filter: LibraryTypeFilter): boolean {
	if (filter === "all") return true;
	if (filter === "unknown") return entry.effectiveType == null;
	return entry.effectiveType === filter;
}

function matchesStatus<TFileLike>(entry: LibraryEntry<TFileLike>, filter: LibraryStatusFilter): boolean {
	if (filter === "all") return true;
	if (filter === "unknown") return entry.effectiveStatus == null;
	return entry.effectiveStatus === filter;
}

function matchesUserTag<TFileLike>(entry: LibraryEntry<TFileLike>, filter: LibraryTagFilter): boolean {
	if (!filter) return true;
	return entry.userTags.includes(filter);
}
