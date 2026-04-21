import { type CollectionEntry, getCollection } from "astro:content";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { SITE } from "@consts";
import sharp from "sharp";

const IMAGE_WIDTH = 1200;
const IMAGE_HEIGHT = 630;
const DEFAULT_IMAGE = "/assets/images/site/share-default.jpg";
const PUBLIC_DIR = path.resolve(process.cwd(), "public");
const FONT_DIR = path.join(PUBLIC_DIR, "assets/fonts");
const TITLE_FONT_PATH = path.join(FONT_DIR, "NotoSerifSC-Bold.ttf");
const META_FONT_PATH = path.join(FONT_DIR, "NotoSans-Bold.ttf");
const TITLE_FONT_URL = pathToFileURL(TITLE_FONT_PATH).href;
const META_FONT_URL = pathToFileURL(META_FONT_PATH).href;

type Props = {
    post: CollectionEntry<"blog">;
};

export async function getStaticPaths() {
    const posts = (await getCollection("blog")).filter((post) => !post.data.draft);

    return posts.map((post) => ({
        params: { slug: post.id },
        props: { post },
    }));
}

export async function GET({ props }: { props: Props }) {
    const image = await generateShareImage(props.post);
    const body = image.buffer.slice(image.byteOffset, image.byteOffset + image.byteLength);

    return new Response(body as ArrayBuffer, {
        headers: {
            "Cache-Control": "public, max-age=31536000, immutable",
            "Content-Type": "image/jpeg",
        },
    });
}

async function generateShareImage(post: CollectionEntry<"blog">): Promise<Buffer> {
    const background = await getBackgroundImage(post.data.image);
    const base = await sharp(background)
        .resize(IMAGE_WIDTH, IMAGE_HEIGHT, { fit: "cover", position: "center" })
        .jpeg({ quality: 88, mozjpeg: true })
        .toBuffer();

    return sharp(base)
        .composite([
            {
                input: Buffer.from(getOverlaySvg(post)),
                left: 0,
                top: 0,
            },
        ])
        .jpeg({ quality: 86, mozjpeg: true })
        .toBuffer();
}

async function getBackgroundImage(image?: string): Promise<Buffer> {
    const candidates = [image, DEFAULT_IMAGE].filter(Boolean) as string[];

    for (const candidate of candidates) {
        const imageBuffer = await tryLoadImage(candidate);
        if (imageBuffer) return imageBuffer;
    }

    return Buffer.from(getFallbackBackgroundSvg());
}

async function tryLoadImage(image: string): Promise<Buffer | null> {
    const publicPath = resolvePublicImagePath(image);
    if (publicPath) {
        try {
            return await readFile(publicPath);
        } catch {
            return null;
        }
    }

    if (!image.startsWith("https://")) return null;

    try {
        const response = await fetch(image);
        if (!response.ok) return null;
        return Buffer.from(await response.arrayBuffer());
    } catch {
        return null;
    }
}

function resolvePublicImagePath(image: string): string | null {
    try {
        const siteOrigin = new URL(import.meta.env.SITE).origin;
        const url = new URL(image, siteOrigin);
        if (url.origin !== siteOrigin) return null;

        const relativePath = decodeURIComponent(url.pathname).replace(/^\/+/, "");
        const publicPath = path.resolve(PUBLIC_DIR, relativePath);
        if (!publicPath.startsWith(`${PUBLIC_DIR}${path.sep}`)) return null;

        return publicPath;
    } catch {
        return null;
    }
}

