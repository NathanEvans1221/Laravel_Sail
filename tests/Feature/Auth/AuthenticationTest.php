<?php

declare(strict_types=1);

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * 測試：登入頁面是否能正常顯示。
     * 預期：發送 GET 請求至 /login，應回傳 HTTP 200 狀態碼。
     */
    public function test_login_screen_can_be_rendered(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
    }

    /**
     * 測試：使用者可以使用正確的憑證登入。
     * 步驟：
     * 1. 建立一個虛擬使用者 (User Factory)。
     * 2. 發送 POST 請求至 /login，帶入該使用者的 email 與正確密碼 ('password')。
     * 3. 驗證該使用者是否已通過認證。
     * 4. 驗證是否重定向至 'dashboard' 路由。
     */
    public function test_users_can_authenticate_using_the_login_screen(): void
    {
        $user = User::factory()->create();

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    /**
     * 測試：使用者使用錯誤的密碼無法登入。
     * 預期：系統應拒絕認證，使用者狀態應維持為訪客 (Guest)。
     */
    public function test_users_can_not_authenticate_with_invalid_password(): void
    {
        $user = User::factory()->create();

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $this->assertGuest();
    }

    /**
     * 測試：已登入的使用者可以登出。
     * 步驟：
     * 1. 模擬以某個使用者身份 (actingAs) 發送 POST 請求至 /logout。
     * 2. 驗證使用者狀態是否轉變為訪客 (Guest)。
     * 3. 驗證是否重定向至首頁 ('/')。
     */
    public function test_users_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $response->assertRedirect('/');
    }
}
