# 設計風格指南 (Design Guidelines)

本文件記錄 Laravel Sail 教學專案的 UI/UX 設計規範，確保整個應用程式保持一致的視覺風格和使用者體驗。

## 目錄

- [設計理念](#設計理念)
- [配色方案](#配色方案)
- [字體系統](#字體系統)
- [間距系統](#間距系統)
- [組件設計](#組件設計)
- [頁面布局](#頁面布局)
- [響應式設計](#響應式設計)
- [動畫與過渡](#動畫與過渡)

---

## 設計理念

### 核心原則

1. **簡潔至上 (Simplicity First)**
   - 移除不必要的視覺元素
   - 專注於內容和功能
   - 避免過度設計

2. **一致性 (Consistency)**
   - 統一的配色方案
   - 一致的間距和字體大小
   - 可預測的互動模式

3. **易用性 (Usability)**
   - 清晰的視覺層次
   - 明確的操作反饋
   - 直觀的導航結構

4. **教學友善 (Learning-Friendly)**
   - 適合作為教學範例
   - 程式碼易於理解和修改
   - 註解清晰完整

---

## 配色方案

### 主色調 (Primary Colors)

```css
/* Indigo - 主要品牌色 */
--color-indigo-50:  #eef2ff;
--color-indigo-100: #e0e7ff;
--color-indigo-600: #4f46e5;  /* 主要使用 */
--color-indigo-700: #4338ca;  /* Hover 狀態 */
```

**使用場景：**
- 主要按鈕 (Primary Button)
- 重要連結
- 品牌元素（Logo、標題強調）
- 選中狀態

### 輔助色 (Secondary Colors)

```css
/* Purple - 輔助色 */
--color-purple-100: #f3e8ff;
--color-purple-600: #9333ea;

/* Blue - 資訊色 */
--color-blue-100: #dbeafe;
--color-blue-600: #2563eb;
```

**使用場景：**
- 資訊卡片的圖示背景
- 次要強調元素
- 狀態指示

### 中性色 (Neutral Colors)

```css
/* Gray - 文字和背景 */
--color-gray-50:  #f9fafb;  /* 淺背景 */
--color-gray-100: #f3f4f6;  /* 卡片背景 */
--color-gray-500: #6b7280;  /* 次要文字 */
--color-gray-600: #4b5563;  /* 說明文字 */
--color-gray-700: #374151;  /* 一般文字 */
--color-gray-900: #111827;  /* 標題文字 */
--color-white:    #ffffff;  /* 卡片、按鈕背景 */
```

### 語意色 (Semantic Colors)

```css
/* Success - 成功狀態 */
--color-green-600: #16a34a;

/* Warning - 警告狀態 */
--color-yellow-500: #eab308;

/* Error - 錯誤狀態 */
--color-red-600: #dc2626;
```

---

## 字體系統

### 字體家族

```css
/* 系統字體堆疊 */
font-family: 
  ui-sans-serif, 
  system-ui, 
  -apple-system, 
  BlinkMacSystemFont, 
  "Segoe UI", 
  Roboto, 
  "Helvetica Neue", 
  Arial, 
  "Noto Sans", 
  sans-serif;
```

### 字體大小階層

| 用途 | Class | 大小 | 行高 |
|------|-------|------|------|
| 大標題 | `text-6xl` | 3.75rem (60px) | 1 |
| 主標題 | `text-5xl` | 3rem (48px) | 1 |
| 次標題 | `text-4xl` | 2.25rem (36px) | 2.5rem |
| 小標題 | `text-2xl` | 1.5rem (24px) | 2rem |
| 段落標題 | `text-xl` | 1.25rem (20px) | 1.75rem |
| 正文大 | `text-lg` | 1.125rem (18px) | 1.75rem |
| 正文 | `text-base` | 1rem (16px) | 1.5rem |
| 正文小 | `text-sm` | 0.875rem (14px) | 1.25rem |
| 輔助文字 | `text-xs` | 0.75rem (12px) | 1rem |

### 字重 (Font Weight)

| 用途 | Class | 數值 |
|------|-------|------|
| 一般文字 | `font-normal` | 400 |
| 中等強調 | `font-medium` | 500 |
| 半粗體 | `font-semibold` | 600 |
| 粗體標題 | `font-bold` | 700 |

---

## 間距系統

### 基礎間距單位

使用 Tailwind CSS 的間距系統（基於 `0.25rem = 4px`）：

| Class | 數值 | 用途 |
|-------|------|------|
| `p-2` / `m-2` | 0.5rem (8px) | 極小間距 |
| `p-4` / `m-4` | 1rem (16px) | 小間距 |
| `p-6` / `m-6` | 1.5rem (24px) | 中等間距 |
| `p-8` / `m-8` | 2rem (32px) | 大間距 |
| `p-16` / `m-16` | 4rem (64px) | 區塊間距 |

### 常用間距組合

```css
/* 卡片內邊距 */
.card-padding {
  padding: 1.5rem; /* p-6 */
}

/* 區塊間距 */
.section-spacing {
  margin-top: 4rem;    /* mt-16 */
  margin-bottom: 4rem; /* mb-16 */
}

/* 元素間距 */
.element-gap {
  gap: 1rem; /* gap-4 */
}
```

---

## 組件設計

### 按鈕 (Buttons)

#### 主要按鈕 (Primary Button)

```vue
<button class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
  按鈕文字
</button>
```

**特性：**
- 背景色：`bg-indigo-600`
- Hover：`hover:bg-indigo-700`
- 圓角：`rounded-md` (0.375rem)
- 內邊距：`px-4 py-2`
- 文字：白色、中等字重、小字體
- Focus 環：2px indigo-500

#### 次要按鈕 (Secondary Button)

```vue
<button class="rounded-md px-4 py-2 text-sm font-medium text-gray-700 transition hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
  按鈕文字
</button>
```

**特性：**
- 無背景色
- 文字色：`text-gray-700`
- Hover：`hover:text-gray-900`

### 卡片 (Cards)

#### 標準卡片

```vue
<div class="rounded-lg bg-white p-6 shadow-md transition hover:shadow-lg">
  <!-- 卡片內容 -->
</div>
```

**特性：**
- 背景：白色
- 圓角：`rounded-lg` (0.5rem)
- 內邊距：`p-6` (1.5rem)
- 陰影：`shadow-md`
- Hover：`hover:shadow-lg`
- 過渡動畫：`transition`

#### 資訊卡片（帶圖示）

```vue
<div class="rounded-lg bg-white p-6 shadow-md transition hover:shadow-lg">
  <div class="flex items-center">
    <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
      <!-- SVG 圖示 -->
    </div>
    <div class="ml-4">
      <h3 class="text-sm font-medium text-gray-500">標題</h3>
      <p class="text-lg font-semibold text-gray-900">內容</p>
    </div>
  </div>
</div>
```

### 連結卡片

```vue
<a href="#" class="group rounded-lg bg-white p-6 shadow-md transition hover:shadow-lg">
  <h3 class="font-semibold text-gray-900 group-hover:text-indigo-600">標題</h3>
  <p class="mt-2 text-sm text-gray-600">描述文字</p>
</a>
```

**特性：**
- 使用 `group` 類別實現群組 hover 效果
- 標題在 hover 時變色：`group-hover:text-indigo-600`

### 表單元素

#### 輸入框

```vue
<input 
  type="text" 
  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
/>
```

#### 標籤

```vue
<label class="block text-sm font-medium text-gray-700">
  標籤文字
</label>
```

---

## 頁面布局

### Header 結構

```vue
<header class="bg-white shadow-sm">
  <div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between">
      <!-- Logo -->
      <div class="flex items-center">
        <!-- Logo SVG + 文字 -->
      </div>
      
      <!-- 右側導航 -->
      <div class="flex items-center gap-4">
        <!-- 語言切換器 + 按鈕 -->
      </div>
    </div>
  </div>
</header>
```

### Main Content 結構

```vue
<main class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
  <!-- Hero Section -->
  <div class="text-center">
    <!-- 標題 + 描述 -->
  </div>
  
  <!-- Content Sections -->
  <div class="mt-16">
    <!-- 內容區塊 -->
  </div>
</main>
```

### Footer 結構

```vue
<footer class="mt-16 border-t border-gray-200 bg-white">
  <div class="mx-auto max-w-7xl px-4 py-6 text-center sm:px-6 lg:px-8">
    <p class="text-sm text-gray-500">
      <!-- 版權資訊 -->
    </p>
  </div>
</footer>
```

### 最大寬度容器

```css
/* 標準內容寬度 */
.max-w-7xl {
  max-width: 80rem; /* 1280px */
}

/* 文字內容寬度 */
.max-w-2xl {
  max-width: 42rem; /* 672px */
}
```

---

## 響應式設計

### 斷點 (Breakpoints)

| 斷點 | 最小寬度 | 用途 |
|------|---------|------|
| `sm:` | 640px | 小型平板 |
| `md:` | 768px | 平板 |
| `lg:` | 1024px | 桌面 |
| `xl:` | 1280px | 大桌面 |
| `2xl:` | 1536px | 超大桌面 |

### 網格系統

```vue
<!-- 響應式網格 -->
<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
  <!-- 手機：1列，平板：2列，桌面：3列 -->
</div>

<div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
  <!-- 手機：1列，平板：2列，桌面：4列 -->
</div>
```

### 間距調整

```vue
<!-- 響應式內邊距 -->
<div class="px-4 sm:px-6 lg:px-8">
  <!-- 手機：16px，平板：24px，桌面：32px -->
</div>

<!-- 響應式外邊距 -->
<div class="py-8 sm:py-12 lg:py-16">
  <!-- 手機：32px，平板：48px，桌面：64px -->
</div>
```

---

## 動畫與過渡

### 標準過渡

```css
/* 通用過渡 */
.transition {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
```

### Hover 效果

```vue
<!-- 陰影過渡 -->
<div class="shadow-md transition hover:shadow-lg">
  <!-- 內容 -->
</div>

<!-- 顏色過渡 -->
<button class="bg-indigo-600 transition hover:bg-indigo-700">
  <!-- 按鈕 -->
</button>

<!-- 文字顏色過渡 -->
<a class="text-gray-700 transition hover:text-gray-900">
  <!-- 連結 -->
</a>
```

### Focus 狀態

```vue
<!-- 標準 Focus Ring -->
<button class="focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
  <!-- 按鈕 -->
</button>
```

**特性：**
- 移除預設外框：`focus:outline-none`
- 2px 寬度的環：`focus:ring-2`
- Indigo 顏色：`focus:ring-indigo-500`
- 2px 偏移：`focus:ring-offset-2`

---

## 圖示系統

### SVG 圖示規範

```vue
<!-- 標準圖示大小 -->
<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <!-- 路徑 -->
</svg>

<!-- 小圖示 -->
<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <!-- 路徑 -->
</svg>

<!-- 大圖示 -->
<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <!-- 路徑 -->
</svg>
```

### 圖示背景容器

```vue
<div class="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
  <svg class="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <!-- 圖示 -->
  </svg>
</div>
```

**尺寸變化：**
- 小：`h-8 w-8` 容器 + `h-4 w-4` 圖示
- 中：`h-12 w-12` 容器 + `h-6 w-6` 圖示
- 大：`h-16 w-16` 容器 + `h-8 w-8` 圖示

---

## 實作範例

### Welcome 頁面設計

Welcome 頁面是本專案設計風格的最佳範例，包含：

1. **簡潔的 Header**
   - 白色背景 + 淡陰影
   - Logo + 專案名稱
   - 語言切換器 + 認證按鈕

2. **Hero 區塊**
   - 漸層背景（`bg-gradient-to-br from-gray-50 to-gray-100`）
   - 大標題 + 副標題
   - 居中對齊

3. **資訊卡片**
   - 3 列網格（響應式）
   - 圖示 + 標題 + 內容
   - Hover 陰影效果

4. **快速連結**
   - 4 列網格（響應式）
   - 群組 hover 效果
   - 外部連結

5. **Footer**
   - 簡單的版本資訊
   - 灰色文字

### 設計決策記錄

| 元素 | 決策 | 理由 |
|------|------|------|
| 主色調 | Indigo | 專業、現代、不過於鮮豔 |
| 背景 | 漸層灰 | 增加視覺層次，不會太單調 |
| 卡片陰影 | md → lg | 提供明確的 hover 反饋 |
| 圓角 | md/lg | 現代化設計，不過於圓潤 |
| 字體 | 系統字體 | 載入快速，跨平台一致 |
| 間距 | 4 的倍數 | 符合 8px 網格系統 |

---

## 開發建議

### 1. 使用 Tailwind CSS 工具類別

優先使用 Tailwind 的工具類別，避免自定義 CSS：

```vue
<!-- ✅ 推薦 -->
<div class="rounded-lg bg-white p-6 shadow-md">

<!-- ❌ 不推薦 -->
<div class="custom-card">
<style>
.custom-card {
  border-radius: 0.5rem;
  background-color: white;
  padding: 1.5rem;
  box-shadow: ...;
}
</style>
```

### 2. 保持一致性

在新增組件時，參考現有設計：
- 使用相同的配色
- 使用相同的間距
- 使用相同的圓角和陰影

### 3. 響應式優先

始終考慮不同螢幕尺寸：
- 手機優先設計
- 使用響應式工具類別
- 測試各種螢幕尺寸

### 4. 可訪問性

確保設計符合無障礙標準：
- 足夠的顏色對比度
- 清晰的 Focus 狀態
- 語意化的 HTML

---

## 更新記錄

| 日期 | 版本 | 變更內容 |
|------|------|---------|
| 2026-02-12 | 1.0.0 | 初始版本，記錄 Welcome 頁面設計規範 |

---

## 參考資源

- [Tailwind CSS 官方文檔](https://tailwindcss.com/docs)
- [Tailwind UI 組件](https://tailwindui.com/)
- [Heroicons 圖示庫](https://heroicons.com/)
- [Material Design 色彩系統](https://material.io/design/color)
