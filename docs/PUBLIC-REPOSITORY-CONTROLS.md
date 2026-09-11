# Kontrol Public Repository

Dokumen ini mencatat kontrol yang aktif pada repository
`OXY7O/platform-runtime-images`. Status diverifikasi melalui GitHub API pada
11 September 2026. Pengaturan GitHub tetap menjadi source of truth operasional;
file ini menjadi rekaman yang mudah direview dan tidak menyimpan secret.

## Kontrol aktif

| Area | Status | Implementasi |
| --- | --- | --- |
| Visibilitas | Aktif | Public repository |
| Default branch | Aktif | `main` |
| Kontribusi | Aktif | Issues dan issue forms |
| Merge | Aktif | Squash merge saja; branch sumber dihapus otomatis |
| Secret protection | Aktif | Secret scanning dan push protection |
| Code scanning | Aktif | CodeQL default setup dengan extended query suite |
| Dependency security | Aktif | Vulnerability alerts, security updates, dan Dependabot |
| Pelaporan kerentanan | Aktif | Private vulnerability reporting |
| Release approval | Aktif | Environment `runtime-image-release`, reviewer `@lethisa`, prevent self-review |
| Release branch policy | Sementara | `main`; diganti menjadi tag `v*.*.*` saat workflow SemVer merged |

## Kontrol berbasis repository

- `CODEOWNERS` melindungi workflow, image, policy, katalog, dokumentasi, dan
  community health files melalui `@donibawono` dan `@lethisa`.
- Pull request validation menguji kontrak, katalog, image build, SBOM, dan
  vulnerability policy tanpa deployment credential.
- Release hanya menerima signed annotated SemVer tag yang menunjuk commit pada
  `main` dan menerbitkan GitHub Release setelah seluruh gate berhasil.
- Security advisory digunakan untuk laporan kerentanan; public issue tidak boleh
  memuat detail kerentanan yang belum ditangani.

## Batasan dan keputusan tertunda

- Branch ruleset belum diaktifkan sampai required status check pada pull request
  ini terverifikasi. Ruleset harus direkam pada pembaruan dokumen berikutnya.
- Repository belum menyatakan lisensi open-source. Publik dapat membaca source,
  tetapi tidak ada hak penggunaan ulang yang diasumsikan sampai organisasi
  menyetujui dan menambahkan file lisensi.
- Package GHCR menjadi public setelah release pertama berhasil dan digest katalog
  telah direview.

Setiap perubahan pengaturan GitHub harus memperbarui tabel ini dalam pull request
yang sama atau pada pull request evidence segera setelah perubahan administratif.
