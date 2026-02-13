<?php

declare(strict_types=1);

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class EmailVerificationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * 測試：電子郵件驗證頁面是否能正常顯示。
     * 預期：
     * 1. 建立一個未驗證的假使用者 (unverified)。
     * 2. 模擬該使用者登入並訪問 '/verify-email'。
     * 3. 應回傳 HTTP 200 狀態碼。
     */
    public function test_email_verification_screen_can_be_rendered(): void
    {
        $user = User::factory()->unverified()->create();

        $response = $this->actingAs($user)->get('/verify-email');

        $response->assertStatus(200);
    }

    /**
     * 測試：電子郵件可以被成功驗證。
     * 流程：
     * 1. 建立未驗證使用者。
     * 2. 偽造 Event 以攔截事件。
     * 3. 產生帶有簽名 (Signed) 的驗證網址。
     * 4. 模擬使用者訪問該網址。
     * 5. 驗證是否觸發 Verified 事件、資料庫欄位已更新、並導向至 dashboard。
     */
    public function test_email_can_be_verified(): void
    {
        $user = User::factory()->unverified()->create();

        Event::fake();

        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1($user->email)]
        );

        $response = $this->actingAs($user)->get($verificationUrl);

        Event::assertDispatched(Verified::class);
        $this->assertTrue($user->fresh()->hasVerifiedEmail());
        $response->assertRedirect(route('dashboard', absolute: false).'?verified=1');
    }

    /**
     * 測試：使用無效的 Hash 無法驗證電子郵件。
     * 預期：使用錯誤的 email hash 產生網址，訪問後使用者的驗證狀態應維持為 false。
     */
    public function test_email_is_not_verified_with_invalid_hash(): void
    {
        $user = User::factory()->unverified()->create();

        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1('wrong-email')]
        );

        $this->actingAs($user)->get($verificationUrl);

        $this->assertFalse($user->fresh()->hasVerifiedEmail());
    }
}
