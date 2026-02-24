export type ZkType = "fleeting" | "literature" | "permanent" | "index" | "project";

export type ZkStatus = "inbox" | "processing" | "done" | "archived";

export const ZK_FRONTMATTER_KEYS = {
	type: "zk_type",
	status: "zk_status",
	id: "zk_id",
	source: "zk_source",
} as const;

export interface ZkFrontmatter {
	zk_type?: ZkType;
	zk_status?: ZkStatus;
	zk_id?: string;
	zk_source?: string;
}

