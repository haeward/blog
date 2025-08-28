import { visit } from "unist-util-visit";
import type { Parent } from "unist";
import type { Root, Paragraph, Text, Link, Html } from "mdast";

interface SpotifyData {
  type: string;
  id: string;
}

export function remarkSpotifyEmbed() {
  return (tree: Root) => {
    visit(tree, "paragraph", (node: Paragraph, index: number | undefined, parent: Parent | undefined) => {
      if (!parent || typeof index !== "number") return;

      if (node.children.length === 1 && node.children[0].type === "link") {
        const link = node.children[0] as Link;
        const url = link.url;

        if (isSpotifyUrl(url)) {
          const mediaNode: Html = {
            type: "html",
            value: generateSpotifyEmbed(url)
          };

          parent.children[index] = mediaNode;
        }
      }

      if (node.children.length === 1 && node.children[0].type === "text") {
        const text = (node.children[0] as Text).value;
        const mediaMatch = text.match(/::media\[([^\]]+)\]/);

        if (mediaMatch) {
          const url = mediaMatch[1];

          if (isSpotifyUrl(url)) {
            const mediaNode: Html = {
              type: "html",
              value: generateSpotifyEmbed(url)
            };

            parent.children[index] = mediaNode;
          }
        }
      }
    });
  };
}

function isSpotifyUrl(url: string): boolean {
  return url.includes("spotify.com/");
}

function generateSpotifyEmbed(url: string): string {
  const spotifyData = extractSpotifyData(url);
  const height = getSpotifyHeight(spotifyData.type);

  return `<div class="media-embed spotify-embed">
    <iframe
      style="border-radius:12px"
      src="https://open.spotify.com/embed/${spotifyData.type}/${spotifyData.id}?utm_source=generator"
      width="100%"
      height="${height}"
      frameBorder="0"
      allowfullscreen=""
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
    ></iframe>
  </div>`;
}

function extractSpotifyData(url: string): SpotifyData {
  const match = url.match(/spotify\.com\/(track|album|playlist|artist|show|episode)\/([a-zA-Z0-9]+)/);
  if (match) {
    return {
      type: match[1],
      id: match[2].split("?")[0]
    };
  }
  return { type: "track", id: "" };
}

function getSpotifyHeight(type: string): string {
  const heights: Record<string, string> = {
    track: "152",
    album: "352",
    playlist: "352",
    artist: "352",
    show: "232",
    episode: "232"
  };
  return heights[type] || "152";
}
