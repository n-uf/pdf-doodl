import { execSync } from "node:child_process";

/**
 * Root release entry: fan out to all publishable packages.
 *
 * pnpm appends unknown flags (e.g. `--nobump=true`) to the script argv as
 * literal text. That breaks shell `if …; fi` package scripts and only hit the
 * last `&&`-chained filter. Convert the flag into `npm_config_nobump` so every
 * package's existing release script sees it (same contract as
 * `npm run release --nobump=true`).
 */
const nobump =
  process.env.npm_config_nobump === "true" ||
  process.argv.includes("--nobump=true") ||
  process.argv.includes("--nobump");

const env = { ...process.env };
if (nobump) {
  env.npm_config_nobump = "true";
}

execSync(
  "pnpm -r --filter './packages/*' --workspace-concurrency=1 release",
  { stdio: "inherit", env },
);
