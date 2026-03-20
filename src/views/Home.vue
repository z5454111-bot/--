<template>
  <div class="home-container">
    <!-- 动态粒子背景层 -->
    <div class="particles-container">
      <div v-for="i in 50" :key="i" class="particle" :style="getParticleStyle(i)"></div>
    </div>

    <!-- 游戏标题 -->
    <h1 class="game-title">
      <span class="title-word">Vampire</span>
      <span class="title-word">Survivor</span>
      <span class="title-word">Clone</span>
    </h1>
    
    <!-- 菜单按钮组 -->
    <div class="menu-buttons">
      <n-button 
        type="primary" 
        size="large" 
        class="menu-btn start-btn"
        @click="startGame"
      >
        开始游戏
      </n-button>
      
      <n-button 
        type="warning" 
        size="large" 
        class="menu-btn"
        @click="openShop"
      >
        商店
      </n-button>
      
      <n-button 
        type="info" 
        size="large" 
        class="menu-btn"
        @click="openCredits"
      >
        致谢名单
      </n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { NButton, useMessage } from 'naive-ui'

const router = useRouter()
const message = useMessage()

// 点击开始游戏，跳转到游戏页面
const startGame = () => {
  router.push('/game')
}

// 打开商店
const openShop = () => {
  message.warning('商店功能正在装修中...')
}

// 打开致谢名单
const openCredits = () => {
  message.info('制作人：Kilo Code\n感谢游玩！')
}

// 生成随机粒子样式
const getParticleStyle = (index: number) => {
  const size = Math.random() * 5 + 2; // 2px - 7px
  const left = Math.random() * 100; // 0% - 100%
  const duration = Math.random() * 10 + 5; // 5s - 15s
  const delay = Math.random() * 5; // 0s - 5s
  const opacity = Math.random() * 0.5 + 0.2; // 0.2 - 0.7

  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`,
    opacity: opacity,
    // 随机颜色：偏红/紫/金，符合吸血鬼幸存者风格
    backgroundColor: `hsl(${Math.random() * 60 + 300}, 80%, 60%)`,
    boxShadow: `0 0 ${size * 2}px hsl(${Math.random() * 60 + 300}, 80%, 60%)`
  }
}
</script>

<style scoped>
.home-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
  /* 设置背景图片，覆盖整个屏幕 */
  background-image: url('../assets/images/start_background.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  /* 添加一层半透明遮罩，让文字更清晰，同时增加一点暗黑氛围 */
  box-shadow: inset 0 0 0 2000px rgba(15, 5, 20, 0.6);
  overflow: hidden;
}

/* 动态粒子背景 */
.particles-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.particle {
  position: absolute;
  bottom: -10px;
  border-radius: 50%;
  animation: floatUp linear infinite;
}

@keyframes floatUp {
  0% {
    transform: translateY(0) scale(1);
    opacity: 0;
  }
  10% {
    opacity: var(--opacity, 0.5);
  }
  90% {
    opacity: var(--opacity, 0.5);
  }
  100% {
    transform: translateY(-100vh) scale(0.5);
    opacity: 0;
  }
}

/* 游戏标题动画 */
.game-title {
  position: relative;
  z-index: 2;
  font-size: 5rem;
  color: #fff;
  text-shadow: 4px 4px 0px #4a0e4e, 
               -2px -2px 0px #000, 
               2px -2px 0px #000, 
               -2px 2px 0px #000,
               0 0 20px rgba(170, 59, 255, 0.8);
  margin-bottom: 4rem;
  font-family: 'XiangSuZi', sans-serif;
  letter-spacing: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  animation: titlePulse 3s ease-in-out infinite alternate;
}

.title-word {
  display: block;
}

.title-word:nth-child(1) { color: #ff4d4d; }
.title-word:nth-child(2) { color: #e0e0e0; font-size: 4rem; }
.title-word:nth-child(3) { color: #ffd700; font-size: 3rem; }

@keyframes titlePulse {
  0% { transform: scale(1); text-shadow: 4px 4px 0px #4a0e4e, 0 0 20px rgba(170, 59, 255, 0.5); }
  100% { transform: scale(1.05); text-shadow: 6px 6px 0px #2a082e, 0 0 40px rgba(170, 59, 255, 1); }
}

/* 菜单按钮 */
.menu-buttons {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 240px;
}

.menu-btn {
  font-family: 'XiangSuZi', sans-serif;
  font-size: 1.5rem;
  height: 55px;
  border-radius: 8px;
  /* 增加按钮的阴影效果，使其更有立体感 */
  box-shadow: 0 6px 0 rgba(0, 0, 0, 0.5), 0 10px 15px rgba(0, 0, 0, 0.4);
  transition: all 0.1s ease;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.menu-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 0 rgba(0, 0, 0, 0.5), 0 15px 20px rgba(0, 0, 0, 0.5);
  filter: brightness(1.1);
}

.menu-btn:active {
  transform: translateY(4px);
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.5), 0 5px 10px rgba(0, 0, 0, 0.4);
}

.start-btn {
  font-size: 1.8rem;
  height: 65px;
  background: linear-gradient(135deg, #aa3bff, #6b21a8);
  border-color: #d8b4fe;
  animation: btnGlow 2s infinite alternate;
}

@keyframes btnGlow {
  0% { box-shadow: 0 6px 0 rgba(0, 0, 0, 0.5), 0 0 10px rgba(170, 59, 255, 0.5); }
  100% { box-shadow: 0 6px 0 rgba(0, 0, 0, 0.5), 0 0 25px rgba(170, 59, 255, 1); }
}
</style>