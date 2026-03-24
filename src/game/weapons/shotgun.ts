import type { WeaponConfig } from '../types'

export const shotgunConfig: WeaponConfig = {
  id: 'shotgun',
  name: '霰弹枪',
  baseDamage: 15,
  baseFireRate: 1, // 1发/秒
  critChance: 0.1, // 10% 暴击率
  critDamage: 1.8, // 180% 暴击伤害
  bulletSpeed: 12,
  bulletSize: 1,
  pierceCount: 0,
  lifeTime: 400,
  color: '#e67e22',
  width: 6,
  height: 6,
  pelletCount: 5,
  spreadAngle: Math.PI / 4, // 45度
  fire: (x, y, angle, playerStats, bulletIdCounter, calculateDamage) => {
    const bullets = []
    const pelletCount = shotgunConfig.pelletCount!
    const spreadAngle = shotgunConfig.spreadAngle!
    const startAngle = angle - spreadAngle / 2
    const angleStep = spreadAngle / (pelletCount - 1)

    for (let i = 0; i < pelletCount; i++) {
      const pelletAngle = startAngle + i * angleStep
      const { damage, critTier } = calculateDamage(
        shotgunConfig.baseDamage + playerStats.attackDamage - 20,
        shotgunConfig.critChance + playerStats.critChance - 0.05,
        shotgunConfig.critDamage + playerStats.critDamage - 1.5
      )

      bullets.push({
        id: bulletIdCounter + i,
        x,
        y,
        vx: Math.cos(pelletAngle),
        vy: Math.sin(pelletAngle),
        speed: shotgunConfig.bulletSpeed * playerStats.bulletSpeedMultiplier,
        angle: pelletAngle,
        damage,
        lifeTime: shotgunConfig.lifeTime,
        pierceCount: shotgunConfig.pierceCount + playerStats.pierceBonus,
        hitMonsters: new Set<number>(),
        width: shotgunConfig.width * playerStats.bulletSizeMultiplier,
        height: shotgunConfig.height * playerStats.bulletSizeMultiplier,
        color: shotgunConfig.color,
        critTier
      })
    }
    return bullets
  }
}