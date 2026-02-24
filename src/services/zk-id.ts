export interface ZkIdIndex {
	getAllZkIds(): string[];
	isZkIdAvailable(zkId: string, exceptPath?: string): boolean;
}

function parseTopLevelNumber(zkId: string): number | undefined {
	const match = zkId.match(/^(\d+)/);
	if (!match) return undefined;
	const group = match[1];
	if (!group) return undefined;
	const asNumber = Number.parseInt(group, 10);
	return Number.isFinite(asNumber) ? asNumber : undefined;
}

function incrementTrailingNumber(zkId: string): string | undefined {
	const match = zkId.match(/^(.*?)(\d+)$/);
	if (!match) return undefined;
	const prefix = match[1] ?? "";
	const numberPart = match[2];
	if (!numberPart) return undefined;
	const asNumber = Number.parseInt(numberPart, 10);
	if (!Number.isFinite(asNumber)) return undefined;
	return `${prefix}${asNumber + 1}`;
}

function numberToLetters(n: number): string {
	// 0 -> a, 25 -> z, 26 -> aa ...
	let value = n;
	let out = "";
	while (true) {
		out = String.fromCharCode(97 + (value % 26)) + out;
		value = Math.floor(value / 26) - 1;
		if (value < 0) break;
	}
	return out;
}

export function generateTopLevelZkId(index: ZkIdIndex, exceptPath?: string): string {
	const all = index.getAllZkIds();
	let max = 0;
	for (const id of all) {
		const top = parseTopLevelNumber(id);
		if (top != null && top > max) max = top;
	}

	let candidate = String(max + 1);
	while (!index.isZkIdAvailable(candidate, exceptPath)) {
		candidate = String(Number.parseInt(candidate, 10) + 1);
	}
	return candidate;
}

export function generateZkIdAfterAnchor(
	anchorZkId: string,
	index: ZkIdIndex,
	exceptPath?: string,
): string {
	const incremented = incrementTrailingNumber(anchorZkId);
	if (incremented && index.isZkIdAvailable(incremented, exceptPath)) return incremented;

	for (let i = 0; i < 10_000; i++) {
		const candidate = `${anchorZkId}${numberToLetters(i)}`;
		if (index.isZkIdAvailable(candidate, exceptPath)) return candidate;
	}

	throw new Error("Unable to generate a unique zk_id after anchor (too many conflicts).");
}
