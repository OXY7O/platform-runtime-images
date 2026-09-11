ARG PHP_BASE_IMAGE=php:8.3-cli-bookworm@sha256:177529735599a8244b2c903522f029839dce1c2ac4be122fdc00ada4b45a20e4
ARG COMPOSER_IMAGE=composer:2@sha256:d020706319701a44468968321dccd0fce6620190159a7a9ec195d78e6e971c71
ARG NODE_IMAGE=node:24-bookworm@sha256:be23f54a88d34e8824c741b19b91064094f92c1c97b194144bfc8b50d67258e2
ARG XDEBUG_VERSION=3.4.5
ARG PHP_BUILD_JOBS=1

FROM ${COMPOSER_IMAGE} AS composer
FROM ${NODE_IMAGE} AS node
FROM ${PHP_BASE_IMAGE} AS runtime

ARG XDEBUG_VERSION
ARG PHP_BUILD_JOBS
ARG SOURCE_REVISION=uncommitted
ARG IMAGE_VERSION=development

LABEL org.opencontainers.image.title="OXY7O PHP CI Toolchain" \
      org.opencontainers.image.source="https://github.com/OXY7O/platform-runtime-images" \
      org.opencontainers.image.revision="${SOURCE_REVISION}" \
      org.opencontainers.image.version="${IMAGE_VERSION}" \
      org.opencontainers.image.licenses="MIT"

RUN apt-get update \
    && apt-get install --yes --no-install-recommends \
      ca-certificates git libcurl4-openssl-dev libicu-dev libonig-dev \
      libxml2-dev libzip-dev unzip \
    && docker-php-ext-install -j"${PHP_BUILD_JOBS}" bcmath intl mbstring opcache pcntl pdo_mysql zip \
    && pecl install "xdebug-${XDEBUG_VERSION}" \
    && docker-php-ext-enable xdebug \
    && apt-get purge --yes libcurl4-openssl-dev libicu-dev libonig-dev libxml2-dev libzip-dev \
    && rm -rf /var/lib/apt/lists/* /tmp/pear ~/.pearrc

COPY --from=composer /usr/bin/composer /usr/local/bin/composer
COPY --from=node /usr/local/bin/node /usr/local/bin/node
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
COPY doctor.sh /usr/local/bin/php-ci-doctor
COPY entrypoint.sh /usr/local/bin/platform-ci-entrypoint

RUN ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -s ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx \
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
