#!/usr/bin/env bash
set -euo pipefail

readonly logical_id="${1:?usage: build-image.sh LOGICAL_ID IMAGE_TAG}"
readonly image_tag="${2:?usage: build-image.sh LOGICAL_ID IMAGE_TAG}"
readonly catalogue="catalogue/php-ci.json"
readonly node_image="node:24-bookworm@sha256:6dac556d980b7f0e5498d08f08cee0ca67798b4ad6c23964a9214920e67758d0"

base_image="$(docker run --rm \
  --volume "$(pwd):/repository:ro" \
  --workdir /repository \
  "${node_image}" \
  node -e '
  const fs = require("node:fs");
  const catalogue = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
  const entry = catalogue.entries.find((candidate) => candidate.logicalId === process.argv[2]);
  if (!entry) process.exit(2);
  process.stdout.write(entry.baseImage);
' "${catalogue}" "${logical_id}")"

docker build \
  --file images/php-ci/Dockerfile \
  --build-arg "PHP_BASE_IMAGE=${base_image}" \
  --build-arg "SOURCE_REVISION=$(git rev-parse HEAD)" \
  --build-arg "IMAGE_VERSION=development" \
  --tag "${image_tag}" \
  images/php-ci
