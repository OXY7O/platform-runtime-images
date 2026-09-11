ARG PHP_BASE_IMAGE=php:8.3-cli-bookworm@sha256:177529735599a8244b2c903522f029839dce1c2ac4be122fdc00ada4b45a20e4
ARG COMPOSER_IMAGE=composer:2@sha256:d8f6343d3fae98107426bc49163ccad46ef85aabd4a27d80a74401fab4aba332
ARG NODE_IMAGE=node:24-bookworm@sha256:6dac556d980b7f0e5498d08f08cee0ca67798b4ad6c23964a9214920e67758d0
ARG XDEBUG_VERSION=3.4.5
ARG PHP_BUILD_JOBS=1
ARG NPM_VERSION=12.0.2

FROM ${COMPOSER_IMAGE} AS composer
FROM ${NODE_IMAGE} AS node
ARG NPM_VERSION
RUN npm install --global "npm@${NPM_VERSION}" --ignore-scripts \
    && npm install --prefix /tmp/npm-patches --no-save --ignore-scripts --no-package-lock \
      brace-expansion@5.0.9 ip-address@10.3.1 tar@7.5.21 \
    && rm -rf \
      /usr/local/lib/node_modules/npm/node_modules/brace-expansion \
      /usr/local/lib/node_modules/npm/node_modules/ip-address \
      /usr/local/lib/node_modules/npm/node_modules/tar \
    && cp -R /tmp/npm-patches/node_modules/brace-expansion /usr/local/lib/node_modules/npm/node_modules/brace-expansion \
    && cp -R /tmp/npm-patches/node_modules/ip-address /usr/local/lib/node_modules/npm/node_modules/ip-address \
    && cp -R /tmp/npm-patches/node_modules/tar /usr/local/lib/node_modules/npm/node_modules/tar \
    && rm -rf /tmp/npm-patches /root/.npm
FROM ${PHP_BASE_IMAGE} AS runtime

ARG XDEBUG_VERSION
ARG PHP_BUILD_JOBS

RUN apt-get update \
    && apt-get upgrade --yes \
    && apt-get install --yes --no-install-recommends \
      ca-certificates git libcurl4-openssl-dev libicu-dev libonig-dev \
      libxml2-dev libzip-dev unzip \
    && docker-php-ext-install -j"${PHP_BUILD_JOBS}" bcmath intl mbstring opcache pcntl pdo_mysql zip \
    && pecl install "xdebug-${XDEBUG_VERSION}" \
    && docker-php-ext-enable xdebug \
    && apt-get purge --yes libcurl4-openssl-dev libicu-dev libonig-dev libxml2-dev libzip-dev \
    && rm -rf /var/lib/apt/lists/* /tmp/pear ~/.pearrc

ARG SOURCE_REVISION=uncommitted
ARG IMAGE_VERSION=development

LABEL org.opencontainers.image.title="OXY7O PHP CI Toolchain" \
      org.opencontainers.image.source="https://github.com/OXY7O/platform-runtime-images" \
      org.opencontainers.image.revision="${SOURCE_REVISION}" \
      org.opencontainers.image.version="${IMAGE_VERSION}"

COPY --from=composer /usr/bin/composer /usr/local/bin/composer
COPY --from=node /usr/local/bin/node /usr/local/bin/node
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
COPY doctor.sh /usr/local/bin/php-ci-doctor
COPY entrypoint.sh /usr/local/bin/platform-ci-entrypoint

RUN ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -s ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx \
    && install -d -m 1777 /var/cache/platform/composer /var/cache/platform/npm \
    && chmod 0755 /usr/local/bin/php-ci-doctor /usr/local/bin/platform-ci-entrypoint \
    && php -r 'foreach (["bcmath"=>"bcmath","ctype"=>"ctype","curl"=>"curl","dom"=>"dom","fileinfo"=>"fileinfo","intl"=>"intl","mbstring"=>"mbstring","opcache"=>"Zend OPcache","pcntl"=>"pcntl","pdo"=>"pdo","pdo_mysql"=>"pdo_mysql","tokenizer"=>"tokenizer","xml"=>"xml","xdebug"=>"xdebug","zip"=>"zip"] as $logicalName => $extension) { if (!extension_loaded($extension)) { fwrite(STDERR, "Missing extension: {$logicalName}\n"); exit(1); } }' \
    && composer --version \
    && node --version \
    && npm --version

ENV PLATFORM_LOGICAL_ID="php-ci/8.3" \
    PLATFORM_PHP_MINOR="8.3" \
    COMPOSER_ALLOW_SUPERUSER="1" \
    COMPOSER_CACHE_DIR="/var/cache/platform/composer" \
    NPM_CONFIG_CACHE="/var/cache/platform/npm"

WORKDIR /workspace
ENTRYPOINT ["/usr/local/bin/platform-ci-entrypoint"]
CMD ["php-ci-doctor", "--json"]
