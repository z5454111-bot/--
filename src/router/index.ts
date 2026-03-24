import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// 定义路由
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    // 懒加载主页组件
    component: () => import('../views/Home.vue')
  },
  {
    path: '/game',
    name: 'Game',
    // 懒加载游戏组件
    component: () => import('../views/Game.vue')
  },
  {
    path: '/shop',
    name: 'Shop',
    // 懒加载商店组件
    component: () => import('../views/Shop.vue')
  },
  {
    path: '/achievement',
    name: 'Achievement',
    // 懒加载成就组件
    component: () => import('../views/Achievement.vue')
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router