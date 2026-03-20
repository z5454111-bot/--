<template>
  <div class="game-container">
    <h2>Game Running...</h2>
    <n-button @click="goBack">Back to Menu</n-button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { NButton } from 'naive-ui'

const router = useRouter()

// 返回主菜单
const goBack = () => {
  router.push('/')
}
</script>

<style scoped>
.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #222;
  color: white;
}
</style>