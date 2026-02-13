import LZString from 'lz-string';

/**
 * 語系檔加密工具 (i18n Protector)
 * 
 * 邏輯：LZ-String 壓縮 -> Base64 強制格式化 -> 字串反轉 (混淆)
 */

export const encrypt = (data: object): string => {
    try {
        const jsonStr = JSON.stringify(data);
        const compressed = LZString.compressToBase64(jsonStr);
        return compressed.split('').reverse().join('');
    } catch (e) {
        console.error('[i18nProtector] Encrypt failed:', e);
        return "";
    }
};

/**
 * 語系檔解密工具
 * @param cipherText 加密後的字串
 */
export const decrypt = (cipherText: string): any => {
    try {
        if (!cipherText) return {};

        const originalBase64 = cipherText.split('').reverse().join('');
        const decompressed = LZString.decompressFromBase64(originalBase64);

        if (!decompressed) {
            console.warn('[i18nProtector] Decompression returned null/empty. Check if input is valid encrypted string.');
            return {};
        }

        return JSON.parse(decompressed);
    } catch (e) {
        console.error('[i18nProtector] Decryption failed:', e);
        // 回傳空物件會導致 i18n 顯示 Key，方便開發者意識到錯誤
        return {};
    }
};
