import { World } from '../core/World';
import { EntityId } from '../components/CombatComponents';
import { AluEngine } from '@domain/hardware/AluEngine';
import { RegisterBank } from '@domain/hardware/RegisterBank';
import { InstructionCycleTracker } from '@domain/hardware/InstructionCycleTracker';
import { ScoreLedger } from '@domain/combat/ScoreLedger';
import { Vec2 } from '@domain/math/Vec2';
import { DdaRaycaster } from '@domain/math/DdaRaycaster';
import { LOGICAL_PULSE_BALANCE } from '@domain/config/GameBalance';
import { EventBus } from '@app/events/EventBus';
import { IAudioPort } from '@app/ports/IAudioPort';

/**
 * Sistema do Pulso Lógico XOR (RN-01, RN-02, RF-15).
 */
export class LogicalPulseSystem {
  public static update(
    world: World,
    dt: number,
    playerId: EntityId,
    triggerPulse: boolean,
    aluEngine: AluEngine,
    registerBank: RegisterBank,
    cycleTracker: InstructionCycleTracker,
    scoreLedger: ScoreLedger,
    eventBus: EventBus,
    isSolidCell: (cellX: number, cellY: number) => boolean,
    audioPort?: IAudioPort
  ): void {
    const playerTransform = world.getComponent(playerId, 'transform');
    const logicalPulse = world.getComponent(playerId, 'logicalPulse');
    if (!playerTransform || !logicalPulse) return;

    if (logicalPulse.cooldownTimerSec > 0) {
      logicalPulse.cooldownTimerSec = Math.max(0, logicalPulse.cooldownTimerSec - dt);
    }

    if (triggerPulse && logicalPulse.cooldownTimerSec <= 0) {
      logicalPulse.cooldownTimerSec = LOGICAL_PULSE_BALANCE.COOLDOWN_SEC;
      audioPort?.playLogicalPulse();
      cycleTracker.startCycle();

      const origin = new Vec2(playerTransform.x, playerTransform.z);
      const dir = new Vec2(Math.sin(playerTransform.yaw), Math.cos(playerTransform.yaw));

      const rayHit = DdaRaycaster.cast(origin, dir, LOGICAL_PULSE_BALANCE.MAX_RANGE, isSolidCell);
      const maxDist = rayHit ? rayHit.distance : LOGICAL_PULSE_BALANCE.MAX_RANGE;

      // Localiza o alvo lógico (Inimigo OVERFLOW com escudo ou Porta Lógica)
      const lockEntities = world.query(['transform', 'binaryLock', 'collider']);
      let closestTarget: EntityId | null = null;
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
            closestTarget = target;
            closestDist = proj;
          }
        }
      }

      if (closestTarget !== null) {
        const binaryLock = world.getComponent(closestTarget, 'binaryLock')!;
        const regA = registerBank.getRegA();
        const regB = binaryLock.mask;

        // Executa a operação real de XOR na ULA
        const operationResult = aluEngine.execute(regA, regB);
        registerBank.storeOperation(regB, operationResult.result);

        eventBus.publish('ALU_OPERATION_EXECUTED', {
          operandA: regA.toBinaryString(),
          operandB: regB.toBinaryString(),
          result: operationResult.result.toBinaryString(),
          zeroFlag: operationResult.zeroFlag,
        });

        if (operationResult.zeroFlag) {
          // Zero Flag = 1: Sobrecarga imediata (anulação total)
          audioPort?.playZeroFlagOverload();
          scoreLedger.recordLogicalEfficiencyBonus();
          binaryLock.active = false;
          binaryLock.mask = operationResult.result;
          binaryLock.stunTimerSec = LOGICAL_PULSE_BALANCE.STUN_DURATION_SEC;

          const door = world.getComponent(closestTarget, 'doorSlide');
          if (door) {
            door.lockedByZf = false;
            door.isOpen = true;
            audioPort?.playDoorSlide();
          }
        } else {
          // Mutação parcial de bits
          binaryLock.mask = operationResult.result;
        }
      }
    }
  }
}
