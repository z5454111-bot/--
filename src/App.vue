<template>
  <!-- Naive UI 的全局配置组件，可以包裹整个应用以提供主题等配置 -->
  <n-config-provider>
    <n-message-provider>
      <!-- 路由视图，用于渲染匹配到的组件 -->
      <router-view />
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { NConfigProvider, NMessageProvider } from 'naive-ui'
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
