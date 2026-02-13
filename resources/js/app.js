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
                resolve: async lang => {
                    const langs = import.meta.glob('../../lang/*.json');
                    const message = await langs[`../../lang/${lang}.json`]();

                    // 如果是加密過的內容 (帶有 _p 標記)，則進行解密
                    const data = message.default || message;

                    if (data && data._p) {
                        return { default: decrypt(data.d) };
                    }
                    return data;
                }
            })
            .mount(el);
    },
    progress: {
        color: '#4B5563',
    },
});
