<template>
  <div class="game-wrapper">
    <!-- 游戏结束遮罩 -->
    <div v-if="isGameOver" class="game-over-overlay">
      <div class="game-over-content">
        <h1 class="game-over-title">游戏结束</h1>
        <div class="stats-container">
          <div class="stat-item">
            <span class="stat-label">存活时间</span>
            <span class="stat-value">{{ Math.floor(gameTime / 1000) }} 秒</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">击杀怪物</span>
            <span class="stat-value">{{ engine.stats.monstersKilled }} 只</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">造成伤害</span>
            <span class="stat-value">{{ engine.stats.damageDealt }}</span>
          </div>
          <div class="stat-item gold-stat">
            <span class="stat-label">获得金币</span>
            <span class="stat-value">+{{ player.gold }} 💰</span>
          </div>
        </div>
        <n-button type="primary" size="large" class="menu-btn" @click="goBack">返回主菜单</n-button>
      </div>
    </div>

    <!-- 暂停菜单遮罩 -->
    <div v-if="isPaused && !isGameOver && !isLevelUp" class="pause-overlay">
      <div class="pause-menu">
        <h2 class="pause-title">游戏暂停</h2>
        <div class="pause-buttons">
          <n-button type="primary" size="large" class="menu-btn" @click="engine.togglePause()">继续游戏</n-button>
          <n-button type="info" size="large" class="menu-btn" @click="openSettings">设置</n-button>
          <n-button type="error" size="large" class="menu-btn" @click="engine.forceGameOver()">结束本局</n-button>
        </div>
      </div>
    </div>

    <!-- 升级选择遮罩 -->
    <div v-if="isLevelUp" class="level-up-overlay">
      <h2>升级啦！</h2>
      <p>请选择一项强化：</p>
      <div class="upgrade-options">
        <div
          v-for="option in currentUpgradeOptions"
          :key="option.id"
          class="upgrade-card"
          @click="selectUpgrade(option)"
        >
          <Icon :icon="option.icon" class="upgrade-icon" />
          <h3>{{ option.name }}</h3>
          <p>{{ option.description }}</p>
        </div>
      </div>
      <div class="reroll-container" v-if="rerollsLeft > 0">
        <n-button type="warning" size="large" @click="rerollUpgrades">
          <template #icon>
            <Icon icon="mdi:dice-multiple" />
          </template>
          刷新选项 (剩余: {{ rerollsLeft }})
        </n-button>
      </div>
    </div>

    <!-- 视口容器，固定大小，超出部分隐藏 -->
    <div class="viewport">
      <!-- 游戏世界容器，包含地图和所有实体，通过 transform 移动来实现镜头跟随 -->
      <div
        class="game-world"
        :style="{ transform: `translate(${-camera.x}px, ${-camera.y}px)` }"
      >
        <!-- 掉落物列表 (经验和金币) -->
        <div
          v-for="drop in drops"
          :key="drop.id"
          class="drop-item"
          :class="drop.type"
          :style="{
            left: `${drop.x}px`,
            top: `${drop.y}px`
          }"
        ></div>

        <!-- 死亡粒子特效列表 -->
        <div
          v-for="particle in deathParticles"
          :key="particle.id"
          class="death-particle"
          :style="{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            opacity: particle.opacity,
            transform: `translate(-50%, -50%) scale(${particle.scale})`
          }"
        ></div>

        <!-- 伤害数字列表 -->
        <div
          v-for="dmg in damageNumbers"
          :key="dmg.id"
          class="damage-number"
          :class="[
            dmg.critTier === 1 ? 'is-crit-yellow' : '',
            dmg.critTier === 2 ? 'is-crit-red' : '',
            (dmg.critTier || 0) >= 3 ? 'is-crit-purple' : ''
          ]"
          :style="{
            left: `${dmg.x}px`,
            top: `${dmg.y}px`,
            opacity: dmg.opacity,
            transform: `translate(-50%, -50%) translateY(${dmg.offsetY}px) scale(${dmg.critTier ? 1 + dmg.critTier * 0.3 : 1})`
          }"
        >
          -{{ dmg.value }}{{ '!'.repeat(dmg.critTier || 0) }}
        </div>

        <!-- 子弹实体列表 -->
        <div
          v-for="bullet in bullets"
          :key="bullet.id"
          class="bullet"
          :style="{
            left: `${bullet.x}px`,
            top: `${bullet.y}px`,
            width: `${bullet.width || 10}px`,
            height: `${bullet.height || 4}px`,
            backgroundColor: bullet.color || '#f1c40f',
            boxShadow: `0 0 5px ${bullet.color || '#f39c12'}`,
            transform: `translate(-50%, -50%) rotate(${bullet.angle}rad)`
          }"
        ></div>

        <!-- 怪物实体列表 -->
        <div
          v-for="monster in monsters"
          :key="monster.id"
          class="monster"
          :class="{ 'is-hit': monster.isHit }"
          :style="{
            left: `${monster.x}px`,
            top: `${monster.y}px`,
            width: `${monster.radius * 2}px`,
            height: `${monster.radius * 2}px`,
            transform: `translate(-50%, -50%) scaleX(${monster.direction === 'left' ? -1 : 1})`
          }"
        >
          <!-- 怪物血条 -->
          <div class="monster-hp-bar-container" :style="{ transform: `scaleX(${monster.direction === 'left' ? -1 : 1})` }">
            <div class="monster-hp-bg">
              <div
                class="monster-hp-fill"
                :style="{
                  width: `${Math.max(0, (monster.hp / monster.maxHp) * 100)}%`,
                  backgroundColor: monster.hp / monster.maxHp > 0.5 ? '#2ecc71' : (monster.hp / monster.maxHp > 0.2 ? '#f1c40f' : '#e74c3c')
                }"
              ></div>
            </div>
          </div>
          <img
            :src="monster.image"
            :alt="monster.type"
            class="monster-img"
            :class="{ 'is-moving': Math.abs(monster.vx) > 0.1 || Math.abs(monster.vy) > 0.1 }"
          />
        </div>

        <!-- 玩家实体 -->
        <div
          class="player"
          :class="{ 'is-hit': player.isInvincible }"
          :style="{
            left: `${player.x}px`,
            top: `${player.y}px`,
            transform: `translate(-50%, -50%)`
          }"
        >
          <!-- 玩家图片 (独立翻转，添加移动时的弹跳动画) -->
          <!-- 注意：将动画和翻转分离到不同的层级，避免 transform 冲突 -->
          <div
            class="player-img-wrapper"
            :class="{ 'is-moving': Math.abs(player.vx) > 0.1 || Math.abs(player.vy) > 0.1 }"
          >
            <img
              src="../assets/images/gblin.gif"
              alt="player"
              class="player-img"
              :style="{ transform: `scaleX(${player.direction === 'left' ? -1 : 1})` }"
            />
          </div>
          
          <!-- 武器 (环绕玩家，独立旋转) -->
          <div
            class="weapon-container"
            :style="{
              transform: `rotate(${player.weaponAngle}rad)`
            }"
          >
            <img
              :src="currentWeaponImage"
              alt="weapon"
              class="weapon-img"
              :style="{
                transform: `translateX(40px) scaleY(${Math.abs(player.weaponAngle) > Math.PI / 2 ? -1 : 1})`
              }"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- UI 层 -->
    <div class="ui-layer">
      <!-- 血条 -->
      <div class="status-bar health-bar-container">
        <div class="bar-label">HP</div>
        <div class="bar-bg">
          <div class="bar-fill health-fill" :style="{ width: `${(player.hp / player.maxHp) * 100}%` }"></div>
        </div>
        <div class="bar-text">{{ Math.ceil(player.hp) }} / {{ player.maxHp }}</div>
      </div>
      
      <!-- 经验条 -->
      <div class="status-bar exp-bar-container">
        <div class="bar-label">EXP</div>
        <div class="bar-bg">
          <div class="bar-fill exp-fill" :style="{ width: `${(player.exp / player.maxExp) * 100}%` }"></div>
        </div>
        <div class="bar-text">Lv.{{ player.level }}</div>
      </div>
    </div>

    <!-- 右上角金币显示 -->
    <div class="gold-display">
      <span class="gold-icon">💰</span>
      <span class="gold-text">{{ player.gold }}</span>
    </div>

  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, computed, h } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, useMessage, useNotification } from 'naive-ui'
