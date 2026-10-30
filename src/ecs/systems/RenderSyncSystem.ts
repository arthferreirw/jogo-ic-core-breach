import { World } from '../core/World';
import { EntityId } from '../components/CombatComponents';
import { IRenderPort, RenderEntityState } from '@app/ports/IRenderPort';

/**
 * Traduz o estado puro das entidades ECS para a interface agnóstica de renderização IRenderPort.
 */
export class RenderSyncSystem {
  public static update(world: World, playerId: EntityId, renderPort: IRenderPort): void {
    const states: RenderEntityState[] = [];

    // 1. Jogador (Câmera)
    const playerT = world.getComponent(playerId, 'transform');
    if (playerT) {
      states.push({
        id: playerId,
        x: playerT.x,
        y: playerT.y,
        z: playerT.z,
        yaw: playerT.yaw,
        pitch: playerT.pitch,
        type: 'PLAYER',
      });
    }

    // 2. Inimigos
    const enemies = world.query(['transform', 'aiFsm']);
    for (const enemy of enemies) {
      const t = world.getComponent(enemy, 'transform')!;
      const ai = world.getComponent(enemy, 'aiFsm')!;
      const lock = world.getComponent(enemy, 'binaryLock');

      states.push({
        id: enemy,
        x: t.x,
        y: t.y,
        z: t.z,
        yaw: t.yaw,
        pitch: t.pitch,
        type: ai.archetype,
        isStunned: ai.state === 'STUNNED',
        hasShield: Boolean(lock?.active),
        shieldMask: lock?.mask.toBinaryString(),
      });
    }

    // 3. Portas
    const doors = world.query(['transform', 'doorSlide']);
    for (const door of doors) {
      const t = world.getComponent(door, 'transform')!;
      const slide = world.getComponent(door, 'doorSlide')!;
      const lock = world.getComponent(door, 'binaryLock');

      states.push({
        id: door,
        x: t.x,
        y: t.y,
        z: t.z,
        yaw: t.yaw,
        pitch: t.pitch,
        type: 'DOOR',
        slideProgress: slide.slideProgress,
        shieldMask: lock?.mask.toBinaryString(),
      });
    }

    // 4. Terminais
    const terminals = world.query(['transform', 'terminal']);
    for (const term of terminals) {
      const t = world.getComponent(term, 'transform')!;
      const data = world.getComponent(term, 'terminal')!;

      states.push({
        id: term,
        x: t.x,
        y: t.y,
        z: t.z,
        yaw: t.yaw,
        pitch: t.pitch,
        type: 'TERMINAL',
        subtype: data.conceptId,
      });
    }

    // 5. Pickups
    const pickups = world.query(['transform', 'pickup']);
    for (const p of pickups) {
      const t = world.getComponent(p, 'transform')!;
      const data = world.getComponent(p, 'pickup')!;

      states.push({
        id: p,
        x: t.x,
        y: t.y,
        z: t.z,
        yaw: t.yaw,
        pitch: t.pitch,
        type: 'PICKUP',
        subtype: data.type,
      });
    }

    renderPort.syncEntities(states);
  }
}
