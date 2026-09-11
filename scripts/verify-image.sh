#!/usr/bin/env bash
set -euo pipefail

readonly image="${1:?usage: verify-image.sh IMAGE}"
readonly fixture="$(pwd)/images/php-ci/test/fixture"

doctor_json="$(docker run --rm "${image}" php-ci-doctor --json)"
docker run --rm --entrypoint node "${image}" -e '
  const doctor = JSON.parse(process.argv[1]);
  const expected = {logicalId:"php-ci/8.3",phpMinor:"8.3",composerMajor:"2",nodeMajor:"24",architecture:"amd64"};
  for (const [key, value] of Object.entries(expected)) {
    if (doctor[key] !== value) throw new Error(`${key}: expected ${value}, received ${doctor[key]}`);
  }
' "${doctor_json}"

docker run --rm --entrypoint sh "${image}" -c '
  test ! -e /workspace/vendor
  test ! -e /workspace/node_modules
  ! grep -RIlE "BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY" /usr/local /opt 2>/dev/null
'

docker run --rm \
  --volume "${fixture}:/workspace" \
  --workdir /workspace \
  "${image}" \
  sh -c 'test -f composer.lock && composer install --no-interaction --no-progress --prefer-dist --no-scripts && vendor/bin/phpunit tests/RuntimeSmokeTest.php'
