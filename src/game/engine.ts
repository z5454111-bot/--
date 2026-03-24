import { reactive, ref } from 'vue'
import type { Player, Bullet, Monster, Drop, DamageNumber, DeathParticle } from './types'
import { GAME_WIDTH, GAME_HEIGHT, VIEWPORT_WIDTH, VIEWPORT_HEIGHT } from './config'
import { checkCollision } from './utils'
import { getRandomMonsterConfig, monsterConfigs } from './monsters'
import { useGameStore } from '../store/game'
import { useAchievementStore } from '../store/achievement'
import { getRandomUpgrades, type UpgradeOption } from './upgrades'
import { weapons, calculateCritDamage } from './weapons'

export class GameEngine {
  private store = useGameStore()
  private achievementStore = useAchievementStore()

  // 游戏状态
  isGameOver = ref(false)
  isLevelUp = ref(false)
  isPaused = ref(false) // 新增暂停状态
  gameTime = ref(0)
  
  // 统计数据
  stats = reactive({
    monstersKilled: 0,
    damageDealt: 0
  })

  // 镜头状态
  camera = reactive({ x: 0, y: 0 })

  // 玩家状态
  player = reactive<Player>({
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT / 2,
    vx: 0,
    vy: 0,
    radius: 30,
    speed: 0.8,
    friction: 0.85,
    maxSpeed: 5,
    hp: 100,
    maxHp: 100,
    exp: 0,
    maxExp: 100,
    level: 1,
    gold: 0,
    pickupRange: 100,
    direction: 'right',
    isInvincible: false,
    invincibleTimer: 0,
    attackCooldown: 500,
    lastAttackTime: 0,
    attackRange: 300,
    attackDamage: 20,
    weaponAngle: 0,
    critChance: 0.05, // 初始 5% 暴击率
    critDamage: 1.5,  // 初始 150% 暴击伤害
    expMultiplier: 1.0, // 初始 100% 经验获取
    pierceBonus: 0, // 初始 0 额外穿透
    bulletSpeedMultiplier: 1.0, // 初始 100% 子弹速度
    bulletSizeMultiplier: 1.0, // 初始 100% 子弹大小
    invincibleDuration: 1000 // 初始 1000ms 无敌时间
  })

  // 当前提供的升级选项
  currentUpgradeOptions = ref<UpgradeOption[]>([])
  // 剩余刷新次数
  rerollsLeft = ref(0)

  constructor() {
    this.syncStoreData()
  }

  // 同步商店数据到战斗引擎
  private syncStoreData() {
    // 基础属性加成
    const hpBonus = this.store.getUpgradeValue('maxHp')
    const attackBonus = this.store.getUpgradeValue('attack')
    const speedBonusPercent = this.store.getUpgradeValue('speed')

    this.player.maxHp = 100 + hpBonus
    this.player.hp = this.player.maxHp
    
    // 速度加成 (百分比)
    const speedMultiplier = 1 + (speedBonusPercent / 100)
    this.player.maxSpeed = 5 * speedMultiplier
    this.player.speed = 0.8 * speedMultiplier

    // 武器属性
    const weaponId = this.store.equippedWeaponId as keyof typeof this.store.weapons
    const weaponConfig = weapons[weaponId]
    
    // 商店升级带来的基础属性加成
    this.player.attackDamage = attackBonus
    
    // 初始冷却时间由武器决定
    const weaponFireRate = this.store.getWeaponFireRate(weaponId)
    this.player.attackCooldown = 1000 / weaponFireRate

    // 初始化刷新次数
    this.rerollsLeft.value = this.store.getUpgradeValue('reroll')
  }

  // 实体列表
  bullets = reactive<Bullet[]>([])
  monsters = reactive<Monster[]>([])
  drops = reactive<Drop[]>([])
  damageNumbers = reactive<DamageNumber[]>([])
  deathParticles = reactive<DeathParticle[]>([])

  // ID 计数器
  private bulletIdCounter = 0
  private monsterIdCounter = 0
  private dropIdCounter = 0
  private dmgIdCounter = 0
  private particleIdCounter = 0

  // 循环控制
  private animationFrameId: number = 0
  private lastTime: number = 0
  private spawnTimer: number = 0
  private spawnRate = 3000

  // 按键状态
  keys = reactive({
    w: false,
    a: false,
    s: false,
    d: false
  })

