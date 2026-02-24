import {describe, expect, it} from "vitest";
import {buildFrontmatterBlock} from "../src/utils/frontmatter";

describe("frontmatter utils", () => {
	it("builds a YAML frontmatter block", () => {
		const block = buildFrontmatterBlock({
			zk_type: "fleeting",
			zk_status: "inbox",
			title: "Hello world",
			empty: "",
			count: 3,
			flag: true,
			nothing: null,
		});

		expect(block).toBe(
			[
				"---",
				"zk_type: fleeting",
				"zk_status: inbox",
				'title: "Hello world"',
				'empty: ""',
				"count: 3",
				"flag: true",
				"nothing: null",
				"---",
				"",
			].join("\n"),
		);
	});
});

