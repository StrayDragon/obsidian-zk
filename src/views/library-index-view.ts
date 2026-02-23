import {ItemView, Setting, type TFile, type WorkspaceLeaf} from "obsidian";
import type ZkWorkflowWizardPlugin from "../main";
import {getEffectiveZkStatus, getEffectiveZkType, getUserTags} from "../services/zk-classify";
import {getZkFieldLabel, getZkStatusLabel, getZkTypeLabel} from "../utils/zk-labels";
import {
	computeUserTagCounts,
	filterEntriesForTagFacets,
	filterLibraryEntries,
	groupByType,
	sortEntriesInPlace,
	type LibraryEntry,
	type LibraryStatusFilter,
	type LibraryTagFilter,
	type LibraryTypeFilter,
	type TagCount,
} from "../services/library-filter";
import {ProcessWizardModal} from "../ui/process-wizard-modal";
import {AssignZkIdModal} from "../ui/assign-zk-id-modal";
import type {ZkIndexedNote} from "../services/zk-index";
import type {ZkType} from "../model/zk";

export const ZK_LIBRARY_INDEX_VIEW_TYPE = "zk-library-index";

const DEFAULT_PER_TYPE_LIMIT = 100;
const TAG_DROPDOWN_LIMIT = 30;
const TAG_CHIP_LIMIT = 12;

const TYPE_ORDER: Array<ZkType | "unknown"> = [
	"permanent",
	"literature",
	"fleeting",
	"index",
	"project",
	"unknown",
];

function openFile(plugin: ZkWorkflowWizardPlugin, file: TFile) {
	void plugin.app.workspace.getLeaf(false).openFile(file);
}

function isZkRelevant(note: ZkIndexedNote): boolean {
	if (note.zkType || note.zkStatus || note.zkId || note.zkSource) return true;
	for (const tag of note.tags) {
		if (tag.startsWith("zk/")) return true;
	}
	return false;
}

function buildEntryDesc(entry: LibraryEntry<TFile>): string {
	const parts: string[] = [];
	if (entry.zkId) parts.push(`${getZkFieldLabel("id")}：${entry.zkId}`);
	if (entry.zkSource) parts.push(`${getZkFieldLabel("source")}：${entry.zkSource}`);
	if (entry.userTags.length > 0) {
		const preview = entry.userTags.slice(0, 3).map((t) => `#${t}`).join(" ");
		parts.push(preview);
	}
	parts.push(entry.path);
	return parts.join(" · ");
}

function toTypeFilter(value: string): LibraryTypeFilter {
	if (value === "all" || value === "unknown") return value;
	if (
		value === "fleeting" ||
		value === "literature" ||
		value === "permanent" ||
		value === "index" ||
		value === "project"
	) {
		return value;
	}
	return "all";
}

function toStatusFilter(value: string): LibraryStatusFilter {
	if (value === "all" || value === "unknown") return value;
	if (value === "inbox" || value === "processing" || value === "done" || value === "archived") return value;
	return "all";
}

export class ZkLibraryIndexView extends ItemView {
	private refreshTimer?: number;
	private updateTimer?: number;

	private entries: Array<LibraryEntry<TFile>> = [];

	private query = "";
	private typeFilter: LibraryTypeFilter = "all";
	private statusFilter: LibraryStatusFilter = "all";
	private tagFilter: LibraryTagFilter;

	private readonly expandedTypes = new Set<string>(["permanent", "literature"]);
	private readonly limitByType = new Map<ZkType | "unknown", number>();

	private updatedEl?: HTMLElement;
	private matchEl?: HTMLElement;
	private chipsEl?: HTMLElement;
	private resultsEl?: HTMLElement;

	private searchInput?: HTMLInputElement;
	private typeSelect?: HTMLSelectElement;
	private statusSelect?: HTMLSelectElement;
	private tagSelect?: HTMLSelectElement;

	constructor(
		leaf: WorkspaceLeaf,
		private readonly plugin: ZkWorkflowWizardPlugin,
	) {
		super(leaf);
	}

	getViewType(): string {
		return ZK_LIBRARY_INDEX_VIEW_TYPE;
	}

