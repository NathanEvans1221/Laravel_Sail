# 前後端語系共享與安全保護機制 (i18n Security & Shared Guide)

本文件詳述了如何實作一套前後端共享且具備自動化加密保護的語系系統，旨在解決語系檔易被大規模抓取（Dumping）的問題，同時維持開發效率。

## 1. 核心設計理念

*   **單一事實來源 (Single Source of Truth)**：前後端共用 `/lang/*.json`，避免在 PHP 與 JS 之間重複維護翻譯。
*   **環境差異化處理**：
    *   **開發環境 (Development)**：讀取原始 JSON，支援 Vite 熱重載 (HMR)。
    *   **正式環境 (Production)**：自動加密/壓縮，保護資源內容，減少檔案體積。
*   **低侵入性**：對業務代碼透明，開發者依然使用 `$t('auth.login')` 或 `__('auth.login')`。

---

## 2. 技術規格與考量

### 規格目標
*   **格式**：JSON (UTF-8)。
*   **結構**：扁平化 (Flattened Key)，例如 `"auth.login": "登入"`。
*   **保護演算法**：`LZ-String` 壓縮 + `Base64` 編碼 + `字串反轉 (Reverse)`。

### 關鍵考量：為什麼要「扁平化」？
Laravel 的語系函數 `__('auth.login')` 在讀取 JSON 時，期待鍵值直接是 `auth.login`。雖然前端習慣巢狀結構，但巢狀結構會導致 Laravel 讀取困難。採用扁平化結構後，Vue-i18n 依然能透過點分隔符號解析，達成完美相容。

---

## 3. 實作步驟

### Step 1: 安裝基礎依賴
```bash
npm install lz-string
npm install -D @types/lz-string
```

### Step 2: 建立加密工具類 (`resources/js/Utils/i18nProtector.ts`)
負責處理字串的壓縮還原與混淆邏輯。
```typescript
import LZString from 'lz-string';

export const encrypt = (data: object): string => {
    const jsonStr = JSON.stringify(data);
    const compressed = LZString.compressToBase64(jsonStr);
    return compressed.split('').reverse().join('');
};

export const decrypt = (cipherText: string): any => {
    const originalBase64 = cipherText.split('').reverse().join('');
    const decompressed = LZString.decompressFromBase64(originalBase64);
    return JSON.parse(decompressed);
};
```

### Step 3: 配置 Vite 自動化插件 (`vite.config.js`)
在打包階段攔截並「物理加密」語系檔。
```javascript
import LZString from 'lz-string';
import fs from 'fs';

function i18nProtectorPlugin() {
    return {
        name: 'vite-plugin-i18n-protector',
        transform(code, id) {
            if (id.includes('/lang/') && id.endsWith('.json')) {
                if (process.env.NODE_ENV === 'production') {
                    // 關鍵：直接從磁碟讀取原始 JSON，避開已變換的 code
                    const rawContent = fs.readFileSync(id, 'utf-8');
                    const data = JSON.parse(rawContent);
                    const encrypted = LZString.compressToBase64(JSON.stringify(data)).split('').reverse().join('');
                    
                    return {
                        code: `export default { _p: true, d: "${encrypted}" };`,
                        map: null
                    };
                }
            }
        }
    };
}
```

### Step 4: 修改 i18n 初始化 (`resources/js/app.js`)

利用 `laravel-vue-i18n` 的 `resolve` 選項攔截語系載入，並處理非同步解密。

