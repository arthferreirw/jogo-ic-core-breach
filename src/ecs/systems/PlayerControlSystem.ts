import { World } from '../core/World';
import { EntityId } from '../components/CombatComponents';
import { InputSnapshot } from '@app/ports/IInputPort';
import { Vec2 } from '@domain/math/Vec2';
import { AngleMath } from '@domain/math/AngleMath';
import { PLAYER_BALANCE } from '@domain/config/GameBalance';

/**
 * Traduz o snapshot de input do jogador em rotação de câmera e velocidade linear normalizada.
 */
export class PlayerControlSystem {
  public static update(
    world: World,
    playerId: EntityId,
    input: InputSnapshot,
    sensitivity: number = 0.0022
  ): void {
    const transform = world.getComponent(playerId, 'transform');
    const velocity = world.getComponent(playerId, 'velocity');
    if (!transform || !velocity) return;

    // Rotação da Câmera (Mouse Look)
    transform.yaw = AngleMath.wrapYaw(transform.yaw + input.deltaMouseX * sensitivity);
    transform.pitch = AngleMath.clampPitch(
      transform.pitch - input.deltaMouseY * sensitivity,
      PLAYER_BALANCE.PITCH_LIMIT_DEG
    );

    // Movimentação WASD relativa ao Yaw da câmera
    let forward = 0;
    let strafe = 0;

    if (input.moveForward) forward += 1;
    if (input.moveBackward) forward -= 1;
    if (input.moveRight) strafe += 1;
    if (input.moveLeft) strafe -= 1;

    const inputVec = new Vec2(strafe, forward).normalize();

    if (inputVec.magnitudeSquared() > 0) {
      // Projeta o vetor relativo à rotação da câmera (Yaw)
      const sin = Math.sin(transform.yaw);
      const cos = Math.cos(transform.yaw);

      const vx = (inputVec.x * cos + inputVec.y * sin) * PLAYER_BALANCE.SPEED;
      const vz = (-inputVec.x * sin + inputVec.y * cos) * PLAYER_BALANCE.SPEED;

      velocity.vx = vx;
      velocity.vz = vz;
    } else {
      velocity.vx = 0;
      velocity.vz = 0;
    }
  }
}