  // 作弊状态
  private isCheatInvincible = false
  private isCheatInstaKill = false

  // 触发升级
  triggerLevelUp() {
    this.isLevelUp.value = true
    this.currentUpgradeOptions.value = getRandomUpgrades(3)
  }

  // 刷新升级选项
  rerollUpgrades() {
    if (this.rerollsLeft.value > 0) {
      this.rerollsLeft.value--
      this.currentUpgradeOptions.value = getRandomUpgrades(3)
    }
  }

  // 升级选择逻辑
  selectUpgrade(option: UpgradeOption) {
    option.apply(this.player)
    this.isLevelUp.value = false
    this.lastTime = performance.now() // 恢复时间
  }

  // 生成怪物
  spawnMonster = () => {
    // 提高同屏怪物上限，增加压迫感
    const maxMonsters = Math.min(150, 20 + Math.floor(this.gameTime.value / 5000))
    if (this.monsters.length >= maxMonsters) return

    const config = getRandomMonsterConfig(this.gameTime.value)
    if (!config) return

    const timeMinutes = this.gameTime.value / 60000
    // 提高后期怪物的成长倍率
    const speedMultiplier = 1 + timeMinutes * 0.15
    const hpMultiplier = 1 + timeMinutes * 0.8 // 血量成长更快
    const damageMultiplier = 1 + timeMinutes * 0.5 // 伤害也随时间成长

    let spawnX = 0
    let spawnY = 0
    let validSpawn = false
    let attempts = 0
    const margin = 40

    while (!validSpawn && attempts < 10) {
      const angle = Math.random() * Math.PI * 2
      const distance = Math.random() * 300 + 400
      
      spawnX = this.player.x + Math.cos(angle) * distance
      spawnY = this.player.y + Math.sin(angle) * distance
      
      spawnX = Math.max(margin, Math.min(GAME_WIDTH - margin, spawnX))
      spawnY = Math.max(margin, Math.min(GAME_HEIGHT - margin, spawnY))

      if (!checkCollision(spawnX, spawnY, config.radius)) {
        validSpawn = true
      }
      attempts++
    }

    if (!validSpawn) return

    this.monsters.push({
      id: this.monsterIdCounter++,
      type: config.type,
      x: spawnX,
      y: spawnY,
      vx: 0,
      vy: 0,
      radius: config.radius,
      speed: config.baseSpeed * speedMultiplier,
      friction: config.friction,
      hp: config.baseHp * hpMultiplier,
      maxHp: config.baseHp * hpMultiplier,
      damage: config.baseDamage * damageMultiplier,
      expValue: config.expValue,
      goldValue: Math.random() < config.goldChance ? config.goldValue : 0,
      direction: 'right',
      isHit: false,
      hitTimer: 0,
      image: config.image
    })
  }

  // 游戏主循环
  private gameLoop = (currentTime: number) => {
    if (this.isGameOver.value) return

    if (this.isLevelUp.value || this.isPaused.value) {
      this.lastTime = currentTime
      this.animationFrameId = requestAnimationFrame(this.gameLoop)
      return
    }

    let deltaTime = currentTime - this.lastTime
    this.lastTime = currentTime

    // 防止切换标签页导致 deltaTime 过大，限制最大值为 100ms
    if (deltaTime > 100) {
      deltaTime = 16 // 假设为 60fps 的正常间隔
    }

    this.gameTime.value += deltaTime

    // 检查存活时间成就 (60秒 = 60000毫秒)
    if (this.gameTime.value >= 60000) {
      this.checkAchievement('survivor')
    }

    // 动态调整出怪速度，后期刷怪更快
    // 初始 2000ms，每分钟减少 500ms，最低 200ms
    this.spawnRate = Math.max(200, 2000 - (this.gameTime.value / 60000) * 500)
    
    // 基于游戏循环的生成逻辑，替代 setInterval
    this.spawnTimer += deltaTime
    if (this.spawnTimer >= this.spawnRate) {
      // 后期每次可能生成多只怪物
      const spawnCount = 1 + Math.floor(this.gameTime.value / 30000) // 每 30 秒增加一次生成数量
      for (let i = 0; i < spawnCount; i++) {
        this.spawnMonster()
      }
      this.spawnTimer = 0
    }

    this.updatePlayer(currentTime, deltaTime)
    this.updateBullets(deltaTime)
    this.updateMonsters(deltaTime)
    this.updateDrops()
    this.updateEffects(deltaTime)
    this.updateCamera()

    this.animationFrameId = requestAnimationFrame(this.gameLoop)
  }

