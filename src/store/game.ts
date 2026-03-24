import { defineStore } from 'pinia'

// 定义商店升级项的接口
export interface ShopUpgrade {
  id: string
  name: string
  description: string
  level: number
  maxLevel: number
  baseCost: number
  costMultiplier: number
  valuePerLevel: number
  icon: string
}

// 定义枪械的接口
export interface Weapon {
  id: string
  name: string
  description: string
  level: number
  maxLevel: number
  baseDamage: number
  damagePerLevel: number
  baseFireRate: number // 射速 (发/秒)
  fireRatePerLevel: number
  baseCost: number // 购买价格
  upgradeCostMultiplier: number // 升级价格乘数
  isOwned: boolean // 是否已拥有
  image: string // 枪械图片路径
}

// 定义游戏状态 store
export const useGameStore = defineStore('game', {
  state: () => ({
    // 玩家等级
    level: 1,
    // 玩家经验值
    exp: 0,
    // 玩家金币
    gold: 0,
    // 游戏最高存活时间（秒）
    maxSurvivalTime: 0,
    // 商店升级项
    shopUpgrades: {
      maxHp: {
        id: 'maxHp',
        name: '最大生命值',
        description: '提升基础最大生命值',
        level: 0,
        maxLevel: 10,
        baseCost: 100,
        costMultiplier: 1.5,
        valuePerLevel: 10,
        icon: 'mdi:heart-plus'
      } as ShopUpgrade,
      attack: {
        id: 'attack',
        name: '基础攻击力',
        description: '提升所有武器的基础伤害',
        level: 0,
        maxLevel: 10,
        baseCost: 150,
        costMultiplier: 1.6,
        valuePerLevel: 2,
        icon: 'mdi:sword'
      } as ShopUpgrade,
      speed: {
        id: 'speed',
        name: '移动速度',
        description: '提升角色的移动速度',
        level: 0,
        maxLevel: 5,
        baseCost: 200,
        costMultiplier: 1.8,
        valuePerLevel: 5, // 百分比
        icon: 'mdi:run-fast'
      } as ShopUpgrade,
      reroll: {
        id: 'reroll',
        name: '刷新次数',
        description: '增加升级时刷新选项的次数',
        level: 0,
        maxLevel: 3,
        baseCost: 500,
        costMultiplier: 2,
        valuePerLevel: 1,
        icon: 'mdi:dice-multiple'
      } as ShopUpgrade
    },
    // 枪械商店
    weapons: {
      pistol: {
        id: 'pistol',
        name: '基础手枪',
        description: '开局自带的可靠伙伴，射速适中。',
        level: 1,
        maxLevel: 5,
        baseDamage: 10,
        damagePerLevel: 5,
        baseFireRate: 2,
        fireRatePerLevel: 0.5,
        baseCost: 0,
        upgradeCostMultiplier: 1.5,
        isOwned: true, // 默认拥有
        image: '/src/assets/images/guns/regularpisto.png' // 使用项目中的手枪贴图
      } as Weapon,
      shotgun: {
        id: 'shotgun',
        name: '霰弹枪',
        description: '近战王者，一次发射多枚弹片。',
        level: 0,
        maxLevel: 5,
        baseDamage: 8, // 单片伤害
        damagePerLevel: 3,
        baseFireRate: 1,
        fireRatePerLevel: 0.2,
        baseCost: 500,
        upgradeCostMultiplier: 1.6,
        isOwned: false,
        image: '/src/assets/images/guns/xiandan.png'
      } as Weapon,
      smg: {
        id: 'smg',
        name: '冲锋枪',
        description: '射速极快，适合倾泻火力。',
        level: 0,
        maxLevel: 5,
        baseDamage: 5,
        damagePerLevel: 2,
        baseFireRate: 8,
        fireRatePerLevel: 2,
        baseCost: 800,
        upgradeCostMultiplier: 1.7,
        isOwned: false,
        image: '/src/assets/images/guns/chongfeng.png'
      } as Weapon,
      sniper: {
        id: 'sniper',
        name: '狙击枪',
        description: '单发伤害极高，具有穿透效果。',
        level: 0,
        maxLevel: 5,
        baseDamage: 150, // 大幅提高基础伤害
        damagePerLevel: 50, // 提高成长伤害
        baseFireRate: 0.5,
        fireRatePerLevel: 0.1,
        baseCost: 1200,
        upgradeCostMultiplier: 1.8,
        isOwned: false,
        image: '/src/assets/images/guns/juji.png'
      } as Weapon,
      rocket: {
        id: 'rocket',
        name: '火箭筒',
        description: '发射爆炸火箭弹，造成大范围伤害。',
        level: 0,
        maxLevel: 5,
        baseDamage: 100,
        damagePerLevel: 30,
        baseFireRate: 0.3, // 射速很慢
        fireRatePerLevel: 0.05,
        baseCost: 2000,
        upgradeCostMultiplier: 2.0,
        isOwned: false,
        image: '/src/assets/images/guns/juji.png' // 暂时复用狙击枪图片，如果有火箭筒图片可以替换
      } as Weapon
    },
    // 当前装备的枪械 ID
    equippedWeaponId: 'pistol'
  }),
  getters: {
    // 获取某个升级项的当前花费
    getUpgradeCost: (state) => (id: keyof typeof state.shopUpgrades) => {
      const upgrade = state.shopUpgrades[id]
      if (upgrade.level >= upgrade.maxLevel) return -1 // 已满级
      return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level))
    },
    // 获取某个升级项的当前加成值
    getUpgradeValue: (state) => (id: keyof typeof state.shopUpgrades) => {
      const upgrade = state.shopUpgrades[id]
      return upgrade.level * upgrade.valuePerLevel
    },
    // 获取枪械的当前升级花费
    getWeaponUpgradeCost: (state) => (id: keyof typeof state.weapons) => {
      const weapon = state.weapons[id]
      if (!weapon.isOwned) return weapon.baseCost // 如果未拥有，返回购买价格
      if (weapon.level >= weapon.maxLevel) return -1 // 已满级
      // 基础升级价格为购买价格的 50%
      const baseUpgradeCost = weapon.baseCost === 0 ? 100 : weapon.baseCost * 0.5
      return Math.floor(baseUpgradeCost * Math.pow(weapon.upgradeCostMultiplier, weapon.level - 1))
    },
    // 获取枪械当前伤害
    getWeaponDamage: (state) => (id: keyof typeof state.weapons) => {
      const weapon = state.weapons[id]
      return weapon.baseDamage + (Math.max(0, weapon.level - 1) * weapon.damagePerLevel)
    },
    // 获取枪械当前射速
    getWeaponFireRate: (state) => (id: keyof typeof state.weapons) => {
      const weapon = state.weapons[id]
      return weapon.baseFireRate + (Math.max(0, weapon.level - 1) * weapon.fireRatePerLevel)
    }
  },
  actions: {
    // 增加经验值
    addExp(amount: number) {
      this.exp += amount
      // 简单的升级逻辑示例
      if (this.exp >= this.level * 100) {
        this.exp -= this.level * 100
        this.level++
      }
    },
    // 增加金币
    addGold(amount: number) {
      this.gold += amount
    },
    // 更新最高存活时间
    updateMaxSurvivalTime(time: number) {
      if (time > this.maxSurvivalTime) {
        this.maxSurvivalTime = time
      }
    },
    // 重置当前游戏状态（不重置金币和最高记录，因为它们是肉鸽的局外成长部分）
    resetCurrentGame() {
      this.level = 1
      this.exp = 0
    },
    // 购买商店升级
    buyUpgrade(id: keyof typeof this.shopUpgrades) {
      const upgrade = this.shopUpgrades[id]
      const cost = this.getUpgradeCost(id)
      
      if (cost !== -1 && this.gold >= cost && upgrade.level < upgrade.maxLevel) {
        this.gold -= cost
        upgrade.level++
        return true // 购买成功
      }
      return false // 购买失败
    },
    // 购买或升级枪械
    buyOrUpgradeWeapon(id: keyof typeof this.weapons) {
      const weapon = this.weapons[id]
      const cost = this.getWeaponUpgradeCost(id)

      if (cost !== -1 && this.gold >= cost) {
        this.gold -= cost
        if (!weapon.isOwned) {
          weapon.isOwned = true
          weapon.level = 1 // 购买后初始为 1 级
        } else if (weapon.level < weapon.maxLevel) {
          weapon.level++
        }
        return true
      }
      return false
    },
    // 装备枪械
    equipWeapon(id: keyof typeof this.weapons) {
      if (this.weapons[id].isOwned) {
        this.equippedWeaponId = id
        return true
      }
      return false
    }
  },
  // 开启持久化，默认保存到 localStorage
  persist: true
})