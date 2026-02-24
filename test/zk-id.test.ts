import {describe, expect, it} from "vitest";
import {generateTopLevelZkId, generateZkIdAfterAnchor, type ZkIdIndex} from "../src/services/zk-id";

function makeIndex(ids: string[]): ZkIdIndex {
	const set = new Set(ids);
	return {
		getAllZkIds(): string[] {
			return [...set];
		},
		isZkIdAvailable(zkId: string): boolean {
			return !set.has(zkId);
		},
	};
}

describe("zk-id", () => {
	describe("generateTopLevelZkId", () => {
		it("generates the next available top-level id", () => {
			const index = makeIndex(["1", "2", "2a", "10", "10a1", "11"]);
			expect(generateTopLevelZkId(index)).toBe("12");
		});

		it("skips unavailable ids until it finds a free one", () => {
			const index = makeIndex(["1", "2", "3", "4", "5"]);
			expect(generateTopLevelZkId(index)).toBe("6");
		});
	});

	describe("generateZkIdAfterAnchor", () => {
		it("increments trailing number if available", () => {
			const index = makeIndex(["22"]);
			expect(generateZkIdAfterAnchor("22", index)).toBe("23");
		});

		it("falls back to letter branches when increment is taken", () => {
			const index = makeIndex(["22", "23", "22a"]);
			expect(generateZkIdAfterAnchor("22", index)).toBe("22b");
		});

		it("increments complex ids that end with digits", () => {
			const index = makeIndex(["21/3d7a6"]);
			expect(generateZkIdAfterAnchor("21/3d7a6", index)).toBe("21/3d7a7");
		});
	});
});