import { useEventListener } from '@vueuse/core'
import { Icon } from '@iconify/vue'
import { GameEngine } from '../game/engine'
import { GAME_WIDTH, GAME_HEIGHT } from '../game/config'
import { useGameStore } from '../store/game'
import type { UpgradeOption } from '../game/upgrades'
import defaultWeaponImg from '../assets/images/guns/regularpisto.png'
import shotgunImg from '../assets/images/guns/xiandan.png'
import smgImg from '../assets/images/guns/chongfeng.png'
import sniperImg from '../assets/images/guns/juji.png'

const router = useRouter()
const store = useGameStore()
const message = useMessage()
const notification = useNotification()
const engine = new GameEngine()

// 武器图片映射表
const weaponImages: Record<string, string> = {
  pistol: defaultWeaponImg,
  shotgun: shotgunImg,
  smg: smgImg,
  sniper: sniperImg,
  rocket: sniperImg // 暂时复用狙击枪图片
}

// 获取当前装备武器的图片
const currentWeaponImage = computed(() => {
  const weaponId = store.equippedWeaponId as string
  const weapon = store.weapons[weaponId as keyof typeof store.weapons]
  return weaponImages[weaponId] || weapon?.image || defaultWeaponImg
})

// 暴露给模板的状态
const {
  isGameOver,
  isLevelUp,
  isPaused,
  gameTime,
  camera,
  player,
  bullets,
  monsters,
  drops,
  damageNumbers,
  deathParticles,
  currentUpgradeOptions,
  rerollsLeft
} = engine

