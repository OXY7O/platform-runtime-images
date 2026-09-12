import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import {parse} from "yaml";

function assertPullRequestPermissionBoundary(workflow) {
  assert.deepEqual(workflow.permissions, {contents: "read"});
  for (const [jobId, job] of Object.entries(workflow.jobs)) {
    assert.equal(job.permissions, undefined, `${jobId} must not override permissions`);
  }
}

test("public pull request validation is read-only, ephemeral, and never publishes", () => {
  const workflow = parse(fs.readFileSync(".github/workflows/validate.yml", "utf8"));
  assert.ok(workflow.on.pull_request);
  assert.equal(workflow.on.pull_request_target, undefined);
  assertPullRequestPermissionBoundary(workflow);
  for (const [jobId, job] of Object.entries(workflow.jobs)) {
    assert.equal(job["runs-on"], "ubuntu-24.04", jobId);
    for (const step of job.steps ?? []) {
      if (!step.uses) continue;
      assert.match(step.uses, /@[a-f0-9]{40}$/u, `${jobId}: ${step.uses}`);
    }
  }
  const serialized = JSON.stringify(workflow);
  assert.doesNotMatch(serialized, /11d5960a326750d5838078e36cf38b85af677262|ea165f8d65b6e75b540449e92b4886f43607fa02/u);
  assert.doesNotMatch(serialized, /docker push|build-push-action/u);
  assert.match(serialized, /scripts\/build-image\.sh/u);
  assert.match(serialized, /scripts\/verify-image\.sh/u);
  assert.equal(workflow.jobs["validate-php-83"].if, undefined);
  assert.deepEqual(workflow.concurrency, {
    group: "runtime-image-pr-${{ github.event.pull_request.number }}",
    "cancel-in-progress": true,
  });
  assert.match(workflow.jobs["validate-php-83"].env.IMAGE_TAG, /github\.run_id/u);
  assert.match(workflow.jobs["validate-php-83"].env.IMAGE_TAG, /github\.run_attempt/u);
  assert.match(serialized, /docker image inspect/u);
  assert.match(serialized, /IMAGE_REF/u);
  assert.doesNotMatch(serialized, /platform-ci-php:php-8\.3-test/u);
  const steps = workflow.jobs["validate-php-83"].steps;
  assert.equal(steps[0].name, "Checkout source");
  assert.doesNotMatch(serialized, /Clean legacy root-owned fixture output/u);
});

test("permission contract rejects a job-level write escalation", () => {
  const workflow = parse(fs.readFileSync(".github/workflows/validate.yml", "utf8"));
  workflow.jobs["validate-php-83"].permissions = {packages: "write", "id-token": "write"};
  assert.throws(() => assertPullRequestPermissionBoundary(workflow), /must not override permissions/u);
});

test("public pull request runner gap is closed with protected release separation", () => {
  const gap = fs.readFileSync("docs/SECURITY-GAPS.md", "utf8");
  assert.match(gap, /GAP-RUNNER-2026-001/u);
  assert.match(gap, /\*\*Status:\*\* Closed/u);
  assert.match(gap, /11 September 2026/u);
  assert.match(gap, /ubuntu-24\.04/u);
  assert.match(gap, /ephemeral/u);
  assert.match(gap, /release.*ubuntu-24\.04/isu);
  assert.doesNotMatch(gap, /TBD|TODO|placeholder/u);
});

test("live build input reproducibility gap is explicit and time-bound", () => {
  const gap = fs.readFileSync("docs/SECURITY-GAPS.md", "utf8");
  assert.match(gap, /GAP-BUILD-2026-002/u);
  assert.match(gap, /28 February 2027/u);
  assert.match(gap, /Debian snapshot/u);
  assert.match(gap, /integrity hash/u);
  assert.match(gap, /tidak mengklaim build byte-for-byte reproducible/u);
  assert.doesNotMatch(gap, /TBD|TODO|placeholder/u);
});
