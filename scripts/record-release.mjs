import fs from "node:fs";
import {pathToFileURL} from "node:url";

const releasePattern = /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$/u;
const digestPattern = /^sha256:[a-f0-9]{64}$/u;

export function recordRelease(catalogue, input) {
  if (!releasePattern.test(input.release ?? "")) throw new Error("release must use stable Semantic Versioning X.Y.Z");
  if (!digestPattern.test(input.digest ?? "")) throw new Error("digest must be an immutable sha256 digest");
  if (input.registry !== "ghcr.io" || input.repository !== "oxy7o/platform-ci-php") {
    throw new Error("public release location is controlled by platform policy");
  }

  const candidate = structuredClone(catalogue);
  const entry = candidate.entries?.find((value) => value.logicalId === input.logicalId);
  if (!entry) throw new Error(`unknown logical image: ${input.logicalId}`);
  if (entry.lifecycle === "retired") throw new Error(`retired image cannot be released: ${input.logicalId}`);

  entry.release = input.release;
  entry.locations["ghcr-public"] = {
    registry: input.registry,
    repository: input.repository,
    digest: input.digest,
  };
  return candidate;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [sourcePath, outputPath, logicalId, release, digest] = process.argv.slice(2);
  if (!sourcePath || !outputPath || !logicalId || !release || !digest) {
    throw new Error("usage: record-release.mjs SOURCE OUTPUT LOGICAL_ID RELEASE DIGEST");
  }
  const catalogue = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  const candidate = recordRelease(catalogue, {
    logicalId,
    release,
    digest,
    registry: "ghcr.io",
    repository: "oxy7o/platform-ci-php",
  });
  fs.writeFileSync(outputPath, `${JSON.stringify(candidate, null, 2)}\n`, {flag: "wx"});
}
