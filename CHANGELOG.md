# Changelog

所有本專案的顯著變更都將記錄於此檔案。

格式基於 [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)，
並且本專案遵循 [Semantic Versioning](https://semver.org/spec/v2.0.0.html)。

## [Unreleased]

### Added
- 新增 `docs/development_guide.md`：開發常見操作指南，說明新增 Controller, Middleware, Model 等功能的標準流程與範例。
- 建立多語系 (i18n) 基礎架構，整合 `laravel-vue-i18n` 套件。
- 新增 `docs/i18n-setup.md` 說明文件 (含前後端語系機制比較)。
- 新增 `lang/zh_TW.json` 繁體中文語系檔。
- 新增 `lang/en.json` 英文語系檔 (防止前端切換語系時報錯)。
- 新增 `LanguageSwitcher.vue` 元件，並整合至 `GuestLayout`，讓登入/註冊頁面可切換語系。
- 為所有認證相關頁面實作完整多語系支援：
  - `Welcome.vue`：歡迎頁面導航連結
  - `Dashboard.vue`：儀表板頁面
  - `Auth/Register.vue`：註冊頁面
  - `Auth/ForgotPassword.vue`：忘記密碼頁面
  - `Auth/ResetPassword.vue`：重設密碼頁面
  - `Auth/ConfirmPassword.vue`：確認密碼頁面
  - `Auth/VerifyEmail.vue`：電子郵件驗證頁面
- 新增 `docs/i18n-implementation-summary.md`：多語系實作總結文件，包含所有翻譯鍵值與使用方式。
- 擴充翻譯檔案，新增 15+ 個認證相關的翻譯鍵值（英文與繁體中文）。
- 新增 `docs/design-guidelines.md`：設計風格指南，記錄專案的 UI/UX 設計規範，包含配色方案、字體系統、間距系統、組件設計、頁面布局等完整規範。
- 新增 `docs/laravel_session.md`：Laravel Session 與 Redis 儲存說明文件，詳述儲存機制、序列化格式與檢視方法。
- 新增 `docs/i18n-security-guide.md`：前後端語系共享與安全保護機制文件，詳述自動化加密與混淆邏輯。
- 實作 i18n 安全保護機制：
  - 安裝 `lz-string` 依賴。
  - 建立 `resources/js/Utils/i18nProtector.ts` 提供加密/解密功能。
  - 在 `vite.config.js` 整合 `i18nProtectorPlugin` 插件，實現打包時自動物理加密。
  - 修改 `resources/js/app.js` 以支援解密載入 (修正為 Async Module 格式回傳)。
- 新增 `pint.json`：PHP 程式碼格式化配置檔案。
- 新增 `CHANGE.md`：變更記錄檔案（後續已整合至 CHANGELOG.md）。

### Changed
- 更新 `vite.config.js` 與 `resources/js/app.js` 以支援前後端共用語系檔。
- 將 `LanguageSwitcher` 組件整合到所有頁面：
  - `AuthenticatedLayout.vue`：在桌面版導航欄和手機版響應式選單中添加語言切換器
  - `Welcome.vue`：在頁面 header 中添加語言切換器
  - 確保語言切換功能在所有頁面（已登入和未登入）都可使用
- 重新設計 `Welcome.vue` 首頁為簡潔的教學專案風格：
  - 移除 Laravel 官方宣傳內容，改為乾淨的現代化設計
  - 新增版本資訊卡片（Laravel、PHP、Docker）
  - 新增快速連結區塊（Documentation、Laracasts、Laravel News、GitHub）
  - 採用漸層背景和卡片式布局，提升視覺效果
  - 保留完整的導航功能和語言切換器

### Changed
- `compose.yaml`: 合併參考範例 `docker-compose.yml` 之配置。
  - 將 MySQL 映像檔版本由 `8.4` 調整為 `mysql/mysql-server:8.0` 以統一環境。
  - 新增 `phpmyadmin` 與 `redis-insight` 服務。
  - 同步 `laravel.test` 環境變數 (`DB_HOST`)。
  - 為 MySQL 服務增加效能優化指令 (`--innodb-buffer-pool-size=256M` 等)。

### Removed
- `docker-compose.yml`: 作為參考範例已被移除，相關配置已整併至 `compose.yaml`。
### Fixed
- 修正 MySQL 容器啟動失敗問題 (`OS errno 13 - Permission denied`)。
  - 重建 `sail-mysql` Volume以清除舊版本不相容之資料權限。
  - 於 MySQL 啟動指令追加 `--host-cache-size=0` 以解決 `--skip-host-cache` 棄用警告。

### Added
- 新增 `docs/laravel-permission-installation.md`：Spatie Laravel Permission 套件安裝指南，包含安裝步驟與 Browser/Tinker 測試流程。
- 安裝 `laravel/breeze` 套件：提供標準的使用者註冊、登入與管理功能 (Auth Scaffolding)，作為測試權限的基礎。
- 新增 `docs/inertia-page-props.md`：Inertia Page Props 配置指南，包含 Middleware 設定與 Vue 前端範例。

### Changed
- `app/Models/User.php`: 引入 `HasRoles` Trait 並規範化程式碼格式。
- `README.md`: 擴充「進階指南 & 文件」區塊，新增 Laravel Session 與 i18n 安全保護機制說明之連結。
- `resources/views/welcome.blade.php`: 新增權限測試區塊，在首頁即時顯示當前登入使用者的權限狀態 (Has Permission / No Permission)。
- `docs/i18n-security-guide.md`: 補充說明 `lz-string` 打包時的 Named Export 錯誤問題與兼容解決方案。
- 新增 `docs/laravel-testing.md`：Laravel Testing 指南文件，詳述如何在 Sail 環境下執行測試並產生 Coverage 報告。
- 更新 `.gitignore`：將 `/coverage` 目錄加入忽略清單。
- 更新 `.env.example`：新增關於 `SAIL_XDEBUG_MODE` 支援 `coverage` 模式的說明。
