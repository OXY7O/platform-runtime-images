## Ringkasan

Jelaskan perubahan dan alasan teknisnya.

## Dampak

- [ ] Tidak mengubah public contract atau memerlukan PATCH release
- [ ] Menambah capability backward-compatible dan memerlukan MINOR release
- [ ] Mengubah contract secara breaking dan memerlukan MAJOR release

## Validasi

- [ ] `npm test`
- [ ] `npm run validate:catalogue`
- [ ] `git diff --check`
- [ ] Image build/smoke test bila Dockerfile atau runtime berubah

## Security dan supply chain

- [ ] Tidak ada secret, credential, atau environment value
- [ ] External action/base image dipin secara immutable
- [ ] Permission tetap minimum
- [ ] Changelog dan evidence diperbarui bila diperlukan

## Traceability

Issue, governance control, exception, atau evidence reference:
