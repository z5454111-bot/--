import type { WeaponConfig } from '../types'

export const smgConfig: WeaponConfig = {
  id: 'smg',
  name: '冲锋枪',
  baseDamage: 10,
  baseFireRate: 8, // 8发/秒
  critChance: 0.08, // 8% 暴击率
  critDamage: 1.4, // 140% 暴击伤害
  bulletSpeed: 15,
  bulletSize: 1,
  pierceCount: 0,
  lifeTime: 800,
  color: '#f1c40f',
  width: 8,
  height: 3,
  spreadAngle: 0.2, // 散射范围
  fire: (x, y, angle, playerStats, bulletIdCounter, calculateDamage) => {
    const randomSpread = (Math.random() - 0.5) * smgConfig.spreadAngle!
    const finalAngle = angle + randomSpread

    const { damage, critTier } = calculateDamage(
      smgConfig.baseDamage + playerStats.attackDamage - 20,
      smgConfig.critChance + playerStats.critChance - 0.05,
      smgConfig.critDamage + playerStats.critDamage - 1.5
    )

    return [{
      id: bulletIdCounter,
      x,
      y,
      vx: Math.cos(finalAngle),
      vy: Math.sin(finalAngle),
      speed: smgConfig.bulletSpeed * playerStats.bulletSpeedMultiplier,
      angle: finalAngle,
      damage,
      lifeTime: smgConfig.lifeTime,
      pierceCount: smgConfig.pierceCount + playerStats.pierceBonus,
      hitMonsters: new Set<number>(),
      width: smgConfig.width * playerStats.bulletSizeMultiplier,
      height: smgConfig.height * playerStats.bulletSizeMultiplier,
      color: smgConfig.color,
      critTier
    }]
  }
}