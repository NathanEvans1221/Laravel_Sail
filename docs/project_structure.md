
## 📂 專案目錄架構說明 (Project Structure)

本專案採用標準 Laravel 搭配 Inertia.js (Vue 3) 的架構，以下是關鍵目錄與其職責的說明：

### 🖥️ 前端架構 (Frontend) - `resources/js/`
前端程式碼主要位於 `resources/js` 目錄下，使用 Vue 3 與 Tailwind CSS 開發。

*   **`Components/`**: 共用 UI 元件 (如按鈕、輸入框、Modal 等)。
    *   *例：`PrimaryButton.vue`, `TextInput.vue`, `LanguageSwitcher.vue`*
*   **`Layouts/`**: 頁面佈局組件 (如導覽列、側邊欄、Footer)。
    *   *例：`AuthenticatedLayout.vue` (登入後), `GuestLayout.vue` (登入前)*
*   **`Pages/`**: 對應後端路由的頁面組件 (Inertia Pages)。
    *   *例：`Dashboard.vue`, `Profile/Edit.vue`, `Welcome.vue`*
*   **`Utils/`**: 前端工具函式庫。
    *   *例：`i18nProtector.ts` (負責語系檔解密)*
*   **`app.js`**: 前端應用程式入口，設定 Vue、Inertia 與 i18n 插件。
*   **`bootstrap.js`**: 載入 Axios 與 Echo 等全域設定。

### ⚙️ 後端架構 (Backend) - `app/` & `routes/`
後端核心邏輯位於 `app` 目錄，路由定義在 `routes` 目錄。

*   **`app/Http/Controllers/`**: 處理 HTTP 請求的控制器。
    *   *例：`ProfileController.php` (個人資料管理)*
*   **`app/Models/`**: Eloquent 資料模型，負責與資料庫互動。
    *   *例：`User.php`*
*   **`routes/web.php`**: 定義網頁路由，將 URL 對應到 Controller 或 Inertia 頁面。
*   **`lang/`**: 語系檔案存放處 (JSON 格式)，前後端共用。
    *   *例：`en.json`, `zh_TW.json`*

### 🐳 基礎設施 (Infrastructure)
*   **`docker-compose.yml`**: Laravel Sail 的 Docker 服務定義檔 (MySQL, Redis, Meilisearch 等)。
*   **`vite.config.js`**: 前端建置工具設定，包含 Vue 插件與 i18n 加密插件設定。
