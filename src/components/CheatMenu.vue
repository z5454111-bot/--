<template>
  <div v-if="visible" class="cheat-menu-overlay" @click.self="close">
    <div class="cheat-menu-container">
      <div class="cheat-header">
        <h2 class="cheat-title">
          <Icon icon="mdi:bug" class="title-icon" />
          开发者控制台
        </h2>
        <n-button circle ghost type="error" @click="close">
          <template #icon><Icon icon="mdi:close" /></template>
        </n-button>
      </div>

      <div class="cheat-content">
        <n-tabs type="segment" animated>
          <!-- 全局修改 -->
          <n-tab-pane name="global" tab="全局修改">
            <div class="cheat-section">
              <h3 class="section-title">资源管理</h3>
              <div class="cheat-item">
                <span class="label">金币数量</span>
                <div class="action-group">
                  <n-input-number v-model:value="goldAmount" :min="0" :step="1000" />
                  <n-button type="warning" @click="addGold">添加金币</n-button>
                </div>
              </div>

              <h3 class="section-title">武器解锁</h3>
              <div class="cheat-grid">
                <n-button 
                  v-for="(weapon, id) in gameStore.weapons" 
                  :key="id"
                  :type="weapon.isOwned ? 'success' : 'default'"
                  @click="unlockWeapon(id as string)"
                >
                  {{ weapon.name }} ({{ weapon.isOwned ? '已拥有' : '未解锁' }})
                </n-button>
              </div>

              <h3 class="section-title">成就管理</h3>
              <div class="cheat-grid">
                <n-button 
                  v-for="ach in achievementStore.achievementList" 
                  :key="ach.id"
                  :type="ach.isUnlocked ? 'success' : 'default'"
                  @click="unlockAchievement(ach.id)"
                >
                  {{ ach.name }} ({{ ach.isUnlocked ? '已解锁' : '未解锁' }})
                </n-button>
              </div>
            </div>
          </n-tab-pane>

          <!-- 局内修改 -->
          <n-tab-pane name="ingame" tab="局内修改" :disabled="!isInGame">
            <div v-if="!isInGame" class="not-in-game-msg">
              请在游戏进行中（非暂停/结束状态）使用此功能
            </div>
            <div v-else class="cheat-section">
              <h3 class="section-title">角色状态</h3>
              <div class="cheat-item">
                <span class="label">无敌模式</span>
                <n-switch v-model:value="isInvincible" @update:value="toggleInvincible" />
              </div>
              <div class="cheat-item">
                <span class="label">秒杀模式 (伤害9999)</span>
                <n-switch v-model:value="isInstaKill" @update:value="toggleInstaKill" />
              </div>
              
              <h3 class="section-title">经验与等级</h3>
              <div class="cheat-item">
                <span class="label">增加经验</span>
                <div class="action-group">
                  <n-input-number v-model:value="expAmount" :min="0" :step="1000" />
                  <n-button type="info" @click="addExp">添加经验</n-button>
                </div>
              </div>

              <h3 class="section-title">世界控制</h3>
              <div class="cheat-grid">
                <n-button type="error" @click="clearMonsters">
                  <template #icon><Icon icon="mdi:skull-crossbones" /></template>
                  清屏 (消灭所有怪物)
                </n-button>
                <n-button type="warning" @click="spawnBoss">
                  <template #icon><Icon icon="mdi:cow" /></template>
                  召唤牛头人
                </n-button>
              </div>
            </div>
          </n-tab-pane>
        </n-tabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { NButton, NTabs, NTabPane, NInputNumber, NSwitch, useMessage } from 'naive-ui'
import { Icon } from '@iconify/vue'
import { useGameStore } from '../store/game'
import { useAchievementStore } from '../store/achievement'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

const route = useRoute()
const gameStore = useGameStore()
const achievementStore = useAchievementStore()
const message = useMessage()

// 判断是否在游戏内
const isInGame = computed(() => route.path === '/game')

