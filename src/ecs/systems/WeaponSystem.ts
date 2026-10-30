import { World } from '../core/World';
import { EntityId } from '../components/CombatComponents';
import { AmmoCapacitor } from '@domain/combat/AmmoCapacitor';
import { DamageCalculator } from '@domain/combat/DamageCalculator';
import { ScoreLedger } from '@domain/combat/ScoreLedger';
import { Vec2 } from '@domain/math/Vec2';
import { DdaRaycaster } from '@domain/math/DdaRaycaster';
import { WEAPON_BALANCE } from '@domain/config/GameBalance';
import { IAudioPort } from '@app/ports/IAudioPort';
import { IRenderPort } from '@app/ports/IRenderPort';

/**
 * Sistema de disparo da arma balística PULSE-9 (RF-09, RF-10, RN-03).
 */
export class WeaponSystem {
  public static update(
    world: World,
    dt: number,
    playerId: EntityId,
    triggerFire: boolean,
    ammoCapacitor: AmmoCapacitor,
    scoreLedger: ScoreLedger,
    isSolidCell: (cellX: number, cellY: number) => boolean,
    audioPort?: IAudioPort,
    renderPort?: IRenderPort
  ): void {
    const playerTransform = world.getComponent(playerId, 'transform');
    const weapon = world.getComponent(playerId, 'weapon');
    if (!playerTransform || !weapon) return;

    if (weapon.cooldownTimerSec > 0) {
      weapon.cooldownTimerSec = Math.max(0, weapon.cooldownTimerSec - dt);
    }

    ammoCapacitor.update(dt);

    if (triggerFire && weapon.cooldownTimerSec <= 0) {
      if (!ammoCapacitor.consumeShot()) {
        return; // Sem munição
      }

      weapon.cooldownTimerSec = 1 / WEAPON_BALANCE.FIRE_RATE_PER_SEC;
      audioPort?.playPistolShot();
      renderPort?.triggerMuzzleFlash();

      // Traça o tiro a partir da mira central
      const origin = new Vec2(playerTransform.x, playerTransform.z);
      const dir = new Vec2(Math.sin(playerTransform.yaw), Math.cos(playerTransform.yaw));

      const rayHit = DdaRaycaster.cast(origin, dir, 50, isSolidCell);
      const maxDist = rayHit ? rayHit.distance : 50;

      // Testa acerto com inimigos no raio de alcance
      const enemies = world.query(['transform', 'health', 'collider']);
      let closestEnemy: EntityId | null = null;
      let closestEnemyDist = maxDist;

      for (const enemy of enemies) {
        if (enemy === playerId) continue;

        const enemyTransform = world.getComponent(enemy, 'transform')!;
        const enemyCollider = world.getComponent(enemy, 'collider')!;
        const toEnemy = new Vec2(enemyTransform.x, enemyTransform.z).sub(origin);

        const projection = toEnemy.dot(dir);
        if (projection > 0 && projection < closestEnemyDist) {
          const perpDistSq = toEnemy.sub(dir.scale(projection)).magnitudeSquared();
          if (perpDistSq < enemyCollider.radius * enemyCollider.radius) {
            closestEnemy = enemy;
            closestEnemyDist = projection;
          }
        }
      }

      if (closestEnemy !== null) {
        const enemyHealth = world.getComponent(closestEnemy, 'health')!;
        const binaryLock = world.getComponent(closestEnemy, 'binaryLock');
        const hasActiveShield = Boolean(binaryLock?.active);

        const damage = DamageCalculator.calculateBallisticDamageToEnemy(
          WEAPON_BALANCE.PULSE9_DAMAGE,
          hasActiveShield
        );

        if (hasActiveShield) {
          audioPort?.playShieldDeflect();
        }

        enemyHealth.current = Math.max(0, enemyHealth.current - damage);
        const enemyTransform = world.getComponent(closestEnemy, 'transform')!;
        renderPort?.triggerImpactFlash(enemyTransform.x, enemyTransform.y, enemyTransform.z);

        if (enemyHealth.current <= 0) {
          audioPort?.playEnemyDeath();
          const aiFsm = world.getComponent(closestEnemy, 'aiFsm');
          if (aiFsm) {
            scoreLedger.recordEnemyDefeated(aiFsm.archetype);
          }
          world.destroyEntity(closestEnemy);
        }
      } else if (rayHit) {
        renderPort?.triggerImpactFlash(rayHit.hitPoint.x, 1.0, rayHit.hitPoint.y);
      }
    }
  }
}
