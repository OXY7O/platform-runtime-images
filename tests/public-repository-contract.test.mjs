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
    "docs/PUBLIC-REPOSITORY-CONTROLS.md",
    ".github/PULL_REQUEST_TEMPLATE.md",
    ".github/ISSUE_TEMPLATE/bug.yml",
    ".github/ISSUE_TEMPLATE/runtime-request.yml",
    ".github/ISSUE_TEMPLATE/config.yml",
    ".github/dependabot.yml",
  ]) assert.ok(fs.existsSync(path), path);

  const changelog = fs.readFileSync("CHANGELOG.md", "utf8");
  assert.match(changelog, /Semantic Versioning/u);
  assert.match(changelog, /## \[Unreleased\]/u);
  assert.match(changelog, /## \[0\.1\.1\] - 2026-09-12/u);
  assert.match(changelog, /## \[0\.1\.0\] - 2026-09-11 \[YANKED\]/u);
  assert.match(changelog, /no (?:image|artifact).*published/iu);
  assert.match(changelog, /### Added/u);

  const controls = fs.readFileSync("docs/PUBLIC-REPOSITORY-CONTROLS.md", "utf8");
  assert.match(controls, /Public main protection/u);
  assert.match(controls, /Release runner.*ubuntu-24\.04/isu);
  assert.match(controls, /Release branch policy.*v\*\.\*\.\*/isu);
  assert.doesNotMatch(controls, /Branch ruleset belum diaktifkan|Release branch policy \| Sementara/u);

  const packageMetadata = JSON.parse(fs.readFileSync("package.json", "utf8"));
  assert.equal(packageMetadata.version, "0.1.1");

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
    assert.ok(codeowners.split("\n").includes(`${pattern} @donibawono @lethisa`), pattern);
  }
});

test("public metadata does not claim an unapproved software license", () => {
  const dockerfile = fs.readFileSync("images/php-ci/Dockerfile", "utf8");
  assert.doesNotMatch(dockerfile, /org\.opencontainers\.image\.licenses/u);
});
