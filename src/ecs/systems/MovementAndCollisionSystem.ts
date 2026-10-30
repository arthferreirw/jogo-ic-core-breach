import { World } from '../core/World';
import { Vec2 } from '@domain/math/Vec2';

/**
 * Integra posição física e resolve colisões contra paredes do grid com wall-sliding.
 */
export class MovementAndCollisionSystem {
  public static update(
    world: World,
    dt: number,
    isSolidCell: (cellX: number, cellY: number) => boolean
  ): void {
    const movingEntities = world.query(['transform', 'velocity', 'collider']);

    for (const entity of movingEntities) {
      const transform = world.getComponent(entity, 'transform')!;
      const velocity = world.getComponent(entity, 'velocity')!;
      const collider = world.getComponent(entity, 'collider')!;

      if (velocity.vx === 0 && velocity.vz === 0) continue;

      const radius = collider.radius;

      // Movimento no eixo X
      const nextX = transform.x + velocity.vx * dt;
      if (!this.checkCollision(nextX, transform.z, radius, isSolidCell)) {
        transform.x = nextX;
      } else {
        velocity.vx = 0; // Desliza (wall-sliding no eixo Z)
      }

      // Movimento no eixo Z
      const nextZ = transform.z + velocity.vz * dt;
      if (!this.checkCollision(transform.x, nextZ, radius, isSolidCell)) {
        transform.z = nextZ;
      } else {
        velocity.vz = 0; // Desliza (wall-sliding no eixo X)
      }
    }
  }

  private static checkCollision(
    x: number,
    z: number,
    radius: number,
    isSolidCell: (cellX: number, cellY: number) => boolean
  ): boolean {
    const minX = Math.floor(x - radius);
    const maxX = Math.floor(x + radius);
    const minZ = Math.floor(z - radius);
    const maxZ = Math.floor(z + radius);

    for (let cz = minZ; cz <= maxZ; cz++) {
      for (let cx = minX; cx <= maxX; cx++) {
        if (isSolidCell(cx, cz)) {
          // Checa colisão exata ponto mais próximo do quadrado vs círculo
          const closestX = Math.max(cx, Math.min(x, cx + 1));
          const closestZ = Math.max(cz, Math.min(z, cz + 1));

          const distSq = new Vec2(x - closestX, z - closestZ).magnitudeSquared();
          if (distSq < radius * radius) {
            return true;
          }
        }
      }
    }

    return false;
  }
}
