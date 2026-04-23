import { type CollectionEntry, getCollection } from "astro:content";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { SITE } from "@consts";
import sharp from "sharp";

const IMAGE_WIDTH = 1200;
const IMAGE_HEIGHT = 630;
const DEFAULT_IMAGE = "/assets/images/site/default-og.jpg";
const AVATAR_IMAGE = "/assets/images/site/favicon.png";
const AVATAR_SIZE = 46;
const AVATAR_LEFT = 64;
const AVATAR_TOP = 462;
const TITLE_LEFT = 64;
const TITLE_MAX_WIDTH = 840;
const TITLE_FONT_SIZE = 48;
const TITLE_LINE_HEIGHT = 58;
const META_TEXT_LEFT = AVATAR_LEFT + AVATAR_SIZE + 18;
const META_BASELINE = AVATAR_TOP + 31;
const META_AUTHOR_WIDTH = 94;
const SCRIM_TOP = AVATAR_TOP - 10;
const SCRIM_HEIGHT = IMAGE_HEIGHT - SCRIM_TOP;
const SCRIM_MIDPOINT = 0.32;
const SCRIM_MID_OPACITY = 0.28;
const SCRIM_BOTTOM_OPACITY = 0.68;
const PUBLIC_DIR = path.resolve(process.cwd(), "public");
const FONT_DIR = path.join(PUBLIC_DIR, "assets/fonts");
const TITLE_FONT_PATH = path.join(FONT_DIR, "SarasaGothicSC-Bold.ttf");
const META_FONT_PATH = path.join(FONT_DIR, "SarasaGothicSC-Bold.ttf");
const TITLE_FONT_URL = pathToFileURL(TITLE_FONT_PATH).href;
const META_FONT_URL = pathToFileURL(META_FONT_PATH).href;

type Props = {
    post: CollectionEntry<"blog">;
};

type OverlayLayout = {
    metaText: string;
    titleLines: string[];
    titleStartY: number;
};

type TextPalette = {
    primary: string;
    secondary: string;
    separator: string;
    shadowColor: string;
    shadowOpacity: number;
    avatarRing: string;
};

