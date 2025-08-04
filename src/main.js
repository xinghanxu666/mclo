import { createApp } from 'vue'
import App from './App.vue'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 使用Element Plus
createApp(App)
  .use(ElementPlus)
  .mount('#app')
