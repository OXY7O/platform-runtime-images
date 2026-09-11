import fs from "node:fs";
import {pathToFileURL} from "node:url";

const digestPattern = /^sha256:[a-f0-9]{64}$/u;
const shaPattern = /^[a-f0-9]{40}$/u;
const checksumPattern = /^[a-f0-9]{64}$/u;
const runUrlPattern = /^https:\/\/github\.com\/OXY7O\/platform-runtime-images\/actions\/runs\/[0-9]+$/u;
const attestationUrlPattern = /^https:\/\/github\.com\/OXY7O\/platform-runtime-images\/attestations\/.+$/u;
const identityPattern = /^https:\/\/github\.com\/OXY7O\/platform-runtime-images\/\.github\/workflows\/release\.yml@refs\/(heads\/main|tags\/v(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*))$/u;
const releasePattern = /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$/u;

function required(value, name) {
  if (typeof value !== "string" || value.trim() === "") throw new Error(`${name} is required`);
  return value;
}

export function createReleaseEvidence(input) {
  const imageReference = required(input.imageReference, "imageReference");
  const separator = imageReference.lastIndexOf("@");
  const imageDigest = separator === -1 ? "" : imageReference.slice(separator + 1);
  if (!digestPattern.test(imageDigest)) throw new Error("imageReference must use an immutable sha256 digest");
  if (!shaPattern.test(input.sourceSha ?? "")) throw new Error("sourceSha must be a full commit SHA");
  if (!runUrlPattern.test(input.runUrl ?? "")) throw new Error("runUrl must identify this repository");
  if (!identityPattern.test(input.signatureIdentity ?? "")) throw new Error("signatureIdentity is not approved");
  if (!attestationUrlPattern.test(input.attestationUrl ?? "")) throw new Error("attestationUrl is not approved");
  if (!checksumPattern.test(input.sbomSha256 ?? "")) throw new Error("sbomSha256 must be a sha256 checksum");
  if (!releasePattern.test(input.release ?? "")) throw new Error("release must use stable Semantic Versioning X.Y.Z");

  return {
    schemaVersion: "1.0",
    logicalId: required(input.logicalId, "logicalId"),
    release: required(input.release, "release"),
    sourceSha: input.sourceSha,
    image: {reference: imageReference, digest: imageDigest},
    signature: {
      subject: imageReference,
      certificateIdentity: input.signatureIdentity,
      certificateIssuer: "https://token.actions.githubusercontent.com",
    },
    provenance: {
      attestationId: required(input.attestationId, "attestationId"),
      attestationUrl: input.attestationUrl,
    },
    sbom: {
      format: "spdx-json",
      artifactPath: "sbom.spdx.json",
      sha256: input.sbomSha256,
    },
    workflow: {runId: required(input.runId, "runId"), runUrl: input.runUrl},
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [outputPath, logicalId, release, sourceSha, imageReference, runId, runUrl, signatureIdentity, attestationId, attestationUrl, sbomSha256] = process.argv.slice(2);
  if (!outputPath) throw new Error("output path is required");
  const evidence = createReleaseEvidence({logicalId, release, sourceSha, imageReference, runId, runUrl, signatureIdentity, attestationId, attestationUrl, sbomSha256});
  fs.writeFileSync(outputPath, `${JSON.stringify(evidence, null, 2)}\n`, {flag: "wx"});
}
