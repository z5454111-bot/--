import { pistolConfig } from './pistol'
import { shotgunConfig } from './shotgun'
import { smgConfig } from './smg'
import { sniperConfig } from './sniper'
import { rocketConfig } from './rocket'
import { gatlingConfig } from './gatling'
import type { WeaponConfig } from '../types'

export const weapons: Record<string, WeaponConfig> = {
  pistol: pistolConfig,
  shotgun: shotgunConfig,
  smg: smgConfig,
  sniper: sniperConfig,
  rocket: rocketConfig,
  gatling: gatlingConfig
}

// Warframe 式暴击计算逻辑
export function calculateCritDamage(baseDamage: number, critChance: number, critDamageMultiplier: number): { damage: number, critTier: number } {
  let critTier = 0
  let currentCritChance = critChance

  // 计算暴击等级 (例如 250% 暴击率 = 必定2级暴击，50%概率3级暴击)
  while (currentCritChance >= 1) {
    critTier++
    currentCritChance -= 1
  }

  // 判定最后一次概率暴击
  if (Math.random() < currentCritChance) {
    critTier++
  }

  // 最终伤害 = 基础伤害 * (1 + 暴击等级 * (暴击倍率 - 1))
  // 例如：基础伤害100，暴击倍率2.0
  // 0级暴击 (不暴击): 100 * (1 + 0 * 1) = 100
  // 1级暴击 (黄暴): 100 * (1 + 1 * 1) = 200
  // 2级暴击 (红暴): 100 * (1 + 2 * 1) = 300
  const finalDamageMultiplier = 1 + critTier * (critDamageMultiplier - 1)
  const finalDamage = Math.floor(baseDamage * finalDamageMultiplier)

  return {
    damage: finalDamage,
    critTier
  }
}