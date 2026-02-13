<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    /**
     * 測試：個人資料頁面可以正常顯示。
     * 預期：已登入使用者訪問 /profile 應回傳 HTTP 200。
     */
    public function test_profile_page_is_displayed(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->get('/profile');

        $response->assertOk();
    }

    /**
     * 測試：個人資料 (姓名與電子郵件) 可以被更新。
     * 流程：
     * 1. 發送 PATCH 請求至 /profile 更新 name 與 email。
     * 2. 驗證資料庫是否已更新。
     * 3. 驗證更新 email 後，email_verified_at 應重置 (因為需要重新驗證)。
     */
    public function test_profile_information_can_be_updated(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->patch('/profile', [
                'name' => 'Test User',
                'email' => 'test@example.com',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $user->refresh();

        $this->assertSame('Test User', $user->name);
        $this->assertSame('test@example.com', $user->email);
        $this->assertNull($user->email_verified_at);
    }

    /**
     * 測試：若電子郵件未變更，則驗證狀態不應改變。
     * 預期：只更新姓名但不改 email 時，email_verified_at 應維持原值 (不變)。
     */
    public function test_email_verification_status_is_unchanged_when_the_email_address_is_unchanged(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->patch('/profile', [
                'name' => 'Test User',
                'email' => $user->email,
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $this->assertNotNull($user->refresh()->email_verified_at);
    }

    /**
     * 測試：使用者可以刪除自己的帳號。
     * 流程：
     * 1. 發送 DELETE 請求至 /profile，並提供正確密碼。
     * 2. 驗證使用者被登出且重定向至首頁。
     * 3. 驗證資料庫中該使用者已被移除 (fresh() 回傳 null)。
     */
    public function test_user_can_delete_their_account(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->delete('/profile', [
                'password' => 'password',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/');

        $this->assertGuest();
        $this->assertNull($user->fresh());
    }

    /**
     * 測試：刪除帳號時必須提供正確密碼。
     * 預期：若密碼錯誤，刪除請求應失敗，且 Session 包含錯誤訊息。
     */
    public function test_correct_password_must_be_provided_to_delete_account(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->from('/profile')
            ->delete('/profile', [
                'password' => 'wrong-password',
            ]);

        $response
            ->assertSessionHasErrors('password')
            ->assertRedirect('/profile');

        $this->assertNotNull($user->fresh());
    }
}