  private updatePlayer(currentTime: number, deltaTime: number) {
    let inputX = 0
    let inputY = 0

    if (this.keys.w) inputY -= 1
    if (this.keys.s) inputY += 1
    if (this.keys.a) inputX -= 1
    if (this.keys.d) inputX += 1

    if (inputX !== 0 || inputY !== 0) {
      const length = Math.sqrt(inputX * inputX + inputY * inputY)
      inputX /= length
      inputY /= length
    }

    this.player.vx += inputX * this.player.speed
    this.player.vy += inputY * this.player.speed

    this.player.vx *= this.player.friction
    this.player.vy *= this.player.friction

    const currentSpeed = Math.sqrt(this.player.vx * this.player.vx + this.player.vy * this.player.vy)
    if (currentSpeed > this.player.maxSpeed && inputX === 0 && inputY === 0) {
       this.player.vx *= 0.8
       this.player.vy *= 0.8
    }

    if (inputX > 0) {
      this.player.direction = 'right'
    } else if (inputX < 0) {
      this.player.direction = 'left'
    }

    // 自动射击逻辑
    let nearestMonster: Monster | null = null
    let minDistance = this.player.attackRange

    for (const monster of this.monsters) {
      const dx = monster.x - this.player.x
      const dy = monster.y - this.player.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      
      if (dist < minDistance) {
        minDistance = dist
        nearestMonster = monster
      }
    }

    if (nearestMonster) {
      const dx = nearestMonster.x - this.player.x
      const dy = nearestMonster.y - this.player.y
      const angle = Math.atan2(dy, dx)
      
      this.player.weaponAngle = angle

      if (currentTime - this.player.lastAttackTime > this.player.attackCooldown) {
        const weaponId = this.store.equippedWeaponId
        const weaponConfig = weapons[weaponId]
        
        if (weaponConfig) {
          const newBullets = weaponConfig.fire(
            this.player.x,
            this.player.y,
            angle,
            this.player,
            this.bulletIdCounter,
            (baseDamage, critChance, critDamage) => {
              if (this.isCheatInstaKill) return { damage: 9999, critTier: 0 }
              return calculateCritDamage(baseDamage, critChance, critDamage)
            }
          )
          
          this.bullets.push(...newBullets)
          this.bulletIdCounter += newBullets.length
        }

        this.player.lastAttackTime = currentTime
      }
    }

    let newX = this.player.x + this.player.vx
    let newY = this.player.y + this.player.vy

    if (!checkCollision(newX, this.player.y, this.player.radius)) {
      this.player.x = newX
    } else {
      this.player.vx = 0
    }
    
    if (!checkCollision(this.player.x, newY, this.player.radius)) {
      this.player.y = newY
    } else {
      this.player.vy = 0
    }

    if (this.player.isInvincible) {
      this.player.invincibleTimer -= deltaTime
      if (this.player.invincibleTimer <= 0) {
        this.player.isInvincible = false
      }
    }
  }

