import { createReadStream } from "node:fs";
import { access, stat } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const DIST_DIR = path.resolve("dist");
const HOST = "127.0.0.1";
const ARTICLE_SLUG = "/posts/2025/travelogue-of-southern-shanxi/";
const MOCK_MASTODON_ACCOUNT = { id: "haeward-account" };
const MOCK_MASTODON_STATUSES = Array.from({ length: 5 }, (_, index) => ({
    id: `moment-${index + 1}`,
    account: {
        acct: "haeward",
        avatar: "/assets/images/site/favicon.png",
        display_name: "Haeward",
        url: "https://mas.to/@haeward",
        username: "haeward",
    },
    card:
        index === 0
            ? {
                  description: "A linked article preview.",
                  image: "/assets/images/site/favicon.png",
                  provider_name: "Example",
                  title: "Example preview",
                  url: "https://example.com/article",
              }
            : null,
    content:
        index === 3
            ? `<p>Moment ${index + 1} from Mastodon. <a href="https://mas.to/tags/now">#Now</a></p>`
            : `<p>Moment ${index + 1} from Mastodon. <a href="https://example.com/article">example.com</a></p>`,
    created_at: `2026-04-2${index + 1}T16:57:00.000Z`,
    media_attachments:
        index === 1
            ? [
                  {
                      description: "Preview attachment",
                      preview_url: "/assets/images/site/favicon.png",
                      type: "image",
                      url: "/assets/images/site/favicon.png",
                  },
              ]
            : [],
    quote:
        index === 2
            ? {
                  state: "accepted",
                  quoted_status: {
                      account: {
                          acct: "quoted",
                          display_name: "Quoted User",
                          url: "https://mas.to/@quoted",
                      },
                      content: "<p>A quoted toot preview.</p>",
                      created_at: "2026-04-20T08:30:00.000Z",
                      url: "https://mas.to/@quoted/1",
                  },
              }
            : null,
    tags:
        index === 3
            ? [
                  {
                      name: "Now",
                      url: "https://mas.to/tags/now",
                  },
              ]
            : [],
    url: `https://mas.to/@haeward/${index + 1}`,
}));

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
    if (!response?.ok()) {
        fail(`${label} failed to load: ${response?.status() ?? "no response"}`);
    }
}

async function assertStatus(baseUrl, route, expectedStatus) {
    const response = await fetch(new URL(route, baseUrl));
    if (response.status !== expectedStatus) {
        fail(`Expected ${route} to return ${expectedStatus}, got ${response.status}.`);
    }
}

async function getMediaTabCounts(page, tabName) {
    return page.locator("#media-data").evaluate((node, name) => {
        const tabData = JSON.parse(node.textContent || "{}");
        const pageSize = Number.parseInt(node.dataset.pageSize || "100", 10);
        const totalCount = Array.isArray(tabData[name]) ? tabData[name].length : 0;

        return {
            initialCount: Math.min(pageSize, totalCount),
            totalCount,
        };
    }, tabName);
}

async function assertMediaTabLoadMore(page, tabName, label) {
    const panelSelector = `[data-tab-panel="${tabName}"]:not([hidden])`;
    const gridItemSelector = `${panelSelector} [data-media-grid] > li`;
    const moreButtonSelector = `${panelSelector} [data-media-more]`;

    await page.waitForSelector(gridItemSelector);

    const { initialCount, totalCount } = await getMediaTabCounts(page, tabName);
    const initialVisibleCount = await page.locator(gridItemSelector).count();
    if (initialVisibleCount !== initialCount) {
        fail(
            `${label} expected ${initialCount} ${tabName} cards initially, received ${initialVisibleCount}.`,
        );
    }

    if (totalCount <= initialCount) {
        return;
    }

    const moreButton = page.locator(moreButtonSelector);
    if ((await moreButton.count()) === 0) {
        fail(`${label} expected a load-more button for ${tabName}, but none was rendered.`);
    }

    await moreButton.click();
    await page.waitForFunction(
        ({ panelSelector, expectedCount }) => {
            const panel = document.querySelector(panelSelector);
            if (!(panel instanceof HTMLElement)) return false;

            const cards = panel.querySelectorAll("[data-media-grid] > li");
            const moreWrapper = panel.querySelector("[data-media-more-wrapper]");
            const moreHidden = !(moreWrapper instanceof HTMLElement) || moreWrapper.hidden === true;

            return cards.length === expectedCount && moreHidden;
        },
        {
            panelSelector,
            expectedCount: totalCount,
        },
    );
}

