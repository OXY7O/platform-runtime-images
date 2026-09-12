# Changelog

Semua perubahan penting pada project ini didokumentasikan di file ini. Format
mengikuti [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) dan versi
mengikuti [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Changed

- Katalog `php-ci/8.3` kini menunjuk release `v0.1.1` dan digest GHCR public yang
  telah melewati seluruh release gate.

### Planned

- Approved digest integration dengan reusable Laravel workflow.
- PHP 8.2, 8.4, dan 8.5 runtime lanes sesuai lifecycle catalogue.
- Verified mirror ke registry yang dikelola organisasi.

## [0.1.1] - 2026-09-12

### Changed

- Pull request dan protected release menggunakan standard GitHub-hosted
  `ubuntu-24.04` yang ephemeral.
- Release documentation, repository controls, dan package metadata diselaraskan
  dengan trust boundary public repository.

### Security

- Self-hosted runner tidak lagi menerima source atau release credential dari
  repository public.

## [0.1.0] - 2026-09-11 [YANKED]

### Release status

- Signed tag dipertahankan sebagai audit trail, tetapi release workflow tidak
  memperoleh eligible runner. No image or artifact was published, dan versi ini
  tidak boleh digunakan oleh consumer.

### Added

- Controlled PHP 8.3 CI image dengan Composer 2, Node.js 24, Xdebug, dan ekstensi Laravel.
- Laravel application boot smoke test dan arbitrary non-root cache verification.
- Pull request validation dengan SBOM, Trivy scan, dan vulnerability policy gate.
- Protected GHCR release workflow dengan immutable SemVer, digest verification,
  Cosign signature, GitHub provenance attestation, dan catalogue candidate.
- Machine-readable release evidence yang mengikat source SHA, digest, signature,
  attestation, SBOM, dan workflow run.
- Public repository security baseline, community health files, serta Dependabot.
- Ephemeral GitHub-hosted validation untuk public pull request.

### Security

- Exception kerentanan dibatasi menurut artifact, CVE, package, installed/fixed
  version, approval reference, dan expiry.
- Policy, workflow, katalog, dan dokumentasi kritis dilindungi CODEOWNERS.
- Risiko non-reproducible live build inputs dicatat dengan remediation deadline.

[Unreleased]: https://github.com/OXY7O/platform-runtime-images/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/OXY7O/platform-runtime-images/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/OXY7O/platform-runtime-images/releases/tag/v0.1.0