function getOverlaySvg(post: CollectionEntry<"blog">): string {
    const titleLines = wrapText(post.data.title, 1020, 62, 2);
    const metaText = formatDate(post.data.date, post.data.lang);
    const titleStartY = titleLines.length === 1 ? 415 : 382;
    const titleLineHeight = 72;
    const metaY = titleStartY + titleLineHeight * titleLines.length + 44;

    return `<svg width="${IMAGE_WIDTH}" height="${IMAGE_HEIGHT}" viewBox="0 0 ${IMAGE_WIDTH} ${IMAGE_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @font-face {
        font-family: "ShareTitle";
        src: url("${TITLE_FONT_URL}") format("truetype");
        font-weight: 700;
      }
      @font-face {
        font-family: "ShareMeta";
        src: url("${META_FONT_URL}") format("truetype");
        font-weight: 700;
      }
    </style>
    <linearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.12"/>
      <stop offset="40%" stop-color="#000000" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.58"/>
    </linearGradient>
    <linearGradient id="textPanel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.18"/>
      <stop offset="28%" stop-color="#000000" stop-opacity="0.78"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.86"/>
    </linearGradient>
  </defs>
  <rect width="${IMAGE_WIDTH}" height="${IMAGE_HEIGHT}" fill="url(#scrim)"/>
  <rect y="230" width="${IMAGE_WIDTH}" height="400" fill="url(#textPanel)"/>
  <text x="74" y="315" fill="#ffffff" font-family="ShareMeta, Noto Sans, sans-serif" font-size="30" font-weight="700" letter-spacing="0.5">${escapeXml(SITE.NAME)}</text>
  ${titleLines
      .map(
          (line, index) =>
              `<text x="72" y="${titleStartY + titleLineHeight * index}" fill="#ffffff" font-family="ShareTitle, Noto Serif SC, serif" font-size="62" font-weight="700">${escapeXml(line)}</text>`,
      )
      .join("")}
  <text x="74" y="${metaY}" fill="rgba(255,255,255,0.78)" font-family="ShareMeta, Noto Sans, sans-serif" font-size="27" font-weight="700">${escapeXml(metaText)}</text>
</svg>`;
}

function getFallbackBackgroundSvg(): string {
    return `<svg width="${IMAGE_WIDTH}" height="${IMAGE_HEIGHT}" viewBox="0 0 ${IMAGE_WIDTH} ${IMAGE_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${IMAGE_WIDTH}" height="${IMAGE_HEIGHT}" fill="#1c1917"/>
  <path d="M0 480L1200 220V630H0Z" fill="#44403c"/>
  <path d="M0 310L1200 70V260L0 520Z" fill="#78716c" opacity="0.42"/>
</svg>`;
}

function wrapText(text: string, maxWidth: number, fontSize: number, maxLines: number): string[] {
    const words = splitText(text.trim());
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
        const candidate = currentLine ? `${currentLine}${word}` : word.trimStart();
        if (measureText(candidate, fontSize) <= maxWidth) {
            currentLine = candidate;
            continue;
        }

        if (currentLine) {
            lines.push(currentLine.trim());
            currentLine = word.trimStart();
        } else {
            lines.push(truncateText(word.trim(), maxWidth, fontSize));
            currentLine = "";
        }

        if (lines.length === maxLines) break;
    }

    if (lines.length < maxLines && currentLine) {
        lines.push(currentLine.trim());
    }

    if (lines.length > maxLines) {
        lines.length = maxLines;
    }

    if (lines.length === maxLines && words.join("").length > lines.join("").length) {
        lines[maxLines - 1] = truncateText(lines[maxLines - 1], maxWidth, fontSize);
    }

    return lines.length > 0 ? lines : [SITE.NAME];
}

function splitText(text: string): string[] {
    const tokens: string[] = [];
    let latinToken = "";

    for (const char of Array.from(text)) {
        if (/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(char)) {
            if (latinToken) {
                tokens.push(latinToken);
                latinToken = "";
            }
            tokens.push(char);
            continue;
        }

        latinToken += char;
        if (/\s/u.test(char)) {
            tokens.push(latinToken);
            latinToken = "";
        }
    }

    if (latinToken) tokens.push(latinToken);
    return tokens;
}

function truncateText(text: string, maxWidth: number, fontSize: number): string {
    const ellipsis = "…";
    let result = text;

    while (result.length > 0 && measureText(`${result}${ellipsis}`, fontSize) > maxWidth) {
        result = Array.from(result).slice(0, -1).join("");
    }

    return `${result.trimEnd()}${ellipsis}`;
}

function measureText(text: string, fontSize: number): number {
    return Array.from(text).reduce((width, char) => width + getCharWidth(char) * fontSize, 0);
}

function getCharWidth(char: string): number {
    if (/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(char)) return 1;
    if (/\s/u.test(char)) return 0.34;
    if (/[A-Z0-9#]/u.test(char)) return 0.68;
    if (/[il.,:;|!]/u.test(char)) return 0.32;
    if (/[-–—_]/u.test(char)) return 0.45;
    return 0.58;
}

function formatDate(date: Date, lang: string): string {
    const locale = lang.startsWith("zh") ? "zh-CN" : lang.startsWith("ja") ? "ja-JP" : "en-US";

    return new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "short",
        timeZone: "UTC",
        year: "numeric",
    }).format(date);
}

function escapeXml(value: string): string {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
}
