import type { Html, Image, Paragraph, Parent, Root } from "mdast";
import { visit } from "unist-util-visit";

const RESPONSIVE_IMAGE_WIDTHS = [480, 768, 1024, 1440];
const ARTICLE_IMAGE_SIZES =
    "(max-width: 768px) calc(100vw - 2rem), (max-width: 1280px) min(100vw - 4rem, 46rem), 46rem";

function escapeHtml(value: string): string {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function supportsResponsiveWidths(rawUrl: string): boolean {
    try {
        const url = new URL(rawUrl);
        return url.hostname === "webp.haeward.com";
    } catch {
        return false;
    }
}

function withWidth(rawUrl: string, width: number): string {
    const url = new URL(rawUrl);
    url.searchParams.set("width", String(width));
    return url.toString();
}

function buildImageMarkup(imageNode: Image, eager: boolean): string {
    const altText = imageNode.alt?.trim() ?? "";
    const escapedAlt = escapeHtml(altText);
    const responsive = supportsResponsiveWidths(imageNode.url);
    const src = responsive ? withWidth(imageNode.url, 1024) : imageNode.url;
    const srcset = responsive
        ? RESPONSIVE_IMAGE_WIDTHS.map(
              (width) => `${escapeHtml(withWidth(imageNode.url, width))} ${width}w`,
          ).join(", ")
        : "";

    const attributes = [
        `class="blog-figure__image"`,
        `src="${escapeHtml(src)}"`,
        `alt="${escapedAlt}"`,
        `loading="${eager ? "eager" : "lazy"}"`,
        `decoding="async"`,
        `fetchpriority="${eager ? "high" : "low"}"`,
    ];

    if (srcset) {
        attributes.push(`srcset="${srcset}"`);
        attributes.push(`sizes="${ARTICLE_IMAGE_SIZES}"`);
    }

    return `<figure class="blog-figure">
            <img ${attributes.join(" ")} />
            <figcaption class="blog-figure__caption">${escapedAlt}</figcaption>
          </figure>`;
}

const remarkImageCaption = () => {
    return (tree: Root) => {
        const replacements: Array<{ index: number; parent: Parent; newNode: Html }> = [];
        let figureIndex = 0;

        visit(
            tree,
            "paragraph",
            (node: Paragraph, index: number | undefined, parent: Parent | undefined) => {
                if (!parent || typeof index === "undefined") return;

                if (node.children.length === 1 && node.children[0].type === "image") {
                    const imageNode = node.children[0] as Image;

                    if (imageNode.alt && imageNode.alt.trim() !== "") {
                        const figureNode: Html = {
                            type: "html",
                            value: buildImageMarkup(imageNode, figureIndex === 0),
                        };

                        replacements.push({ index, parent, newNode: figureNode });
                        figureIndex += 1;
                    }
                }
            },
        );

        // Apply replacements in reverse order to avoid index shifting
        replacements.reverse().forEach(({ index, parent, newNode }) => {
            parent.children.splice(index, 1, newNode);
        });
    };
};

export default remarkImageCaption;
