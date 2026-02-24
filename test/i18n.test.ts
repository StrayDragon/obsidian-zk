import {describe, expect, it} from "vitest";
import {t, tUnsafe} from "../src/i18n";

describe("i18n", () => {
	it("interpolates variables", () => {
		expect(t("views.dashboard.updatedAt", {time: "12:34:56"})).toContain("12:34:56");
	});

	it("falls back to the key when missing", () => {
		expect(tUnsafe("missing.key")).toBe("missing.key");
	});

	it("keeps bilingual tokens for core concept labels", () => {
		const label = t("labels.zkStatus.inbox");
		expect(label).toContain("收集箱");
		expect(label).toContain("inbox");
	});
});