// 返回主菜单
const goBack = () => {
  router.push('/')
}

// 打开设置 (占位)
const openSettings = () => {
  message.info('设置功能开发中...')
}

// 升级选择逻辑
const selectUpgrade = (option: UpgradeOption) => {
  engine.selectUpgrade(option)
}

// 刷新升级选项
const rerollUpgrades = () => {
  engine.rerollUpgrades()
}

// 监听键盘按下事件
useEventListener(window, 'keydown', (e: KeyboardEvent) => {
  const key = e.key.toLowerCase()
  
  // ESC 键切换暂停
  if (key === 'escape') {
    engine.togglePause()
    return
  }

  if (engine.keys.hasOwnProperty(key)) {
    engine.keys[key as keyof typeof engine.keys] = true
  }
})

// 监听键盘抬起事件
useEventListener(window, 'keyup', (e: KeyboardEvent) => {
  const key = e.key.toLowerCase()
  if (engine.keys.hasOwnProperty(key)) {
    engine.keys[key as keyof typeof engine.keys] = false
  }
})

// --- 作弊功能事件监听 ---
const handleCheatInvincible = (e: Event) => {
  engine.setCheatInvincible((e as CustomEvent).detail)
}

const handleCheatInstaKill = (e: Event) => {
  engine.setCheatInstaKill((e as CustomEvent).detail)
}

const handleCheatAddExp = (e: Event) => {
  engine.addCheatExp((e as CustomEvent).detail)
}

const handleCheatClearMonsters = () => {
  engine.clearAllMonsters()
}

const handleCheatSpawnBoss = () => {
  engine.spawnBoss()
}

// 监听成就解锁事件
const handleAchievementUnlocked = (e: Event) => {
  const customEvent = e as CustomEvent
  const achievement = customEvent.detail
  
  notification.success({
    title: '🏆 获得成就！',
    content: achievement.name,
    meta: achievement.description,
    duration: 5000,
    keepAliveOnHover: true
  })
}

// 组件挂载时启动游戏循环
onMounted(() => {
  engine.start()
  window.addEventListener('achievement-unlocked', handleAchievementUnlocked)
  window.addEventListener('cheat-toggle-invincible', handleCheatInvincible)
  window.addEventListener('cheat-toggle-instakill', handleCheatInstaKill)
  window.addEventListener('cheat-add-exp', handleCheatAddExp)
  window.addEventListener('cheat-clear-monsters', handleCheatClearMonsters)
  window.addEventListener('cheat-spawn-boss', handleCheatSpawnBoss)
})

