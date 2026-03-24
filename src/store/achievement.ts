import { defineStore } from 'pinia'

// 定义成就难度类型
export type AchievementDifficulty = 'easy' | 'normal' | 'hard'

// 定义成就接口
export interface Achievement {
  id: string
  name: string
  description: string
  difficulty: AchievementDifficulty
  isUnlocked: boolean
  icon: string
}

// 定义成就状态 store
export const useAchievementStore = defineStore('achievement', {
  state: () => ({
    achievements: {
      firstBlood: {
        id: 'firstBlood',
        name: '初出茅庐',
        description: '击杀第一只怪物',
        difficulty: 'easy',
        isUnlocked: false,
        icon: 'mdi:sword-cross'
      } as Achievement,
      survivor: {
        id: 'survivor',
        name: '渐入佳境',
        description: '单局存活超过 60 秒',
        difficulty: 'normal',
        isUnlocked: false,
        icon: 'mdi:timer-sand'
      } as Achievement,
      richMan: {
        id: 'richMan',
        name: '腰缠万贯',
        description: '单局获得超过 1000 金币',
        difficulty: 'hard',
        isUnlocked: false,
        icon: 'mdi:gold'
      } as Achievement
    }
  }),
  getters: {
    // 获取所有成就列表
    achievementList: (state) => Object.values(state.achievements),
    // 按难度获取成就
    getAchievementsByDifficulty: (state) => (difficulty: AchievementDifficulty) => {
      return Object.values(state.achievements).filter(a => a.difficulty === difficulty)
    },
    // 获取已解锁成就数量
    unlockedCount: (state) => {
      return Object.values(state.achievements).filter(a => a.isUnlocked).length
    },
    // 获取总成就数量
    totalCount: (state) => {
      return Object.keys(state.achievements).length
    }
  },
  actions: {
    // 解锁成就
    unlockAchievement(id: keyof typeof this.achievements) {
      const achievement = this.achievements[id]
      if (achievement && !achievement.isUnlocked) {
        achievement.isUnlocked = true
        return achievement // 返回解锁的成就，用于触发提示
      }
      return null // 已解锁或不存在
    }
  },
  // 开启持久化，保存到 localStorage
  persist: true
})