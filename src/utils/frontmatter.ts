function toYamlScalar(value: unknown): string {
	if (typeof value === "string") {
		if (value === "") return '""';
		if (/^[a-z0-9_/-]+$/i.test(value)) return value;
		return JSON.stringify(value);
	}

	if (typeof value === "number" || typeof value === "boolean") return String(value);
	if (value == null) return "null";
	return JSON.stringify(value);
}

export function buildFrontmatterBlock(frontmatter: Record<string, unknown>): string {
	const lines: string[] = ["---"];
	for (const [key, value] of Object.entries(frontmatter)) {
		if (value === undefined) continue;
		lines.push(`${key}: ${toYamlScalar(value)}`);
	}
	lines.push("---", "");
	return lines.join("\n");
}

