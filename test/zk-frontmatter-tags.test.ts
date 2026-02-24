import {describe, expect, it} from "vitest";
import {upsertZkTags} from "../src/services/zk-frontmatter";

describe("zk-frontmatter", () => {
	describe("upsertZkTags", () => {
		it("writes helper tags when enabled", () => {
			const fm: any = {};
			upsertZkTags(fm, {type: "permanent", status: "done"}, true);
			expect(fm.tags).toEqual(["zk/done", "zk/permanent"]);
		});

		it("removes previous zk/* tags but keeps other tags", () => {
			const fm: any = {tags: ["foo", "#bar", "zk/fleeting", "zk/inbox", ""]};
			upsertZkTags(fm, {type: "literature", status: "inbox"}, true);
			expect(fm.tags).toEqual(["bar", "foo", "zk/inbox", "zk/literature"]);
		});

		it("does nothing when disabled", () => {
			const fm: any = {tags: ["foo"]};
			upsertZkTags(fm, {type: "permanent", status: "done"}, false);
			expect(fm.tags).toEqual(["foo"]);
		});
	});
});

