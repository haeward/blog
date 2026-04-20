import { mkdirSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import process from "node:process";
import path from "node:path";

const userAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const sourcePath = path.resolve("src/data/links/links.json");
const outputPath = path.resolve("src/data/links/generated.json");
const publicDir = path.resolve("public/assets/images/links");
const blogrollDir = path.join(publicDir, "blogroll");
const videosDir = path.join(publicDir, "videos");

mkdirSync(blogrollDir, { recursive: true });
mkdirSync(videosDir, { recursive: true });

const source = JSON.parse(await readFile(sourcePath, "utf-8"));
const output = await readJson(outputPath);
const currentUrls = getCurrentUrls(source);

pruneGeneratedOutput(output, currentUrls);

for (const item of source.blogroll ?? []) {
  const image = await syncBlogrollAsset(item);
  if (image) output[item.url] = { ...output[item.url], image };
}

for (const item of source.videos ?? []) {
  const image = await syncVideoAsset(item);
  if (image) output[item.url] = { ...output[item.url], image };
}

deleteOrphanAssets(output);
writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Link assets written to ${path.relative(process.cwd(), outputPath)}`);

async function readJson(filePath) {
  try {
    return JSON.parse(await readFile(filePath, "utf-8"));
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

function deleteOrphanAssets(output) {
  const referencedImages = new Set(
    Object.values(output)
      .map((entry) => entry?.image)
      .filter(Boolean),
  );

  for (const dir of [blogrollDir, videosDir]) {
    for (const name of readdirSync(dir)) {
      const filePath = path.join(dir, name);
      const publicPath = toPublicPath(filePath);
      if (!referencedImages.has(publicPath)) {
        rmSync(filePath, { force: true });
      }
    }
  }
}

async function syncBlogrollAsset(item) {
  const fileBase = createKey(item.url);
  const existing = findExistingAsset(blogrollDir, fileBase);
  if (existing) return toPublicPath(existing);

  const downloaded = await downloadFirstAvailableAsset(
    [
      await findDeclaredIcon(item.url),
      await findNamedImage(item.url),
      await findOgImage(item.url),
      buildFallbackFavicon(item.url),
      buildFaviconServiceUrl(item.url),
    ],
    blogrollDir,
    fileBase,
    item.url,
  );
  if (downloaded) return toPublicPath(downloaded);
  return undefined;
}

async function syncVideoAsset(item) {
  const fileBase = createKey(item.url);
  const existing = findExistingAsset(videosDir, fileBase);
  if (existing) return toPublicPath(existing);

  const downloaded = await downloadFirstAvailableAsset(
    [
      await findOgImage(item.url),
      await findDeclaredIcon(item.url),
      await findNamedImage(item.url),
      buildFallbackFavicon(item.url),
      buildFaviconServiceUrl(item.url),
    ],
    videosDir,
    fileBase,
    item.url,
  );
  if (downloaded) return toPublicPath(downloaded);
  return undefined;
}

function createKey(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    const tail = parsed.pathname
      .split("/")
      .filter(Boolean)
      .slice(-1)[0];
    return [host, tail].filter(Boolean).join("-").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  } catch {
    return url.replace(/[^a-zA-Z0-9._-]+/g, "-");
  }
}

function findExistingAsset(dir, fileBase) {
  const match = readdirSync(dir).find((name) => name === fileBase || name.startsWith(`${fileBase}.`));
  return match ? path.join(dir, match) : undefined;
}

function toPublicPath(filePath) {
  return `/${path.relative(path.resolve("public"), filePath).split(path.sep).join("/")}`;
}

async function findDeclaredIcon(pageUrl) {
  const html = await fetchText(pageUrl);
  if (!html) return undefined;

  const candidates = [];
  for (const tag of findTags(html, "link")) {
    const rel = getAttribute(tag, "rel")?.toLowerCase() ?? "";
    if (!isIconRel(rel)) continue;
    const href = getAttribute(tag, "href");
    if (!href) continue;

    candidates.push({
      href: resolveUrl(pageUrl, href),
      rel,
      type: getAttribute(tag, "type")?.toLowerCase() ?? "",
      sizes: getAttribute(tag, "sizes")?.toLowerCase() ?? "",
    });
  }

  return candidates
    .sort((a, b) => getIconCandidateScore(b) - getIconCandidateScore(a))
    .at(0)?.href;
}

function isIconRel(rel) {
  if (!rel.includes("icon")) return false;
  if (rel.includes("mask-icon")) return false;
  return true;
}

function getIconCandidateScore(candidate) {
  let score = 0;

  if (candidate.rel.includes("apple-touch-icon")) score += 25;
  if (candidate.rel.split(/\s+/).includes("icon")) score += 20;
  if (candidate.href.startsWith("data:")) score += 18;
  if (candidate.type.includes("svg")) score += 14;
  if (candidate.type.includes("png")) score += 12;
  if (candidate.type.includes("x-icon") || candidate.href.endsWith(".ico")) score += 8;

  const size = getLargestDeclaredSize(candidate.sizes);
  if (size) {
    score += Math.max(0, 40 - Math.abs(size - 32));
  } else if (candidate.sizes === "any") {
    score += 12;
  }

  return score;
}

function getLargestDeclaredSize(sizes) {
  const matches = [...sizes.matchAll(/(\d+)x(\d+)/g)];
  if (!matches.length) return undefined;
  return Math.max(...matches.map((match) => Math.max(Number(match[1]), Number(match[2]))));
}

async function findOgImage(pageUrl) {
  const html = await fetchText(pageUrl);
  if (!html) return undefined;

  for (const tag of findTags(html, "meta")) {
    const property = getAttribute(tag, "property")?.toLowerCase();
    const name = getAttribute(tag, "name")?.toLowerCase();
    const itemProp = getAttribute(tag, "itemprop")?.toLowerCase();
    if (property !== "og:image" && name !== "og:image" && itemProp !== "image") continue;

    const content = getAttribute(tag, "content");
    if (!content) continue;
    return resolveUrl(pageUrl, content);
  }

  return undefined;
}

function getAttribute(tag, name) {
  const patterns = [
    new RegExp(`${name}\\s*=\\s*"([^"]+)"`, "i"),
    new RegExp(`${name}\\s*=\\s*'([^']+)'`, "i"),
    new RegExp(`${name}\\s*=\\s*([^\\s>]+)`, "i"),
  ];

  for (const pattern of patterns) {
    const match = tag.match(pattern);
    if (match?.[1]) return decodeHtmlEntities(match[1]);
  }

  return undefined;
}

