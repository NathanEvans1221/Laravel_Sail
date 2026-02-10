# 安裝 Spatie Laravel Permission 指南

本文件說明如何在 Laravel Sail 環境中安裝並設定 `spatie/laravel-permission` 套件。

## ⚠️ 重要前置作業

在執行任何 Composer 指令之前，**必須確保 Laravel Sail 容器已經啟動**。

如果您尚未啟動 Sail，請執行以下指令：

```bash
./vendor/bin/sail up -d
```

> **注意**：若沒有先啟動容器，直接執行 `./vendor/bin/sail composer ...` 將會失敗，因為 Sail 需要依賴 Docker 容器環境來執行 PHP 與 Composer。

---

## 安裝步驟

### 1. 安裝套件
透過 Composer 安裝 `spatie/laravel-permission`：

```bash
./vendor/bin/sail composer require spatie/laravel-permission
```

### 2. 發布設定檔與遷移檔
將套件的 `config/permission.php` 與資料庫遷移檔案 (migrations) 複製到專案中：

```bash
./vendor/bin/sail php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
```

### 3. 清除設定快取
為了確保新的設定檔被 Laravel 正確讀取，建議清除設定快取：

```bash
./vendor/bin/sail php artisan config:clear
```

### 4. 執行資料庫遷移
建立權限相關的資料表 (`roles`, `permissions`, `model_has_roles` 等)：

```bash
./vendor/bin/sail php artisan migrate
```

### 5. 設定 User Model
編輯 `app/Models/User.php`，引入 `HasRoles` Trait 以啟用權限功能。

```php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Spatie\Permission\Traits\HasRoles; // 1. 引入 Trait

class User extends Authenticatable
{
    use HasRoles; // 2. 在類別中使用 Trait

    // ...
}
```

## 常用指令參考

- 建立角色：`Role::create(['name' => 'writer']);`
- 賦予權限：`$user->givePermissionTo('edit articles');`
- 指派角色：`$user->assignRole('writer');`

更多詳細用法請參考 [官方文件](https://spatie.be/docs/laravel-permission/v6/introduction)。

---

## 🧪 測試與驗證 (Testing)

**⚠️ 注意：** 在測試之前，請確保您的 Laravel 專案已具備「會員註冊/登入」功能。
如果您是全新專案，建議先安裝 [Laravel Breeze](https://laravel.com/docs/starter-kits#laravel-breeze) 以快速產生註冊頁面：

```bash
./vendor/bin/sail composer require laravel/breeze --dev
./vendor/bin/sail artisan breeze:install blade
```

安裝完成後，才能正常瀏覽 `http://localhost/register` 進行註冊。

---

安裝完成後，我們可以使用 Laravel Tinker 來快速驗證權限功能是否運作正常。

### 步驟 1：進入 Tinker 環境
執行以下指令進入互動式 Shell：

```bash
./vendor/bin/sail artisan tinker
```

### 步驟 2：執行測試代碼
在 Tinker 中，依序輸入以下 PHP 代碼進行測試：

```php
// 1. 引入必要的 Model
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

// 2. 建立一個測試權限
// 如果已存在會報錯，可以使用 firstOrCreate
$permission = Permission::firstOrCreate(['name' => 'edit articles']);

// 3. 建立一個測試角色
$role = Role::firstOrCreate(['name' => 'writer']);

// 4. 將「編輯文章」權限賦予「作家」角色
$role->givePermissionTo($permission);

// 5. 取得第一位使用者 (或是建立一位新使用者)
$user = User::first() ?? User::factory()->create();

// 6. 將「作家」角色指派給該使用者
$user->assignRole($role);

// 7. 驗證結果
$user->hasRole('writer');       // 應回傳 true
$user->can('edit articles');    // 應回傳 true
$user->can('delete articles');  // 應回傳 false (因為沒給這個權限)
```

如果上述步驟最後回傳 `true`，恭喜你！權限系統已經成功安裝並運作中。

### 步驟 3：在 Blade 視圖中的應用 (選讀)
在你的 Blade 檔案中，可以使用 `@can` 或 `@role` 指令來控制顯示內容：

```blade
@role('writer')
    <div>我是作家，我可以看到這行字。</div>
@endrole

@can('edit articles')
    <button>編輯文章</button>
@endcan
```

---

## 🖥️ 瀏覽器實測流程 (Browser Testing)

為了讓測試更直觀，我們已經在專案首頁 (`welcome.blade.php`) 加入了權限檢測區塊。請依照以下步驟操作：

### 1. 註冊新帳號
1. 打開瀏覽器前往 [http://localhost](http://localhost)。
2. 點擊右上角的 **Register** 按鈕。
3. 填寫表單註冊一個測試帳號 (例如 `test@example.com`)。

### 2. 查看初始狀態
登入後，您會在首頁左側看到紅色的警告訊息：
> ❌ 你沒有「編輯文章」的權限

這表示目前您的帳號還沒有被賦予任何權限，這是正常的。

### 3. 賦予權限 (使用 Tinker)
保持瀏覽器開啟，回到您的 **終端機 (Terminal)**，執行以下指令：

> 這段指令會建立 `edit articles` 權限，並將其賦予給最新註冊的使用者。

```bash
./vendor/bin/sail artisan tinker --execute="use App\Models\User; use Spatie\Permission\Models\Permission; Permission::firstOrCreate(['name' => 'edit articles']); User::latest()->first()->givePermissionTo('edit articles');"
```

### 4. 驗證結果
回到瀏覽器，**重新整理頁面 (F5)**。
原本的紅色警告應該會變成綠色的成功訊息：
> ✅ 你擁有「編輯文章」的權限

恭喜！這代表您的權限系統、資料庫連線以及 Blade 指令 (`@can`) 都在正常運作中。

---

## 🔍 進階驗證：查看資料庫 (Database Verification)

如果您想親眼確認資料儲存的位置，本專案已內建 **phpMyAdmin** 資料庫管理工具。

### 資料表結構說明
註冊並賦予權限後，相關資料會分散在以下幾張表：

1. **`users`**：儲存使用者基本資料 (Name, Email, Password)。
2. **`permissions`**：儲存權限定義 (例如 `id: 1, name: "edit articles"` )。
3. **`model_has_permissions`**：由 Spatie 套件建立的中介表，用來記錄「誰 (User) 擁有什麼權限 (Permission)」。
   - `permission_id`：對應 `permissions` 表的 ID。
   - `model_id`：對應 `users` 表的 ID。

### 如何查看？
1. 打開瀏覽器前往：**[http://localhost:3307](http://localhost:3307)** (phpMyAdmin)。
   - **伺服器**：`mysql`
   - **使用者名稱**：`root`
   - **密碼**：`admin` (或查看 `.env` 中的 `DB_PASSWORD`)
2. 在左側欄位點選資料庫 **`mydatabase`** (注意：此名稱取決於 `.env` 中 `DB_DATABASE` 的設定，預設為 `mydatabase`)。
3. 點擊 **`model_has_permissions`** 資料表。
   - 您應該會看到一筆資料，將您的 User ID 與 Permission ID 關聯起來。
