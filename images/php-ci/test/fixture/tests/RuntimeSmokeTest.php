<?php

declare(strict_types=1);

use Illuminate\Foundation\Application;
use PHPUnit\Framework\TestCase;

final class RuntimeSmokeTest extends TestCase
{
    public function testControlledRuntimeExecutesPhpUnit(): void
    {
        self::assertSame('8.3', PHP_MAJOR_VERSION . '.' . PHP_MINOR_VERSION);
        self::assertTrue(extension_loaded('xdebug'));
    }

    public function testLockedLaravelFrameworkBootsItsContainer(): void
    {
        $application = new Application(dirname(__DIR__));
        $application->instance('runtime.smoke', 'ready');

        self::assertSame('ready', $application->make('runtime.smoke'));
        self::assertNotSame('', $application->version());
    }
}
