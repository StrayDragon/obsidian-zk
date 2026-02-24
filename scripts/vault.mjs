import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import {fileURLToPath} from "node:url";

function parseArgs(argv) {
	const out = {};
	for (let i = 0; i < argv.length; i++) {
		const token = argv[i];
		if (!token) continue;

		if (token === "--help" || token === "-h") {
			out.help = true;
			continue;
		}

		if (token.startsWith("--vault=")) {
			out.vault = token.slice("--vault=".length);
			continue;
		}

		if (token === "--vault") {
			out.vault = argv[i + 1];
			i++;
			continue;
		}

		if (token === "--copy") {
			out.copy = true;
			continue;
		}

		if (token === "--obsidian-dir") {
			out.obsidianDir = argv[i + 1];
			i++;
			continue;
		}

		if (!out.command && !token.startsWith("-")) out.command = token;
	}
	return out;
}

function usage() {
	return [
		"Usage:",
		"  node scripts/vault.mjs link --vault <vaultPath> [--copy] [--obsidian-dir <dir>]",
		"",
		"Examples:",
		'  VAULT="/path/to/Vault" npm run vault:dev',
		'  npm run vault:dev -- --vault "/path/to/Vault"',
		"",
		"Notes:",
		"  - Default Obsidian config dir is .obsidian (override with --obsidian-dir).",
		"  - This will create symlinks for manifest.json, styles.css (if present) and main.js.",
	].join("\n");
}

async function pathExists(p) {
	try {
		await fs.lstat(p);
		return true;
	} catch {
		return false;
	}
}

async function safeRemove(p) {
	try {
		await fs.rm(p, {force: true});
	} catch {
		// ignore
	}
}

async function linkOrCopy({src, dest, copy, requireSource}) {
	const exists = await pathExists(src);
	if (!exists) {
		if (copy || requireSource) {
			throw new Error(`Source file not found: ${src}`);
		}
	}

	const destStat = await fs.lstat(dest).catch(() => null);
	if (destStat) {
		await safeRemove(dest);
	}

	if (copy) {
		await fs.copyFile(src, dest);
		return;
	}

	await fs.symlink(src, dest);
}

async function main() {
	const args = parseArgs(process.argv.slice(2));
	if (args.help) {
		console.log(usage());
		return;
	}

	const command = args.command ?? "link";
	if (command !== "link") {
		throw new Error(`Unknown command: ${command}`);
	}

	const vault = args.vault ?? process.env.OBSIDIAN_VAULT ?? process.env.VAULT;
	if (!vault) {
		console.error("Missing required --vault <path> (or set OBSIDIAN_VAULT/VAULT).");
		console.error();
		console.error(usage());
		process.exitCode = 1;
		return;
	}

	const obsidianDirName = args.obsidianDir ?? ".obsidian";

	const __filename = fileURLToPath(import.meta.url);
	const __dirname = path.dirname(__filename);
	const repoRoot = path.resolve(__dirname, "..");

	const manifestPath = path.join(repoRoot, "manifest.json");
	const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
	const pluginId = manifest?.id;
	if (typeof pluginId !== "string" || !pluginId.trim()) {
		throw new Error("manifest.json is missing a valid 'id' field.");
	}

	const pluginDir = path.join(vault, obsidianDirName, "plugins", pluginId);
	await fs.mkdir(pluginDir, {recursive: true});

	const linkPlan = [
		{file: "manifest.json", optional: false, requireSource: true},
		{file: "styles.css", optional: true},
		// Allow linking main.js even if it does not exist yet. This makes `npm run vault:dev`
		// work from a clean repo before the first esbuild output is produced.
		{file: "main.js", optional: false, requireSource: args.copy === true},
	];

	const created = [];
	for (const entry of linkPlan) {
		const src = path.join(repoRoot, entry.file);
		const dest = path.join(pluginDir, entry.file);

		if (entry.optional && !(await pathExists(src))) continue;

		try {
			await linkOrCopy({
				src,
				dest,
				copy: args.copy === true,
				requireSource: entry.requireSource === true,
			});
			created.push(entry.file);
		} catch (error) {
			console.error(error);
			if (!args.copy) {
				console.error();
				console.error(
					"Symlink failed. If you're on a system that restricts symlinks, re-run with --copy.",
				);
			}
			process.exitCode = 1;
			return;
		}
	}

	console.log(`Linked into vault plugin dir: ${pluginDir}`);
	console.log(`Files: ${created.join(", ")}`);

	if (!(await pathExists(path.join(repoRoot, "main.js")))) {
		console.log("Note: main.js does not exist yet. Start the build/watch to generate it.");
	}
}

await main();
