# Security Policy

## Versi yang didukung

| Versi | Dukungan |
| --- | --- |
| `0.1.x` | Security fixes setelah release pertama |
| `< 0.1.0` | Development history; tidak untuk consumer produksi |

Status image individual tetap mengikuti `lifecycle` pada
[`catalogue/php-ci.json`](catalogue/php-ci.json).

## Melaporkan kerentanan

Gunakan [private vulnerability reporting](https://github.com/OXY7O/platform-runtime-images/security/advisories/new). Mohon jangan membuka public issue untuk dugaan kerentanan, credential exposure, atau teknik bypass.

Sertakan informasi minimum berikut tanpa memasukkan secret aktif:

- logical image ID dan digest;
- dampak dan kondisi reproduksi;
- package/file yang terpengaruh;
- bukti minimal yang telah disanitasi;
- mitigasi sementara jika tersedia.

Maintainer akan melakukan triage, menetapkan severity, dan mengoordinasikan
perbaikan serta disclosure. Tidak ada SLA publik yang dijanjikan pada release
awal; finding Critical diprioritaskan untuk containment segera.

## Verifikasi release

Consumer wajib memakai image berdasarkan digest katalog, memverifikasi Cosign
signature dan GitHub provenance attestation, serta memeriksa SBOM/vulnerability
evidence pada workflow run yang sama.
