# i18n 多語系功能設定說明

本專案使用 Laravel 內建的語系功能搭配 `laravel-vue-i18n` 套件，實現前後端共用單一語系檔 (Single Source of Truth) 的架構。

## 1. 架構說明

- **語系檔位置**：`lang/*.json` (例如 `lang/zh_TW.json`)
- **後端使用**：`__('Key')`
- **前端使用**：`$t('Key')`

前端 Vue 應用程式會透過 `laravel-vue-i18n` 插件，在編譯時或運行時自動讀取 `lang` 目錄下的 JSON 檔案，因此**不需要**維護兩份翻譯。

## 2. 安裝與設定歷程 (Installation & Setup)

本環境已執行以下指令完成建置，供日後參考：

### Backend (Laravel)
- **發布語系目錄**：
  ```bash
  ./vendor/bin/sail php artisan lang:publish
  ```
  - **產出**：建立 `lang/` 目錄 (Laravel 11+ 預設不顯示，需手動發布)。
  - **用途**：存放所有後端與前端共用的翻譯檔案。
- **建立英文語系檔**：
  ```bash
  touch lang/en.json
  ```
  - **原因**：前端 `import.meta.glob` 需要明確的檔案存在，否則切換到英文時會因為找不到檔案而報錯。

### Frontend (Vue/Inertia)
- **安裝套件**：
  ```bash
  ./vendor/bin/sail npm install laravel-vue-i18n --save-dev
  ```
  - **用途**：讓 Vue 前端能解析並使用 Laravel 的翻譯檔。

## 3. 設計決策與機制比較 (Design Rationale)

為了避免前後端語言檔不同步的維護噩夢，本專案刻意選用了 **Single Source of Truth** 的架構。以下比較常見的三種模式：

### A. 傳統 Laravel 機制 (Backend Only)
- **機制**：使用 PHP 陣列 (`lang/en/messages.php`) 或 JSON (`lang/en.json`)。
- **缺點**：前端 Vue 無法直接存取這些翻譯，必須透過 API 回傳或是全部塞進 `window.shared`，容易造成 Payload 過大。

### B. 常見 Vue 機制 (Frontend Only)
- **機制**：使用 `vue-i18n`，將翻譯檔放在 `resources/js/locales` 或是 `src/locales`。
- **缺點**：與 Laravel 後端完全脫鉤。後端發出的 Email 或驗證訊息 (Validation) 用一套翻譯，前端介面用另一套，**維護人員需要同時修改兩份檔案**。

### C. 本專案採用機制 (Current Strategy) 👑
- **機制**：使用 `laravel-vue-i18n` + Vite Glob Import。
- **原理**：Vue 前端直接「掛載」 Laravel 的 `lang` 目錄。
- **優點**：**只維護一份檔案 (`lang/*.json`)**，前後端同時生效。

> ⚠️ **特別提醒維護人員**
> 強烈建議不要移除 `resources/js/app.js` 中的 `import.meta.glob('../../lang/*.json')` 設定。
> 這不是 Vue 的預設行為，而是為了實現前後端共用翻譯檔的客製化設定。

## 4. 關鍵設定檔案 (Configuration Files)

以下是實現前後端共用翻譯的核心設定檔，點擊連結可直接跳轉編輯：

### 1. Vite 設定
- **檔案位置**：[`vite.config.js`](../vite.config.js)
- **用途**：引入 `laravel-vue-i18n/vite` 插件，讓 Vite 能讀取並熱更新 JSON 翻譯檔。

```javascript
import i18n from 'laravel-vue-i18n/vite';

export default defineConfig({
    plugins: [
        // ...
        i18n(),
    ],
});
```

### 2. Vue 入口設定
- **檔案位置**：[`resources/js/app.js`](../resources/js/app.js)
- **用途**：初始化 `i18nVue` 插件，並透過 `import.meta.glob` 掛載 `lang` 目錄。

```javascript
import { i18nVue } from 'laravel-vue-i18n';

createInertiaApp({
    // ...
    setup({ el, App, props, plugin }) {
        return createApp({ render: () => h(App, props) })
            .use(plugin)
            .use(i18nVue, {
                resolve: async lang => {
                    const langs = import.meta.glob('../../lang/*.json');
                    return await langs[`../../lang/${lang}.json`]();
                }
            })
            .mount(el);
    },
});
```

## 5. 如何新增/修改翻譯

### 步驟 1：開啟語系檔
語系檔案位於專案根目錄的 `lang` 資料夾，請直接點擊以下連結編輯：
- 📂 **語系目錄**：[`lang/`](../lang)
- 🇹🇼 **繁體中文**：[`lang/zh_TW.json`](../lang/zh_TW.json)
- 🇺🇸 **英文 (預設)**：[`lang/en.json`](../lang/en.json) (需自行建立)

### 步驟 2：新增鍵值對
    ```json
    {
        "Welcome Message": "歡迎訊息",
        "Login": "登入"
    }
    ```

3.  **使用翻譯**：
    - **Blade / PHP**: `{{ __('Welcome Message') }}`
    - **Vue Template**: `{{ $t('Welcome Message') }}`

## 6. 切換語系

使用 `loadLanguageAsync` 方法動態切換：

```javascript
import { loadLanguageAsync } from 'laravel-vue-i18n';

<button @click="loadLanguageAsync('en')">English</button>
<button @click="loadLanguageAsync('zh_TW')">繁體中文</button>
```

## 7. 常見問題

- **為什麼新增翻譯後前端沒更新？**
    請確認 `vite` 開發伺服器正在運行 (`npm run dev`)，插件通常會自動偵測變更。若無效，請嘗試重新整理頁面。

- **支援 PHP 陣列格式嗎？**
    目前的 `resources/js/app.js` 設定主要針對 JSON 格式優化。若需支援 `lang/zh_TW/messages.php` 這種格式，需調整 `resolve` 函數的 glob pattern。