	getDisplayText(): string {
		return "图书馆索引（library index）";
	}

	getIcon(): string {
		return "book-open";
	}

	async onOpen() {
		this.contentEl.empty();
		this.contentEl.addClass("zk-library");

		this.buildSkeleton();

		this.registerEvent(
			this.plugin.app.metadataCache.on("changed", () => {
				this.scheduleRefresh();
			}),
		);
		this.registerEvent(
			this.plugin.app.vault.on("rename", () => {
				this.scheduleRefresh();
			}),
		);
		this.registerEvent(
			this.plugin.app.vault.on("delete", () => {
				this.scheduleRefresh();
			}),
		);

		await this.refreshData();
		this.updateUI();
	}

	async onClose() {
		this.contentEl.empty();
		if (this.refreshTimer != null) window.clearTimeout(this.refreshTimer);
		if (this.updateTimer != null) window.clearTimeout(this.updateTimer);
	}

	private buildSkeleton() {
		const header = this.contentEl.createDiv({cls: "zk-library-header"});
		header.createEl("h2", {text: "图书馆索引（library index）"});

		const headerRight = header.createDiv({cls: "zk-library-headerRight"});
		this.updatedEl = headerRight.createDiv({cls: "zk-library-updated"});

		const refreshButton = headerRight.createEl("button", {
			cls: "zk-library-btn",
			text: "刷新",
			attr: {type: "button", "aria-label": "刷新"},
		});
		refreshButton.addEventListener("click", () => this.scheduleRefresh(true));

		const filters = this.contentEl.createDiv({cls: "zk-library-filters"});

		const searchWrap = filters.createDiv({cls: "zk-library-filter is-search"});
		searchWrap.createDiv({cls: "zk-library-filterLabel", text: "搜索"});
		this.searchInput = searchWrap.createEl("input", {
			cls: "zk-library-input",
			attr: {
				type: "search",
				placeholder: `搜索文件名、${getZkFieldLabel("id")}、${getZkFieldLabel("source")}或标签（tags）…`,
				"aria-label": "搜索",
			},
		});
		this.searchInput.addEventListener("input", () => {
			this.query = this.searchInput?.value ?? "";
			this.scheduleUpdate();
		});

		const typeWrap = filters.createDiv({cls: "zk-library-filter"});
		typeWrap.createDiv({cls: "zk-library-filterLabel", text: getZkFieldLabel("type")});
		this.typeSelect = typeWrap.createEl("select", {
			cls: "zk-library-select",
			attr: {"aria-label": "类型"},
		});
		const typeOptions: Array<{value: string; label: string}> = [
			{value: "all", label: "全部"},
			{value: "permanent", label: getZkTypeLabel("permanent")},
			{value: "literature", label: getZkTypeLabel("literature")},
			{value: "fleeting", label: getZkTypeLabel("fleeting")},
			{value: "index", label: getZkTypeLabel("index")},
			{value: "project", label: getZkTypeLabel("project")},
			{value: "unknown", label: getZkTypeLabel("unknown")},
		];
		for (const option of typeOptions) {
			this.typeSelect.createEl("option", {value: option.value, text: option.label});
		}
		this.typeSelect.addEventListener("change", () => {
			this.typeFilter = toTypeFilter(this.typeSelect?.value ?? "all");
			this.scheduleUpdate();
		});

		const statusWrap = filters.createDiv({cls: "zk-library-filter"});
		statusWrap.createDiv({cls: "zk-library-filterLabel", text: getZkFieldLabel("status")});
		this.statusSelect = statusWrap.createEl("select", {
			cls: "zk-library-select",
			attr: {"aria-label": "状态"},
		});
		const statusOptions: Array<{value: string; label: string}> = [
			{value: "all", label: "全部"},
			{value: "inbox", label: getZkStatusLabel("inbox")},
			{value: "processing", label: getZkStatusLabel("processing")},
			{value: "done", label: getZkStatusLabel("done")},
			{value: "archived", label: getZkStatusLabel("archived")},
			{value: "unknown", label: getZkStatusLabel("unknown")},
		];
		for (const option of statusOptions) {
			this.statusSelect.createEl("option", {value: option.value, text: option.label});
		}
		this.statusSelect.addEventListener("change", () => {
			this.statusFilter = toStatusFilter(this.statusSelect?.value ?? "all");
			this.scheduleUpdate();
		});

		const tagWrap = filters.createDiv({cls: "zk-library-filter"});
		tagWrap.createDiv({cls: "zk-library-filterLabel", text: "标签（tags）"});
		this.tagSelect = tagWrap.createEl("select", {
			cls: "zk-library-select",
			attr: {"aria-label": "标签"},
		});
		this.tagSelect.createEl("option", {value: "all", text: "全部标签（tags）"});
		this.tagSelect.addEventListener("change", () => {
			const value = this.tagSelect?.value ?? "all";
			this.tagFilter = value === "all" ? undefined : value;
			this.scheduleUpdate();
		});

		const resetButton = filters.createEl("button", {
			cls: "zk-library-btn is-reset",
			text: "重置",
			attr: {type: "button", "aria-label": "重置筛选"},
		});
		resetButton.addEventListener("click", () => {
			this.query = "";
			this.typeFilter = "all";
			this.statusFilter = "all";
			this.tagFilter = undefined;
			if (this.searchInput) this.searchInput.value = "";
			if (this.typeSelect) this.typeSelect.value = "all";
			if (this.statusSelect) this.statusSelect.value = "all";
			if (this.tagSelect) this.tagSelect.value = "all";
			this.scheduleUpdate(true);
		});

		const summary = this.contentEl.createDiv({cls: "zk-library-summary"});
		this.matchEl = summary.createDiv({cls: "zk-library-match"});
		this.chipsEl = summary.createDiv({cls: "zk-library-chips"});

		this.resultsEl = this.contentEl.createDiv({cls: "zk-library-results"});
	}

