import type {ZkStatus, ZkType} from "../model/zk";
import {ZK_FRONTMATTER_KEYS} from "../model/zk";
import {t} from "../i18n";

type Unknown = "unknown";

export function getZkFieldLabel(key: keyof typeof ZK_FRONTMATTER_KEYS): string {
	switch (key) {
		case "type":
			return t("labels.field.type");
		case "status":
			return t("labels.field.status");
		case "id":
			return t("labels.field.id");
		case "source":
			return t("labels.field.source");
		default: {
			const _exhaustive: never = key;
			return _exhaustive;
		}
	}
}

export function getZkStatusLabel(status?: ZkStatus | Unknown): string {
	switch (status) {
		case "inbox":
			return t("labels.zkStatus.inbox");
		case "processing":
			return t("labels.zkStatus.processing");
		case "done":
			return t("labels.zkStatus.done");
		case "archived":
			return t("labels.zkStatus.archived");
		case "unknown":
		case undefined:
			return t("labels.zkStatus.unknown");
		default: {
			const _exhaustive: never = status;
			return _exhaustive;
		}
	}
}

export function getZkTypeLabel(type?: ZkType | Unknown): string {
	switch (type) {
		case "fleeting":
			return t("labels.zkType.fleeting");
		case "literature":
			return t("labels.zkType.literature");
		case "permanent":
			return t("labels.zkType.permanent");
		case "index":
			return t("labels.zkType.index");
		case "project":
			return t("labels.zkType.project");
		case "unknown":
		case undefined:
			return t("labels.zkType.unknown");
		default: {
			const _exhaustive: never = type;
			return _exhaustive;
		}
	}
}