// 表单状态
const goldAmount = ref(10000)
const expAmount = ref(5000)
const isInvincible = ref(false)
const isInstaKill = ref(false)

const close = () => {
  emit('update:visible', false)
}

// --- 全局修改功能 ---

const addGold = () => {
  gameStore.addGold(goldAmount.value)
  message.success(`已添加 ${goldAmount.value} 金币`)
}

const unlockWeapon = (id: string) => {
  const weapon = gameStore.weapons[id as keyof typeof gameStore.weapons]
  if (!weapon.isOwned) {
    weapon.isOwned = true
    message.success(`已解锁武器: ${weapon.name}`)
  } else {
    message.info(`武器 ${weapon.name} 已拥有`)
  }
}

const unlockAchievement = (id: string) => {
  const ach = achievementStore.achievements[id as keyof typeof achievementStore.achievements]
  if (!ach.isUnlocked) {
    ach.isUnlocked = true
    message.success(`已解锁成就: ${ach.name}`)
  } else {
    message.info(`成就 ${ach.name} 已解锁`)
  }
}

// --- 局内修改功能 (通过事件总线与 GameEngine 通信) ---

const toggleInvincible = (val: boolean) => {
  window.dispatchEvent(new CustomEvent('cheat-toggle-invincible', { detail: val }))
  message.success(`无敌模式已${val ? '开启' : '关闭'}`)
}

const toggleInstaKill = (val: boolean) => {
  window.dispatchEvent(new CustomEvent('cheat-toggle-instakill', { detail: val }))
  message.success(`秒杀模式已${val ? '开启' : '关闭'}`)
}

const addExp = () => {
  window.dispatchEvent(new CustomEvent('cheat-add-exp', { detail: expAmount.value }))
  message.success(`已添加 ${expAmount.value} 经验`)
}

const clearMonsters = () => {
  window.dispatchEvent(new CustomEvent('cheat-clear-monsters'))
  message.success('已清空屏幕上的怪物')
}

const spawnBoss = () => {
  window.dispatchEvent(new CustomEvent('cheat-spawn-boss'))
  message.success('已召唤牛头人')
}

// 监听路由变化，如果离开游戏页面，重置局内状态
onMounted(() => {
  // 可以在这里做一些初始化
})
</script>

<style scoped>
.cheat-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 9999; /* 确保在最顶层 */
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'XiangSuZi', sans-serif;
}

.cheat-menu-container {
  width: 600px;
  max-height: 80vh;
  background-color: #1a1a2e;
  border: 4px solid #e74c3c;
  border-radius: 12px;
  box-shadow: 0 0 30px rgba(231, 76, 60, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.cheat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: rgba(231, 76, 60, 0.2);
  border-bottom: 2px solid #e74c3c;
}

.cheat-title {
  margin: 0;
  color: #e74c3c;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.8rem;
  text-shadow: 2px 2px 0 #000;
}

.title-icon {
  font-size: 2.2rem;
}

.cheat-content {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

/* 覆盖 Naive UI Tabs 样式以适应像素风 */
:deep(.n-tabs-nav) {
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 5px;
}

:deep(.n-tabs-tab) {
  font-family: 'XiangSuZi', sans-serif;
  font-size: 1.2rem;
  color: #aaa;
}

:deep(.n-tabs-tab--active) {
  color: #e74c3c !important;
  font-weight: bold;
}

.cheat-section {
  margin-bottom: 30px;
}

.section-title {
  color: #ffd700;
  border-bottom: 1px dashed #555;
  padding-bottom: 8px;
  margin-bottom: 15px;
  font-size: 1.4rem;
}

.cheat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.05);
  padding: 10px 15px;
  border-radius: 8px;
  margin-bottom: 10px;
}

.label {
  color: #fff;
  font-size: 1.2rem;
}

.action-group {
  display: flex;
  gap: 10px;
  align-items: center;
}

.cheat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
}

.not-in-game-msg {
  text-align: center;
  color: #aaa;
  padding: 40px 0;
  font-size: 1.2rem;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}
</style>