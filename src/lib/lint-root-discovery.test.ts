import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createRequire } from "node:module";
import { test } from "node:test";
import { Linter } from "eslint";

const require = createRequire(import.meta.url);
const { getRootDirs } = require("@next/eslint-plugin-next/dist/utils/get-root-dirs.js");

test("Next lint root discovery keeps defaults, directory globs and multiple roots", () => {
  const root = mkdtempSync(join(tmpdir(), "navigeto-lint-roots-"));
  try {
    for (const name of ["web", "admin"]) mkdirSync(join(root, name));
    writeFileSync(join(root, "other.txt"), "not a directory");
    // Next joins these roots to pages/app and reads them relative to process.cwd().
    // tinyglobby returns relative paths; compare the directories they resolve to.
    const discover = (rootDir?: string | string[]) => getRootDirs({ cwd: root, settings: { next: rootDir ? { rootDir } : {} } }).map((dir: string) => resolve(dir));
    assert.deepEqual(discover(), [root]);
    assert.deepEqual(discover(`${root}/*`).sort(), [join(root, "admin"), join(root, "web")]);
    assert.deepEqual(discover(`${root}/{admin,web}`).sort(), [join(root, "admin"), join(root, "web")]);
    assert.deepEqual(discover([join(root, "web"), join(root, "admin")]).sort(), [join(root, "admin"), join(root, "web")]);
    mkdirSync(join(root, "web", "pages"));
    writeFileSync(join(root, "web", "pages", "about.tsx"), "export default function About() { return null; }");
    const messages = new Linter().verify('const link = <a href="/about">About</a>;', {
      languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
      plugins: { "@next/next": require("@next/eslint-plugin-next") },
      settings: { next: { rootDir: `${root}/*` } },
      rules: { "@next/next/no-html-link-for-pages": "error" },
    });
    assert.ok(messages.some(message => message.ruleId === "@next/next/no-html-link-for-pages" && message.severity === 2), "Next must still find pages and reject internal anchor navigation");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
