// Assembles the frontend files written as ES modules (src/<stem>/, entry src/<stem>/index.js) into the classic
// scripts the integration serves, custom_components/<domain>/frontend/<stem>.js (scripts/bundle.mjs). Those files
// are not committed: run this before the tests, the screenshots, the translation split and the release zip.
// The frontend files under 40 KB, if any, stay written by hand in frontend/ and are left as they are.
// Usage: node scripts/build-frontend.mjs
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { bundle } from "./bundle.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const [domain] = readdirSync(`${root}custom_components`);
const out = `${root}custom_components/${domain}/frontend`;
mkdirSync(out, { recursive: true });
for (const stem of readdirSync(`${root}src`).filter((d) => existsSync(`${root}src/${d}/index.js`))) {
  const code = bundle(`src/${stem}/index.js`);
  writeFileSync(`${out}/${stem}.js`, code);
  console.log(`custom_components/${domain}/frontend/${stem}.js: ${(code.length / 1024).toFixed(1)} KB`);
}
