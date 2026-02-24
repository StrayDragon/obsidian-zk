import {spawn} from "node:child_process";
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
	}
	return out;
}

function usage() {
	return [
		"Usage:",
		"  npm run vault:dev -- --vault <vaultPath> [--copy] [--obsidian-dir <dir>]",
		"",
		"Notes:",
		"  - Links plugin files into the vault and starts esbuild watch.",
		"  - Default Obsidian config dir is .obsidian (override with --obsidian-dir).",
		"  - If symlinks are restricted on your system, add --copy.",
	].join("\n");
}

function run(command, args, options) {
	return new Promise((resolve) => {
		const child = spawn(command, args, {
			stdio: "inherit",
			...options,
		});

		child.on("close", (code) => {
			resolve(typeof code === "number" ? code : 1);
		});
	});
}

async function main() {
	const args = parseArgs(process.argv.slice(2));
	if (args.help) {
		console.log(usage());
		return;
	}

	const vault = args.vault ?? process.env.OBSIDIAN_VAULT ?? process.env.VAULT;
	if (!vault) {
		console.error("Missing required --vault <path> (or set OBSIDIAN_VAULT/VAULT).");
		console.error();
		console.error(usage());
		process.exitCode = 1;
		return;
	}

	const __filename = fileURLToPath(import.meta.url);
	const __dirname = path.dirname(__filename);
	const repoRoot = path.resolve(__dirname, "..");

	const linkArgs = [
		path.join("scripts", "vault.mjs"),
		"link",
		"--vault",
		vault,
	];
	if (args.copy === true) linkArgs.push("--copy");
	if (typeof args.obsidianDir === "string" && args.obsidianDir.trim()) {
		linkArgs.push("--obsidian-dir", args.obsidianDir.trim());
	}

	const linkExitCode = await run(process.execPath, linkArgs, {cwd: repoRoot});
	if (linkExitCode !== 0) {
		process.exitCode = linkExitCode;
		return;
	}

	const devExitCode = await run(process.execPath, [path.join("esbuild.config.mjs")], {cwd: repoRoot});
	process.exitCode = devExitCode;
}

await main();

