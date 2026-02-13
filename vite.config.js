import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue';
import i18n from 'laravel-vue-i18n/vite';
import LZString from 'lz-string';
import fs from 'fs';

/**
 * i18n 安全保護插件
 * 在生產環境 (Production) 中攔截 /lang/*.json 並加密其內容
 */
function i18nProtectorPlugin() {
    return {
        name: 'vite-plugin-i18n-protector',
        transform(code, id) {
            // 只處理 /lang/ 目錄下的 .json 檔案
            if (id.includes('/lang/') && id.endsWith('.json')) {
                // 僅在生產環境執行加密
                if (process.env.NODE_ENV === 'production') {
                    try {
                        // 重新讀取原始磁碟檔案，以獲取標準 JSON 內容
                        const rawContent = fs.readFileSync(id, 'utf-8');
                        const data = JSON.parse(rawContent);

                        // 加密邏輯：壓縮 -> 反轉 (Reverse)
                        const encrypted = LZString.compressToBase64(JSON.stringify(data))
                            .split('')
                            .reverse()
                            .join('');

                        // 回傳一個帶有標記的物件
                        return {
                            code: `export default { _p: true, d: "${encrypted}" };`,
                            map: null
                        };
                    } catch (e) {
                        console.error(`[i18n-protector] Failed to encrypt ${id}:`, e);
                    }
                }
            }
        }
    };
}

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.js',
            refresh: true,
        }),
        vue({
            template: {
                transformAssetUrls: {
                    base: null,
                    includeAbsolute: false,
                },
            },
        }),
        i18n(),
        i18nProtectorPlugin(),
    ],
});
