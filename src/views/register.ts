import type ZkWorkflowWizardPlugin from "../main";
import {ZkDashboardView, ZK_DASHBOARD_VIEW_TYPE} from "./dashboard-view";
import {ZkLibraryIndexView, ZK_LIBRARY_INDEX_VIEW_TYPE} from "./library-index-view";

export function registerViews(plugin: ZkWorkflowWizardPlugin) {
	plugin.registerView(ZK_DASHBOARD_VIEW_TYPE, (leaf) => new ZkDashboardView(leaf, plugin));
	plugin.register(() => plugin.app.workspace.detachLeavesOfType(ZK_DASHBOARD_VIEW_TYPE));

	plugin.registerView(ZK_LIBRARY_INDEX_VIEW_TYPE, (leaf) => new ZkLibraryIndexView(leaf, plugin));
	plugin.register(() => plugin.app.workspace.detachLeavesOfType(ZK_LIBRARY_INDEX_VIEW_TYPE));
}
