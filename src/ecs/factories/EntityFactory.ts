import { World } from '../core/World';
import { EntityId } from '../components/CombatComponents';
import { Nibble } from '@domain/hardware/Nibble';
import { PLAYER_BALANCE, ENEMY_BALANCE } from '@domain/config/GameBalance';

/**
 * Fábrica de criação de entidades por composição de componentes (Clean ECS).
 */
export class EntityFactory {
  public static createPlayer(world: World, x: number, z: number): EntityId {
    const id = world.createEntity();
    world.addComponent(id, 'transform', { x, y: 0.8, z, yaw: 0, pitch: 0 });
    world.addComponent(id, 'velocity', { vx: 0, vz: 0 });
    world.addComponent(id, 'collider', { radius: 0.4, isSolid: true });
    world.addComponent(id, 'health', {
      current: PLAYER_BALANCE.INITIAL_HP,
      max: PLAYER_BALANCE.MAX_HP,
    });
    world.addComponent(id, 'shield', {
      current: PLAYER_BALANCE.INITIAL_SHIELD,
      max: PLAYER_BALANCE.MAX_SHIELD,
    });
    world.addComponent(id, 'weapon', { cooldownTimerSec: 0 });
    world.addComponent(id, 'logicalPulse', { cooldownTimerSec: 0 });
    return id;
  }

  public static createBitling(world: World, x: number, z: number): EntityId {
    const id = world.createEntity();
    world.addComponent(id, 'transform', { x, y: 0.5, z, yaw: 0, pitch: 0 });
    world.addComponent(id, 'velocity', { vx: 0, vz: 0 });
    world.addComponent(id, 'collider', { radius: 0.5, isSolid: true });
    world.addComponent(id, 'health', {
      current: ENEMY_BALANCE.BITLING.HP,
      max: ENEMY_BALANCE.BITLING.HP,
    });
    world.addComponent(id, 'aiFsm', {
      archetype: 'BITLING',
      state: 'IDLE',
      stateTimerSec: 0,
      attackCooldownSec: 0,
    });
    return id;
  }

  public static createOverflow(world: World, x: number, z: number, shieldMask: Nibble): EntityId {
    const id = world.createEntity();
    world.addComponent(id, 'transform', { x, y: 0.8, z, yaw: 0, pitch: 0 });
    world.addComponent(id, 'velocity', { vx: 0, vz: 0 });
    world.addComponent(id, 'collider', { radius: 0.7, isSolid: true });
    world.addComponent(id, 'health', {
      current: ENEMY_BALANCE.OVERFLOW.HP,
      max: ENEMY_BALANCE.OVERFLOW.HP,
    });
    world.addComponent(id, 'binaryLock', {
      mask: shieldMask,
      active: true,
      stunTimerSec: 0,
    });
    world.addComponent(id, 'aiFsm', {
      archetype: 'OVERFLOW',
      state: 'IDLE',
      stateTimerSec: 0,
      attackCooldownSec: 0,
    });
    return id;
  }

  public static createLogicDoor(world: World, x: number, z: number, lockMask: Nibble): EntityId {
    const id = world.createEntity();
    world.addComponent(id, 'transform', { x, y: 1.0, z, yaw: 0, pitch: 0 });
    world.addComponent(id, 'collider', { radius: 1.0, isSolid: true });
    world.addComponent(id, 'binaryLock', {
      mask: lockMask,
      active: true,
      stunTimerSec: 0,
    });
    world.addComponent(id, 'doorSlide', {
      isOpen: false,
      slideProgress: 0,
      lockedByZf: true,
    });
    return id;
  }

  public static createTerminal(world: World, x: number, z: number, conceptId: string): EntityId {
    const id = world.createEntity();
    world.addComponent(id, 'transform', { x, y: 0.5, z, yaw: 0, pitch: 0 });
    world.addComponent(id, 'collider', { radius: 0.6, isSolid: false });
    world.addComponent(id, 'terminal', { conceptId, interacted: false });
    return id;
  }

  public static createPickup(
    world: World,
    x: number,
    z: number,
    type: 'HP' | 'SHLD' | 'AMMO',
    amount: number
  ): EntityId {
    const id = world.createEntity();
    world.addComponent(id, 'transform', { x, y: 0.3, z, yaw: 0, pitch: 0 });
    world.addComponent(id, 'collider', { radius: 0.4, isSolid: false });
    world.addComponent(id, 'pickup', { type, amount });
    return id;
  }
}
