import type { WeaponConfig } from '../types'

export const sniperConfig: WeaponConfig = {
  id: 'sniper',
  name: '狙击枪',
  baseDamage: 150,
  baseFireRate: 0.5, // 0.5发/秒
  critChance: 0.25, // 25% 暴击率
  critDamage: 2.5, // 250% 暴击伤害
  bulletSpeed: 25,
  bulletSize: 1,
  pierceCount: 5,
  lifeTime: 1500,
  color: '#3498db',
  width: 20,
  height: 4,
  fire: (x, y, angle, playerStats, bulletIdCounter, calculateDamage) => {
    const { damage, critTier } = calculateDamage(
      sniperConfig.baseDamage + playerStats.attackDamage - 20,
      sniperConfig.critChance + playerStats.critChance - 0.05,
      sniperConfig.critDamage + playerStats.critDamage - 1.5
    )

    return [{
      id: bulletIdCounter,
      x,
      y,
      vx: Math.cos(angle),
      vy: Math.sin(angle),
      speed: sniperConfig.bulletSpeed * playerStats.bulletSpeedMultiplier,
      angle,
      damage,
      lifeTime: sniperConfig.lifeTime,
      pierceCount: sniperConfig.pierceCount + playerStats.pierceBonus,
      hitMonsters: new Set<number>(),
      width: sniperConfig.width * playerStats.bulletSizeMultiplier,
      height: sniperConfig.height * playerStats.bulletSizeMultiplier,
      color: sniperConfig.color,
      critTier
    }]
  }
}