# Contributing

Terima kasih telah membantu meningkatkan platform runtime organisasi.

## Sebelum memulai

1. Gunakan issue form untuk bug atau usulan runtime baru.
2. Jangan membuka detail security vulnerability sebagai public issue; ikuti [SECURITY.md](SECURITY.md).
3. Pisahkan satu perubahan kohesif per pull request.
4. Jangan memasukkan secret, credential, source aplikasi, atau deployment configuration.

## Development flow

```bash
npm ci
npm test
npm run validate:catalogue
git diff --check
```

Perubahan Dockerfile juga harus melewati build dan `scripts/verify-image.sh` pada
runner yang memiliki Docker daemon. Seluruh external GitHub Action dan base image
wajib dipin dengan full commit SHA atau digest.

## Pull request

- jelaskan tujuan, risiko, dan dampak compatibility;
- cantumkan hasil test dan evidence yang relevan;
- perbarui changelog untuk perubahan user-visible;
- gunakan SemVer untuk dampak release;
- tunggu status check, CODEOWNERS review, dan resolution seluruh conversation.

Maintainer dapat menolak perubahan yang memperluas privilege, memakai mutable
tag, mengurangi evidence, atau tidak mempunyai lifecycle/remediation yang jelas.
