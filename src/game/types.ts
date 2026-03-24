export interface Player {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  speed: number
  friction: number
  maxSpeed: number
  hp: number
  maxHp: number
  exp: number
  maxExp: number
  level: number
  gold: number
  pickupRange: number
  direction: 'left' | 'right'
  isInvincible: boolean
  invincibleTimer: number
  attackCooldown: number
  lastAttackTime: number
  attackRange: number
  attackDamage: number
  weaponAngle: number
  critChance: number
  critDamage: number
  expMultiplier: number
  pierceBonus: number
  bulletSpeedMultiplier: number
  bulletSizeMultiplier: number
  invincibleDuration: number
}

export interface Bullet {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  speed: number
  angle: number
  damage: number
  lifeTime: number
  pierceCount: number // 穿透次数，0表示不穿透
  hitMonsters: Set<number> // 记录已经击中过的怪物ID，防止重复伤害
  width?: number // 子弹宽度
  height?: number // 子弹高度
  color?: string // 子弹颜色
  isExplosive?: boolean // 是否是爆炸子弹
  explosionRadius?: number // 爆炸半径
  critTier?: number // 暴击等级 (0: 不暴击, 1: 黄暴, 2: 红暴, 3+: 紫暴)
}

export interface Monster {
  id: number
  type: string // 怪物类型标识
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  speed: number
  friction: number
  hp: number
  maxHp: number
  damage: number
  expValue: number
  goldValue: number
  direction: 'left' | 'right'
  isHit: boolean
  hitTimer: number
  image: string // 怪物图片路径
}

export interface MonsterConfig {
  type: string
  radius: number
  baseSpeed: number
  friction: number
  baseHp: number
  baseDamage: number
  expValue: number
  goldChance: number // 0-1 掉落金币的概率
  goldValue: number
  image: string
  spawnWeight: number // 生成权重，越大越容易生成
  minTime: number // 游戏进行到多少毫秒后才允许生成
}

export interface Drop {
  id: number
  type: 'exp' | 'gold'
  x: number
  y: number
  value: number
}

export interface DamageNumber {
  id: number
  x: number
  y: number
  value: number
  lifeTime: number
  opacity: number
  offsetY: number
  critTier?: number
}

export interface WeaponConfig {
  id: string
  name: string
  baseDamage: number
  baseFireRate: number // 发/秒
  critChance: number // 基础暴击率 (0-1+)
  critDamage: number // 基础暴击伤害倍率 (例如 1.5)
  bulletSpeed: number
  bulletSize: number
  pierceCount: number
  lifeTime: number
  color: string
  width: number
  height: number
  isExplosive?: boolean
  explosionRadius?: number
  pelletCount?: number // 霰弹枪弹片数
  spreadAngle?: number // 散射角度
  // 开火逻辑，返回生成的子弹数组
  fire: (
    x: number,
    y: number,
    angle: number,
    playerStats: Player,
    bulletIdCounter: number,
    calculateDamage: (baseDamage: number, critChance: number, critDamage: number) => { damage: number, critTier: number }
  ) => Bullet[]
}

export interface DeathParticle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  lifeTime: number
  maxLifeTime: number
  opacity: number
  scale: number
}

export interface Obstacle {
  x: number
  y: number
  width: number
  height: number
}