async function run() {
    await ensureBuiltSite();
    const { server, baseUrl } = await startStaticServer();
    const browser = await chromium.launch({ headless: true });

    try {
        await assertStatus(baseUrl, "/", 200);
        await assertStatus(baseUrl, "/about/", 200);
        await assertStatus(baseUrl, "/posts/", 200);
        await assertStatus(baseUrl, "/blog/", 404);
        await assertStatus(baseUrl, "/blog/2025/travelogue-of-southern-shanxi/", 404);
        await assertStatus(baseUrl, "/now/", 200);
        await assertStatus(baseUrl, ARTICLE_SLUG, 200);
        await assertStatus(baseUrl, "/links/", 200);
        await assertStatus(baseUrl, "/media/", 200);
        await assertStatus(baseUrl, "/rss.xml", 200);
        await assertStatus(baseUrl, "/robots.txt", 200);
        await assertStatus(baseUrl, "/sitemap-index.xml", 200);
        await assertStatus(baseUrl, "/does-not-exist/", 404);

        const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
        await page.addInitScript(
            ({ account, statuses }) => {
                const originalFetch = window.fetch.bind(window);

                window.fetch = async (input, init) => {
                    const url =
                        typeof input === "string"
                            ? input
                            : input instanceof Request
                              ? input.url
                              : String(input);

                    if (url.startsWith("https://mas.to/api/v1/accounts/lookup")) {
                        return {
                            ok: true,
                            async json() {
                                return account;
                            },
                        };
                    }

                    if (url.startsWith(`https://mas.to/api/v1/accounts/${account.id}/statuses`)) {
                        return {
                            ok: true,
                            async json() {
                                return statuses;
                            },
                        };
                    }

                    return originalFetch(input, init);
                };
            },
            {
                account: MOCK_MASTODON_ACCOUNT,
                statuses: MOCK_MASTODON_STATUSES,
            },
        );
        const assertNoErrors = bindPageDiagnostics(page, "desktop");

        await assertOk(page, `${baseUrl}/`, "Home");
        const navLabels = await page
            .locator("header nav a")
            .evaluateAll((links) => links.map((link) => link.textContent?.trim() || ""));
        const expectedNavLabels = ["Archive", "Media", "Now", "About", "Links"];
        if (expectedNavLabels.some((label, index) => navLabels[index] !== label)) {
            fail(
                `Expected header nav to start with ${expectedNavLabels.join(", ")}. Received ${navLabels.join(", ")}.`,
            );
        }

        await assertOk(page, `${baseUrl}/now/`, "Now");
        await page.waitForSelector("[data-moments-item='true']");
        const momentsCount = await page.locator("[data-moments-item='true']").count();
        if (momentsCount !== 5) {
            fail(`Expected /now to render 5 moments, received ${momentsCount}.`);
        }
        await page.waitForSelector('a:has-text("View Toot")');
        await page.waitForSelector('a:has-text("Example preview")');
        await page.waitForSelector('a:has-text("A quoted toot preview.")');
        await page.waitForSelector('a:has-text("#Now")');

        await assertOk(page, `${baseUrl}/links/`, "Links");
        await page.waitForSelector('[data-links-section="blogroll"] [data-link-card="true"]');
        await page.waitForSelector('[data-links-section="videos"] [data-link-card="true"]');

        const blogrollCount = await page
            .locator('[data-links-section="blogroll"] [data-link-card="true"]')
            .count();
        const videoCount = await page
            .locator('[data-links-section="videos"] [data-link-card="true"]')
            .count();
        if (blogrollCount === 0 || videoCount === 0) {
            fail(
                `Expected Links page to render both blogroll and video entries, received ${blogrollCount} and ${videoCount}.`,
            );
        }

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
        await assertMediaTabLoadMore(page, "movies", "Desktop media tab");

        await page.goto(`${baseUrl}${ARTICLE_SLUG}`, { waitUntil: "networkidle" });
        await page.click(".blog-article img");
        await page.waitForSelector(".image-lightbox.is-open");
        await page.keyboard.press("Escape");
        await page.waitForSelector(".image-lightbox:not(.is-open)");
        await page.evaluate(() => window.scrollTo({ top: 900, behavior: "instant" }));
        await page.waitForSelector(
            '[data-toc-root="true"][data-toc-visible="true"] [data-toc-link="true"]',
        );
        await page
            .locator('[data-toc-root="true"][data-toc-visible="true"] [data-toc-link="true"]')
            .first()
            .click();
        await page.waitForTimeout(200);

        const mobilePage = await browser.newPage({
            viewport: { width: 390, height: 844 },
            userAgent:
                "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
        });
        const assertNoMobileErrors = bindPageDiagnostics(mobilePage, "mobile");

        await mobilePage.goto(`${baseUrl}/media/#movies`, { waitUntil: "networkidle" });
        await mobilePage.locator('[data-tab="movies"]').click();
        await mobilePage.waitForFunction(() => window.location.hash === "#movies");
        await assertMediaTabLoadMore(mobilePage, "movies", "Mobile media tab");

        assertNoErrors();
        assertNoMobileErrors();
        await mobilePage.close();
        await page.close();
    } finally {
        await browser.close();
        await new Promise((resolve, reject) =>
            server.close((error) => (error ? reject(error) : resolve())),
        );
    }
}

run().then(
    () => {
        console.log("Smoke checks passed.");
    },
    (error) => {
        console.error(error instanceof Error ? (error.stack ?? error.message) : String(error));
        process.exitCode = 1;
    },
);
