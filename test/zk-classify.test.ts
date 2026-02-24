import {describe, expect, it} from "vitest";
import {getEffectiveZkStatus, getEffectiveZkType, getUserTags} from "../src/services/zk-classify";

describe("zk-classify", () => {
	it("prefers zk/* tags over frontmatter values", () => {
		const note = {
			zkType: "permanent" as const,
			zkStatus: "done" as const,
			tags: new Set(["zk/literature", "zk/inbox", "foo"]),
		};

		expect(getEffectiveZkType(note)).toBe("literature");
		expect(getEffectiveZkStatus(note)).toBe("inbox");
	});

	it("falls back to frontmatter when zk/* tags are missing", () => {
		const note = {
			zkType: "fleeting" as const,
			zkStatus: "inbox" as const,
			tags: new Set(["foo"]),
		};

		expect(getEffectiveZkType(note)).toBe("fleeting");
		expect(getEffectiveZkStatus(note)).toBe("inbox");
	});

	it("returns user tags without zk/* helper tags", () => {
		const note = {
			tags: new Set(["zk/inbox", "bar", "foo"]),
		};

		expect(getUserTags(note)).toEqual(["bar", "foo"]);
	});
});

