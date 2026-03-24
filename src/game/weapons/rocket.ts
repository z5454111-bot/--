import type { WeaponConfig } from '../types'

export const rocketConfig: WeaponConfig = {
  id: 'rocket',
  name: '火箭筒',
  baseDamage: 100,
  baseFireRate: 0.3, // 0.3发/秒
  critChance: 0.15, // 15% 暴击率
  critDamage: 2.0, // 200% 暴击伤害
  bulletSpeed: 8,
  bulletSize: 1,
  pierceCount: 0,
  lifeTime: 2000,
  color: '#e74c3c',
  width: 16,
  height: 8,
  isExplosive: true,
  explosionRadius: 150,
  fire: (x, y, angle, playerStats, bulletIdCounter, calculateDamage) => {
    const { damage, critTier } = calculateDamage(
      rocketConfig.baseDamage + playerStats.attackDamage - 20,
      rocketConfig.critChance + playerStats.critChance - 0.05,
      rocketConfig.critDamage + playerStats.critDamage - 1.5
    )

    return [{
      id: bulletIdCounter,
      x,
      y,
      vx: Math.cos(angle),
      vy: Math.sin(angle),
      speed: rocketConfig.bulletSpeed * playerStats.bulletSpeedMultiplier,
      angle,
      damage,
      lifeTime: rocketConfig.lifeTime,
      pierceCount: 0, // 碰到第一个敌人就爆炸，不享受穿透加成
      hitMonsters: new Set<number>(),
      width: rocketConfig.width * playerStats.bulletSizeMultiplier,
      height: rocketConfig.height * playerStats.bulletSizeMultiplier,
      color: rocketConfig.color,
      isExplosive: rocketConfig.isExplosive,
      explosionRadius: rocketConfig.explosionRadius! * playerStats.bulletSizeMultiplier,
      critTier
    }]
  }
}