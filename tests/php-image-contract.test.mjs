import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const requiredExtensions = [
  "bcmath", "ctype", "curl", "dom", "fileinfo", "intl", "mbstring", "opcache",
  "pcntl", "pdo", "pdo_mysql", "tokenizer", "xml", "xdebug", "zip",
];

test("PHP CI Dockerfile uses only immutable controlled stages", () => {
  const dockerfile = fs.readFileSync("images/php-ci/Dockerfile", "utf8");
  assert.match(dockerfile, /ARG PHP_BASE_IMAGE/u);
  assert.match(dockerfile, /ARG COMPOSER_IMAGE/u);
  assert.match(dockerfile, /ARG NODE_IMAGE/u);
  assert.match(dockerfile, /ARG XDEBUG_VERSION=3\.4\.5/u);
  assert.doesNotMatch(dockerfile, /:latest(?:\s|$)/mu);
  assert.doesNotMatch(dockerfile, /COPY\s+\.\s+/u);
  assert.doesNotMatch(dockerfile, /apt-get purge[^\n]*--auto-remove/u);
  assert.match(dockerfile, /ARG PHP_BUILD_JOBS=2/u);
  assert.match(dockerfile, /docker-php-ext-install -j"\$\{PHP_BUILD_JOBS\}"/u);
  assert.doesNotMatch(dockerfile, /nproc/u);
  assert.match(dockerfile, /Zend OPcache/u);
  for (const extension of requiredExtensions) {
    assert.ok(dockerfile.includes(extension), `missing extension contract: ${extension}`);
  }
});

test("doctor emits controlled machine-readable runtime metadata", () => {
  const doctor = fs.readFileSync("images/php-ci/doctor.sh", "utf8");
  for (const field of ["schemaVersion", "logicalId", "phpMinor", "composerMajor", "nodeMajor", "architecture", "extensions"]) {
    assert.ok(doctor.includes(field), `doctor missing ${field}`);
  }
  assert.match(doctor, /"opcache"\s*=>\s*"Zend OPcache"/u);
  assert.doesNotMatch(doctor, /(?:^|\s)(?:env|printenv)(?:\s|$)/mu);
});

test("build script resolves the base image from catalogue and rejects free-form base input", () => {
  const script = fs.readFileSync("scripts/build-image.sh", "utf8");
  assert.match(script, /catalogue\/php-ci\.json/u);
  assert.match(script, /logical_id/u);
  assert.match(script, /docker build/u);
  assert.match(script, /node:24-bookworm@sha256:be23f54a88d34e8824c741b19b91064094f92c1c97b194144bfc8b50d67258e2/u);
  assert.doesNotMatch(script, /base_image="\$\(node /u);
  assert.doesNotMatch(script, /PHP_BASE_IMAGE="\$\{[1234]/u);
});

test("verification checks runtime, locked dependencies, and prohibited content", () => {
  const script = fs.readFileSync("scripts/verify-image.sh", "utf8");
  assert.match(script, /php-ci-doctor --json/u);
  assert.match(script, /composer install --no-interaction/u);
  assert.match(script, /composer\.lock/u);
  assert.ok(script.includes("PRIVATE KEY"));
  assert.match(script, /node_modules/u);
  assert.match(script, /vendor/u);
});
