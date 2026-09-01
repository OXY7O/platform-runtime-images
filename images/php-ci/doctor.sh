#!/usr/bin/env sh
set -eu

if [ "${1:-}" != "--json" ]; then
  echo "usage: php-ci-doctor --json" >&2
  exit 2
fi

php -r '
  $architecture = php_uname("m") === "x86_64" ? "amd64" : php_uname("m");
  $extensions = ["bcmath","ctype","curl","dom","fileinfo","intl","mbstring","opcache","pcntl","pdo","pdo_mysql","tokenizer","xml","xdebug","zip"];
  foreach ($extensions as $extension) {
    if (!extension_loaded($extension)) {
      fwrite(STDERR, "Missing extension: {$extension}\n");
      exit(1);
    }
  }
  echo json_encode([
    "schemaVersion" => "1.0",
    "logicalId" => getenv("PLATFORM_LOGICAL_ID"),
    "phpMinor" => getenv("PLATFORM_PHP_MINOR"),
    "phpVersion" => PHP_VERSION,
    "composerMajor" => explode(".", trim(shell_exec("composer --version --no-ansi | awk \'{print $3}\'")))[0],
    "composerVersion" => trim(shell_exec("composer --version --no-ansi | awk \'{print $3}\'")),
    "nodeMajor" => ltrim(explode(".", trim(shell_exec("node --version")))[0], "v"),
    "nodeVersion" => ltrim(trim(shell_exec("node --version")), "v"),
    "architecture" => $architecture,
    "extensions" => $extensions,
  ], JSON_UNESCAPED_SLASHES) . PHP_EOL;
'
