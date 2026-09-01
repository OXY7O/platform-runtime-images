<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class RuntimeSmokeTest extends TestCase
{
    public function testControlledRuntimeExecutesPhpUnit(): void
    {
        self::assertSame('8.3', PHP_MAJOR_VERSION . '.' . PHP_MINOR_VERSION);
        self::assertTrue(extension_loaded('xdebug'));
    }
}
