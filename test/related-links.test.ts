import {describe, expect, it} from "vitest";
import {upsertRelatedLinksSection} from "../src/services/related-links";

type FakeFile = {path: string; basename: string};

function makeFile(path: string): FakeFile {
	const basename = path.split("/").pop()?.replace(/\.md$/i, "") ?? path;
	return {path, basename};
}

function makeApp(markdownByPath: Record<string, string>, targets: Record<string, FakeFile>) {
	return {
		vault: {
			async process(file: FakeFile, transform: (data: string) => string) {
				const current = markdownByPath[file.path] ?? "";
				markdownByPath[file.path] = transform(current);
			},
		},
		metadataCache: {
			getFirstLinkpathDest(target: string): FakeFile | null {
				return targets[target] ?? null;
			},
		},
		fileManager: {
			generateMarkdownLink(file: FakeFile): string {
				return `[[${file.basename}]]`;
			},
		},
	};
}

describe("related-links", () => {
	it("adds a related section when missing", async () => {
		const current = makeFile("notes/Current.md");
		const a = makeFile("notes/A.md");
		const b = makeFile("notes/B.md");

		const markdownByPath: Record<string, string> = {
			[current.path]: ["# Current", "", "Some text."].join("\n"),
		};

		const app = makeApp(markdownByPath, {A: a, B: b});

		const result = await upsertRelatedLinksSection(app as any, current as any, [a as any, b as any], "关联");
		expect(result.addedCount).toBe(2);
		expect(markdownByPath[current.path]).toContain("## 关联");
		expect(markdownByPath[current.path]).toContain("- [[A]]");
		expect(markdownByPath[current.path]).toContain("- [[B]]");
	});

	it("does not duplicate links already present in the section", async () => {
		const current = makeFile("notes/Current.md");
		const a = makeFile("notes/A.md");
		const b = makeFile("notes/B.md");

		const markdownByPath: Record<string, string> = {
			[current.path]: ["# Current", "", "## 关联", "- [[A]]", "", "## Next", "Text."].join("\n"),
		};

		const app = makeApp(markdownByPath, {A: a, B: b});

		const result = await upsertRelatedLinksSection(app as any, current as any, [a as any, b as any], "关联");
		expect(result.addedCount).toBe(1);

		const updated = markdownByPath[current.path];
		const relatedIndex = updated.indexOf("## 关联");
		const nextIndex = updated.indexOf("## Next");
		expect(relatedIndex).toBeGreaterThanOrEqual(0);
		expect(nextIndex).toBeGreaterThan(relatedIndex);
		expect(updated).toContain("- [[A]]");
		expect(updated).toContain("- [[B]]");
	});
});