	private scheduleRefresh(immediate = false) {
		if (this.refreshTimer != null) return;
		const delay = immediate ? 0 : 200;
		this.refreshTimer = window.setTimeout(() => {
			this.refreshTimer = undefined;
			void (async () => {
				await this.refreshData();
				this.updateUI();
			})();
		}, delay);
	}

	private scheduleUpdate(immediate = false) {
		if (this.updateTimer != null) return;
		const delay = immediate ? 0 : 150;
		this.updateTimer = window.setTimeout(() => {
			this.updateTimer = undefined;
			this.updateUI();
		}, delay);
	}

	private async refreshData() {
		const index = await this.plugin.getIndex();
		const notes = index.getAllNotes().filter(isZkRelevant);

		this.entries = notes.map((note) => {
			const effectiveType = getEffectiveZkType(note);
			const effectiveStatus = getEffectiveZkStatus(note);
			const userTags = getUserTags(note);
			const allTags = [...note.tags].sort((a, b) => a.localeCompare(b));
			return {
				file: note.file,
				path: note.file.path,
				basename: note.file.basename,
				zkId: note.zkId,
				zkSource: note.zkSource,
				effectiveType,
				effectiveStatus,
				userTags,
				allTags,
			};
		});

		if (this.updatedEl) {
			this.updatedEl.setText(`最后更新：${new Date().toLocaleTimeString()}`);
		}
	}

