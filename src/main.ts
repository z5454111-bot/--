import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import pinia from './store'

// 创建 Vue 应用实例
const app = createApp(App)

// 注册路由
app.use(router)

// 注册状态管理
app.use(pinia)

// 挂载应用
app.mount('#app')
