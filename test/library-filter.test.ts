import {describe, expect, it} from "vitest";
import {
	computeUserTagCounts,
	filterEntriesForTagFacets,
	filterLibraryEntries,
	groupByType,
	sortEntriesInPlace,
	type LibraryEntry,
} from "../src/services/library-filter";

function makeEntry(overrides: Partial<LibraryEntry<string>>): LibraryEntry<string> {
	return {
		file: overrides.file ?? "file",
		path: overrides.path ?? "a/b.md",
		basename: overrides.basename ?? "B",
		userTags: overrides.userTags ?? [],
		allTags: overrides.allTags ?? [],
		zkId: overrides.zkId,
		zkSource: overrides.zkSource,
		effectiveType: overrides.effectiveType,
		effectiveStatus: overrides.effectiveStatus,
	};
}

describe("library-filter", () => {
	it("filters by query across fields and tags", () => {
		const entries = [
			makeEntry({basename: "Alpha", path: "x/one.md", allTags: ["foo"]}),
			makeEntry({basename: "Beta", path: "x/two.md", zkId: "21", allTags: ["bar"]}),
		];

		expect(filterLibraryEntries(entries, {query: "21", type: "all", status: "all", tag: undefined})).toHaveLength(1);
		expect(filterLibraryEntries(entries, {query: "foo", type: "all", status: "all", tag: undefined})).toHaveLength(1);
	});

	it("filters by type/status/tag", () => {
		const entries = [
			makeEntry({effectiveType: "permanent", effectiveStatus: "done", userTags: ["t1"]}),
			makeEntry({effectiveType: "literature", effectiveStatus: "inbox", userTags: ["t2"]}),
		];

		expect(filterLibraryEntries(entries, {query: "", type: "permanent", status: "all", tag: undefined})).toHaveLength(1);
		expect(filterLibraryEntries(entries, {query: "", type: "all", status: "inbox", tag: undefined})).toHaveLength(1);
		expect(filterLibraryEntries(entries, {query: "", type: "all", status: "all", tag: "t2"})).toHaveLength(1);
	});

	it("computes user tag counts from facet entries", () => {
		const entries = [
			makeEntry({userTags: ["a", "b"], allTags: ["a", "b"]}),
			makeEntry({userTags: ["a"], allTags: ["a"]}),
		];

		const facet = filterEntriesForTagFacets(entries, {query: "", type: "all", status: "all"});
		const counts = computeUserTagCounts(facet);
		expect(counts[0]).toEqual({tag: "a", count: 2});
	});

	it("groups by type and sorts by zkId when present", () => {
		const entries = [
			makeEntry({basename: "A", path: "x/a.md", effectiveType: "permanent", zkId: "10"}),
			makeEntry({basename: "B", path: "x/b.md", effectiveType: "permanent", zkId: "2"}),
			makeEntry({basename: "C", path: "x/c.md", effectiveType: "literature"}),
		];

		const groups = groupByType(entries);
		const permanent = groups.get("permanent")!;
		sortEntriesInPlace(permanent);
		expect(permanent.map((e) => e.zkId)).toEqual(["2", "10"]);
	});
});
