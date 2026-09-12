import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {validateCatalogue} from "../scripts/validate-catalogue.mjs";

const expectedBase =
  "php:8.3-cli-bookworm@sha256:177529735599a8244b2c903522f029839dce1c2ac4be122fdc00ada4b45a20e4";
const expectedReleaseDigest =
  "sha256:e406cd0def2e69f3ca9800ab68ede80ad7f3a5fd7b23dc20b1927371d867db69";

test("catalogue declares the controlled PHP 8.3 vertical slice", () => {
  const catalogue = JSON.parse(fs.readFileSync("catalogue/php-ci.json", "utf8"));
  const result = validateCatalogue(catalogue);
  assert.deepEqual(result.errors, []);
  assert.equal(catalogue.schemaVersion, "1.0");
  assert.equal(catalogue.entries.length, 1);
  assert.deepEqual(catalogue.entries[0], {
    logicalId: "php-ci/8.3",
    phpMinor: "8.3",
    lifecycle: "canonical",
    release: "0.1.1",
    platforms: ["linux/amd64"],
    baseImage: expectedBase,
    toolchain: {composerMajor: "2", nodeMajor: "24", xdebug: true},
    locations: {
      "ghcr-public": {
        registry: "ghcr.io",
        repository: "oxy7o/platform-ci-php",
        digest: expectedReleaseDigest,
      },
      "self-managed": null,
    },
  });
});

test("catalogue rejects mutable images, duplicates, unknown fields, and unverified locations", () => {
  const valid = JSON.parse(fs.readFileSync("catalogue/php-ci.json", "utf8"));
  const cases = [
    {...valid, entries: [{...valid.entries[0], baseImage: "php:latest"}]},
    {...valid, entries: [valid.entries[0], valid.entries[0]]},
    {...valid, entries: [{...valid.entries[0], command: "echo unsafe"}]},
    {...valid, entries: [{...valid.entries[0], platforms: ["linux/arm64"]}]},
    {...valid, entries: [{...valid.entries[0], release: "latest"}]},
    {
      ...valid,
      entries: [{...valid.entries[0], locations: {"ghcr-public": "ghcr.io/oxy7o/platform-ci-php:latest", "self-managed": null}}],
    },
  ];
  for (const candidate of cases) {
    assert.notDeepEqual(validateCatalogue(candidate).errors, []);
  }
});

test("catalogue schema is valid JSON and CLI rejects an invalid file", async () => {
  assert.doesNotThrow(() => JSON.parse(fs.readFileSync("catalogue/php-ci.schema.json", "utf8")));
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "runtime-catalogue-"));
  const invalid = path.join(temp, "invalid.json");
  fs.writeFileSync(invalid, JSON.stringify({schemaVersion: "1.0", entries: []}));
  const result = await import("node:child_process").then(({spawnSync}) =>
    spawnSync(process.execPath, ["scripts/validate-catalogue.mjs", invalid], {encoding: "utf8"}),
  );
  assert.notEqual(result.status, 0);
});
