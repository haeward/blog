import { createReadStream } from "node:fs";
import { access, stat } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const DIST_DIR = path.resolve("dist");
const HOST = "127.0.0.1";
const ARTICLE_SLUG = "/blog/2025/travelogue-of-southern-shanxi/";

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".xml": "application/xml; charset=utf-8",
};

function fail(message) {
  throw new Error(message);
}

async function ensureBuiltSite() {
  await access(DIST_DIR);
}

async function resolveRequestPath(urlPath) {
  const pathname = decodeURIComponent(new URL(urlPath, `http://${HOST}`).pathname);
  let filePath = path.join(DIST_DIR, pathname);
  if (pathname.endsWith("/")) {
    filePath = path.join(DIST_DIR, pathname, "index.html");
  }

  try {
    const fileStat = await stat(filePath);
    if (fileStat.isDirectory()) {
      return path.join(filePath, "index.html");
    }
    return filePath;
  } catch {
    if (!path.extname(filePath)) {
      return path.join(filePath, "index.html");
    }
    throw new Error(`Missing file for ${pathname}`);
  }
}

async function startStaticServer() {
  const server = http.createServer(async (req, res) => {
    if (!req.url) {
      res.writeHead(400);
      res.end("Bad Request");
      return;
    }

    try {
      const filePath = await resolveRequestPath(req.url);
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, {
        "content-type": MIME_TYPES[ext] ?? "application/octet-stream",
      });
      createReadStream(filePath).pipe(res);
    } catch {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      res.end("Not Found");
    }
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, HOST, resolve);
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    fail("Unable to determine smoke server address.");
  }

  return {
    server,
    baseUrl: `http://${HOST}:${address.port}`,
  };
}

function bindPageDiagnostics(page, label) {
  const errors = [];

  page.on("pageerror", (error) => {
    errors.push(`[${label}] pageerror: ${error.message}`);
  });

  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(`[${label}] console.${message.type()}: ${message.text()}`);
    }
  });

  page.on("requestfailed", (request) => {
    const failureText = request.failure()?.errorText ?? "";
    if (request.resourceType() === "image" && failureText.includes("ERR_ABORTED")) {
      return;
    }

    errors.push(
      `[${label}] requestfailed: ${request.method()} ${request.url()} (${failureText || "unknown"})`,
    );
  });

  return () => {
    if (errors.length > 0) {
      fail(errors.join("\n"));
    }
  };
}

async function assertOk(page, url, label) {
  const response = await page.goto(url, { waitUntil: "networkidle" });
  if (!response || !response.ok()) {
    fail(`${label} failed to load: ${response?.status() ?? "no response"}`);
  }
}

async function assertStatus(baseUrl, route, expectedStatus) {
  const response = await fetch(new URL(route, baseUrl));
  if (response.status !== expectedStatus) {
    fail(`Expected ${route} to return ${expectedStatus}, got ${response.status}.`);
  }
}

async function run() {
  await ensureBuiltSite();
  const { server, baseUrl } = await startStaticServer();
  const browser = await chromium.launch({ headless: true });

  try {
    await assertStatus(baseUrl, "/", 200);
    await assertStatus(baseUrl, "/about/", 200);
    await assertStatus(baseUrl, "/blog/", 200);
    await assertStatus(baseUrl, ARTICLE_SLUG, 200);
    await assertStatus(baseUrl, "/media/", 200);
    await assertStatus(baseUrl, "/rss.xml", 200);
    await assertStatus(baseUrl, "/robots.txt", 200);
    await assertStatus(baseUrl, "/sitemap-index.xml", 200);
    await assertStatus(baseUrl, "/does-not-exist/", 404);

    const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
    const assertNoErrors = bindPageDiagnostics(page, "desktop");

    await assertOk(page, `${baseUrl}/`, "Home");

    const themeToggle = page.locator("#theme-toggle");
    await themeToggle.click();
    await page.waitForFunction(() => document.documentElement.dataset.themeMode === "light");
    await themeToggle.click();
    await page.waitForFunction(() => document.documentElement.dataset.themeMode === "dark");
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForFunction(() => document.documentElement.dataset.themeMode === "dark");

    await page.goto(`${baseUrl}/media/#books`, { waitUntil: "networkidle" });
    await page.waitForFunction(() => {
      const tab = document.querySelector('[data-tab="books"]');
      return tab?.getAttribute("aria-selected") === "true";
    });
    await page.click('[data-tab="movies"]');
    await page.waitForFunction(() => window.location.hash === "#movies");
    await page.waitForSelector('[data-tab-panel="movies"]:not([hidden]) [data-media-grid] > li');
    const movieCards = await page.locator('[data-tab-panel="movies"]:not([hidden]) [data-media-grid] > li').count();
    if (movieCards !== 100) {
      fail(`Expected 100 movie cards initially, received ${movieCards}.`);
    }
    const moreButton = page.locator('[data-tab-panel="movies"]:not([hidden]) [data-media-more]');
    await moreButton.click();
    await page.waitForFunction(() => {
      const cards = document.querySelectorAll('[data-tab-panel="movies"]:not([hidden]) [data-media-grid] > li');
      return cards.length === 124;
    });

    await page.goto(`${baseUrl}${ARTICLE_SLUG}`, { waitUntil: "networkidle" });
    await page.click(".blog-article img");
    await page.waitForSelector(".image-lightbox.is-open");
    await page.keyboard.press("Escape");
    await page.waitForSelector(".image-lightbox:not(.is-open)");
    await page.evaluate(() => window.scrollTo({ top: 900, behavior: "instant" }));
    await page.waitForSelector('[data-toc-root="true"][data-toc-visible="true"] [data-toc-link="true"]');
    await page.locator('[data-toc-root="true"][data-toc-visible="true"] [data-toc-link="true"]').first().click();
    await page.waitForTimeout(200);

    const mobilePage = await browser.newPage({
      viewport: { width: 390, height: 844 },
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
    });
    const assertNoMobileErrors = bindPageDiagnostics(mobilePage, "mobile");

    await mobilePage.goto(`${baseUrl}/media/#movies`, { waitUntil: "networkidle" });
    await mobilePage.locator('[data-tab="movies"]').click();
    await mobilePage.waitForSelector('[data-tab-panel="movies"]:not([hidden]) [data-media-grid] > li');
    await mobilePage.locator('[data-tab-panel="movies"]:not([hidden]) [data-media-more]').click();
    await mobilePage.waitForFunction(() => {
      const cards = document.querySelectorAll('[data-tab-panel="movies"]:not([hidden]) [data-media-grid] > li');
      return cards.length === 124;
    });

    assertNoErrors();
    assertNoMobileErrors();
    await mobilePage.close();
    await page.close();
  } finally {
    await browser.close();
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
}

run().then(
  () => {
    console.log("Smoke checks passed.");
  },
  (error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  },
);
