import { World } from '../core/World';
import { EntityId } from '../components/CombatComponents';
import { RegisterBank } from '@domain/hardware/RegisterBank';
import { Vec2 } from '@domain/math/Vec2';
import { DdaRaycaster } from '@domain/math/DdaRaycaster';

/**
 * Inspeciona o alvo binário (OVERFLOW ou Porta Lógica) alinhado com a mira central.
 */
export class TargetInspectionSystem {
  public static update(
    world: World,
    playerId: EntityId,
    registerBank: RegisterBank,
    isSolidCell: (cellX: number, cellY: number) => boolean
  ): void {
    const playerTransform = world.getComponent(playerId, 'transform');
    if (!playerTransform) return;

    const origin = new Vec2(playerTransform.x, playerTransform.z);
    const dir = new Vec2(Math.sin(playerTransform.yaw), Math.cos(playerTransform.yaw));

    const rayHit = DdaRaycaster.cast(origin, dir, 25.0, isSolidCell);
    const maxDist = rayHit ? rayHit.distance : 25.0;

    const lockEntities = world.query(['transform', 'binaryLock', 'collider']);
    let inspectedTarget: EntityId | null = null;
    let closestDist = maxDist;

    for (const target of lockEntities) {
      if (target === playerId) continue;

      const targetTransform = world.getComponent(target, 'transform')!;
      const targetCollider = world.getComponent(target, 'collider')!;
      const toTarget = new Vec2(targetTransform.x, targetTransform.z).sub(origin);

      const proj = toTarget.dot(dir);
      if (proj > 0 && proj < closestDist) {
        const perpDistSq = toTarget.sub(dir.scale(proj)).magnitudeSquared();
        if (perpDistSq < targetCollider.radius * targetCollider.radius) {
          inspectedTarget = target;
          closestDist = proj;
        }
      }
    }

    if (inspectedTarget !== null) {
      const lock = world.getComponent(inspectedTarget, 'binaryLock')!;
      registerBank.storeOperation(lock.mask, registerBank.getRes() || lock.mask);
    }
  }
}
