# Changelog

Semua perubahan penting pada project ini didokumentasikan di file ini. Format
mengikuti [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) dan versi
mengikuti [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Controlled PHP 8.3 CI image dengan Composer 2, Node.js 24, Xdebug, dan ekstensi Laravel.
- Laravel application boot smoke test dan arbitrary non-root cache verification.
- Pull request validation dengan SBOM, Trivy scan, dan vulnerability policy gate.
- Protected GHCR release workflow dengan immutable SemVer, digest verification,
  Cosign signature, GitHub provenance attestation, dan catalogue candidate.
- Machine-readable release evidence yang mengikat source SHA, digest, signature,
  attestation, SBOM, dan workflow run.
- Public repository security baseline, community health files, serta Dependabot.
- Ephemeral GitHub-hosted validation untuk public pull request; self-hosted runner
  dibatasi pada protected release.

### Security

- Exception kerentanan dibatasi menurut artifact, CVE, package, installed/fixed
  version, approval reference, dan expiry.
- Policy, workflow, katalog, dan dokumentasi kritis dilindungi CODEOWNERS.
- Risiko persistent self-hosted runner dan non-reproducible live build inputs
  dicatat dengan remediation deadline.

### Planned

- Approved digest integration dengan reusable Laravel workflow.
- PHP 8.2, 8.4, dan 8.5 runtime lanes sesuai lifecycle catalogue.
- Verified mirror ke registry yang dikelola organisasi.

[Unreleased]: https://github.com/OXY7O/platform-runtime-images/commits/main
