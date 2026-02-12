# Laravel Session 與 Redis 儲存說明

本文件記錄了專案中 Laravel Session 的儲存機制、序列化格式以及相關配置。

## 1. 儲存媒介 (Storage Driver)

目前的專案配置使用 **Redis** 作為 Session 的後端儲存媒介。

*   **設定檔位置**: `.env`
*   **關鍵參數**:
    ```env
    SESSION_DRIVER=redis
    ```

這表示當您在 PHP 程式碼中使用 `session()` 輔助函式或 `Session` Facade 時，資料會被同步到 Docker 容器中的 Redis 服務。

## 2. 資料格式 (Serialization)

Laravel 在寫入 Session 到 Redis 時，預設使用 **PHP 序列化 (PHP Serialization)** 格式，而不是 JSON。

### 為什麼使用 PHP 序列化？
*   **型別保留**: 能完整保留 PHP 的資料型別（例如字串、整數、布林值）甚至是物件實例。
*   **效能**: 對於 PHP 原生處理來說，`serialize()` 與 `unserialize()` 的速度非常快。

### 格式範例
在 Redis 中直接查看 `get` 出來的內容會類似：
```text
a:3:{s:6:"_token";s:40:"...";s:6:"locale";s:2:"zh_TW";...}
```
*   `a:3` 代表 3 個項目的數組 (Array)。
*   `s:6:"locale"` 代表鍵名為長度 6 的字串 "locale"。

## 3. 安全與加密 (Encryption)

目前的 Session 加密設定如下：

*   **參數**: `SESSION_ENCRYPT`
*   **設定值**: `false` (目前未加密)

如果未來改為 `true`，Redis 中的資料將會變成加密後的二進制/亂碼字串，無法直接閱讀。

## 4. 如何查看 Session 資料

### 方法 A：使用 Redis CLI (透過 Sail)
1.  進入 Redis 終端機：
    ```bash
    ./vendor/bin/sail redis
    ```
2.  搜尋 Key（Session Key 通常帶有應用程式前綴）：
    ```bash
    keys *session*
    ```
3.  查看內容：
    ```bash
    get <KEY_NAME>
    ```

### 方法 B：使用 Tinker (人類可讀格式)
如果想直接看到解析後的陣列格式，建議使用 Tinker：
```bash
./vendor/bin/sail tinker
>>> session()->all();
```

### 方法 C：使用 Redis Insight
訪問 `http://localhost:5540` 透過圖形介面查看。
