import { defineStore } from 'pinia'

// 定义游戏状态 store
export const useGameStore = defineStore('game', {
  state: () => ({
    // 玩家等级
    level: 1,
    // 玩家经验值
    exp: 0,
    // 玩家金币
    gold: 0,
    // 游戏最高存活时间（秒）
    maxSurvivalTime: 0
  }),
  actions: {
    // 增加经验值
    addExp(amount: number) {
      this.exp += amount
      // 简单的升级逻辑示例
      if (this.exp >= this.level * 100) {
        this.exp -= this.level * 100
        this.level++
      }
    },
    // 增加金币
    addGold(amount: number) {
      this.gold += amount
    },
    // 更新最高存活时间
    updateMaxSurvivalTime(time: number) {
      if (time > this.maxSurvivalTime) {
        this.maxSurvivalTime = time
      }
    },
    // 重置当前游戏状态（不重置金币和最高记录，因为它们是肉鸽的局外成长部分）
    resetCurrentGame() {
      this.level = 1
      this.exp = 0
    }
  },
  // 开启持久化，默认保存到 localStorage
  persist: true
})