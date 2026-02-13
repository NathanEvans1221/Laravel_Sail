<?php

declare(strict_types=1);

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * 測試：註冊頁面是否能正常顯示。
     * 預期：發送 GET 請求至 /register，應回傳 HTTP 200 狀態碼。
     */
    public function test_registration_screen_can_be_rendered(): void
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    /**
     * 測試：新使用者可以註冊成功。
     * 流程：
     * 1. 準備註冊表單資料 (name, email, password 等)。
     * 2. 發送 POST 請求至 /register。
     * 3. 驗證使用者註冊後是否自動登入 (assertAuthenticated)。
     * 4. 驗證註冊後是否導向至 'dashboard'。
     */
    public function test_new_users_can_register(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }
}
