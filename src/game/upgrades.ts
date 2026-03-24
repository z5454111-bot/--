import type { Player } from './types'

export interface UpgradeOption {
  id: string
  name: string
  description: string
  icon: string
  apply: (player: Player) => void
}

export const availableUpgrades: UpgradeOption[] = [
  {
    id: 'hp_up',
    name: '强健体魄',
    description: '最大生命值 +20，并恢复等量生命',
    icon: 'mdi:heart-plus',
    apply: (player) => {
      player.maxHp += 20
      player.hp += 20
    }
  },
  {
    id: 'damage_up',
    name: '力量强化',
    description: '基础攻击力 +5',
    icon: 'mdi:sword',
    apply: (player) => {
      player.attackDamage += 5
    }
  },
  {
    id: 'speed_up',
    name: '轻盈步伐',
    description: '移动速度 +10%',
    icon: 'mdi:run-fast',
    apply: (player) => {
      player.maxSpeed *= 1.1
      player.speed *= 1.1
    }
  },
  {
    id: 'crit_chance_up',
    name: '致命一击',
    description: '暴击率 +10%',
    icon: 'mdi:target',
    apply: (player) => {
      player.critChance += 0.1
    }
  },
  {
    id: 'crit_damage_up',
    name: '无情打击',
    description: '暴击伤害 +50%',
    icon: 'mdi:flash',
    apply: (player) => {
      player.critDamage += 0.5
    }
  },
  {
    id: 'exp_up',
    name: '好学不倦',
    description: '经验获取量 +20%',
    icon: 'mdi:book-open-page-variant',
    apply: (player) => {
      player.expMultiplier += 0.2
    }
  },
  {
    id: 'pickup_range_up',
    name: '磁性体质',
    description: '拾取范围 +50',
    icon: 'mdi:magnet',
    apply: (player) => {
      player.pickupRange += 50
    }
  },
  {
    id: 'pierce_up',
    name: '穿甲弹头',
    description: '子弹穿透次数 +1',
    icon: 'mdi:arrow-projectile',
    apply: (player) => {
      player.pierceBonus += 1
    }
  },
  {
    id: 'bullet_speed_up',
    name: '高压火药',
    description: '子弹飞行速度 +20%',
    icon: 'mdi:speedometer',
    apply: (player) => {
      player.bulletSpeedMultiplier += 0.2
    }
  },
  {
    id: 'bullet_size_up',
    name: '大口径弹药',
    description: '子弹体积 +30%',
    icon: 'mdi:circle-expand',
    apply: (player) => {
      player.bulletSizeMultiplier += 0.3
    }
  },
  {
    id: 'cooldown_down',
    name: '快速装填',
    description: '攻击冷却时间 -10%',
    icon: 'mdi:timer-sand',
    apply: (player) => {
      player.attackCooldown *= 0.9
    }
  },
  {
    id: 'invincible_up',
    name: '金钟罩',
    description: '受伤后的无敌时间 +0.5秒',
    icon: 'mdi:shield-half-full',
    apply: (player) => {
      player.invincibleDuration += 500
    }
  },
  {
    id: 'heal_full',
    name: '急救包',
    description: '恢复所有生命值',
    icon: 'mdi:medical-bag',
    apply: (player) => {
      player.hp = player.maxHp
    }
  }
]

// 随机抽取指定数量的不重复升级选项
export function getRandomUpgrades(count: number): UpgradeOption[] {
  const shuffled = [...availableUpgrades].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}