> ⚠️ **極為重要**：此 `resolve` 函數的 **所有** 回傳值都 **必須** 是 `{ default: 翻譯物件 }` 格式！
> 絕對不可以回傳翻譯物件本身，也不可回傳空物件 `{}`。
> 違反此規則將導致語系在 F5 重新整理後被重設為英文。
> 詳細根因請參閱下方 [Q5](#q5-語系切換後按-f5-重新整理語系被重設為英文核心問題)。

```javascript
.use(i18nVue, {
    lang: localStorage.getItem('locale') || 'en',
    /**
     * ⚠️ 此 resolve 函數的回傳值「必須」是 { default: 翻譯物件 } 格式！
     *    絕對不可以回傳翻譯物件本身或空物件 {}。
     *    原因：laravel-vue-i18n 內部的 avoidExceptionOnPromise() 會執行
     *    (await promise).default 來提取翻譯內容。
     */
    resolve: async lang => {
        // 1. 忽略 php_ 開頭的請求（因為我們只使用 JSON）
        if (lang.startsWith('php_')) {
            return { default: {} }; // ⚠️ 必須是 { default: {} }，不可以只回傳 {}
        }

        const langs = import.meta.glob('../../lang/*.json');

        // 2. 嘗試載入對應的 JSON 檔案
        //    優先嘗試原始檔名，若找不到則嘗試將 - 轉為 _（解決 zh-TW vs zh_TW 的問題）
        let path = `../../lang/${lang}.json`;

        if (!langs[path]) {
            const alternativeLang = lang.replace(/-/g, '_');
            path = `../../lang/${alternativeLang}.json`;
        }

        if (!langs[path]) {
            console.warn(`[i18n] Language file not found: ${lang}`);
            return { default: {} }; // ⚠️ 必須是 { default: {} }，不可以只回傳 {}
        }

        console.log(`[i18n] Loading: ${lang}`);
        const module = await langs[path]();

        // 取得翻譯資料（Vite dynamic import 會將 JSON 放在 .default 中）
        const data = module.default || module;

        // 如果是加密過的內容（帶有 _p 標記），則進行解密
        if (data && data._p) {
            return { default: decrypt(data.d) }; // ⚠️ 必須是 { default: 解密結果 }
        }

        return { default: data }; // ⚠️ 必須是 { default: data }，不可以只回傳 data
    }
})
```

---

## 4. 遇到問題與解決方案

### Q1: Laravel 顯示 `auth.login` 而非正確字串
*   **原因**：Laravel 預設路徑下若存在 `lang/zh-TW/auth.php`，它會優先讀取該檔案，若找不到對應 Key 則直接回傳 Key 名稱，不會去翻 JSON。
*   **解決**：將 `/lang/zh-TW/` 下的 PHP 檔案更名（如加 `.bak`）或刪除，確保 JSON 是唯一來源。

### Q2: Vite 打包時報錯 `SyntaxError: Unexpected token 'e'...`
*   **原因**：Vite 的 `transform` 鉤子拿到的 `code` 已經被轉成了 `export default "..."` 字串，直接對其執行 `JSON.parse` 會失敗。
*   **解決**：在插件中使用 `fs.readFileSync(id)` 重新讀取原始檔案內容，確保獲得的是標準 JSON 格式。

### Q3: Vite Build 報錯 `Named export 'compressToBase64' not found`
*   **原因**：`lz-string` 是一個 CommonJS 模組，不完整支援 ESM 的 Named Export。
    *   **Node.js (Vite Config)**: 必須使用 `import LZString from 'lz-string'` (Default Import)。
    *   **Browser (TypeScript)**: 為了同時兼容開發與打包後的環境，建議使用兼容性引入寫法。
*   **解決**：
    1.  **vite.config.js**：維持使用 Default Import。
    2.  **i18nProtector.ts**：採用以下兼容寫法：
        ```typescript
        import * as LZStringModule from 'lz-string';
        // @ts-ignore
        const LZString = LZStringModule.default || LZStringModule;
        ```

### Q4: 解密後翻譯仍未顯示 (UI 不更新) — `{ default: ... }` 包裝規則

*   **原因**：`laravel-vue-i18n` 內部的 `avoidExceptionOnPromise()` 函數（位於 `node_modules/laravel-vue-i18n/dist/utils/avoid-exceptions.mjs`）在處理 resolve 回傳值時，會執行：
    ```javascript
    return (await promise).default || {};
    ```
    它會嘗試存取回傳物件的 `.default` 屬性。若回傳的是純翻譯物件（例如 `{ "Welcome": "歡迎" }`），因為沒有 `.default` 屬性，結果會是 `undefined`，最終變成空物件 `{}`。

*   **影響範圍**：此規則適用於 resolve 函數的 **所有回傳點**，不只是加密解密的情境。

*   **解決**：在所有回傳點，都必須用 `{ default: ... }` 包裝：
    ```javascript
    // ❌ 錯誤：回傳翻譯物件本身
    return data;
    return {};

    // ✅ 正確：用 { default: } 包裝
    return { default: data };
    return { default: {} };
    ```

*   **為什麼只有加密時正確？** 歷史上，加密分支 (`if (data._p)`) 一開始就回傳了 `{ default: decrypt(data.d) }`，所以加密環境從未出錯。但一般（非加密）的回傳分支之前寫的是 `return data`，**缺少 `{ default: }` 包裝**，導致開發環境下語系載入失敗。

---

### Q5: 語系切換後按 F5 重新整理，語系被重設為英文（核心問題）

> 🚨 **這是一個非常隱蔽的 Bug，曾經困擾開發團隊許久。請務必仔細閱讀。**

#### 問題現象
使用者透過 `LanguageSwitcher` 切換至「繁體中文」後，按 F5 重新整理頁面，語系被自動改回英文 (en)。Console 可觀察到：
```
[i18n] Loading: zh-TW   ← 正確嘗試載入
[i18n] Loading: en      ← 但最終 fallback 覆蓋了 zh-TW
```

#### 根本原因

此 Bug 的觸發需要 **三個條件同時滿足**，缺一不可：

| # | 條件 | 說明 |
|:--|:--|:--|
| 1 | `i18n()` Vite 插件啟用 | 它會強制設定 `VITE_LARAVEL_VUE_I18N_HAS_PHP = true`，導致 `hasPhpTranslations()` 始終回傳 `true` |
| 2 | `resolve` 是 `async` 函數 | 回傳值是 Promise，觸發 `resolveLangAsync` 的 `hasPhpTranslations` 分支 |
| 3 | `resolve` 回傳值缺少 `.default` 屬性 | 例如直接 `return data` 而非 `return { default: data }` |

#### 完整資料流追蹤

以下說明 `resolve` 回傳格式如何影響語系載入結果：

**❌ 錯誤寫法：`return data`（回傳翻譯物件本身）**
```
resolve('zh_TW') 回傳 { "Welcome": "歡迎", ... }
         ↓
套件呼叫 avoidExceptionOnPromise(resolvePromise)
         ↓
avoidExceptionOnPromise 內部執行:
  (await promise).default
  → { "Welcome": "歡迎" }.default
  → undefined（翻譯物件沒有 .default 屬性！）
  → undefined || {}
  → {}（空物件）
         ↓
resolveLangAsync 合併 PHP + JSON 翻譯:
  { default: { ...phpLang, ...jsonLang } }
  = { default: { ...{}, ...{} } }
  = { default: {} }  ← messages 是空的！
         ↓
applyLanguage('zh_TW', {})
  → Object.keys({}).length < 1  ← 翻譯為空，觸發 fallback
         ↓
嘗試 dash 版本 'zh-TW' → 同樣失敗（因為 resolve 回傳格式同樣錯誤）
         ↓
最終 fallback 到 'en' ❌ 語系被重設！
```

**✅ 正確寫法：`return { default: data }`（用 `{ default: }` 包裝）**
```
resolve('zh_TW') 回傳 { default: { "Welcome": "歡迎", ... } }
         ↓
avoidExceptionOnPromise 內部執行:
  (await promise).default
  → { "Welcome": "歡迎", ... }  ✅ 正確取得翻譯內容
         ↓
resolveLangAsync 合併:
  { default: { ...{}, ...{ "Welcome": "歡迎" } } }
  = { default: { "Welcome": "歡迎", ... } }  ✅ messages 有內容
         ↓
applyLanguage('zh_TW', { "Welcome": "歡迎" })
  → Object.keys(messages).length > 0  ✅ 正常設定語系
```

#### 涉及的套件原始碼位置

| 檔案路徑 (`node_modules/laravel-vue-i18n/dist/`) | 函數 | 關鍵行為 |
|:--|:--|:--|
| `vite.mjs` → `config()` | Vite Plugin | 強制設定 `VITE_LARAVEL_VUE_I18N_HAS_PHP = true` |
| `utils/has-php-translations.mjs` | `hasPhpTranslations()` | 檢查上述環境變數，決定是否走 PHP 翻譯合併分支 |
| `index.mjs` → `resolveLangAsync()` | 語系解析 | `hasPhpTranslations = true` 時，用 `avoidExceptionOnPromise` 處理回傳值 |
| `utils/avoid-exceptions.mjs` | `avoidExceptionOnPromise()` | **核心：`(await promise).default \|\| {}`** — 提取 `.default` 屬性 |
| `index.mjs` → `applyLanguage()` | 語系套用 | `messages` 為空時觸發 dash/underscore 轉換重試，最終 fallback 到 `en` |

#### 如何排查此類問題

如果未來遇到「語系在 F5 後被重設」的問題，按以下步驟排查：

1. **打開 Console**：觀察 `[i18n] Loading:` 的順序。如果先載入目標語系後又載入 `en`，代表 fallback 被觸發。
2. **在 resolve 函數中加入 debug log**：
   ```javascript
   const result = { default: data };
   console.log('[i18n] resolve result:', lang, result);
   return result;
   ```
3. **檢查所有 `return` 語句**：確認每一個都是 `{ default: ... }` 格式。
4. **檢查 `hasPhpTranslations`**：如果你使用了 `i18n()` Vite 插件，這個值永遠是 `true`，resolve 的回傳值**必須**有 `.default` 屬性。

#### 解決方案

確保 `resolve` 函數的 **每一個回傳點** 都回傳 `{ default: 翻譯物件 }` 格式：

```javascript
// ❌ 以下寫法都會導致語系被重設為英文
return {};                    // 空物件沒有 .default
return data;                  // 翻譯物件沒有 .default
return { "Welcome": "歡迎" }; // 同上

// ✅ 以下才是正確寫法
return { default: {} };                    // 空翻譯（php_ 前綴、檔案未找到時）
return { default: data };                  // 一般翻譯
return { default: decrypt(data.d) };       // 加密翻譯
```

#### 修復日期
*   **2026-02-13**：`resources/js/app.js` 中所有回傳點統一修正為 `{ default: ... }` 格式。

---

## 5. 測試與驗證

### 開發階段測試
1. 修改 `lang/zh_TW.json` 內容。
2. 確認瀏覽器是否有即時熱更新。

### 語系切換持久化測試（防止 F5 重設）
1. 透過 `LanguageSwitcher` 將語系切換為「繁體中文」。
2. 確認頁面顯示為中文。
3. **按 F5 重新整理頁面。**
4. 確認語系仍為「繁體中文」。
5. 打開 Console，應只出現 `[i18n] Loading: zh_TW`，**不應**出現 `[i18n] Loading: en`。

### 正式環境 (Build) 測試
1. **執行打包**：
   ```bash
   npm run build
   ```
2. **驗證數據隱匿**（搜尋不到明文）：
   ```bash
   grep -r "儀錶板" public/build/assets/
   ```
3. **驗證加密標記**（確保留有加密球）：
   ```bash
   grep -r "_p:true" public/build/assets/
   ```

## 6. 維護考量
*   **效能**：解壓縮大約耗費 10-50ms，對管理台系統幾乎無感。
*   **安全性**：此方法為「混淆」而非「強加密」，能阻擋大規模傾倒 (Dumping)，但無法阻擋熟知此邏輯的開發者手動還原單一 Key。對於翻譯資料保護已足夠。
*   **resolve 回傳格式**：修改 `app.js` 中的 i18n resolve 函數時，**務必確認所有回傳值都是 `{ default: ... }` 格式**。這是最容易被疏忽且影響最大的問題點。

