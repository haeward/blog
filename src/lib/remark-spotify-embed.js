import { visit } from "unist-util-visit";

export function remarkSpotifyEmbed() {
  return (tree) => {
    visit(tree, "paragraph", (node, index, parent) => {
      // Look for paragraphs that contain only a link
      if (node.children.length === 1 && node.children[0].type === "link") {
        const link = node.children[0];
        const url = link.url;
        const text = link.children[0]?.value || "";

        // Check if it's a Spotify URL
        if (isSpotifyUrl(url)) {
          // Replace the paragraph with a custom media node
          const mediaNode = {
            type: "html",
            value: generateSpotifyEmbed(url, text)
          };

          parent.children[index] = mediaNode;
        }
      }

      // Also look for text patterns like ::media[url]{options}
      if (node.children.length === 1 && node.children[0].type === "text") {
        const text = node.children[0].value;
        const mediaMatch = text.match(/::media\[([^\]]+)\](?:\{([^}]+)\})?/);

        if (mediaMatch) {
          const url = mediaMatch[1];
          const options = mediaMatch[2] ? parseOptions(mediaMatch[2]) : {};

          if (isSpotifyUrl(url)) {
            const mediaNode = {
              type: "html",
              value: generateSpotifyEmbed(url, options)
            };

            parent.children[index] = mediaNode;
          }
        }
      }
    });
  };
}

function isSpotifyUrl(url) {
  return url.includes("spotify.com/");
}

function parseOptions(optionsStr) {
  const options = {};
  const pairs = optionsStr.split(" ");

  pairs.forEach(pair => {
    const [key, value] = pair.split("=");
    if (key && value) {
      options[key] = value.replace(/['"]/g, "");
    }
  });

  return options;
}

function generateSpotifyEmbed(url, options = {}) {
  const spotifyData = extractSpotifyData(url);
  const height = options.height || "152";

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

function extractSpotifyData(url) {
  const match = url.match(/spotify\.com\/(track|album|playlist|artist|show|episode)\/([a-zA-Z0-9]+)/);
  if (match) {
    return {
      type: match[1],
      id: match[2].split("?")[0]
    };
  }
  return { type: "track", id: "" };
}
