# Operasi Release Runtime Image

## Prasyarat satu kali

1. Buat GitHub Environment `runtime-image-release`.
2. Tetapkan reviewer dari Platform Operations atau Platform Security dan cegah self-review jika paket GitHub organisasi mendukungnya.
3. Terapkan ruleset pada `main` dan tag `runtime-images-v*`; perubahan workflow, policy, dan katalog harus melewati CODEOWNERS review.
4. Pastikan runner `platform-ci` hanya menerima release dari commit yang telah direview dan tidak menyimpan deployment credential.

Konfigurasi environment dan ruleset dilakukan melalui GitHub UI oleh Platform Operations. Workflow tidak boleh menganggap konfigurasi tersebut sudah aktif tanpa verifikasi evidence.

## Menjalankan release

1. Pastikan pull request release sudah merged dan seluruh check hijau.
2. Jalankan `Release Runtime Images` melalui `workflow_dispatch` dengan versi CalVer `YYYY.MM.N`, misalnya `2026.09.0`. Tag `runtime-images-vYYYY.MM.N` menyediakan jalur ekuivalen.
3. Reviewer environment menyetujui job setelah memeriksa source SHA dan versi.
4. Workflow membangun serta memublikasikan image, menarik ulang berdasarkan digest, menjalankan smoke test, membuat SBOM, memindai kerentanan, menandatangani image, dan membuat attestation.
5. Unduh artifact release evidence. Gunakan `php-ci.catalogue.candidate.json` untuk pull request katalog; jangan menyalin digest secara manual.

Workflow release hanya memiliki akses baca ke source. Karena itu pembaruan katalog sengaja tidak didorong langsung ke `main`; kandidat selalu melewati pull request terpisah.

## Aktivasi GHCR public

Setelah release pertama lulus, Platform Operations mengubah visibilitas package `platform-ci-php` menjadi public melalui pengaturan package GHCR. Source repository tetap private. Verifikasi dari sesi tanpa credential:

```bash
docker pull ghcr.io/oxy7o/platform-ci-php@sha256:<digest-dari-katalog>
```

Jangan memakai tag `latest` atau tag CalVer sebagai referensi consumer. `platform-workflow` hanya boleh memakai `registry/repository@sha256:digest` dari katalog yang sudah merged.

## Gagal dan pemulihan

- Build, scan, signature, attestation, atau smoke test gagal: jangan merge kandidat katalog.
- Image sudah terpublikasi tetapi gate berikutnya gagal: image tidak boleh menjadi lokasi approved; hapus atau karantina tag melalui prosedur package operations.
- Kandidat katalog tidak sama dengan digest workflow: tolak pull request dan ulangi release dengan versi baru.
- Registry mandiri belum aktif: pertahankan `self-managed: null`; tidak ada failover diam-diam.