  private updateBullets(deltaTime: number) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i]
      bullet.x += bullet.vx * bullet.speed
      bullet.y += bullet.vy * bullet.speed
      bullet.lifeTime -= deltaTime

      let shouldDestroyBullet = false
      let isExploding = false

      // 检查是否到达寿命或撞墙
      if (bullet.lifeTime <= 0 || checkCollision(bullet.x, bullet.y, 5)) {
        shouldDestroyBullet = true
        if (bullet.isExplosive) {
          isExploding = true
        }
      }

      if (!shouldDestroyBullet) {
        for (let j = this.monsters.length - 1; j >= 0; j--) {
          const monster = this.monsters[j]
          
          // 如果子弹已经击中过这个怪物，跳过
          if (bullet.hitMonsters.has(monster.id)) continue

          const dx = bullet.x - monster.x
          const dy = bullet.y - monster.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < monster.radius + 5) {
            if (bullet.isExplosive) {
              // 爆炸子弹击中怪物，触发爆炸
              shouldDestroyBullet = true
              isExploding = true
              break // 退出当前怪物的检测，进入爆炸逻辑
            } else {
              // 普通子弹击中逻辑
              this.applyDamageToMonster(monster, bullet.damage, j, bullet.critTier)
              bullet.hitMonsters.add(monster.id)

              // 处理穿透逻辑
              if (bullet.pierceCount > 0) {
                bullet.pierceCount--
              } else {
                shouldDestroyBullet = true
                break
              }
            }
          }
        }
      }

      // 处理爆炸逻辑
      if (isExploding && bullet.explosionRadius) {
        this.triggerExplosion(bullet.x, bullet.y, bullet.explosionRadius, bullet.damage)
      }

      if (shouldDestroyBullet) {
        this.bullets.splice(i, 1)
      }
    }
  }

  // 触发爆炸
  private triggerExplosion(x: number, y: number, radius: number, damage: number) {
    // 1. 生成爆炸特效粒子
    const particleCount = 30
    for (let p = 0; p < particleCount; p++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 2 + Math.random() * 8
      const life = 300 + Math.random() * 400
      this.deathParticles.push({
        id: this.particleIdCounter++,
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        lifeTime: life,
        maxLifeTime: life,
        opacity: 1,
        scale: 1.5 + Math.random() * 1.5 // 爆炸粒子更大
      })
    }

    // 2. 对范围内的怪物造成伤害
    for (let j = this.monsters.length - 1; j >= 0; j--) {
      const monster = this.monsters[j]
      const dx = x - monster.x
      const dy = y - monster.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist <= radius + monster.radius) {
        // 距离越近伤害越高，最低造成 50% 伤害
        const damageMultiplier = 0.5 + 0.5 * (1 - dist / (radius + monster.radius))
        const finalDamage = Math.floor(damage * damageMultiplier)
        this.applyDamageToMonster(monster, finalDamage, j)
      }
    }
  }

  // 提取应用伤害的公共逻辑
  private applyDamageToMonster(monster: Monster, damage: number, index: number, critTier: number = 0) {
    monster.hp -= damage
    this.stats.damageDealt += damage // 记录伤害
    monster.isHit = true
    monster.hitTimer = 200
    
    this.damageNumbers.push({
      id: this.dmgIdCounter++,
      x: monster.x + (Math.random() * 20 - 10),
      y: monster.y - 20,
      value: damage,
      lifeTime: 800,
      opacity: 1,
      offsetY: 0,
      critTier
    })

    if (monster.hp <= 0) {
      this.stats.monstersKilled++ // 记录击杀
      
      // 检查首杀成就
      if (this.stats.monstersKilled === 1) {
        this.checkAchievement('firstBlood')
      }

      const particleCount = 15 + Math.floor(Math.random() * 10)
      for (let p = 0; p < particleCount; p++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 3 + Math.random() * 5
        const life = 400 + Math.random() * 300
        this.deathParticles.push({
          id: this.particleIdCounter++,
          x: monster.x + (Math.random() * 10 - 5),
          y: monster.y + (Math.random() * 10 - 5),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          lifeTime: life,
          maxLifeTime: life,
          opacity: 1,
          scale: 0.8 + Math.random() * 0.8
        })
      }

      this.drops.push({
        id: this.dropIdCounter++,
        type: 'exp',
        x: monster.x + (Math.random() * 20 - 10),
        y: monster.y + (Math.random() * 20 - 10),
        value: monster.expValue
      })

      if (monster.goldValue > 0) {
        this.drops.push({
          id: this.dropIdCounter++,
          type: 'gold',
          x: monster.x + (Math.random() * 20 - 10),
          y: monster.y + (Math.random() * 20 - 10),
          value: monster.goldValue
        })
      }

      this.monsters.splice(index, 1)
    }
  }

  private updateMonsters(deltaTime: number) {
    for (let i = this.monsters.length - 1; i >= 0; i--) {
      const monster = this.monsters[i]

      if (monster.isHit) {
        monster.hitTimer -= deltaTime
        if (monster.hitTimer <= 0) {
          monster.isHit = false
        }
      }

      const mdx = this.player.x - monster.x
      const mdy = this.player.y - monster.y
      const distToPlayer = Math.sqrt(mdx * mdx + mdy * mdy)

      if (distToPlayer > 0) {
        if (mdx > 0) monster.direction = 'right'
        else if (mdx < 0) monster.direction = 'left'

        const dirX = mdx / distToPlayer
        const dirY = mdy / distToPlayer
        
        monster.vx += dirX * monster.speed
        monster.vy += dirY * monster.speed
      }

      for (let j = 0; j < this.monsters.length; j++) {
        if (i === j) continue
        const other = this.monsters[j]
        const dx = monster.x - other.x
        const dy = monster.y - other.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const minDist = monster.radius + other.radius
        
        if (dist < minDist && dist > 0) {
          const overlap = minDist - dist
          const force = overlap * 0.01
          monster.vx += (dx / dist) * force
          monster.vy += (dy / dist) * force
        }
      }

      monster.vx *= monster.friction
      monster.vy *= monster.friction

      const maxMonsterSpeed = 2.0
      const currentMonsterSpeed = Math.sqrt(monster.vx * monster.vx + monster.vy * monster.vy)
      if (currentMonsterSpeed > maxMonsterSpeed) {
        monster.vx = (monster.vx / currentMonsterSpeed) * maxMonsterSpeed
        monster.vy = (monster.vy / currentMonsterSpeed) * maxMonsterSpeed
      }

      const isCurrentlyStuck = checkCollision(monster.x, monster.y, monster.radius)

      if (isCurrentlyStuck || !checkCollision(monster.x + monster.vx, monster.y, monster.radius)) {
        monster.x += monster.vx
      } else {
        monster.vx *= -0.5
        if (monster.x < monster.radius) monster.x = monster.radius
        if (monster.x > GAME_WIDTH - monster.radius) monster.x = GAME_WIDTH - monster.radius
      }
      
      if (isCurrentlyStuck || !checkCollision(monster.x, monster.y + monster.vy, monster.radius)) {
        monster.y += monster.vy
      } else {
        monster.vy *= -0.5
        if (monster.y < monster.radius) monster.y = monster.radius
        if (monster.y > GAME_HEIGHT - monster.radius) monster.y = GAME_HEIGHT - monster.radius
      }

      const collisionDist = this.player.radius + monster.radius - 5
      if (distToPlayer < collisionDist) {
        if (!this.player.isInvincible && !this.isCheatInvincible) {
          this.player.hp -= monster.damage
          this.player.isInvincible = true
          this.player.invincibleTimer = this.player.invincibleDuration
          
          monster.isHit = true
          monster.hitTimer = 200

          if (this.player.hp <= 0) {
            this.player.hp = 0
            this.gameOver()
          }
        }
      }
    }
  }

  private updateDrops() {
    for (let i = this.drops.length - 1; i >= 0; i--) {
      const drop = this.drops[i]
      const dx = this.player.x - drop.x
      const dy = this.player.y - drop.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < this.player.pickupRange) {
        const speed = 8
        drop.x += (dx / dist) * speed
        drop.y += (dy / dist) * speed

        if (dist < this.player.radius) {
          if (drop.type === 'exp') {
            this.player.exp += drop.value * this.player.expMultiplier
            if (this.player.exp >= this.player.maxExp) {
              this.player.level++
              this.player.exp -= this.player.maxExp
              this.player.maxExp = Math.floor(this.player.maxExp * 1.5)
              this.triggerLevelUp()
            }
          } else if (drop.type === 'gold') {
            this.player.gold += drop.value
            // 检查金币成就
            if (this.player.gold >= 1000) {
              this.checkAchievement('richMan')
            }
          }
          this.drops.splice(i, 1)
        }
      }
    }
  }

  private updateEffects(deltaTime: number) {
    for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
      const dmg = this.damageNumbers[i]
      dmg.lifeTime -= deltaTime
      dmg.offsetY -= 0.5
      dmg.opacity = dmg.lifeTime / 800

      if (dmg.lifeTime <= 0) {
        this.damageNumbers.splice(i, 1)
      }
    }

    for (let i = this.deathParticles.length - 1; i >= 0; i--) {
      const p = this.deathParticles[i]
      p.x += p.vx
      p.y += p.vy
      p.vx *= 0.9
      p.vy *= 0.9
      p.lifeTime -= deltaTime
      p.opacity = p.lifeTime / p.maxLifeTime
      p.scale *= 0.95

      if (p.lifeTime <= 0) {
        this.deathParticles.splice(i, 1)
      }
    }
  }

  private updateCamera() {
    let camX = this.player.x - VIEWPORT_WIDTH / 2
    let camY = this.player.y - VIEWPORT_HEIGHT / 2

    if (camX < 0) camX = 0
    if (camX > GAME_WIDTH - VIEWPORT_WIDTH) camX = GAME_WIDTH - VIEWPORT_WIDTH
    
    if (camY < 0) camY = 0
    if (camY > GAME_HEIGHT - VIEWPORT_HEIGHT) camY = GAME_HEIGHT - VIEWPORT_HEIGHT

    this.camera.x = camX
    this.camera.y = camY
  }

  // --- 作弊功能接口 ---
  
  setCheatInvincible(val: boolean) {
    this.isCheatInvincible = val
  }

  setCheatInstaKill(val: boolean) {
    this.isCheatInstaKill = val
  }

  addCheatExp(amount: number) {
    this.player.exp += amount
    while (this.player.exp >= this.player.maxExp) {
      this.player.level++
      this.player.exp -= this.player.maxExp
      this.player.maxExp = Math.floor(this.player.maxExp * 1.5)
      this.triggerLevelUp()
    }
  }

  clearAllMonsters() {
    // 触发所有怪物的死亡逻辑，但不掉落物品，避免卡顿
    for (const monster of this.monsters) {
      this.stats.monstersKilled++
      
      // 死亡特效
      const particleCount = 5
      for (let p = 0; p < particleCount; p++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 3 + Math.random() * 5
        const life = 400 + Math.random() * 300
        this.deathParticles.push({
          id: this.particleIdCounter++,
          x: monster.x + (Math.random() * 10 - 5),
          y: monster.y + (Math.random() * 10 - 5),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          lifeTime: life,
          maxLifeTime: life,
          opacity: 1,
          scale: 0.8 + Math.random() * 0.8
        })
      }
    }
    this.monsters = []
  }

  spawnBoss() {
    const config = monsterConfigs.find(c => c.type === 'minotaur')
    if (!config) return

    const angle = Math.random() * Math.PI * 2
    const distance = 300
    
    let spawnX = this.player.x + Math.cos(angle) * distance
    let spawnY = this.player.y + Math.sin(angle) * distance
    
    spawnX = Math.max(40, Math.min(GAME_WIDTH - 40, spawnX))
    spawnY = Math.max(40, Math.min(GAME_HEIGHT - 40, spawnY))

    this.monsters.push({
      id: this.monsterIdCounter++,
      type: config.type,
      x: spawnX,
      y: spawnY,
      vx: 0,
      vy: 0,
      radius: config.radius,
      speed: config.baseSpeed,
      friction: config.friction,
      hp: config.baseHp,
      maxHp: config.baseHp,
      damage: config.baseDamage,
      expValue: config.expValue,
      goldValue: config.goldValue,
      direction: 'right',
      isHit: false,
      hitTimer: 0,
      image: config.image
    })
  }

  start() {
    this.lastTime = performance.now()
    this.animationFrameId = requestAnimationFrame(this.gameLoop)
    this.spawnMonster()
  }

  stop() {
    cancelAnimationFrame(this.animationFrameId)
  }

  // 切换暂停状态
  togglePause() {
    if (this.isGameOver.value || this.isLevelUp.value) return
    this.isPaused.value = !this.isPaused.value
    if (!this.isPaused.value) {
      this.lastTime = performance.now() // 恢复时重置时间，防止 deltaTime 过大
    }
  }

  // 强制结束游戏 (用于从暂停菜单返回主菜单)
  forceGameOver() {
    this.gameOver()
  }

  private gameOver() {
    if (this.isGameOver.value) return // 防止重复调用
    this.isGameOver.value = true
    this.isPaused.value = false // 确保结束时不在暂停状态
    // 结算金币到商店
    this.store.addGold(this.player.gold)
    // 更新最高存活时间
    this.store.updateMaxSurvivalTime(Math.floor(this.gameTime.value / 1000))
  }

  // 检查并触发成就
  private checkAchievement(id: string) {
    const achievement = this.achievementStore.unlockAchievement(id as any)
    if (achievement) {
      // 触发自定义事件，让 Vue 组件监听并显示通知
      window.dispatchEvent(new CustomEvent('achievement-unlocked', {
        detail: achievement
      }))
    }
  }
}