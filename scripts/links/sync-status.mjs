import { readFileSync, writeFileSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";

const inputPath = path.resolve("src/data/links/links.json");
const outputPath = path.resolve("src/data/links/generated.json");
const userAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const source = JSON.parse(readFileSync(inputPath, "utf-8"));
const checkedAt = new Date().toISOString();
const output = readJson(outputPath);
const currentUrls = getCurrentUrls(source);

pruneGeneratedOutput(output, currentUrls);

for (const item of source.blogroll ?? []) {
  const reachable = await probeReachability(item.url);
  output[item.url] = {
    ...output[item.url],
    status: reachable ? "up" : "down",
    checkedAt,
  };
}

writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Link statuses written to ${path.relative(process.cwd(), outputPath)}`);

function readJson(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, "utf-8"));
  } catch {
    return {};
  }
}

function getCurrentUrls(source) {
  return new Set([
    ...(source.blogroll ?? []).map((item) => item.url),
    ...(source.videos ?? []).map((item) => item.url),
  ]);
}

function pruneGeneratedOutput(output, currentUrls) {
  for (const url of Object.keys(output)) {
    if (!currentUrls.has(url)) {
      delete output[url];
    }
  }
}

async function probeReachability(url) {
  const headStatus = await requestStatus(url, "HEAD");
  if (isUpStatus(headStatus)) return true;

  const getStatus = await requestStatus(url, "GET");
  return isUpStatus(getStatus);
}

function requestStatus(url, method) {
  return new Promise((resolve) => {
    const args = [
      "-L",
      "-sS",
      "-o",
      "/dev/null",
      "-w",
      "%{http_code}",
      "--retry",
      "2",
      "--retry-delay",
      "2",
      "--connect-timeout",
      "10",
      "--max-time",
      "20",
      "-A",
      userAgent,
      url,
    ];

    if (method === "HEAD") {
      args.splice(2, 0, "-I");
    } else {
      args.splice(2, 0, "-X", "GET");
    }

    const child = spawn("curl", args, { stdio: ["ignore", "pipe", "ignore"] });
    let stdout = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.on("error", () => resolve(0));
    child.on("close", (code) => {
      if (code !== 0) {
        resolve(0);
        return;
      }
      resolve(Number.parseInt(stdout.trim(), 10) || 0);
    });
  });
}

function isUpStatus(code) {
  return code >= 200 && code < 400;
}