async function findNamedImage(pageUrl) {
  const html = await fetchText(pageUrl);
  if (!html) return undefined;

  const candidates = [];
  for (const tag of findTags(html, "img")) {
    const src = getAttribute(tag, "src");
    if (!src) continue;

    const value = src.toLowerCase();
    if (!/(favicon|icon|logo|avatar|wechat)/.test(value)) continue;

    candidates.push({
      src: resolveUrl(pageUrl, src),
      score: getNamedImageScore(value),
    });
  }

  return candidates.sort((a, b) => b.score - a.score).at(0)?.src;
}

function getNamedImageScore(value) {
  let score = 0;
  if (value.includes("favicon")) score += 40;
  if (value.includes("icon")) score += 30;
  if (value.includes("logo")) score += 20;
  if (value.includes("avatar")) score += 18;
  if (value.includes("wechat")) score += 12;
  if (/\.(svg|png|ico|webp|jpg|jpeg)(?:$|\?)/.test(value)) score += 10;
  return score;
}

function findTags(html, tagName) {
  const tags = [];
  const lower = html.toLowerCase();
  const needle = `<${tagName}`;
  let start = 0;

  while ((start = lower.indexOf(needle, start)) !== -1) {
    let quote = "";
    for (let index = start + needle.length; index < html.length; index += 1) {
      const char = html[index];

      if (quote) {
        if (char === quote) quote = "";
        continue;
      }

      if (char === "\"" || char === "'") {
        quote = char;
        continue;
      }

      if (char === ">") {
        tags.push(html.slice(start, index + 1));
        start = index + 1;
        break;
      }
    }

    start += 1;
  }

  return tags;
}

