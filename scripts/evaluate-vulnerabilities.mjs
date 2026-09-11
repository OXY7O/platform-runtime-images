import fs from "node:fs";
import {pathToFileURL} from "node:url";

function validException(exception, now) {
  return Boolean(
    exception &&
      /^EXC-[0-9]{4}-[0-9]{3,}$/.test(exception.id ?? "") &&
      typeof exception.owner === "string" && exception.owner.trim() !== "" &&
      typeof exception.approvedBy === "string" && exception.approvedBy.trim() !== "" &&
      /^https:\/\/github\.com\/OXY7O\/platform-runtime-images\/(issues|pull)\/[0-9]+$/.test(exception.approvalRef ?? "") &&
      typeof exception.remediation === "string" && exception.remediation.trim().length >= 8 &&
      /^\d{4}-\d{2}-\d{2}$/.test(exception.expiresAt ?? "") &&
      new Date(`${exception.expiresAt}T23:59:59Z`) >= now,
  );
}

export function evaluateVulnerabilities(report, policy, now = new Date(), artifactLogicalId = "") {
  const vulnerabilities = (report.Results ?? []).flatMap((result) => result.Vulnerabilities ?? []);
  const blocking = [];
  const excepted = [];
  for (const vulnerability of vulnerabilities) {
    if (!policy.blockSeverities.includes(vulnerability.Severity)) continue;
    if (policy.requireFixedVersion && !vulnerability.FixedVersion) continue;
    const exception = (policy.exceptions ?? []).find(
      (candidate) =>
        candidate.artifactLogicalId === artifactLogicalId &&
        candidate.vulnerabilityId === vulnerability.VulnerabilityID &&
        candidate.packageName === vulnerability.PkgName &&
        candidate.installedVersion === vulnerability.InstalledVersion &&
        candidate.fixedVersion === vulnerability.FixedVersion,
    );
    if (validException(exception, now)) excepted.push(vulnerability.VulnerabilityID);
    else blocking.push(vulnerability.VulnerabilityID);
  }
  return {allowed: blocking.length === 0, blocking: [...new Set(blocking)].sort(), excepted: [...new Set(excepted)].sort()};
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const report = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
  const policy = JSON.parse(fs.readFileSync(process.argv[3], "utf8"));
  const result = evaluateVulnerabilities(report, policy, new Date(), process.argv[4] ?? "");
  console.log(JSON.stringify(result));
  if (!result.allowed) process.exitCode = 1;
}
