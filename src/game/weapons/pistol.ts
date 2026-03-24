import type { WeaponConfig } from '../types'

export const pistolConfig: WeaponConfig = {
  id: 'pistol',
  name: '基础手枪',
  baseDamage: 20,
  baseFireRate: 2, // 2发/秒
  critChance: 0.05, // 5% 暴击率
  critDamage: 1.5, // 150% 暴击伤害
  bulletSpeed: 10,
  bulletSize: 1,
  pierceCount: 0,
  lifeTime: 1000,
  color: '#f1c40f',
  width: 10,
  height: 4,
  fire: (x, y, angle, playerStats, bulletIdCounter, calculateDamage) => {
    const { damage, critTier } = calculateDamage(
      pistolConfig.baseDamage + playerStats.attackDamage - 20, // 减去初始的20，因为attackDamage包含了基础伤害
      pistolConfig.critChance + playerStats.critChance - 0.05,
      pistolConfig.critDamage + playerStats.critDamage - 1.5
    )

    return [{
      id: bulletIdCounter,
      x,
      y,
      vx: Math.cos(angle),
      vy: Math.sin(angle),
      speed: pistolConfig.bulletSpeed * playerStats.bulletSpeedMultiplier,
      angle,
      damage,
      lifeTime: pistolConfig.lifeTime,
      pierceCount: pistolConfig.pierceCount + playerStats.pierceBonus,
      hitMonsters: new Set<number>(),
      width: pistolConfig.width * playerStats.bulletSizeMultiplier,
      height: pistolConfig.height * playerStats.bulletSizeMultiplier,
      color: pistolConfig.color,
      critTier
    }]
  }
}