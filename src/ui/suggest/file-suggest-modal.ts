import {FuzzySuggestModal, TFile} from "obsidian";

export class FileSuggestModal extends FuzzySuggestModal<TFile> {
	constructor(
		app: import("obsidian").App,
		private readonly items: TFile[],
		private readonly onChoose: (file: TFile) => void,
		options?: {placeholder?: string; emptyStateText?: string},
	) {
		super(app);
		this.setPlaceholder(options?.placeholder ?? "搜索文件…");
		this.emptyStateText = options?.emptyStateText ?? "没有匹配结果";
	}

	getItems(): TFile[] {
		return this.items;
	}

	getItemText(item: TFile): string {
		return item.basename;
	}

	onChooseItem(item: TFile): void {
		this.onChoose(item);
	}

	renderSuggestion(item: import("obsidian").FuzzyMatch<TFile>, el: HTMLElement): void {
		el.createEl("div", {text: item.item.basename});
		el.createEl("small", {text: item.item.path});
	}
}

