import { Vec2 } from './Vec2';

/**
 * Resolução de colisões e deslizamento em paredes (wall-sliding).
 */
export class CollisionMath {
  /**
   * Calcula a projeção do vetor de velocidade ao longo da superfície da parede.
   * v_slide = v - (v . n) * n
   */
  public static calculateSlideVelocity(velocity: Vec2, wallNormal: Vec2): Vec2 {
    const normal = wallNormal.normalize();
    const dot = velocity.dot(normal);

    // Se o vetor aponta para fora da parede, não precisa deslizar
    if (dot >= 0) {
      return velocity;
    }

    return velocity.sub(normal.scale(dot));
  }

  /**
   * Testa colisão círculo vs círculo no plano horizontal.
   */
  public static testCircleCircle(
    posA: Vec2,
    radiusA: number,
    posB: Vec2,
    radiusB: number
  ): boolean {
    const distSq = posA.sub(posB).magnitudeSquared();
    const radiusSum = radiusA + radiusB;
    return distSq < radiusSum * radiusSum;
  }
}
