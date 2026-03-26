import type { WeaponConfig } from '../types'

export const gatlingConfig: WeaponConfig = {
  id: 'gatling',
  name: '加特林',
  baseDamage: 8,
  baseFireRate: 15, // 15发/秒，极高射速
  critChance: 0.05, // 5% 暴击率
  critDamage: 1.5, // 150% 暴击伤害
  bulletSpeed: 18,
  bulletSize: 1,
  pierceCount: 0,
  lifeTime: 600,
  color: '#e74c3c',
  width: 6,
  height: 3,
  spreadAngle: 0.4, // 较大的散射范围
  fire: (x, y, angle, playerStats, bulletIdCounter, calculateDamage) => {
    const randomSpread = (Math.random() - 0.5) * gatlingConfig.spreadAngle!
    const finalAngle = angle + randomSpread

    const { damage, critTier } = calculateDamage(
      gatlingConfig.baseDamage + playerStats.attackDamage - 20,
      gatlingConfig.critChance + playerStats.critChance - 0.05,
      gatlingConfig.critDamage + playerStats.critDamage - 1.5
    )

    return [{
      id: bulletIdCounter,
      x,
      y,
      vx: Math.cos(finalAngle),
      vy: Math.sin(finalAngle),
      speed: gatlingConfig.bulletSpeed * playerStats.bulletSpeedMultiplier,
      angle: finalAngle,
      damage,
      lifeTime: gatlingConfig.lifeTime,
      pierceCount: gatlingConfig.pierceCount + playerStats.pierceBonus,
      hitMonsters: new Set<number>(),
      width: gatlingConfig.width * playerStats.bulletSizeMultiplier,
      height: gatlingConfig.height * playerStats.bulletSizeMultiplier,
      color: gatlingConfig.color,
      critTier
    }]
  }
}