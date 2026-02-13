/**
 * ============================================================================
 * 應用程式進入點 (Application Entry Point)
 * ============================================================================
 *
 * ⚠️ 重要 Bug 修復記錄 — 語系切換後 F5 重新整理會被重設為英文 (2026-02-13)
 * ──────────────────────────────────────────────────────────────────────────
 *
 * 【問題現象】
 *   使用者透過 LanguageSwitcher 切換至「繁體中文」後，按 F5 重新整理頁面，
 *   語系會被自動改回英文 (en)。Console 可觀察到：
 *     [i18n] Loading: zh-TW   ← 正確嘗試載入
 *     [i18n] Loading: en      ← 但最終 fallback 覆蓋了 zh-TW
 *
 * 【根本原因】
 *   laravel-vue-i18n 的 Vite 插件 (i18n()) 會設定 hasPhpTranslations = true，
 *   導致 resolveLangAsync() 內部走 PHP 翻譯合併分支。
 *   該分支使用 avoidExceptionOnPromise() 處理 resolve 回傳值，
 *   而這個函數的核心邏輯是：
 *
 *     (await promise).default || {}
 *
 *   如果 resolve 回傳的是「翻譯物件本身」（例如 { "Welcome": "歡迎" }），
 *   由於翻譯物件沒有 .default 屬性 → 結果為 undefined → fallback 為 {} → 空物件。
 *   空物件觸發 applyLanguage 的 fallback 邏輯 → 語系被重設為 'en'。
 *
 * 【完整資料流追蹤】
 *
 *   ❌ 錯誤寫法：return data （回傳翻譯物件本身）
 *   ┌────────────────────────────────────────────────────────────────────┐
 *   │ resolve('zh_TW') 回傳 { "Welcome": "歡迎", ... }                 │
 *   │          ↓                                                        │
 *   │ avoidExceptionOnPromise 執行:                                     │
 *   │   (await promise).default → { "Welcome": "歡迎" }.default        │
 *   │                           → undefined                             │
 *   │                           → undefined || {} → {}                  │
 *   │          ↓                                                        │
 *   │ resolveLangAsync 回傳 { default: { ...{}, ...{} } }              │
 *   │                       = { default: {} }  ← messages 是空的！      │
 *   │          ↓                                                        │
 *   │ applyLanguage('zh_TW', {}) → Object.keys({}).length < 1          │
 *   │          ↓                                                        │
 *   │ 嘗試 'zh-TW'（dash 版本）→ 同樣失敗 → fallback 到 'en' ❌        │
 *   └────────────────────────────────────────────────────────────────────┘
 *
 *   ✅ 正確寫法：return { default: data }（用 { default: } 包裝）
 *   ┌────────────────────────────────────────────────────────────────────┐
 *   │ resolve('zh_TW') 回傳 { default: { "Welcome": "歡迎", ... } }    │
 *   │          ↓                                                        │
 *   │ avoidExceptionOnPromise 執行:                                     │
 *   │   (await promise).default → { "Welcome": "歡迎", ... } ✅         │
 *   │          ↓                                                        │
 *   │ resolveLangAsync 回傳 { default: { ...翻譯內容 } } ✅              │
 *   │          ↓                                                        │
 *   │ applyLanguage('zh_TW', { "Welcome": "歡迎" }) → 正常設定 ✅       │
 *   └────────────────────────────────────────────────────────────────────┘
 *
 * 【結論】
 *   此 resolve 函數的所有回傳值「必須」是 { default: 翻譯物件 } 格式。
 *   絕對不能回傳翻譯物件本身，也不能回傳空物件 {}。
 *
 *   相關原始碼位置（node_modules/laravel-vue-i18n/dist/）：
 *   - index.mjs → resolveLangAsync()：hasPhpTranslations 分支的處理流程
 *   - utils/avoid-exceptions.mjs → avoidExceptionOnPromise()：(await promise).default
 *   - vite.mjs → config()：強制設定 VITE_LARAVEL_VUE_I18N_HAS_PHP = true
 *
 * ============================================================================
 */

import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/vue3';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createApp, h } from 'vue';
import { ZiggyVue } from '../../vendor/tightenco/ziggy';
import { i18nVue } from 'laravel-vue-i18n';
import { decrypt } from './Utils/i18nProtector';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.vue`,
            import.meta.glob('./Pages/**/*.vue'),
        ),
    setup({ el, App, props, plugin }) {
        return createApp({ render: () => h(App, props) })
            .use(plugin)
            .use(ZiggyVue)
            .use(i18nVue, {
                lang: localStorage.getItem('locale') || 'en',
                /**
                 * ⚠️ 此 resolve 函數的回傳值「必須」是 { default: 翻譯物件 } 格式！
                 *    絕對不可以回傳翻譯物件本身或空物件 {}。
                 *    詳細原因請參閱檔案頂部的 Bug 修復記錄。
                 */
                resolve: async lang => {
                    // 1. 忽略 php_ 開頭的請求（因為我們只使用 JSON 且已經刪除了 php_ 檔案）
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
            .mount(el);
    },
    progress: {
        color: '#4B5563',
    },
});
