<script setup>
import { onMounted, ref } from 'vue';
import { loadLanguageAsync, getActiveLanguage } from 'laravel-vue-i18n';

const activeLang = ref('en');

const changeLanguage = (lang) => {
    loadLanguageAsync(lang);
    localStorage.setItem('locale', lang);
    activeLang.value = lang;
};

onMounted(() => {
    const savedLocale = localStorage.getItem('locale');
    if (savedLocale) {
        loadLanguageAsync(savedLocale);
        activeLang.value = savedLocale;
    } else {
        activeLang.value = getActiveLanguage();
    }
});
</script>

<template>
    <div class="flex space-x-4">
        <button 
            @click="changeLanguage('en')" 
            class="text-sm transition duration-150 ease-in-out"
            :class="activeLang === 'en' ? 'font-bold text-gray-900' : 'text-gray-500 hover:text-gray-900'"
        >
            English
        </button>
        <span class="text-gray-300">|</span>
        <button 
            @click="changeLanguage('zh_TW')" 
            class="text-sm transition duration-150 ease-in-out"
            :class="activeLang === 'zh_TW' ? 'font-bold text-gray-900' : 'text-gray-500 hover:text-gray-900'"
        >
            繁體中文
        </button>
    </div>
</template>
