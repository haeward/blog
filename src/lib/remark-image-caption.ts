import { visit } from "unist-util-visit";
import type { Root, Paragraph, Image, Html, Parent } from "mdast";

const remarkImageCaption = () => {
  return (tree: Root) => {
    const replacements: Array<{ index: number, parent: Parent, newNode: Html }> = [];
    
    visit(tree, "paragraph", (node: Paragraph, index: number | undefined, parent: Parent | undefined) => {
      if (!parent || typeof index === "undefined") return;

      if (node.children.length === 1 && node.children[0].type === "image") {
        const imageNode = node.children[0] as Image;

        if (imageNode.alt && imageNode.alt.trim() !== "") {
          const figureNode: Html = {
            type: "html",
            value: `<figure>
                      <img src="${imageNode.url}" alt="${imageNode.alt}" />
                      <figcaption>${imageNode.alt}</figcaption>
                    </figure>`
          };

          replacements.push({ index, parent, newNode: figureNode });
        }
      }
    });

    // Apply replacements in reverse order to avoid index shifting
    replacements.reverse().forEach(({ index, parent, newNode }) => {
      parent.children.splice(index, 1, newNode);
    });
  };
};

export default remarkImageCaption;
