<template>
  <div class="shop-container">
    <!-- 顶部信息栏 -->
    <div class="header">
      <h1 class="shop-title">商店</h1>
      <div class="gold-display">
        <Icon icon="mdi:gold" class="gold-icon" />
        <span class="gold-amount">{{ gameStore.gold }}</span>
      </div>
    </div>

    <!-- 标签页切换 -->
    <div class="tabs">
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'upgrades' }"
        @click="activeTab = 'upgrades'"
      >
        基础提升
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'weapons' }"
        @click="activeTab = 'weapons'"
      >
        枪械商店
      </button>
    </div>

    <!-- 升级项列表 (基础提升) -->
    <div v-if="activeTab === 'upgrades'" class="upgrades-grid">
      <div 
        v-for="(upgrade, key) in gameStore.shopUpgrades" 
        :key="key"
        class="upgrade-card"
        :class="{ 'max-level': upgrade.level >= upgrade.maxLevel }"
      >
        <div class="card-top">
          <div class="upgrade-icon-wrapper">
            <Icon :icon="upgrade.icon" class="upgrade-icon" />
          </div>
          <h3 class="upgrade-name">{{ upgrade.name }}</h3>
        </div>
        
        <div class="card-middle">
          <p class="upgrade-desc">{{ upgrade.description }}</p>
          <div class="upgrade-stats">
            <span class="level">等级: {{ upgrade.level }} / {{ upgrade.maxLevel }}</span>
            <span class="effect">当前加成: +{{ gameStore.getUpgradeValue(key) }}</span>
          </div>
        </div>

        <div class="card-bottom">
          <n-button 
            type="warning" 
            :disabled="upgrade.level >= upgrade.maxLevel || gameStore.gold < gameStore.getUpgradeCost(key)"
            @click="handleBuyUpgrade(key)"
            class="buy-btn"
          >
            <template v-if="upgrade.level >= upgrade.maxLevel">
              已满级
            </template>
            <template v-else>
              <Icon icon="mdi:gold" class="btn-gold-icon" />
              {{ gameStore.getUpgradeCost(key) }}
            </template>
          </n-button>
        </div>
      </div>
    </div>

    <!-- 枪械列表 -->
    <div v-if="activeTab === 'weapons'" class="upgrades-grid">
      <div 
        v-for="(weapon, key) in gameStore.weapons" 
        :key="key"
        class="upgrade-card weapon-card"
        :class="{ 
          'max-level': weapon.level >= weapon.maxLevel,
          'equipped': gameStore.equippedWeaponId === key
        }"
      >
        <div class="card-top">
          <div class="weapon-image-wrapper">
            <img v-if="weapon.image" :src="weapon.image" :alt="weapon.name" class="weapon-image" />
            <Icon v-else icon="mdi:pistol" class="weapon-placeholder-icon" />
          </div>
          <h3 class="upgrade-name">
            {{ weapon.name }}
            <span v-if="gameStore.equippedWeaponId === key" class="equipped-badge">已装备</span>
          </h3>
        </div>
        
        <div class="card-middle">
          <p class="upgrade-desc">{{ weapon.description }}</p>
          <div class="upgrade-stats weapon-stats">
            <span class="level">等级: {{ weapon.level }} / {{ weapon.maxLevel }}</span>
            <span class="effect">伤害: {{ gameStore.getWeaponDamage(key) }}</span>
            <span class="effect">射速: {{ gameStore.getWeaponFireRate(key).toFixed(1) }}/s</span>
          </div>
        </div>

        <div class="card-bottom weapon-actions">
          <n-button 
            type="warning" 
            :disabled="weapon.level >= weapon.maxLevel || gameStore.gold < gameStore.getWeaponUpgradeCost(key)"
            @click="handleBuyWeapon(key)"
            class="buy-btn"
          >
            <template v-if="weapon.level >= weapon.maxLevel">
              已满级
            </template>
            <template v-else>
              <Icon icon="mdi:gold" class="btn-gold-icon" />
              {{ gameStore.getWeaponUpgradeCost(key) }}
              <span class="btn-text-small">{{ weapon.isOwned ? '升级' : '购买' }}</span>
            </template>
          </n-button>

          <n-button 
            v-if="weapon.isOwned"
            type="success" 
            :disabled="gameStore.equippedWeaponId === key"
            @click="handleEquipWeapon(key)"
            class="equip-btn"
          >
            {{ gameStore.equippedWeaponId === key ? '使用中' : '装备' }}
          </n-button>
        </div>
      </div>
    </div>

    <!-- 底部返回按钮 -->
    <div class="footer">
      <n-button type="primary" size="large" @click="goBack" class="back-btn">
        返回主菜单
      </n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../store/game'
