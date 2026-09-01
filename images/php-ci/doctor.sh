#!/usr/bin/env sh
set -eu

if [ "${1:-}" != "--json" ]; then
  echo "usage: php-ci-doctor --json" >&2
  exit 2
fi

php -r '
  $architecture = php_uname("m") === "x86_64" ? "amd64" : php_uname("m");
  $extensionMap = ["bcmath"=>"bcmath","ctype"=>"ctype","curl"=>"curl","dom"=>"dom","fileinfo"=>"fileinfo","intl"=>"intl","mbstring"=>"mbstring","opcache"=>"Zend OPcache","pcntl"=>"pcntl","pdo"=>"pdo","pdo_mysql"=>"pdo_mysql","tokenizer"=>"tokenizer","xml"=>"xml","xdebug"=>"xdebug","zip"=>"zip"];
  foreach ($extensionMap as $logicalName => $extension) {
    if (!extension_loaded($extension)) {
      fwrite(STDERR, "Missing extension: {$logicalName}\n");
      exit(1);
    }
  }
  $composerOutput = trim(shell_exec("composer --version --no-ansi"));
  if (preg_match("/Composer version ([^ ]+)/", $composerOutput, $composerMatch) !== 1) {
    fwrite(STDERR, "Unable to determine Composer version\n");
    exit(1);
  }
  $composerVersion = $composerMatch[1];
  echo json_encode([
    "schemaVersion" => "1.0",
    "logicalId" => getenv("PLATFORM_LOGICAL_ID"),
    "phpMinor" => getenv("PLATFORM_PHP_MINOR"),
    "phpVersion" => PHP_VERSION,
    "composerMajor" => explode(".", $composerVersion)[0],
    "composerVersion" => $composerVersion,
    "nodeMajor" => ltrim(explode(".", trim(shell_exec("node --version")))[0], "v"),
    "nodeVersion" => ltrim(trim(shell_exec("node --version")), "v"),
    "architecture" => $architecture,
    "extensions" => array_keys($extensionMap),
  ], JSON_UNESCAPED_SLASHES) . PHP_EOL;
'
