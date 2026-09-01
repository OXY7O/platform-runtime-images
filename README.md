# Platform Runtime Images

Image factory untuk controlled CI toolchain organisasi. Kloter pertama
menyediakan PHP 8.3 untuk reusable Laravel CI tanpa instalasi runtime native
pada self-hosted runner.

Image release akan didistribusikan melalui GHCR public dan selalu dikonsumsi
menggunakan digest immutable. Source repository tetap private. Dukungan
registry mandiri disediakan melalui mirror dan verification flow terpisah.

## Validasi lokal

```bash
npm ci
npm test
npm run validate:catalogue
```

Repository ini tidak menyimpan source aplikasi, dependency aplikasi, secret,
credential, deployment configuration, atau application runtime image.
