import { World } from '../core/World';
import { EntityId } from '../components/CombatComponents';
import { CodexTracker } from '@domain/education/CodexTracker';
import { PEDAGOGICAL_CATALOG } from '@domain/config/PedagogicalCatalog';
import { Vec2 } from '@domain/math/Vec2';
import { EventBus } from '@app/events/EventBus';
import { IAudioPort } from '@app/ports/IAudioPort';

/**
 * Sistema de interação com terminais de dados [E] e portas deslizantes.
 */
export class InteractionAndDoorSystem {
  public static update(
    world: World,
    dt: number,
    playerId: EntityId,
    triggerInteract: boolean,
    codexTracker: CodexTracker,
    eventBus: EventBus,
    audioPort?: IAudioPort
  ): void {
    const playerTransform = world.getComponent(playerId, 'transform');
    if (!playerTransform) return;

    const playerPos = new Vec2(playerTransform.x, playerTransform.z);

    // 1. Atualiza animação de portas deslizantes
    const doors = world.query(['doorSlide', 'collider']);
    for (const door of doors) {
      const slide = world.getComponent(door, 'doorSlide')!;
      const collider = world.getComponent(door, 'collider')!;

      if (slide.isOpen && slide.slideProgress < 1.0) {
        slide.slideProgress = Math.min(1.0, slide.slideProgress + dt * 2.0); // 0.5s para abrir
        if (slide.slideProgress >= 0.8) {
          collider.isSolid = false; // Desativa colisão física para permitir passagem
        }
      }
    }

    // 2. Interação com terminais
    if (triggerInteract) {
      const terminals = world.query(['transform', 'terminal']);
      for (const terminal of terminals) {
        const tTransform = world.getComponent(terminal, 'transform')!;
        const comp = world.getComponent(terminal, 'terminal')!;

        const dist = playerPos.distanceTo(new Vec2(tTransform.x, tTransform.z));
        if (dist <= 2.5) {
          const isFirstTime = codexTracker.discoverConcept(comp.conceptId);
          comp.interacted = true;
          audioPort?.playTerminalAccess();

          if (isFirstTime) {
            const data = PEDAGOGICAL_CATALOG[comp.conceptId];
            if (data) {
              eventBus.publish('CONCEPT_DISCOVERED', {
                conceptId: data.id,
                title: data.title,
                shortToast: data.shortToast,
              });
            }
          }
          break;
        }
      }
    }
  }
}
