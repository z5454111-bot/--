import { GAME_WIDTH, GAME_HEIGHT, obstacles } from './config'

// 矩形碰撞检测函数
export const checkCollision = (x: number, y: number, radius: number) => {
  // 检查是否超出地图边界
  if (x - radius < 0 || x + radius > GAME_WIDTH || y - radius < 0 || y + radius > GAME_HEIGHT) {
    return true
  }

  // 检查是否与障碍物碰撞
  // 将玩家视为一个矩形进行简单的 AABB 碰撞检测
  const playerRect = {
    left: x - radius,
    right: x + radius,
    top: y - radius,
    bottom: y + radius
  }

  for (const obs of obstacles) {
    const obsRect = {
      left: obs.x,
      right: obs.x + obs.width,
      top: obs.y,
      bottom: obs.y + obs.height
    }

    // 如果两个矩形相交，则发生碰撞
    if (
      playerRect.left < obsRect.right &&
      playerRect.right > obsRect.left &&
      playerRect.top < obsRect.bottom &&
      playerRect.bottom > obsRect.top
    ) {
      return true
    }
  }

  return false
}