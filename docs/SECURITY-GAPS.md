# Security Gaps

## GAP-RUNNER-2026-001 — Persistent self-hosted pull request builder

**Status:** Closed

**Recorded:** 1 September 2026  

**Closed:** 11 September 2026

**Accountable functions:** Platform Operations dan Platform Security

### Kondisi awal

Pull request internal untuk `platform-runtime-images` sementara dibangun pada
self-hosted runner persisten berlabel `platform-ci`. Proses build dan scan
memerlukan Docker daemon. Branch content yang berbahaya dapat menyalahgunakan
akses tersebut dan memengaruhi runner atau workload berikutnya.

### Alasan penerimaan awal

Repository masih private dan organisasi belum menyediakan GitHub-hosted budget
yang disetujui atau dedicated ephemeral image-builder runner. Controlled runtime
image tetap dibutuhkan untuk menghilangkan instalasi runtime native dan bootstrap
tooling berulang.

### Kontrol kompensasi sebelumnya

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

Kontrol tersebut mengurangi risiko, tetapi tidak menyamai isolasi runner ephemeral.

### Evidence penutupan

- Repository telah menjadi public sehingga standard GitHub-hosted runner tersedia
  tanpa konsumsi kuota menit berbayar.
- Pull request validation dipindahkan ke `ubuntu-24.04`; setiap job memakai VM
  ephemeral baru dan dapat memvalidasi kontribusi dari fork tanpa mengakses
  jaringan runner internal.
- Workflow pull request tetap `contents: read`, tidak memiliki package, OIDC,
  environment, atau deployment credential, dan tidak dapat publish.
- Pull request dan release memakai `ubuntu-24.04` yang ephemeral. Release hanya
  dimulai dari signed annotated tag yang menunjuk commit `main` dan melewati
  required reviewer.
- Self-hosted runner tidak menerima source atau credential dari repository public.
- Penutupan akhir diverifikasi melalui successful canary pull request dan release.

## GAP-BUILD-2026-002 — Reproducibility input build

**Status:** Accepted temporarily

**Recorded:** 11 September 2026

**Review deadline:** 28 February 2027

**Accountable functions:** Platform Operations dan Platform Security

### Kondisi

Base image dan image tool telah dipin menggunakan digest immutable. Namun,
paket dari repository APT, ekstensi PECL, dan paket npm masih diselesaikan dari
sumber aktif saat build berlangsung. Karena isi sumber tersebut dapat berubah,
dua build dari commit yang sama belum dijamin menghasilkan byte yang identik.
Repository ini tidak mengklaim build byte-for-byte reproducible selama gap ini
masih terbuka.

### Kontrol kompensasi

- versi dependency dipin secara eksplisit sejauh didukung sumber upstream;
- base image dan image alat validasi dipin dengan digest;
- setiap build menghasilkan SBOM dan laporan kerentanan;
- policy gate memblokir kerentanan Critical dan High yang memiliki perbaikan,
  kecuali ada exception terkontrol;
- image yang dipromosikan dan dikonsumsi wajib direferensikan melalui digest;
- evidence build mengikat commit, logical artifact ID, hasil validasi, dan image
  digest yang dihasilkan.

### Remediation target

Sebelum tenggat review, evaluasi dan terapkan rangkaian kontrol berikut:

1. gunakan Debian snapshot atau mirror paket ekuivalen yang immutable;
2. pin artefak PECL dan npm dengan integrity hash atau artefak terverifikasi
   yang dikelola organisasi;
3. simpan manifest seluruh input build beserta checksum-nya;
4. jalankan rebuild comparison untuk mengukur dan membuktikan reproducibility;
5. perbarui katalog serta evidence schema sebelum klaim reproducible diaktifkan.

Gap hanya boleh ditutup setelah build berulang dari input yang sama menghasilkan
digest yang sama atau seluruh perbedaan yang tersisa telah diidentifikasi,
didokumentasikan, dan disetujui sebagai non-deterministik yang tidak dapat
dihindari.