import { Icon } from '@iconify/vue'
import { NButton, useMessage } from 'naive-ui'

const router = useRouter()
const gameStore = useGameStore()
const message = useMessage()

// 当前激活的标签页
const activeTab = ref<'upgrades' | 'weapons'>('upgrades')

// 返回主菜单
const goBack = () => {
  router.push('/')
}

// 处理购买基础提升
const handleBuyUpgrade = (key: keyof typeof gameStore.shopUpgrades) => {
  const success = gameStore.buyUpgrade(key)
  if (success) {
    message.success('升级成功！')
    playBuySound()
  } else {
    message.error('金币不足！')
  }
}

// 处理购买/升级枪械
const handleBuyWeapon = (key: keyof typeof gameStore.weapons) => {
  const isNewPurchase = !gameStore.weapons[key].isOwned
  const success = gameStore.buyOrUpgradeWeapon(key)
  if (success) {
    message.success(isNewPurchase ? '购买成功！' : '升级成功！')
    playBuySound()
  } else {
    message.error('金币不足！')
  }
}

// 处理装备枪械
const handleEquipWeapon = (key: keyof typeof gameStore.weapons) => {
  const success = gameStore.equipWeapon(key)
  if (success) {
    message.success(`已装备 ${gameStore.weapons[key].name}`)
    playEquipSound()
  }
}

// 播放购买音效
const playBuySound = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const osc = audioCtx.createOscillator()
    const gainNode = audioCtx.createGain()

    osc.type = 'square'
    
    osc.frequency.setValueAtTime(400, audioCtx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.1)
    osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.2)

    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2)

    osc.connect(gainNode)
    gainNode.connect(audioCtx.destination)

    osc.start()
    osc.stop(audioCtx.currentTime + 0.2)
  } catch (e) {
    console.warn('音效播放失败', e)
  }
}

// 播放装备音效
const playEquipSound = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const osc = audioCtx.createOscillator()
    const gainNode = audioCtx.createGain()

    osc.type = 'sawtooth'
    
    osc.frequency.setValueAtTime(200, audioCtx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1)

    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1)

    osc.connect(gainNode)
    gainNode.connect(audioCtx.destination)

    osc.start()
    osc.stop(audioCtx.currentTime + 0.1)
  } catch (e) {
    console.warn('音效播放失败', e)
  }
}
</script>

<style scoped>
.shop-container {
  height: 100vh;
  background-color: #1a1a2e;
  color: #fff;
  padding: 2rem;
  box-sizing: border-box;
  font-family: 'XiangSuZi', sans-serif;
  display: flex;
  flex-direction: column;
  background-image: 
    linear-gradient(rgba(26, 26, 46, 0.9), rgba(26, 26, 46, 0.9)),
    url('../assets/images/start_background.jpg');
  background-size: cover;
  background-position: center;
  overflow: hidden;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 0 2rem;
  border-bottom: 4px solid #4a0e4e;
  padding-bottom: 1rem;
  flex-shrink: 0;
}

.shop-title {
  font-size: 4rem;
  margin: 0;
  color: #ffd700;
  text-shadow: 4px 4px 0px #4a0e4e;
  letter-spacing: 4px;
}

.gold-display {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 2.5rem;
  background: rgba(0, 0, 0, 0.5);
  padding: 10px 20px;
  border-radius: 12px;
  border: 2px solid #ffd700;
}

.gold-icon {
  color: #ffd700;
}

.gold-amount {
  color: #fff;
  text-shadow: 2px 2px 0px #000;
}

/* 标签页样式 */
.tabs {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-shrink: 0;
}