type OverlayTheme = {
    meta: TextPalette;
    title: TextPalette;
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
    const avatar = await getAvatarImage();
    const base = await sharp(background)
        .resize(IMAGE_WIDTH, IMAGE_HEIGHT, { fit: "cover", position: "center" })
        .jpeg({ quality: 88, mozjpeg: true })
        .toBuffer();
    const layout = getOverlayLayout(post);
    const theme = await getOverlayTheme(base, layout);

    const layers: sharp.OverlayOptions[] = [
        {
            input: Buffer.from(getOverlaySvg(layout, theme)),
            left: 0,
            top: 0,
        },
    ];

    if (avatar) {
        layers.push(
            {
                input: avatar,
                left: AVATAR_LEFT,
                top: AVATAR_TOP,
            },
            {
                input: Buffer.from(getAvatarRingSvg(theme.meta)),
                left: 0,
                top: 0,
            },
        );
    }

    return sharp(base).composite(layers).jpeg({ quality: 86, mozjpeg: true }).toBuffer();
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

async function getAvatarImage(): Promise<Buffer | null> {
    const avatarPath = resolvePublicImagePath(AVATAR_IMAGE);
    if (!avatarPath) return null;

    try {
        const avatar = await readFile(avatarPath);
        const mask = Buffer.from(
            `<svg width="${AVATAR_SIZE}" height="${AVATAR_SIZE}" viewBox="0 0 ${AVATAR_SIZE} ${AVATAR_SIZE}" xmlns="http://www.w3.org/2000/svg">
  <circle cx="${AVATAR_SIZE / 2}" cy="${AVATAR_SIZE / 2}" r="${AVATAR_SIZE / 2}" fill="#ffffff"/>
</svg>`,
        );

        return sharp(avatar)
            .resize(AVATAR_SIZE, AVATAR_SIZE, { fit: "cover", position: "center" })
            .composite([{ input: mask, blend: "dest-in" }])
            .png()
            .toBuffer();
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

function getOverlayLayout(post: CollectionEntry<"blog">): OverlayLayout {
    const titleLines = wrapText(post.data.title, TITLE_MAX_WIDTH, TITLE_FONT_SIZE, 2);

    return {
        metaText: formatDate(post.data.date),
        titleLines,
        titleStartY: titleLines.length === 1 ? 390 : 338,
    };
}

function getOverlaySvg(layout: OverlayLayout, theme: OverlayTheme): string {
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
    <filter id="titleShadow" x="-20%" y="-20%" width="140%" height="160%">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="${theme.title.shadowColor}" flood-opacity="${theme.title.shadowOpacity}"/>
    </filter>
    <filter id="metaShadow" x="-20%" y="-20%" width="140%" height="160%">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="${theme.meta.shadowColor}" flood-opacity="${theme.meta.shadowOpacity}"/>
    </filter>
    <linearGradient id="bottomScrim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="${SCRIM_MIDPOINT * 100}%" stop-color="#000000" stop-opacity="${SCRIM_MID_OPACITY}"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="${SCRIM_BOTTOM_OPACITY}"/>
    </linearGradient>
  </defs>
  <rect y="${SCRIM_TOP}" width="${IMAGE_WIDTH}" height="${SCRIM_HEIGHT}" fill="url(#bottomScrim)"/>
  ${layout.titleLines
      .map(
          (line, index) =>
              `<text x="${TITLE_LEFT}" y="${layout.titleStartY + TITLE_LINE_HEIGHT * index}" fill="${theme.title.primary}" font-family="ShareTitle, Sarasa Gothic SC, sans-serif" font-size="${TITLE_FONT_SIZE}" font-weight="700" filter="url(#titleShadow)">${escapeXml(line)}</text>`,
      )
      .join("")}
  <text x="${META_TEXT_LEFT}" y="${META_BASELINE}" fill="${theme.meta.primary}" font-family="ShareMeta, Sarasa Gothic SC, sans-serif" font-size="21" font-weight="700" filter="url(#metaShadow)">${escapeXml(SITE.NAME)}</text>
  <text x="${META_TEXT_LEFT + META_AUTHOR_WIDTH}" y="${META_BASELINE}" fill="${theme.meta.separator}" font-family="ShareMeta, Sarasa Gothic SC, sans-serif" font-size="21" font-weight="700" filter="url(#metaShadow)">–</text>
  <text x="${META_TEXT_LEFT + META_AUTHOR_WIDTH + 26}" y="${META_BASELINE}" fill="${theme.meta.secondary}" font-family="ShareMeta, Sarasa Gothic SC, sans-serif" font-size="21" font-weight="700" filter="url(#metaShadow)">${escapeXml(layout.metaText)}</text>
</svg>`;
}

function getAvatarRingSvg(palette: TextPalette): string {
    const center = AVATAR_SIZE / 2;

    return `<svg width="${IMAGE_WIDTH}" height="${IMAGE_HEIGHT}" viewBox="0 0 ${IMAGE_WIDTH} ${IMAGE_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <circle cx="${AVATAR_LEFT + center}" cy="${AVATAR_TOP + center}" r="${center - 0.75}" fill="none" stroke="${palette.avatarRing}" stroke-width="0.75"/>
</svg>`;
}

async function getOverlayTheme(base: Buffer, layout: OverlayLayout): Promise<OverlayTheme> {
    const titleLuminance = await getAdjustedRegionLuminance(base, {
        height: TITLE_LINE_HEIGHT * layout.titleLines.length + 16,
        left: TITLE_LEFT,
        top: Math.max(0, layout.titleStartY - TITLE_FONT_SIZE - 8),
        width: TITLE_MAX_WIDTH,
    });
    const metaLuminance = await getAdjustedRegionLuminance(base, {
        height: 36,
        left: META_TEXT_LEFT,
        top: AVATAR_TOP + 6,
        width: 330,
    });

    return {
        meta: getTextPalette(metaLuminance),
        title: getTextPalette(titleLuminance),
    };
}

async function getAdjustedRegionLuminance(
    base: Buffer,
    region: { height: number; left: number; top: number; width: number },
): Promise<number> {
    const width = Math.min(region.width, IMAGE_WIDTH - region.left);
    const height = Math.min(region.height, IMAGE_HEIGHT - region.top);
    const { data, info } = await sharp(base)
        .extract({ height, left: region.left, top: region.top, width })
        .raw()
        .toBuffer({ resolveWithObject: true });

    let luminance = 0;
    let samples = 0;
    const sampleStep = 4;

    for (let y = 0; y < info.height; y += sampleStep) {
        const scrimOpacity = getBottomScrimOpacity(region.top + y);
        for (let x = 0; x < info.width; x += sampleStep) {
            const offset = (y * info.width + x) * info.channels;
            const red = data[offset] ?? 0;
            const green = data[offset + 1] ?? 0;
            const blue = data[offset + 2] ?? 0;
            luminance += (0.2126 * red + 0.7152 * green + 0.0722 * blue) * (1 - scrimOpacity);
            samples += 1;
        }
    }

    return samples > 0 ? luminance / samples : 0;
}

function getBottomScrimOpacity(y: number): number {
    if (y <= SCRIM_TOP) return 0;

    const progress = Math.min((y - SCRIM_TOP) / SCRIM_HEIGHT, 1);
    if (progress <= SCRIM_MIDPOINT) {
        return (progress / SCRIM_MIDPOINT) * SCRIM_MID_OPACITY;
    }

    return (
        SCRIM_MID_OPACITY +
        ((progress - SCRIM_MIDPOINT) / (1 - SCRIM_MIDPOINT)) *
            (SCRIM_BOTTOM_OPACITY - SCRIM_MID_OPACITY)
    );
}

function getTextPalette(luminance: number): TextPalette {
    if (luminance > 158) {
        return {
            avatarRing: "rgba(24, 24, 24, 0.14)",
            primary: "rgba(22, 24, 27, 0.88)",
            secondary: "rgba(22, 24, 27, 0.72)",
            separator: "rgba(22, 24, 27, 0.52)",
            shadowColor: "#ffffff",
            shadowOpacity: 0.38,
        };
    }

    return {
        avatarRing: "rgba(255, 255, 255, 0.24)",
        primary: "rgba(255, 255, 255, 0.94)",
        secondary: "rgba(255, 255, 255, 0.82)",
        separator: "rgba(255, 255, 255, 0.62)",
        shadowColor: "#000000",
        shadowOpacity: 0.48,
    };
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

function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
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
