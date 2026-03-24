import type { MonsterConfig } from '../types'
import goblinImg from '../../assets/images/gblin.gif'
import minotaurImg from '../../assets/images/niutouren.gif'

export const monsterConfigs: MonsterConfig[] = [
  {
    type: 'goblin',
    radius: 30,
    baseSpeed: 0.08, // 提高基础速度
    friction: 0.9,
    baseHp: 50, // 提高基础血量，避免两下就死
    baseDamage: 15,
    expValue: 15, // 稍微降低经验，减缓前期升级速度
    goldChance: 0.3, // 降低金币掉落率
    goldValue: 5,
    image: goblinImg,
    spawnWeight: 100,
    minTime: 0 // 游戏开始即可生成
  },
  {
    type: 'minotaur',
    radius: 50, // 牛头人更大
    baseSpeed: 0.05, // 提高速度
    friction: 0.85, // 惯性更大
    baseHp: 250, // 大幅提高血量
    baseDamage: 40, // 伤害更高
    expValue: 80,
    goldChance: 0.8,
    goldValue: 20,
    image: minotaurImg,
    spawnWeight: 30, // 稍微提高生成概率
    minTime: 30000 // 提前到 30 秒开始生成
  }
]

// 根据当前游戏时间和权重随机选择一个怪物配置
export const getRandomMonsterConfig = (gameTime: number): MonsterConfig | null => {
  // 过滤出当前时间允许生成的怪物
  const availableMonsters = monsterConfigs.filter(config => gameTime >= config.minTime)
  
  if (availableMonsters.length === 0) return null

  // 计算总权重
  const totalWeight = availableMonsters.reduce((sum, config) => sum + config.spawnWeight, 0)
  
  // 随机一个权重值
  let randomWeight = Math.random() * totalWeight
  
  // 根据权重选择怪物
  for (const config of availableMonsters) {
    randomWeight -= config.spawnWeight
    if (randomWeight <= 0) {
      return config
    }
  }
  
  return availableMonsters[0] // 兜底返回
}