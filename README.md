# Platform Runtime Images

[![Validate Runtime Images](https://github.com/OXY7O/platform-runtime-images/actions/workflows/validate.yml/badge.svg)](https://github.com/OXY7O/platform-runtime-images/actions/workflows/validate.yml)
[![CodeQL](https://github.com/OXY7O/platform-runtime-images/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/OXY7O/platform-runtime-images/security/code-scanning)
[![Release](https://img.shields.io/github/v/release/OXY7O/platform-runtime-images?display_name=tag&sort=semver)](https://github.com/OXY7O/platform-runtime-images/releases)
[![PHP 8.3](https://img.shields.io/badge/PHP-8.3-777bb4)](catalogue/php-ci.json)

Image factory publik untuk menyediakan CI toolchain yang terkontrol, dapat
diaudit, dan dikonsumsi secara immutable oleh reusable workflow organisasi.
Vertical slice pertama menyediakan runtime PHP 8.3 untuk Laravel CI tanpa
instalasi PHP, Composer, atau Node.js secara native pada runner.

## Tujuan

Repository ini memisahkan lifecycle toolchain CI dari runner dan source
aplikasi. Setiap image dibangun dari input terkontrol, diuji dengan aplikasi
Laravel nyata, dipindai, diberi SBOM, ditandatangani, dan direferensikan melalui
digest `sha256`.

Repository ini bukan application runtime image, Dev Container, source aplikasi,
atau tempat menyimpan secret dan deployment configuration.

## Arsitektur

```text
platform-governance
  └─ menetapkan policy, lifecycle, security, dan evidence requirement
      └─ platform-runtime-images (repository ini)
          ├─ membangun dan merilis controlled CI image
          └─ menerbitkan approved digest dalam katalog
              └─ platform-workflow
                  └─ menjalankan reusable Laravel CI
                      └─ example-app-laravel
                          └─ membuktikan workflow pada aplikasi nyata
```

| Repository | Tanggung jawab |
| --- | --- |
| [`platform-governance`](https://github.com/OXY7O/platform-governance) | Aturan dan kontrol organisasi |
| `platform-runtime-images` | Factory, release, dan katalog image CI |
| [`platform-workflow`](https://github.com/OXY7O/platform-workflow) | Reusable workflow yang mengonsumsi digest approved |
| [`example-app-laravel`](https://github.com/OXY7O/example-app-laravel) | Verifikasi end-to-end profile Laravel |

## Katalog runtime

| Logical ID | Runtime | Lifecycle | Platform | Release | Lokasi |
| --- | --- | --- | --- | --- | --- |
| `php-ci/8.3` | PHP 8.3, Composer 2, Node.js 24 | `canonical` | `linux/amd64` | Menunggu `v0.1.0` | Menunggu release pertama |

[`catalogue/php-ci.json`](catalogue/php-ci.json) adalah machine-readable source
of truth. Tag membantu manusia menemukan release, tetapi workflow hanya boleh
mengonsumsi `registry/repository@sha256:digest` dari katalog yang sudah direview.

## Quick start

Validasi kontrak repository tanpa membangun image:

```bash
npm ci
npm test
npm run validate:catalogue
```

Build dan verifikasi lokal membutuhkan Docker daemon:

```bash
scripts/build-image.sh php-ci/8.3 platform-ci-php:local
scripts/verify-image.sh platform-ci-php:local
```

Consumer tidak menyalin Dockerfile ini. `platform-workflow` akan memanggil image
berdasarkan digest approved setelah release pertama dan catalogue update selesai.

## Release

Project menggunakan [Semantic Versioning](https://semver.org/) dengan Git tag
`vMAJOR.MINOR.PATCH`; katalog dan metadata image menyimpan `MAJOR.MINOR.PATCH`.

- **MAJOR** untuk perubahan kontrak yang tidak backward-compatible.
- **MINOR** untuk runtime/capability baru yang backward-compatible.
- **PATCH** untuk security rebuild, perbaikan toolchain, atau dokumentasi tanpa
  memutus consumer.

Release hanya dapat berjalan dari `main` melalui environment
`runtime-image-release` dengan required reviewer dan prevent self-review. Setiap
versi immutable: versi yang pernah terpublikasi tidak dapat digunakan kembali.
Prosedur lengkap tersedia pada [panduan operasi release](docs/OPERATIONS.md),
sedangkan perubahan penting dicatat pada [changelog](CHANGELOG.md).

## Keamanan

- Secret scanning dan push protection aktif.
- CodeQL default setup memakai extended query suite.
- Dependabot memantau npm, GitHub Actions, dan Docker.
- Pull request validation tidak memiliki package, OIDC, atau deployment credential.
- Release menghasilkan SBOM, vulnerability report, Cosign signature, provenance
  attestation, dan evidence yang mengikat semuanya ke source SHA serta image digest.

Laporkan kerentanan secara privat melalui [GitHub Security Advisory](https://github.com/OXY7O/platform-runtime-images/security/advisories/new), bukan public issue. Kebijakan lengkap tersedia di [SECURITY.md](SECURITY.md). Risiko yang diterima sementara dicatat pada [security gap register](docs/SECURITY-GAPS.md).

## Kontribusi

Baca [CONTRIBUTING.md](CONTRIBUTING.md), pilih issue form yang sesuai, dan ajukan
perubahan melalui pull request. Jangan mengubah katalog, workflow release, atau
policy security tanpa evidence dan review CODEOWNERS.

## Roadmap

- merilis dan memverifikasi `php-ci/8.3` sebagai `v0.1.0`;
- mengintegrasikan digest approved ke Laravel reusable workflow;
- membuktikan cold/warm cache pada `example-app-laravel`;
- memperluas matrix ke PHP 8.2, 8.4, dan 8.5 sesuai lifecycle;
- menyediakan verified mirror untuk registry mandiri;
- menutup gap runner persisten dan build reproducibility.
