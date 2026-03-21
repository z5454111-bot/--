<template>
  <div class="home-container">
    <!-- 微弱的下雪粒子效果 -->
    <div class="snow-container">
      <div v-for="i in 100" :key="'snow-'+i" class="snow-particle" :style="getSnowStyle(i)"></div>
    </div>

    <!-- 雾气效果 -->
    <div class="fog-container">
      <div class="fog-layer fog-layer-1"></div>
      <div class="fog-layer fog-layer-2"></div>
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
        @mouseenter="playHoverSound"
      >
        开始游戏
      </n-button>
      
      <n-button
        type="warning"
        size="large"
        class="menu-btn"
        @click="openShop"
        @mouseenter="playHoverSound"
      >
        商店
      </n-button>
      
      <n-button
        type="info"
        size="large"
        class="menu-btn"
        @click="openCredits"
        @mouseenter="playHoverSound"
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
  router.push('/shop')
}

// 打开致谢名单
const openCredits = () => {
  message.info('制作人：Kilo Code\n感谢游玩！')
}

// 播放像素风格的悬停音效 (使用 Web Audio API 动态生成)
let audioCtx: AudioContext | null = null;

const playHoverSound = async () => {
  try {
    // 尝试在鼠标悬停时直接初始化和恢复音频上下文
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }

    // 如果浏览器严格限制，resume 后状态仍为 suspended，则放弃播放，避免报错
    if (audioCtx.state === 'suspended') return;
    
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    // 改为更柔和的三角波 (triangle)，适合 UI 悬停，之前的方波留给子弹
    osc.type = 'triangle';
    
    // 频率设置：短促的轻微 "滴" 声，频率上升
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.03);

    // 音量控制：非常轻柔，快速衰减
    gainNode.gain.setValueAtTime(0.02, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);

    // 连接节点并播放
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.03);
  } catch (e) {
    console.warn('音效播放失败', e);
  }
}

// 生成随机雪花粒子样式
const getSnowStyle = (index: number) => {
  const size = Math.random() * 3 + 1; // 1px - 4px，雪花比较小
  const left = Math.random() * 100; // 0% - 100%
  const duration = Math.random() * 10 + 10; // 10s - 20s，下落速度较慢
  const delay = Math.random() * 10; // 0s - 10s
  const opacity = Math.random() * 0.4 + 0.1; // 0.1 - 0.5，微弱的效果

  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    animationDuration: `${duration}s`,
    animationDelay: `-${delay}s`, // 使用负数延迟让雪花一开始就分布在屏幕各处
    opacity: opacity,
    backgroundColor: '#ffffff',
    boxShadow: `0 0 ${size}px rgba(255, 255, 255, 0.8)`
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

/* 雾气效果 */
.fog-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
}

.fog-layer {
  position: absolute;
  width: 200%;
  height: 100%;
  background: transparent url('https://raw.githubusercontent.com/danielstuart14/CSS_FOG_ANIMATION/master/fog1.png') repeat-x;
  background-size: cover;
  opacity: 0.3;
}

.fog-layer-1 {
  animation: fogMove 60s linear infinite;
}

.fog-layer-2 {
  background-image: url('https://raw.githubusercontent.com/danielstuart14/CSS_FOG_ANIMATION/master/fog2.png');
  animation: fogMove 40s linear infinite;
  opacity: 0.2;
}

@keyframes fogMove {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

/* 下雪粒子效果 */
.snow-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.snow-particle {
  position: absolute;
  top: -10px;
  border-radius: 50%;
  animation: fallDown linear infinite;
}

@keyframes fallDown {
  0% {
    transform: translateY(0) translateX(0);
  }
  50% {
    transform: translateY(50vh) translateX(20px);
  }
  100% {
    transform: translateY(100vh) translateX(-20px);
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