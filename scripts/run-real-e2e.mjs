import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, createWriteStream } from "node:fs";

const children = [];
let container = "";
const logDirectory = ".e2e-logs";
const springLog = `${logDirectory}/spring-boot.log`;
const summaryPath = `${logDirectory}/orchestrator-summary.json`;
const summary = { startedAt: new Date().toISOString(), container: null, backend: "not started", frontend: "not started", cleanup: "not started" };
const fail = message => { throw new Error(message); };
const exec = (command, args) => {
  const result = spawnSync(command, args, { encoding: "utf8" });
  if (result.status !== 0) fail(`${command} ${args.join(" ")} failed: ${result.stderr}`);
  return result.stdout.trim();
};
const redact = value => value
  .replace(/(Using generated security password).*$/gim, "$1 [REDACTED]")
  .replace(/(password(?:\s+is)?\s*(?:=|:)?\s*)\S+/gi, "$1[REDACTED]")
  .replace(/(JSESSIONID|XSRF-TOKEN)=([^;\s]+)/gi, "$1=[REDACTED]")
  .replace(/(Bearer\s+)\S+/gi, "$1[REDACTED]");
const start = (command, args, env, log) => {
  const child = spawn(command, args, { stdio: log ? ["ignore", "pipe", "pipe"] : "inherit", env: { ...process.env, ...env } });
  if (log) {
    const stream = createWriteStream(log, { flags: "a" });
    let pending = "";
    const writeRedactedLines = chunk => {
      pending += chunk.toString();
      const lines = pending.split(/\r?\n/);
      pending = lines.pop();
      if (lines.length) stream.write(`${lines.map(redact).join("\n")}\n`);
    };
    for (const output of [child.stdout, child.stderr]) output.on("data", writeRedactedLines);
    child.on("exit", () => { if (pending) stream.write(redact(pending)); stream.end(); });
  }
  children.push(child);
  return child;
};
const wait = async url => {
  const deadline = Date.now() + 90000;
  while (Date.now() < deadline) {
    try { if ((await fetch(url)).ok) return; } catch {}
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  fail(`Timed out waiting for ${url}`);
};
const cleanup = () => {
  children.forEach(process => process.kill("SIGTERM"));
  if (container) spawnSync("docker", ["rm", "-f", container], { stdio: "inherit" });
  summary.cleanup = "backend and frontend signalled; disposable PostgreSQL removal requested";
  summary.finishedAt = new Date().toISOString();
  writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);
};
process.on("SIGINT", () => { cleanup(); process.exit(130); });
process.on("SIGTERM", () => { cleanup(); process.exit(143); });

try {
  mkdirSync(logDirectory, { recursive: true });
  writeFileSync(springLog, `Real E2E Spring Boot log started ${summary.startedAt}\n`);
  exec("docker", ["info"]);
  container = `codepath-e2e-${Date.now()}`;
  summary.container = container;
  exec("docker", ["run", "-d", "--rm", "--name", container, "-e", "POSTGRES_DB=codepath_e2e", "-e", "POSTGRES_USER=e2e", "-e", "POSTGRES_PASSWORD=e2e-only", "-p", "127.0.0.1::5432", "postgres:17-alpine"]);
  const port = exec("docker", ["port", container, "5432/tcp"]).split(":").pop();
  const apiOrigin = "http://127.0.0.1:18080";
  const env = { SPRING_PROFILES_ACTIVE: "e2e", E2E_DATABASE_URL: `jdbc:postgresql://127.0.0.1:${port}/codepath_e2e`, E2E_DATABASE_USERNAME: "e2e", E2E_DATABASE_PASSWORD: "e2e-only", E2E_API_PORT: "18080", E2E_WEB_PORT: "4176", E2E_API_ORIGIN: apiOrigin };
  const homebrewMaven = spawnSync("brew", ["--prefix", "maven"], { encoding: "utf8" });
  const mvn = process.env.MVN_CMD || (spawnSync("mvn", ["-v"], { stdio: "ignore" }).status === 0 ? "mvn" : homebrewMaven.status === 0 ? `${homebrewMaven.stdout.trim()}/bin/mvn` : fail("Maven is required; install it or set MVN_CMD."));
  start(mvn, ["-f", "apps/api/pom.xml", "spring-boot:run"], env, springLog);
  await wait(`${apiOrigin}/actuator/health`);
  summary.backend = "healthy";
  start("npm", ["run", "dev", "--", "--host", "127.0.0.1", "--port", "4176", "--mode", "e2e"], { ...env, VITE_API_BASE_URL: "", VITE_E2E_PROXY_TARGET: apiOrigin });
  await wait("http://127.0.0.1:4176");
  summary.frontend = "healthy";
  const playwright = start("npx", ["playwright", "test", "-c", "playwright.real.config.ts"], env);
  const code = await new Promise(resolve => playwright.on("exit", resolve));
  if (code !== 0) process.exitCode = code;
} finally {
  cleanup();
}