.tab-btn {
  font-family: 'XiangSuZi', sans-serif;
  font-size: 1.5rem;
  padding: 0.8rem 2rem;
  background: rgba(30, 30, 50, 0.8);
  border: 2px solid #4a0e4e;
  color: #aaa;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: none;
}

.tab-btn:hover {
  background: rgba(50, 50, 80, 0.8);
  color: #fff;
}

.tab-btn.active {
  background: #4a0e4e;
  color: #ffd700;
  border-color: #aa3bff;
  box-shadow: 0 -4px 10px rgba(170, 59, 255, 0.3);
}

/* 网格布局 */
.upgrades-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
  flex: 1;
  overflow-y: auto;
  align-content: start;
  min-height: 0;
}

/* 卡片样式 - 改为垂直布局 */
.upgrade-card {
  background: rgba(30, 30, 50, 0.8);
  border: 4px solid #4a0e4e;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
  height: 100%; /* 让卡片填满网格高度 */
}

.upgrade-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
  border-color: #aa3bff;
}

.upgrade-card.max-level {
  opacity: 0.7;
  border-color: #666;
}

.weapon-card.equipped {
  border-color: #4ade80;
  box-shadow: 0 0 15px rgba(74, 222, 128, 0.3);
}

/* 卡片内部区域划分 */
.card-top {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
}

.card-middle {
  flex: 1; /* 占据中间剩余空间 */
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1rem;
}

.card-bottom {
  display: flex;
  justify-content: center;
  margin-top: auto; /* 推到底部 */
}

.weapon-actions {
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

/* 图标和图片 */
.upgrade-icon-wrapper, .weapon-image-wrapper {
  width: 80px;
  height: 80px;
  background: #2a082e;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid #aa3bff;
}

.upgrade-icon {
  font-size: 3rem;
  color: #ffd700;
}

.weapon-image {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
}

.weapon-placeholder-icon {
  font-size: 3rem;
  color: #aaa;
}

/* 文字信息 */
.upgrade-name {
  font-size: 1.8rem;
  margin: 0;
  color: #fff;
  text-shadow: 2px 2px 0px #000;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  word-break: keep-all; /* 防止文字被异常截断 */
}

.equipped-badge {
  font-size: 0.9rem;
  background: #4ade80;
  color: #000;
  padding: 2px 8px;
  border-radius: 4px;
  text-shadow: none;
}

.upgrade-desc {
  font-size: 1rem;
  color: #aaa;
  margin: 0;
  line-height: 1.4;
  min-height: 3em; /* 保证描述区域有一定高度 */
}

.upgrade-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 1.1rem;
  color: #4ade80;
  background: rgba(0,0,0,0.3);
  padding: 10px;
  border-radius: 8px;
  width: 100%;
  box-sizing: border-box;
}

.weapon-stats {
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

/* 按钮 */
.buy-btn {
  font-family: 'XiangSuZi', sans-serif;
  font-size: 1.5rem;
  padding: 0.5rem 1.5rem;
  height: auto;
  border-width: 2px;
  width: 100%;
}

.btn-gold-icon {
  margin-right: 5px;
}

.btn-text-small {
  font-size: 0.8rem;
  margin-left: 5px;
  opacity: 0.8;
}

.equip-btn {
  font-family: 'XiangSuZi', sans-serif;
  width: 100%;
}

/* 底部 */
.footer {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  padding-top: 1rem;
  border-top: 4px solid #4a0e4e;
  flex-shrink: 0;
}

.back-btn {
  font-family: 'XiangSuZi', sans-serif;
  font-size: 1.8rem;
  padding: 1rem 3rem;
  height: auto;
  border: 2px solid #fff;
  box-shadow: 0 6px 0 rgba(0, 0, 0, 0.5);
}

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 0 rgba(0, 0, 0, 0.5);
}

.back-btn:active {
  transform: translateY(4px);
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.5);
}

/* 自定义滚动条 */
.upgrades-grid::-webkit-scrollbar {
  width: 12px;
}

.upgrades-grid::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
}

.upgrades-grid::-webkit-scrollbar-thumb {
  background: #4a0e4e;
  border-radius: 6px;
  border: 2px solid rgba(0, 0, 0, 0.3);
}

.upgrades-grid::-webkit-scrollbar-thumb:hover {
  background: #aa3bff;
}
</style>