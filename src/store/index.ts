import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// 创建 pinia 实例
const pinia = createPinia()

// 使用持久化插件，实现自动存档到 localStorage
pinia.use(piniaPluginPersistedstate)

export default pinia