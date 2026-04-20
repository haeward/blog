import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const filePath = path.resolve("src/data/links/links.json");
const source = JSON.parse(readFileSync(filePath, "utf-8"));

for (const key of ["blogroll", "videos"]) {
  if (!Array.isArray(source[key])) continue;

  source[key] = [...source[key]].sort((left, right) => {
    const titleCompare = compareByCodePoint(left.title, right.title);
    if (titleCompare !== 0) return titleCompare;
    return compareByCodePoint(left.url, right.url);
  });
}

writeFileSync(filePath, `${JSON.stringify(source, null, 2)}\n`);
console.log(`Links source sorted at ${path.relative(process.cwd(), filePath)}`);

function compareByCodePoint(left, right) {
  if (left === right) return 0;

  const leftPoints = Array.from(left);
  const rightPoints = Array.from(right);
  const length = Math.min(leftPoints.length, rightPoints.length);

  for (let index = 0; index < length; index += 1) {
    const leftCodePoint = leftPoints[index].codePointAt(0);
    const rightCodePoint = rightPoints[index].codePointAt(0);

    if (leftCodePoint === rightCodePoint) continue;
    return leftCodePoint < rightCodePoint ? -1 : 1;
  }

  return leftPoints.length < rightPoints.length ? -1 : 1;
}
