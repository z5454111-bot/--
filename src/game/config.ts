import mapData from '../assets/maps/first_map.json'
import type { Obstacle } from './types'

// 视口尺寸 (玩家看到的屏幕大小)
export const VIEWPORT_WIDTH = window.innerWidth
export const VIEWPORT_HEIGHT = window.innerHeight

// 游戏区域尺寸 (根据 first_map.jpg 的实际尺寸 684x456)
// 为了做成探索地图，我们将其放大 6 倍
export const SCALE = 6
export const GAME_WIDTH = 684 * SCALE
export const GAME_HEIGHT = 456 * SCALE

// 解析地图碰撞数据
// Tiled 中碰撞层的数据
const collisionLayer = mapData.layers.find((layer: any) => layer.name === 'collision')
export const obstacles: Obstacle[] = collisionLayer?.objects?.map((obj: any) => ({
  x: obj.x * SCALE,
  y: obj.y * SCALE,
  width: obj.width * SCALE,
  height: obj.height * SCALE
})) || []