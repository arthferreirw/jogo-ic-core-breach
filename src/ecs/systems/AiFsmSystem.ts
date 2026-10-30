import { World } from '../core/World';
import { EntityId } from '../components/CombatComponents';
import { Vec2 } from '@domain/math/Vec2';
import { DdaRaycaster } from '@domain/math/DdaRaycaster';
import { ENEMY_BALANCE } from '@domain/config/GameBalance';
import { DamageCalculator } from '@domain/combat/DamageCalculator';
import { IAudioPort } from '@app/ports/IAudioPort';
import { IRenderPort } from '@app/ports/IRenderPort';

/**
 * Inteligência Artificial dos inimigos (FSM com verificação de LoS via DDA).
 */
export class AiFsmSystem {
  public static update(
    world: World,
    dt: number,
    playerId: EntityId,
    isSolidCell: (cellX: number, cellY: number) => boolean,
    audioPort?: IAudioPort,
    renderPort?: IRenderPort
  ): void {
    const playerTransform = world.getComponent(playerId, 'transform');
    const playerHealth = world.getComponent(playerId, 'health');
    const playerShield = world.getComponent(playerId, 'shield');
    if (!playerTransform || !playerHealth || !playerShield) return;

    const playerPos = new Vec2(playerTransform.x, playerTransform.z);
    const enemies = world.query(['transform', 'velocity', 'aiFsm']);

    for (const enemy of enemies) {
      const transform = world.getComponent(enemy, 'transform')!;
      const velocity = world.getComponent(enemy, 'velocity')!;
      const ai = world.getComponent(enemy, 'aiFsm')!;
      const binaryLock = world.getComponent(enemy, 'binaryLock');

      // Se estiver atordoado por sobrecarga ZF=1 do Pulso XOR
      if (binaryLock && binaryLock.stunTimerSec > 0) {
        binaryLock.stunTimerSec = Math.max(0, binaryLock.stunTimerSec - dt);
        velocity.vx = 0;
        velocity.vz = 0;
        ai.state = 'STUNNED';
        continue;
      }

      if (ai.state === 'STUNNED') {
        ai.state = 'CHASE';
      }

      if (ai.attackCooldownSec > 0) {
        ai.attackCooldownSec = Math.max(0, ai.attackCooldownSec - dt);
      }

      const enemyPos = new Vec2(transform.x, transform.z);
      const toPlayer = playerPos.sub(enemyPos);
      const distance = toPlayer.magnitude();

      // Checa linha de visão (LoS)
      const rayHit = DdaRaycaster.cast(enemyPos, toPlayer, distance, isSolidCell);
      const hasLoS = !rayHit; // Sem parede bloqueando

      if (ai.archetype === 'BITLING') {
        const stats = ENEMY_BALANCE.BITLING;

        if (distance <= 15.0 && hasLoS) {
          ai.state = 'CHASE';
          if (distance > stats.ATTACK_RANGE) {
            const dir = toPlayer.normalize();
            velocity.vx = dir.x * stats.SPEED;
            velocity.vz = dir.y * stats.SPEED;
          } else {
            // Em alcance de ataque corpo a corpo
            velocity.vx = 0;
            velocity.vz = 0;
            ai.state = 'ATTACK';

            if (ai.attackCooldownSec <= 0) {
              ai.attackCooldownSec = stats.ATTACK_INTERVAL_SEC;
              const dmgResult = DamageCalculator.applyDamageToPlayer(
                playerHealth.current,
                playerShield.current,
                stats.ATTACK_DAMAGE
              );
              playerHealth.current = dmgResult.hp;
              playerShield.current = dmgResult.shield;
              audioPort?.playPlayerHurt();
              renderPort?.triggerPlayerDamageFlash();
            }
          }
        } else {
          ai.state = 'IDLE';
          velocity.vx = 0;
          velocity.vz = 0;
        }
      } else if (ai.archetype === 'OVERFLOW') {
        const stats = ENEMY_BALANCE.OVERFLOW;

        if (distance <= stats.ATTACK_RANGE && hasLoS) {
          ai.state = 'CHASE';
          if (distance > 8.0) {
            // Mantém distância média de combate
            const dir = toPlayer.normalize();
            velocity.vx = dir.x * stats.SPEED;
            velocity.vz = dir.y * stats.SPEED;
          } else {
            velocity.vx = 0;
            velocity.vz = 0;
            ai.state = 'ATTACK';

            if (ai.attackCooldownSec <= 0) {
              ai.attackCooldownSec = stats.ATTACK_INTERVAL_SEC;
              // Projétil de plasma atinge jogador
              const dmgResult = DamageCalculator.applyDamageToPlayer(
                playerHealth.current,
                playerShield.current,
                stats.ATTACK_DAMAGE
              );
              playerHealth.current = dmgResult.hp;
              playerShield.current = dmgResult.shield;
              audioPort?.playPlayerHurt();
              renderPort?.triggerPlayerDamageFlash();
            }
          }
        } else {
          ai.state = 'IDLE';
          velocity.vx = 0;
          velocity.vz = 0;
        }
      }
    }
  }
}
