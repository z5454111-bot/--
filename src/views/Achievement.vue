<template>
  <div class="achievement-container">
    <!-- 顶部导航栏 -->
    <div class="header">
      <n-button circle type="primary" ghost @click="goBack" class="back-btn">
        <template #icon>
          <Icon icon="mdi:arrow-left" />
        </template>
      </n-button>
      <h1 class="title">成就系统</h1>
      <div class="stats">
        <div class="stat-item">
          <Icon icon="mdi:trophy" class="stat-icon" />
          <span>{{ unlockedCount }} / {{ totalCount }}</span>
        </div>
      </div>
    </div>

    <!-- 成就列表区域 -->
    <div class="content">
      <n-tabs type="segment" animated class="custom-tabs">
        <n-tab-pane name="easy" tab="简单">
          <div class="achievement-grid">
            <div 
              v-for="item in easyAchievements" 
              :key="item.id" 
              class="achievement-card"
              :class="{ 'unlocked': item.isUnlocked }"
            >
              <div class="icon-wrapper">
                <Icon :icon="item.icon" class="achievement-icon" />
                <div v-if="!item.isUnlocked" class="lock-overlay">
                  <Icon icon="mdi:lock" />
                </div>
              </div>
              <div class="info">
                <h3 class="name">{{ item.name }}</h3>
                <p class="desc">{{ item.description }}</p>
              </div>
              <div class="status">
                <n-tag :type="item.isUnlocked ? 'success' : 'default'" round>
                  {{ item.isUnlocked ? '已解锁' : '未解锁' }}
                </n-tag>
              </div>
            </div>
          </div>
        </n-tab-pane>
        
        <n-tab-pane name="normal" tab="普通">
          <div class="achievement-grid">
            <div 
              v-for="item in normalAchievements" 
              :key="item.id" 
              class="achievement-card"
              :class="{ 'unlocked': item.isUnlocked }"
            >
              <div class="icon-wrapper">
                <Icon :icon="item.icon" class="achievement-icon" />
                <div v-if="!item.isUnlocked" class="lock-overlay">
                  <Icon icon="mdi:lock" />
                </div>
              </div>
              <div class="info">
                <h3 class="name">{{ item.name }}</h3>
                <p class="desc">{{ item.description }}</p>
              </div>
              <div class="status">
                <n-tag :type="item.isUnlocked ? 'success' : 'default'" round>
                  {{ item.isUnlocked ? '已解锁' : '未解锁' }}
                </n-tag>
              </div>
            </div>
          </div>
        </n-tab-pane>

        <n-tab-pane name="hard" tab="困难">
          <div class="achievement-grid">
            <div 
              v-for="item in hardAchievements" 
              :key="item.id" 
              class="achievement-card"
              :class="{ 'unlocked': item.isUnlocked }"
            >
              <div class="icon-wrapper">
                <Icon :icon="item.icon" class="achievement-icon" />
                <div v-if="!item.isUnlocked" class="lock-overlay">
                  <Icon icon="mdi:lock" />
                </div>
              </div>
              <div class="info">
                <h3 class="name">{{ item.name }}</h3>
                <p class="desc">{{ item.description }}</p>
              </div>
              <div class="status">
                <n-tag :type="item.isUnlocked ? 'success' : 'default'" round>
                  {{ item.isUnlocked ? '已解锁' : '未解锁' }}
                </n-tag>
              </div>
            </div>
          </div>
        </n-tab-pane>
      </n-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NTabs, NTabPane, NTag } from 'naive-ui'
import { Icon } from '@iconify/vue'
import { useAchievementStore } from '../store/achievement'

const router = useRouter()
const achievementStore = useAchievementStore()

// 获取统计数据
const unlockedCount = computed(() => achievementStore.unlockedCount)
const totalCount = computed(() => achievementStore.totalCount)

// 按难度分类的成就列表
const easyAchievements = computed(() => achievementStore.getAchievementsByDifficulty('easy'))
const normalAchievements = computed(() => achievementStore.getAchievementsByDifficulty('normal'))
const hardAchievements = computed(() => achievementStore.getAchievementsByDifficulty('hard'))

// 返回主页
const goBack = () => {
  router.push('/')
}
</script>

<style scoped>
.achievement-container {
  width: 100vw;
  height: 100vh;
  background-color: #1a1a2e;
  color: #fff;
  display: flex;
  flex-direction: column;
  font-family: 'XiangSuZi', sans-serif;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 40px;
  background-color: rgba(0, 0, 0, 0.3);
  border-bottom: 2px solid #4a0e4e;
}

.back-btn {
  font-size: 24px;
}

.title {
  margin: 0;
  font-size: 2.5rem;
  color: #ffd700;
  text-shadow: 2px 2px 0 #000;
  letter-spacing: 4px;
}

.stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.5rem;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid #4a0e4e;
}

.stat-icon {
  color: #ffd700;
}

.content {
  flex: 1;
  padding: 20px 40px;
  overflow-y: auto;
}

.custom-tabs {
  --n-tab-text-color: #aaa;
  --n-tab-text-color-active: #fff;
  --n-tab-font-size: 1.2rem;
}

.achievement-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px 0;
}

.achievement-card {
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.05);
  border: 2px solid #333;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s ease;
  opacity: 0.7;
  filter: grayscale(0.8);
}

.achievement-card.unlocked {
  opacity: 1;
  filter: grayscale(0);
  border-color: #ffd700;
  background-color: rgba(255, 215, 0, 0.1);
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.2);
}

.icon-wrapper {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  flex-shrink: 0;
}

.achievement-icon {
  font-size: 36px;
  color: #fff;
}

.unlocked .achievement-icon {
  color: #ffd700;
}

.lock-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #aaa;
}

.info {
  flex: 1;
}

.name {
  margin: 0 0 8px 0;
  font-size: 1.2rem;
  color: #fff;
}

.unlocked .name {
  color: #ffd700;
}

.desc {
  margin: 0;
  font-size: 0.9rem;
  color: #aaa;
  line-height: 1.4;
}

.status {
  margin-left: 16px;
}
</style>