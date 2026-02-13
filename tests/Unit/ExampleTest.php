<?php

declare(strict_types=1);

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class ExampleTest extends TestCase
{
    /**
     * 測試：確認 true 為 true。
     * 說明：這是一個基本的單元測試範例，用於驗證 PHPUnit 環境是否運行正常。
     */
    public function test_that_true_is_true(): void
    {
        $this->assertTrue(true);
    }
}
