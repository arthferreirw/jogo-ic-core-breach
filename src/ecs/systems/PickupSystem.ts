import { World } from '../core/World';
import { EntityId } from '../components/CombatComponents';
import { AmmoCapacitor } from '@domain/combat/AmmoCapacitor';
import { Vec2 } from '@domain/math/Vec2';
import { PLAYER_BALANCE } from '@domain/config/GameBalance';

/**
 * Coleta automática de pacotes de Vida, Escudo e Munição ao passar por cima.
 */
export class PickupSystem {
  public static update(world: World, playerId: EntityId, ammoCapacitor: AmmoCapacitor): void {
    const playerTransform = world.getComponent(playerId, 'transform');
    const playerHealth = world.getComponent(playerId, 'health');
    const playerShield = world.getComponent(playerId, 'shield');
    if (!playerTransform || !playerHealth || !playerShield) return;

    const playerPos = new Vec2(playerTransform.x, playerTransform.z);
    const pickups = world.query(['transform', 'pickup', 'collider']);

    for (const p of pickups) {
      const pTransform = world.getComponent(p, 'transform')!;
      const pickup = world.getComponent(p, 'pickup')!;

      const dist = playerPos.distanceTo(new Vec2(pTransform.x, pTransform.z));
      if (dist < 1.2) {
        let collected = false;

        if (pickup.type === 'HP' && playerHealth.current < PLAYER_BALANCE.MAX_HP) {
          playerHealth.current = Math.min(
            PLAYER_BALANCE.MAX_HP,
            playerHealth.current + pickup.amount
          );
          collected = true;
        } else if (
          pickup.type === 'SHLD' &&
          playerShield.current < PLAYER_BALANCE.MAX_SHIELD
        ) {
          playerShield.current = Math.min(
            PLAYER_BALANCE.MAX_SHIELD,
            playerShield.current + pickup.amount
          );
          collected = true;
        } else if (
          pickup.type === 'AMMO' &&
          ammoCapacitor.getCurrentAmmo() < ammoCapacitor.getMaxAmmo()
        ) {
          ammoCapacitor.addAmmo(pickup.amount);
          collected = true;
        }

        if (collected) {
          world.destroyEntity(p);
        }
      }
    }
  }
}
