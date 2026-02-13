<script setup>
import { onMounted, ref } from 'vue';
import { loadLanguageAsync, getActiveLanguage } from 'laravel-vue-i18n';
import Dropdown from '@/Components/Dropdown.vue';

const activeLang = ref('en');

const changeLanguage = async (lang) => {
    try {
        await loadLanguageAsync(lang);
        localStorage.setItem('locale', lang);
        activeLang.value = lang;
        // 強制重新整理以確保所有組件（包含 Inertia Head 和 Props）都更新到正確語系
        window.location.reload();
    } catch (e) {
        console.error(`[LanguageSwitcher] Change language failed:`, e);
    }
};

onMounted(() => {
    // 語系已在 app.js 的 i18nVue 初始化時載入，這裡只需讀取當前狀態即可
    const savedLocale = localStorage.getItem('locale');
    activeLang.value = savedLocale || getActiveLanguage();
});
</script>

<template>
    <Dropdown align="right" width="48">
        <template #trigger>
            <span class="inline-flex rounded-md">
                <button
                    type="button"
                    class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none transition ease-in-out duration-150"
                >
                    {{ activeLang === 'en' ? 'English' : '繁體中文' }}
                    <svg
                        class="ml-2 -mr-0.5 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fill-rule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clip-rule="evenodd"
                        />
                    </svg>
                </button>
            </span>
        </template>

        <template #content>
            <button
                @click="changeLanguage('en')"
                class="block w-full px-4 py-2 text-start text-sm leading-5 text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition duration-150 ease-in-out"
            >
                English
            </button>
            <button
                @click="changeLanguage('zh_TW')"
                class="block w-full px-4 py-2 text-start text-sm leading-5 text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition duration-150 ease-in-out"
            >
                繁體中文
            </button>
        </template>
    </Dropdown>
</template>
