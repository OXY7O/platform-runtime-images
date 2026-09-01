import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import {parse} from "yaml";

test("pull request validation is read-only, self-hosted, and never publishes", () => {
  const workflow = parse(fs.readFileSync(".github/workflows/validate.yml", "utf8"));
  assert.ok(workflow.on.pull_request);
  assert.equal(workflow.on.pull_request_target, undefined);
  assert.deepEqual(workflow.permissions, {contents: "read"});
  for (const [jobId, job] of Object.entries(workflow.jobs)) {
    assert.deepEqual(job["runs-on"], ["self-hosted", "platform-ci"], jobId);
    for (const step of job.steps ?? []) {
      if (!step.uses) continue;
      assert.match(step.uses, /@[a-f0-9]{40}$/u, `${jobId}: ${step.uses}`);
    }
  }
  const serialized = JSON.stringify(workflow);
  assert.doesNotMatch(serialized, /packages:write|id-token:write|docker push|build-push-action/u);
  assert.match(serialized, /scripts\/build-image\.sh/u);
  assert.match(serialized, /scripts\/verify-image\.sh/u);
  assert.equal(
    workflow.jobs["validate-php-83"].if,
    "github.event.pull_request.head.repo.full_name == github.repository",
  );
  assert.deepEqual(workflow.concurrency, {
    group: "runtime-image-pr-${{ github.event.pull_request.number }}",
    "cancel-in-progress": true,
  });
});

test("actionlint knows the governed platform runner label", () => {
  const config = parse(fs.readFileSync(".github/actionlint.yaml", "utf8"));
  assert.deepEqual(config["self-hosted-runner"].labels, ["platform-ci"]);
});

test("temporary self-hosted build risk is recorded with concrete remediation", () => {
  const gap = fs.readFileSync("docs/SECURITY-GAPS.md", "utf8");
  assert.match(gap, /GAP-RUNNER-2026-001/u);
  assert.match(gap, /30 November 2026/u);
  assert.match(gap, /ephemeral/u);
  assert.match(gap, /Platform Operations dan Platform Security/u);
  assert.doesNotMatch(gap, /TBD|TODO|placeholder/u);
});
