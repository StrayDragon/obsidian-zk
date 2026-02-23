import type {ZkStatus, ZkType} from "../model/zk";
import {ZK_FRONTMATTER_KEYS} from "../model/zk";

type Unknown = "unknown";

export function getZkFieldLabel(key: keyof typeof ZK_FRONTMATTER_KEYS): string {
	switch (key) {
		case "type":
			return `类型（${ZK_FRONTMATTER_KEYS.type}）`;
		case "status":
			return `状态（${ZK_FRONTMATTER_KEYS.status}）`;
		case "id":
			return `卡片 ID（${ZK_FRONTMATTER_KEYS.id}）`;
		case "source":
			return `来源（${ZK_FRONTMATTER_KEYS.source}）`;
		default: {
			const _exhaustive: never = key;
			return _exhaustive;
		}
	}
}

export function getZkStatusLabel(status?: ZkStatus | Unknown): string {
	switch (status) {
		case "inbox":
			return "收集箱（inbox）";
		case "processing":
			return "处理中（processing）";
		case "done":
			return "已完成（done）";
		case "archived":
			return "已归档（archived）";
		case "unknown":
		case undefined:
			return "未标记（unknown）";
		default: {
			const _exhaustive: never = status;
			return _exhaustive;
		}
	}
}

export function getZkTypeLabel(type?: ZkType | Unknown): string {
	switch (type) {
		case "fleeting":
			return "闪念笔记（fleeting）";
		case "literature":
			return "文献笔记（literature）";
		case "permanent":
			return "永久笔记（permanent）";
		case "index":
			return "索引笔记（index）";
		case "project":
			return "项目笔记（project）";
		case "unknown":
		case undefined:
			return "未标记（unknown）";
		default: {
			const _exhaustive: never = type;
			return _exhaustive;
		}
	}
}