// 组件卸载时清理游戏循环
onUnmounted(() => {
  engine.stop()
  window.removeEventListener('achievement-unlocked', handleAchievementUnlocked)
  window.removeEventListener('cheat-toggle-invincible', handleCheatInvincible)
  window.removeEventListener('cheat-toggle-instakill', handleCheatInstaKill)
  window.removeEventListener('cheat-add-exp', handleCheatAddExp)
  window.removeEventListener('cheat-clear-monsters', handleCheatClearMonsters)
  window.removeEventListener('cheat-spawn-boss', handleCheatSpawnBoss)
})
</script>

<style scoped>
.game-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #111;
  position: relative;
  font-family: 'XiangSuZi', sans-serif; /* 全局应用像素字体 */
}

.viewport {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

.game-world {
  /* 使用 v-bind 绑定动态计算的宽高 */
  width: v-bind('GAME_WIDTH + "px"');
  height: v-bind('GAME_HEIGHT + "px"');
  /* 使用指定的地图作为背景 */
  background-image: url('../assets/images/first_map.jpg');
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  position: absolute;
  left: 0;
  top: 0;
  /* 硬件加速，使移动更平滑 */
  will-change: transform;
}

.player {
  position: absolute;
  width: 60px; /* 对应 radius * 2，放大 */
  height: 60px;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
}

.monster {
  position: absolute;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 移动时的上下弹跳动画 */
@keyframes bobbing {
  0% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0); }
}

.is-moving {
  animation: bobbing 0.3s infinite ease-in-out;
}

.player-img-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.player-img, .monster-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  /* 默认图片是朝右的 */
}

/* 怪物血条样式 */
.monster-hp-bar-container {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  display: flex;
  justify-content: center;
  z-index: 12;
  /* 抵消父元素的翻转，确保血条始终从左到右减少 */
  transform-origin: center;
}

.monster-hp-bg {
  width: 100%;
  height: 4px;
  background-color: rgba(0, 0, 0, 0.8);
  border: 1px solid #000;
  border-radius: 2px;
  overflow: hidden;
}

.monster-hp-fill {
  height: 100%;
  transition: width 0.1s ease-out, background-color 0.2s;
}

.weapon-container {
  position: absolute;
  width: 0;
  height: 0;
  z-index: 11;
  /* 容器本身不显示，只用于旋转定位 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.weapon-img {
  position: absolute;
  width: 45px; /* 枪械放大 */
  height: auto;
  /* 枪械图片中心对齐 */
  transform-origin: center center;
  /* 默认枪口朝右 */
}

.bullet {
  position: absolute;
  border-radius: 2px;
  z-index: 15;
}

/* 受伤/无敌闪烁动画 */
@keyframes flashRed {
  0% { filter: brightness(1) sepia(0) hue-rotate(0) saturate(1); }
  50% { filter: brightness(0.8) sepia(1) hue-rotate(-50deg) saturate(5) contrast(1.2); }
  100% { filter: brightness(1) sepia(0) hue-rotate(0) saturate(1); }
}

.is-hit img {
  animation: flashRed 0.2s infinite;
}

