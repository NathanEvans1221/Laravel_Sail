# Changelog

所有本專案的顯著變更都將記錄於此檔案。

格式基於 [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)，
並且本專案遵循 [Semantic Versioning](https://semver.org/spec/v2.0.0.html)。

## [Unreleased]

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
