import { readdir, stat } from "node:fs/promises";
import { extname, join, relative } from "node:path";

const root = new URL("../dist", import.meta.url).pathname;
const limits = new Map([
  [".js", 100 * 1024],
  [".css", 100 * 1024],
  [".jpg", 250 * 1024],
  [".jpeg", 250 * 1024],
  [".png", 500 * 1024],
  [".webp", 250 * 1024],
  [".avif", 250 * 1024]
]);

const files = [];
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await walk(path);
    else files.push(path);
  }
}

await walk(root);
const violations = [];
for (const file of files) {
  const extension = extname(file).toLowerCase();
  const defaultLimit = limits.get(extension);
  const limit = file.includes("/pagefind/") && extension === ".js" ? 200 * 1024 : defaultLimit;
  if (!limit || file.includes("/og/")) continue;
  const size = (await stat(file)).size;
  if (size > limit) violations.push(`${relative(root, file)}: ${size} > ${limit} bytes`);
}

if (violations.length) {
  console.error(`Asset budget failed:\n${violations.join("\n")}`);
  process.exit(1);
}

console.log(`Asset budget passed for ${files.length} generated files.`);
