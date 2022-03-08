import 'core-js/es/map';
import 'core-js/es/set';
import { createApp } from 'vue';
import App from './App/index.vue';
import '@/assets/scss/vue-multiselect.scss';
import '@/assets/scss/animations.scss';
import bridge from '@vkontakte/vk-bridge';

bridge.send('VKWebAppInit', {});
createApp(App).mount('#app');
