import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const filePath = path.resolve("src/data/links/links.json");
const collator = new Intl.Collator(["zh-Hans-u-co-pinyin", "en"], {
  numeric: true,
  sensitivity: "base",
});

const source = JSON.parse(readFileSync(filePath, "utf-8"));

for (const key of ["blogroll", "videos"]) {
  if (!Array.isArray(source[key])) continue;

  source[key] = [...source[key]].sort((left, right) => {
    const titleCompare = collator.compare(left.title, right.title);
    if (titleCompare !== 0) return titleCompare;
    return collator.compare(left.url, right.url);
  });
}

writeFileSync(filePath, `${JSON.stringify(source, null, 2)}\n`);
console.log(`Links source sorted at ${path.relative(process.cwd(), filePath)}`);
