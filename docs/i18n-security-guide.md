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
```javascript
.use(i18nVue, {
    resolve: async lang => {
        const langs = import.meta.glob('../../lang/*.json');
        const message = await langs[`../../lang/${lang}.json`]();

        // 取得模組內容
        const data = message.default || message;
        
        // 檢查是否有加密標記 (_p: true)
        if (data && data._p) {
            // 關鍵修正：必須回傳 { default: ... } 結構，模擬 ES Module 行為
            // 否則 i18n 套件讀取 .default 時會失敗
            return { default: decrypt(data.d) };
        }
        
        return data;
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

### Q4: 解密後翻譯仍未顯示 (UI 不更新)
*   **原因**：`laravel-vue-i18n` 使用動態導入 (`import()`) 載入語系檔，預期回傳的是一個 **ES Module** 物件 (包含 `default` 屬性)。若直接回傳解密後的純物件 (Plain Object)，套件嘗試存取 `.default` 時會得到 `undefined`，導致載入失敗。
*   **解決**：在解密後，需將資料手動包裝成模組結構：
    ```javascript
    return { default: decrypt(data.d) };
    ```


---

## 5. 測試與驗證

### 開發階段測試
1. 修改 `lang/zh-TW.json` 內容。
2. 確認瀏覽器是否有即時熱更新。

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