	private updateUI() {
		const matchEl = this.matchEl;
		const chipsEl = this.chipsEl;
		const resultsEl = this.resultsEl;
		const tagSelect = this.tagSelect;

		if (!matchEl || !chipsEl || !resultsEl || !tagSelect) return;

		const total = this.entries.length;

		const facetEntries = filterEntriesForTagFacets(this.entries, {
			query: this.query,
			type: this.typeFilter,
			status: this.statusFilter,
		});

		const tagCounts = computeUserTagCounts(facetEntries);
		this.updateTagSelect(tagCounts);
		this.updateTagChips(tagCounts);

		const filtered = filterLibraryEntries(this.entries, {
			query: this.query,
			type: this.typeFilter,
			status: this.statusFilter,
			tag: this.tagFilter,
		});

		matchEl.setText(`匹配 ${filtered.length} / 总计 ${total}`);

		resultsEl.empty();
		if (filtered.length === 0) {
			resultsEl.createEl("p", {text: "没有匹配的笔记。"});
			return;
		}

		const groups = groupByType(filtered);
		for (const groupType of TYPE_ORDER) {
			const groupEntries = groups.get(groupType);
			if (!groupEntries || groupEntries.length === 0) continue;

			sortEntriesInPlace(groupEntries);

			const details = resultsEl.createEl("details", {cls: "zk-library-group"});
			const key = groupType;
			details.open = this.expandedTypes.has(key);
			details.addEventListener("toggle", () => {
				if (details.open) this.expandedTypes.add(key);
				else this.expandedTypes.delete(key);
			});

			const inboxCount = groupEntries.filter((e) => e.effectiveStatus === "inbox").length;
			const summaryParts = [`${getZkTypeLabel(groupType)}（${groupEntries.length}）`];
			if (inboxCount > 0) summaryParts.push(`${getZkStatusLabel("inbox")} ${inboxCount}`);
			details.createEl("summary", {text: summaryParts.join(" · ")});

			const body = details.createDiv({cls: "zk-library-groupBody"});
			const limit = this.limitByType.get(groupType) ?? DEFAULT_PER_TYPE_LIMIT;
			const visible = groupEntries.slice(0, limit);

			for (const entry of visible) {
				const setting = new Setting(body).setName(entry.basename).setDesc(buildEntryDesc(entry));

				setting.addButton((btn) => btn.setButtonText("打开").onClick(() => openFile(this.plugin, entry.file)));

				if (entry.effectiveStatus === "inbox") {
					setting.addButton((btn) =>
						btn.setButtonText("处理").onClick(() => new ProcessWizardModal(this.plugin, entry.file).open()),
					);
				}

				if (entry.effectiveType === "permanent" && !entry.zkId) {
					setting.addButton((btn) =>
						btn.setButtonText("分配").onClick(() => new AssignZkIdModal(this.plugin, entry.file).open()),
					);
				}
			}

			if (groupEntries.length > limit) {
				const moreButton = body.createEl("button", {
					cls: "zk-library-more",
					text: "显示更多",
					attr: {type: "button"},
				});
				moreButton.addEventListener("click", () => {
					this.limitByType.set(groupType, limit + DEFAULT_PER_TYPE_LIMIT);
					this.updateUI();
				});
			}
		}
	}

	private updateTagSelect(tagCounts: TagCount[]) {
		if (!this.tagSelect) return;

		const selected = this.tagFilter ?? "all";
		const top = tagCounts.slice(0, TAG_DROPDOWN_LIMIT);

		const hasSelected = selected === "all" || top.some((t) => t.tag === selected);
		const selectedCount = selected === "all" ? undefined : tagCounts.find((t) => t.tag === selected)?.count ?? 0;

		this.tagSelect.empty();
		this.tagSelect.createEl("option", {value: "all", text: "全部标签（tags）"});
		for (const {tag, count} of top) {
			this.tagSelect.createEl("option", {value: tag, text: `${tag}（${count}）`});
		}
		if (!hasSelected && selected !== "all") {
			this.tagSelect.createEl("option", {
				value: selected,
				text: `${selected}（${selectedCount ?? 0}）`,
			});
		}

		this.tagSelect.value = selected;
	}

	private updateTagChips(tagCounts: TagCount[]) {
		if (!this.chipsEl) return;
		this.chipsEl.empty();

		const top = tagCounts.slice(0, TAG_CHIP_LIMIT);
		for (const {tag, count} of top) {
			const active = this.tagFilter === tag;
			const btn = this.chipsEl.createEl("button", {
				cls: ["zk-library-chip", active ? "is-active" : ""].filter(Boolean),
				attr: {type: "button", "aria-label": `筛选标签 ${tag}`},
			});
			btn.createSpan({text: `#${tag}`});
			btn.createSpan({cls: "zk-library-chipCount", text: String(count)});
			btn.addEventListener("click", () => {
				this.tagFilter = active ? undefined : tag;
				if (this.tagSelect) this.tagSelect.value = this.tagFilter ?? "all";
				this.updateUI();
			});
		}
	}
}
