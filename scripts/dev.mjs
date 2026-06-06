import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const children = [];
const rootCwd = process.cwd();
const localEnv = loadLocalEnv(join(rootCwd, ".env.local"));

function run(name, command, args, options = {}) {
  const child = spawn(command, args, {
    stdio: "inherit",
    shell: false,
    env: {
      ...process.env,
      ...localEnv,
      ...(options.env || {}),
    },
    ...options,
  });

  children.push(child);

  child.on("exit", (code, signal) => {
    if (shuttingDown) return;

    const reason = signal ? `signal ${signal}` : `code ${code}`;
    console.error(`[${name}] stopped unexpectedly with ${reason}`);
    shutdown(code || 1);
  });

  return child;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function loadLocalEnv(path) {
  if (!existsSync(path)) {
    return {};
  }

  return Object.fromEntries(
    readFileSync(path, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        const key = line.slice(0, index).trim();
        const rawValue = line.slice(index + 1).trim();
        const value = rawValue.replace(/^["']|["']$/g, "");
        return [key, value];
      })
      .filter(([, value]) => value !== "PASTE_GOOGLE_APP_PASSWORD_HERE")
  );
}

let shuttingDown = false;

async function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const child of children) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }

  await sleep(500);
  process.exit(exitCode);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

async function main() {
  const backendCwd = `${rootCwd}/backend`;

  console.log("[dev] Starting Spring Boot backend...");
  run("backend", "./mvnw", ["spring-boot:run"], { cwd: backendCwd });
  await sleep(4000);

  console.log("[dev] Starting frontend...");
  run("frontend", "npm", ["run", "dev"], { cwd: `${rootCwd}/frontend` });
}

main().catch((error) => {
  console.error("[dev] Failed to start development environment");
  console.error(error);
  shutdown(1);
});
