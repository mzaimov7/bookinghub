import { spawn } from "node:child_process";

const children = [];

function run(name, command, args, options = {}) {
  const child = spawn(command, args, {
    stdio: "inherit",
    shell: false,
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
  const backendCwd = `${process.cwd()}/backend`;

  console.log("[dev] Starting Spring Boot backend...");
  run("backend", "./mvnw", ["spring-boot:run"], { cwd: backendCwd });
  await sleep(4000);

  console.log("[dev] Starting frontend...");
  run("frontend", "npm", ["run", "dev"], { cwd: `${process.cwd()}/frontend` });
}

main().catch((error) => {
  console.error("[dev] Failed to start development environment");
  console.error(error);
  shutdown(1);
});
