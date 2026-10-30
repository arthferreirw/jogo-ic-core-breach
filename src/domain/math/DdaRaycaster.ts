import { Vec2 } from './Vec2';

export interface RayHit {
  cellX: number;
  cellY: number;
  distance: number;
  hitPoint: Vec2;
  normal: Vec2;
}

/**
 * Algoritmo DDA (Digital Differential Analyzer) para raycasting em grid 2.5D.
 * Determina com precisão milimétrica impactos de disparos da PULSE-9,
 * alcance do Pulso Lógico e linha de visão (LoS) da IA.
 */
export class DdaRaycaster {
  public static cast(
    origin: Vec2,
    direction: Vec2,
    maxDistance: number,
    isSolidCell: (cellX: number, cellY: number) => boolean
  ): RayHit | null {
    const dir = direction.normalize();
    if (dir.magnitudeSquared() === 0) return null;

    let mapX = Math.floor(origin.x);
    let mapY = Math.floor(origin.y);

    const deltaDistX = Math.abs(1 / (dir.x === 0 ? 1e-6 : dir.x));
    const deltaDistY = Math.abs(1 / (dir.y === 0 ? 1e-6 : dir.y));

    let stepX: number;
    let stepY: number;
    let sideDistX: number;
    let sideDistY: number;

    if (dir.x < 0) {
      stepX = -1;
      sideDistX = (origin.x - mapX) * deltaDistX;
    } else {
      stepX = 1;
      sideDistX = (mapX + 1.0 - origin.x) * deltaDistX;
    }

    if (dir.y < 0) {
      stepY = -1;
      sideDistY = (origin.y - mapY) * deltaDistY;
    } else {
      stepY = 1;
      sideDistY = (mapY + 1.0 - origin.y) * deltaDistY;
    }

    let hit = false;
    let side = 0; // 0 para vertical (X), 1 para horizontal (Y)
    let currentDist = 0;

    while (!hit && currentDist < maxDistance) {
      if (sideDistX < sideDistY) {
        currentDist = sideDistX;
        sideDistX += deltaDistX;
        mapX += stepX;
        side = 0;
      } else {
        currentDist = sideDistY;
        sideDistY += deltaDistY;
        mapY += stepY;
        side = 1;
      }

      if (currentDist > maxDistance) {
        break;
      }

      if (isSolidCell(mapX, mapY)) {
        hit = true;
      }
    }

    if (!hit) {
      return null;
    }

    const hitPoint = origin.add(dir.scale(currentDist));
    const normal = side === 0 ? new Vec2(-stepX, 0) : new Vec2(0, -stepY);

    return {
      cellX: mapX,
      cellY: mapY,
      distance: currentDist,
      hitPoint,
      normal,
    };
  }
}