function decodeHtmlEntities(value) {
  return value
    .replace(/&#x([0-9a-f]+);?/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);?/g, (_, number) => String.fromCodePoint(Number.parseInt(number, 10)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function resolveUrl(base, value) {
  try {
    return new URL(value, base).toString();
  } catch {
    return value;
  }
}

function buildFallbackFavicon(pageUrl) {
  try {
    return new URL("/favicon.ico", pageUrl).toString();
  } catch {
    return pageUrl;
  }
}

function buildFaviconServiceUrl(pageUrl) {
  return `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(pageUrl)}&sz=64`;
}

function fetchText(url) {
  return new Promise((resolve) => {
    const args = [
      "-L",
      "-sS",
      "--fail",
      "--retry",
      "2",
      "--retry-delay",
      "2",
      "--connect-timeout",
      "10",
      "--max-time",
      "25",
      "-A",
      userAgent,
      url,
    ];

    const child = spawn("curl", args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.on("error", () => resolve(undefined));
    child.on("close", (code) => resolve(code === 0 ? stdout : undefined));
  });
}

function downloadAsset(url, outDir, fileBase, referer) {
  if (url.startsWith("data:")) {
    return saveDataUrlAsset(url, outDir, fileBase);
  }

  return new Promise((resolve) => {
    const tempPath = path.join(outDir, `${fileBase}.tmp`);
    const args = [
      "-L",
      "-sS",
      "--fail",
      "--retry",
      "2",
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
      "-D",
      "-",
      "-o",
      tempPath,
      url,
    ];

    const child = spawn("curl", args, { stdio: ["ignore", "pipe", "pipe"] });
    let headers = "";
    child.stdout.on("data", (chunk) => {
      headers += chunk.toString();
    });

    child.on("error", () => {
      cleanupTemp(tempPath);
      resolve(undefined);
    });

    child.on("close", (code) => {
      if (code !== 0 || !isExistingFile(tempPath)) {
        cleanupTemp(tempPath);
        resolve(undefined);
        return;
      }

      const extension = getExtensionFromHeaders(headers) ?? getExtensionFromUrl(url) ?? ".png";
      const finalPath = path.join(outDir, `${fileBase}${extension}`);
      cleanupTemp(finalPath);
      renameSync(tempPath, finalPath);
      resolve(finalPath);
    });
  });
}

async function downloadFirstAvailableAsset(urls, outDir, fileBase, referer) {
  for (const url of urls.filter(Boolean)) {
    const downloaded = await downloadAsset(url, outDir, fileBase, referer);
    if (downloaded) return downloaded;
  }

  return undefined;
}

function saveDataUrlAsset(url, outDir, fileBase) {
  const match = url.match(/^data:([^;,]+)?(;base64)?,(.*)$/s);
  if (!match) return undefined;

  const mimeType = match[1] ?? "image/svg+xml";
  const isBase64 = Boolean(match[2]);
  const payload = match[3] ?? "";
  const extension = getExtensionFromMimeType(mimeType) ?? ".svg";
  const finalPath = path.join(outDir, `${fileBase}${extension}`);
  const content = isBase64 ? Buffer.from(payload, "base64") : Buffer.from(decodeURIComponent(payload));

  cleanupTemp(finalPath);
  writeFileSync(finalPath, content);
  return finalPath;
}

function getExtensionFromMimeType(mimeType) {
  const normalized = mimeType.toLowerCase();
  if (normalized.includes("svg")) return ".svg";
  if (normalized.includes("png")) return ".png";
  if (normalized.includes("jpeg")) return ".jpg";
  if (normalized.includes("jpg")) return ".jpg";
  if (normalized.includes("webp")) return ".webp";
  if (normalized.includes("x-icon") || normalized.includes("icon")) return ".ico";
  if (normalized.includes("gif")) return ".gif";
  return undefined;
}

function getExtensionFromHeaders(headers) {
  const contentTypeMatches = [...headers.matchAll(/^content-type:\s*([^\r\n;]+)/gim)];
  const contentType = contentTypeMatches.at(-1)?.[1]?.toLowerCase();
  if (!contentType) return undefined;

  return getExtensionFromMimeType(contentType);
}

function getExtensionFromUrl(url) {
  try {
    const ext = path.extname(new URL(url).pathname);
    return ext || undefined;
  } catch {
    return undefined;
  }
}

function isExistingFile(filePath) {
  try {
    return statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function cleanupTemp(filePath) {
  try {
    rmSync(filePath, { force: true });
  } catch {
    // ignore cleanup failures
  }
}
