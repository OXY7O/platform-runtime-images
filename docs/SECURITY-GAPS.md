# Security Gaps

## GAP-RUNNER-2026-001 — Persistent self-hosted image builder

**Status:** Accepted temporarily  
**Recorded:** 1 September 2026  
**Review deadline:** 30 November 2026  
**Accountable functions:** Platform Operations dan Platform Security

### Kondisi

Pull request internal untuk `platform-runtime-images` sementara dibangun pada
self-hosted runner persisten berlabel `platform-ci`. Proses build dan scan
memerlukan Docker daemon. Branch content yang berbahaya dapat menyalahgunakan
akses tersebut dan memengaruhi runner atau workload berikutnya.

### Alasan penerimaan sementara

Organisasi belum menyediakan GitHub-hosted budget yang disetujui atau dedicated
ephemeral image-builder runner. Controlled runtime image tetap dibutuhkan untuk
menghilangkan instalasi runtime native dan bootstrap tooling berulang.

### Kontrol kompensasi

- source repository private;
- workflow hanya menerima pull request dari branch pada repository yang sama;
- workflow menggunakan `contents: read` dan tidak memiliki package, OIDC,
  environment, atau deployment credential;
- publish tidak dilakukan dari pull request workflow;
- seluruh action, tool image, dan base image dipin secara immutable;
- concurrency membatalkan run lama untuk pull request yang sama;
- vulnerability evidence tidak menyimpan secret atau environment value;
- perubahan workflow, Dockerfile, dan script build memerlukan review Platform
  Operations atau Platform Security sebelum merge.

Kontrol ini mengurangi risiko, tetapi tidak menyamai isolasi runner ephemeral.

### Remediation target

Migrasikan pull request build ke salah satu target berikut sebelum tenggat
review:

1. GitHub-hosted runner yang disetujui untuk image build; atau
2. dedicated ephemeral ARC/image-builder runner tanpa state lintas job.

Setelah migrasi, self-hosted runner persisten hanya boleh melakukan protected
release dari commit yang telah direview. Penutupan gap membutuhkan evidence
isolasi, permission review, successful canary, dan pembaruan dokumen operasi.
