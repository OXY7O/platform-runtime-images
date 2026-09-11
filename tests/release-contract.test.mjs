import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {parse} from "yaml";

import {recordRelease} from "../scripts/record-release.mjs";
import {createReleaseEvidence} from "../scripts/create-release-evidence.mjs";

const digest = `sha256:${"a".repeat(64)}`;

test("release workflow is protected, immutable, and verifies the published digest", () => {
  const workflow = parse(fs.readFileSync(".github/workflows/release.yml", "utf8"));
  assert.ok(workflow.on.workflow_dispatch);
  assert.equal(workflow.on.workflow_dispatch.inputs["release-version"].required, true);
  assert.deepEqual(workflow.on.push.tags, ["v*.*.*"]);
  assert.equal(workflow.on.pull_request, undefined);
  assert.deepEqual(workflow.permissions, {contents: "read"});

  const job = workflow.jobs["release-php-83"];
  assert.equal(job.environment, "runtime-image-release");
  assert.deepEqual(job["runs-on"], ["self-hosted", "platform-ci"]);
  assert.deepEqual(job.permissions, {
    contents: "read",
    packages: "write",
    "id-token": "write",
    attestations: "write",
  });

  const serialized = JSON.stringify(workflow);
  assert.equal(job.steps[0].with["fetch-depth"], 0);
  assert.match(serialized, /git merge-base --is-ancestor.*origin\/main/u);
  assert.match(serialized, /git\.getTag/u);
  assert.match(serialized, /verification\?\.verified/u);
  assert.match(serialized, /getAllPackageVersionsForPackageOwnedByOrg/u);
  assert.match(serialized, /error\.status !== 404/u);
  assert.match(serialized, /Release version already exists/u);
  assert.doesNotMatch(serialized, /docker manifest inspect/u);
  assert.match(serialized, /ghcr\.io\/oxy7o\/platform-ci-php/u);
  assert.match(serialized, /scripts\/verify-image\.sh.*IMAGE_REF/u);
  assert.match(serialized, /steps\.build\.outputs\.digest/u);
  assert.match(serialized, /cosign sign --yes/u);
  assert.match(serialized, /scripts\/record-release\.mjs/u);
  assert.match(serialized, /scripts\/create-release-evidence\.mjs/u);
  assert.doesNotMatch(serialized, /pull_request_target|latest|docker push/u);

  for (const step of job.steps) {
    if (step.uses) assert.match(step.uses, /@[a-f0-9]{40}$/u, step.uses);
  }
});

test("release evidence binds digest to signature, attestation, SBOM, and workflow run", () => {
  const evidence = createReleaseEvidence({
    logicalId: "php-ci/8.3",
    release: "0.1.0",
    sourceSha: "c".repeat(40),
    imageReference: `ghcr.io/oxy7o/platform-ci-php@${digest}`,
    runId: "12345",
    runUrl: "https://github.com/OXY7O/platform-runtime-images/actions/runs/12345",
    signatureIdentity: "https://github.com/OXY7O/platform-runtime-images/.github/workflows/release.yml@refs/heads/main",
    attestationId: "attestation-123",
    attestationUrl: "https://github.com/OXY7O/platform-runtime-images/attestations/attestation-123",
    sbomSha256: "d".repeat(64),
  });
  assert.equal(evidence.image.digest, digest);
  assert.equal(evidence.signature.subject, evidence.image.reference);
  assert.equal(evidence.provenance.attestationId, "attestation-123");
  assert.equal(evidence.sbom.sha256, "d".repeat(64));
  assert.equal(evidence.workflow.runUrl, "https://github.com/OXY7O/platform-runtime-images/actions/runs/12345");
});

test("release evidence rejects a tag reference and missing supply-chain references", () => {
  const valid = {
    logicalId: "php-ci/8.3", release: "0.1.0", sourceSha: "c".repeat(40),
    imageReference: `ghcr.io/oxy7o/platform-ci-php@${digest}`, runId: "12345",
    runUrl: "https://github.com/OXY7O/platform-runtime-images/actions/runs/12345",
    signatureIdentity: "https://github.com/OXY7O/platform-runtime-images/.github/workflows/release.yml@refs/heads/main",
    attestationId: "attestation-123",
    attestationUrl: "https://github.com/OXY7O/platform-runtime-images/attestations/attestation-123",
    sbomSha256: "d".repeat(64),
  };
  assert.throws(() => createReleaseEvidence({...valid, imageReference: "ghcr.io/oxy7o/platform-ci-php:latest"}));
  assert.throws(() => createReleaseEvidence({...valid, attestationUrl: ""}));
  assert.throws(() => createReleaseEvidence({...valid, sbomSha256: "bad"}));
});

test("release recorder creates an immutable catalogue candidate and preserves mirrors", () => {
  const catalogue = JSON.parse(fs.readFileSync("catalogue/php-ci.json", "utf8"));
  catalogue.entries[0].locations["self-managed"] = {
    registry: "registry.example.internal",
    repository: "platform/php-ci",
    digest: `sha256:${"b".repeat(64)}`,
  };
  const candidate = recordRelease(catalogue, {
    logicalId: "php-ci/8.3",
    release: "0.1.0",
    registry: "ghcr.io",
    repository: "oxy7o/platform-ci-php",
    digest,
  });
  assert.equal(candidate.entries[0].release, "0.1.0");
  assert.deepEqual(candidate.entries[0].locations["ghcr-public"], {
    registry: "ghcr.io",
    repository: "oxy7o/platform-ci-php",
    digest,
  });
  assert.equal(candidate.entries[0].locations["self-managed"].registry, "registry.example.internal");
  assert.equal(catalogue.entries[0].release, null, "input must not be mutated");
});

test("release recorder rejects unsafe or incomplete release identity", () => {
  const catalogue = JSON.parse(fs.readFileSync("catalogue/php-ci.json", "utf8"));
  for (const input of [
    {logicalId: "php-ci/9.9", release: "0.1.0", registry: "ghcr.io", repository: "oxy7o/platform-ci-php", digest},
    {logicalId: "php-ci/8.3", release: "latest", registry: "ghcr.io", repository: "oxy7o/platform-ci-php", digest},
    {logicalId: "php-ci/8.3", release: "01.0.0", registry: "ghcr.io", repository: "oxy7o/platform-ci-php", digest},
    {logicalId: "php-ci/8.3", release: "0.1.0", registry: "ghcr.io", repository: "oxy7o/platform-ci-php", digest: "sha256:bad"},
    {logicalId: "php-ci/8.3", release: "0.1.0", registry: "evil.example", repository: "other/image", digest},
  ]) {
    assert.throws(() => recordRelease(catalogue, input));
  }
});

test("release recorder CLI writes a candidate file rather than changing the source", async () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "runtime-release-"));
  const source = path.join(temp, "catalogue.json");
  const output = path.join(temp, "candidate.json");
  fs.copyFileSync("catalogue/php-ci.json", source);
  const before = fs.readFileSync(source, "utf8");
  const {spawnSync} = await import("node:child_process");
  const result = spawnSync(process.execPath, [
    "scripts/record-release.mjs", source, output, "php-ci/8.3", "0.1.0", digest,
  ], {encoding: "utf8"});
  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.readFileSync(source, "utf8"), before);
  assert.equal(JSON.parse(fs.readFileSync(output, "utf8")).entries[0].release, "0.1.0");
});
