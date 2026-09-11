import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import {parse} from "yaml";

test("README is a human-readable public project landing page", () => {
  const readme = fs.readFileSync("README.md", "utf8");
  const badges = readme.match(/img\.shields\.io|actions\/workflows\/.+\/badge\.svg/gu) ?? [];
  assert.ok(badges.length >= 3 && badges.length <= 5, `expected 3-5 badges, found ${badges.length}`);
  for (const heading of ["Tujuan", "Arsitektur", "Katalog runtime", "Quick start", "Release", "Keamanan", "Kontribusi", "Roadmap"]) {
    assert.match(readme, new RegExp(`## ${heading}`, "u"));
  }
  assert.match(readme, /platform-governance[\s\S]+platform-workflow[\s\S]+example-app-laravel/u);
  assert.doesNotMatch(readme, /Source repository tetap private/u);
});

test("public repository has governed community health files", () => {
  for (const path of [
    "SECURITY.md",
    "CONTRIBUTING.md",
    "CHANGELOG.md",
    ".github/PULL_REQUEST_TEMPLATE.md",
    ".github/ISSUE_TEMPLATE/bug.yml",
    ".github/ISSUE_TEMPLATE/runtime-request.yml",
    ".github/ISSUE_TEMPLATE/config.yml",
    ".github/dependabot.yml",
  ]) assert.ok(fs.existsSync(path), path);

  const changelog = fs.readFileSync("CHANGELOG.md", "utf8");
  assert.match(changelog, /Semantic Versioning/u);
  assert.match(changelog, /## \[0\.1\.0\] - 2026-09-11/u);
  assert.match(changelog, /### Added/u);

  const security = fs.readFileSync("SECURITY.md", "utf8");
  assert.match(security, /security\/advisories\/new/u);
  assert.match(security, /jangan.*public issue/iu);
});

test("Dependabot covers all dependency ecosystems without daily noise", () => {
  const config = parse(fs.readFileSync(".github/dependabot.yml", "utf8"));
  assert.equal(config.version, 2);
  assert.deepEqual(config.updates.map((item) => item["package-ecosystem"]).sort(), ["docker", "github-actions", "npm"]);
  for (const update of config.updates) assert.notEqual(update.schedule.interval, "daily");
});

test("CODEOWNERS covers public contribution and release control surfaces", () => {
  const codeowners = fs.readFileSync(".github/CODEOWNERS", "utf8");
  for (const pattern of ["/.github/", "/catalogue/", "/docs/", "/README.md", "/CHANGELOG.md", "/SECURITY.md"]) {
    assert.ok(codeowners.split("\n").includes(`${pattern} @donibawono`), pattern);
  }
});