/* UI 层样式 */
.ui-layer {
  position: absolute;
  top: 20px;
  left: 150px; /* 避开返回按钮 */
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.status-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(0, 0, 0, 0.5);
  padding: 5px 10px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.bar-label {
  color: white;
  font-weight: bold;
  width: 30px;
  text-shadow: 1px 1px 2px black;
}

.bar-bg {
  width: 200px;
  height: 15px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #333;
}

.bar-fill {
  height: 100%;
  transition: width 0.2s ease-out;
}

.health-fill {
  background: linear-gradient(90deg, #ff4757, #ff6b81);
}

.exp-fill {
  background: linear-gradient(90deg, #1e90ff, #70a1ff);
}

.bar-text {
  color: white;
  font-size: 12px;
  width: 60px;
  text-align: right;
  text-shadow: 1px 1px 2px black;
}

.gold-display {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.6);
  padding: 8px 15px;
  border-radius: 20px;
  border: 2px solid #ffd700;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

.gold-icon {
  font-size: 20px;
}

.gold-text {
  color: #ffd700;
  font-weight: bold;
  font-size: 20px;
  text-shadow: 1px 1px 2px black;
}

/* 游戏结束和暂停菜单通用样式 */
.game-over-overlay, .pause-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 5, 20, 0.85);
  backdrop-filter: blur(5px);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
}

.game-over-content, .pause-menu {
  background: rgba(30, 30, 50, 0.9);
  border: 4px solid #4a0e4e;
  border-radius: 16px;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  box-shadow: 0 0 30px rgba(170, 59, 255, 0.3);
  animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes popIn {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.game-over-title {
  font-size: 4rem;
  color: #ff4757;
  margin: 0;
  text-shadow: 4px 4px 0px #4a0e4e;
  letter-spacing: 4px;
}

.pause-title {
  font-size: 3.5rem;
  color: #ffd700;
  margin: 0;
  text-shadow: 4px 4px 0px #4a0e4e;
  letter-spacing: 4px;
}

/* 统计数据样式 */
.stats-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  min-width: 300px;
  background: rgba(0, 0, 0, 0.4);
  padding: 1.5rem;
  border-radius: 8px;
  border: 2px solid #aa3bff;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.5rem;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.2);
  padding-bottom: 0.5rem;
}

.stat-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.stat-label {
  color: #aaa;
}

.stat-value {
  color: #fff;
  font-weight: bold;
}

.gold-stat .stat-value {
  color: #ffd700;
  text-shadow: 1px 1px 2px #000;
}

/* 菜单按钮样式 */
.pause-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  min-width: 250px;
}

.menu-btn {
  font-family: 'XiangSuZi', sans-serif;
  font-size: 1.5rem;
  height: 50px;
  width: 100%;
  border-width: 2px;
}

.level-up-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.85);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
}

.level-up-overlay h2 {
  font-size: 40px;
  color: #f1c40f;
  margin-bottom: 10px;
}

.upgrade-options {
  display: flex;
  gap: 20px;
  margin-top: 30px;
}

.upgrade-card {
  background: #2c3e50;
  border: 2px solid #f39c12;
  border-radius: 10px;
  padding: 20px;
  width: 220px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s, background 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.upgrade-card:hover {
  transform: scale(1.05);
  background: #34495e;
  box-shadow: 0 0 15px rgba(243, 156, 18, 0.5);
}

.upgrade-icon {
  font-size: 48px;
  color: #f1c40f;
}

.upgrade-card h3 {
  color: #e74c3c;
  margin: 0;
  font-size: 1.2rem;
}

.upgrade-card p {
  margin: 0;
  font-size: 0.9rem;
  color: #bdc3c7;
}

.reroll-container {
  margin-top: 30px;
}

.drop-item {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  z-index: 5;
  box-shadow: 0 0 5px currentColor;
}

.drop-item.exp {
  background-color: #3498db;
  color: #3498db;
}

.drop-item.gold {
  background-color: #f1c40f;
  color: #f1c40f;
}

.damage-number {
  position: absolute;
  color: white;
  font-weight: bold;
  font-size: 16px;
  text-shadow: 1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000;
  z-index: 20;
  pointer-events: none;
  transition: transform 0.1s ease-out;
}

.damage-number.is-crit-yellow {
  color: #f1c40f; /* 黄色 */
  text-shadow: 2px 2px 0 #e67e22, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000;
  z-index: 21;
}

.damage-number.is-crit-red {
  color: #e74c3c; /* 红色 */
  text-shadow: 2px 2px 0 #c0392b, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000;
  z-index: 22;
}

.damage-number.is-crit-purple {
  color: #9b59b6; /* 紫色 */
  text-shadow: 2px 2px 0 #8e44ad, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000;
  z-index: 23;
}

.death-particle {
  position: absolute;
  width: 6px;
  height: 6px;
  background-color: #ff4757;
  border-radius: 50%;
  z-index: 4;
  pointer-events: none;
  box-shadow: 0 0 8px #ff6b81, 0 0 12px #ff4757;
  /* 添加一点发光效果让粒子更华丽 */
}

</style>