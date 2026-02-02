import { mkdirSync, statSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { Console } from "node:console";
import { setTimeout as delay } from "node:timers/promises";
import process from "node:process";
import path from "node:path";

const tasks = [
  {
    kind: "movie",
    input: "data/douban/movie.json",
    refererFallback: "https://movie.douban.com/",
  },
  {
    kind: "book",
    input: "data/douban/book.json",
    refererFallback: "https://book.douban.com/",
  },
];

const publicDir = path.resolve("public");
const userAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const proxyTemplate = "https://images.weserv.nl/?url={url}";
const delayMs = 300;
const logger = new Console({ stdout: process.stdout, stderr: process.stderr });

let downloaded = 0;
let skipped = 0;
let failed = 0;

for (const task of tasks) {
  const outDir = path.join(publicDir, "douban", task.kind);
  mkdirSync(outDir, { recursive: true });

  const items = await readJson(task.input, task.kind);
  for (const item of items) {
    if (item?.status !== "done" || item?.is_private) continue;
    const subject = item.subject ?? {};
    const subjectUrl = subject.url ?? subject.sharing_url ?? item.sharing_url;
    const subjectId = getSubjectId(subjectUrl);
    if (!subjectId) continue;
    const imageUrl = subject?.pic?.normal ?? subject?.cover_url;
    if (!imageUrl) continue;

    const ext = getImageExtension(imageUrl);
    const outFile = path.join(outDir, `${subjectId}${ext}`);
    if (isExistingFile(outFile)) {
      skipped += 1;
      continue;
    }

    const ok = await downloadImage(imageUrl, outFile, subjectUrl ?? task.refererFallback);
    if (ok) {
      downloaded += 1;
    } else {
      failed += 1;
    }

    await delay(delayMs);
  }
}

logger.log(
  `Douban covers: downloaded ${downloaded}, skipped ${skipped}, failed ${failed}`
);

async function readJson(filePath, kind) {
  try {
    const content = await readFile(filePath, "utf-8");
    const data = JSON.parse(content);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    logger.warn(`Failed to read ${kind} data from ${filePath}: ${error?.message ?? error}`);
    return [];
  }
}

function getSubjectId(value) {
  if (!value) return undefined;
  const match = value.match(/subject\/(\d+)/);
  return match?.[1];
}

function getImageExtension(url) {
  if (!url) return ".jpg";
  try {
    const pathname = new URL(url).pathname;
    const ext = path.extname(pathname);
    return ext || ".jpg";
  } catch {
    return ".jpg";
  }
}

async function downloadImage(url, dest, referer) {
  const direct = await runCurl(url, dest, referer);
  if (direct.ok) return true;

  const proxiedUrl = applyProxy(url, proxyTemplate);
  const proxied = await runCurl(proxiedUrl, dest, referer);
  if (proxied.ok) return true;
  logger.warn(`Proxy failed ${proxiedUrl}: ${proxied.error}`);

  logger.warn(`Failed ${url}: ${direct.error}`);
  return false;
}

function runCurl(url, dest, referer) {
  return new Promise((resolve) => {
    const args = [
      "-L",
      "-sS",
      "--fail",
      "--retry",
      "3",
      "--retry-delay",
      "2",
      "--connect-timeout",
      "10",
      "--max-time",
      "30",
      "-A",
      userAgent,
      "-e",
      referer,
      "-o",
      dest,
      url,
    ];

    const child = spawn("curl", args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("error", (error) => {
      resolve({ ok: false, error: error.message });
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve({ ok: true });
        return;
      }
      const message = stderr.trim();
      resolve({ ok: false, error: message ? `curl exit ${code}: ${message}` : `curl exit ${code}` });
    });
  });
}

function applyProxy(url, template) {
  if (template.includes("{url}")) {
    return template.replace("{url}", encodeURIComponent(url));
  }
  return `${template}${encodeURIComponent(url)}`;
}

function isExistingFile(filePath) {
  try {
    const stats = statSync(filePath);
    return stats.size > 0;
  } catch {
    return false;
  }
}
