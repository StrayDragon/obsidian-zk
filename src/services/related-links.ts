import type {App, TFile} from "obsidian";

function normalizeHeadingText(value: string): string {
	return value.trim().replace(/\s+/g, " ");
}

function findHeadingLineIndex(lines: string[], headingLine: string): number {
	const normalized = normalizeHeadingText(headingLine);
	return lines.findIndex((line) => normalizeHeadingText(line) === normalized);
}

function isHeadingLine(line: string): boolean {
	return /^#{1,6}\s+\S/.test(line.trim());
}

function extractWikiLinkTargets(line: string): string[] {
	const targets: string[] = [];
	const regex = /\[\[([^\]]+)\]\]/g;
	let match: RegExpExecArray | null;
	while ((match = regex.exec(line)) !== null) {
		const raw = match[1];
		if (!raw) continue;
		const noAlias = raw.split("|")[0];
		if (!noAlias) continue;
		const noSubpath = noAlias.split("#")[0]?.trim() ?? "";
		if (noSubpath) targets.push(noSubpath);
	}
	return targets;
}

export async function upsertRelatedLinksSection(
	app: App,
	file: TFile,
	relatedFiles: TFile[],
	headingText: string,
): Promise<{addedCount: number}> {
	if (relatedFiles.length === 0) return {addedCount: 0};

	const heading = normalizeHeadingText(headingText) || "关联";
	const headingLine = `## ${heading}`;
	const sourcePath = file.path;

	let addedCount = 0;
		await app.vault.process(file, (data) => {
			const lines = data.split(/\r?\n/);

			let headingIndex = findHeadingLineIndex(lines, headingLine);
			if (headingIndex === -1) {
				// Append a new section at the end.
				const last = lines.length > 0 ? lines[lines.length - 1] : undefined;
				if (last && last.trim() !== "") lines.push("");
				lines.push(headingLine, "");
				headingIndex = lines.length - 2;
			}

			let sectionEndIndex = lines.length;
			for (let i = headingIndex + 1; i < lines.length; i++) {
				const line = lines[i];
				if (!line) continue;
				if (isHeadingLine(line)) {
					sectionEndIndex = i;
					break;
				}
			}

			const existingTargets = new Set<string>();
			for (let i = headingIndex + 1; i < sectionEndIndex; i++) {
				const line = lines[i];
				if (!line) continue;
				for (const target of extractWikiLinkTargets(line)) {
					const dest = app.metadataCache.getFirstLinkpathDest(target, sourcePath);
					if (dest) existingTargets.add(dest.path);
				}
			}

		const newLines: string[] = [];
		for (const related of relatedFiles) {
			if (related.path === file.path) continue;
			if (existingTargets.has(related.path)) continue;
			const link = app.fileManager.generateMarkdownLink(related, sourcePath);
			newLines.push(`- ${link}`);
			existingTargets.add(related.path);
		}

		if (newLines.length === 0) return data;

		addedCount = newLines.length;

		// Insert before next heading.
		lines.splice(sectionEndIndex, 0, ...newLines, "");
		return lines.join("\n");
	});

	return {addedCount};
}
