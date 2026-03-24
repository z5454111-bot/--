<template>
  <!-- Naive UI 的全局配置组件，可以包裹整个应用以提供主题等配置 -->
  <n-config-provider>
    <n-message-provider>
      <n-notification-provider placement="top-right">
        <!-- 路由视图，用于渲染匹配到的组件 -->
        <router-view />
        <!-- 全局作弊菜单 -->
        <CheatMenu v-model:visible="isCheatMenuVisible" />
      </n-notification-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { NConfigProvider, NMessageProvider, NNotificationProvider } from 'naive-ui'
import CheatMenu from './components/CheatMenu.vue'

const isCheatMenuVisible = ref(false)

// 监听波浪键 (~) 唤出作弊菜单
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === '`' || e.key === '~') {
    e.preventDefault() // 阻止默认行为
    isCheatMenuVisible.value = !isCheatMenuVisible.value
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style>
/* 全局样式重置 */
html, body, #app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden; /* 游戏通常不需要滚动条 */
}
</style>
