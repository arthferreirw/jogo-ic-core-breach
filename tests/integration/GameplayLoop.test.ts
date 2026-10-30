import { describe, it, expect, vi } from 'vitest';
import { World } from '@ecs/core/World';
import { EntityFactory } from '@ecs/factories/EntityFactory';
import { MvpSectorBlueprint, CellType } from '@domain/level/MvpSectorBlueprint';
import { AluEngine } from '@domain/hardware/AluEngine';
import { XorGateStrategy } from '@domain/hardware/XorGateStrategy';
import { RegisterBank } from '@domain/hardware/RegisterBank';
import { InstructionCycleTracker } from '@domain/hardware/InstructionCycleTracker';
import { AmmoCapacitor } from '@domain/combat/AmmoCapacitor';
import { ScoreLedger } from '@domain/combat/ScoreLedger';
import { CodexTracker } from '@domain/education/CodexTracker';
import { EventBus } from '@app/events/EventBus';
import { GameStateMachine, GameState } from '@app/state/GameStateMachine';
import { GameLoop } from '@app/loop/GameLoop';
import { Nibble } from '@domain/hardware/Nibble';

// Sistemas ECS
import { PlayerControlSystem } from '@ecs/systems/PlayerControlSystem';
import { MovementAndCollisionSystem } from '@ecs/systems/MovementAndCollisionSystem';
import { WeaponSystem } from '@ecs/systems/WeaponSystem';
import { LogicalPulseSystem } from '@ecs/systems/LogicalPulseSystem';
import { AiFsmSystem } from '@ecs/systems/AiFsmSystem';
import { InteractionAndDoorSystem } from '@ecs/systems/InteractionAndDoorSystem';
import { PickupSystem } from '@ecs/systems/PickupSystem';
import { RenderSyncSystem } from '@ecs/systems/RenderSyncSystem';

// Mocks agnósticos de portas
import { IRenderPort } from '@app/ports/IRenderPort';
import { IAudioPort } from '@app/ports/IAudioPort';
import { InputSnapshot } from '@app/ports/IInputPort';

describe('Integration: Multi-frame Gameplay Loop, Combat & Session Reset', () => {
  const mockRenderPort: IRenderPort = {
    init: vi.fn().mockResolvedValue(undefined),
    buildLevel: vi.fn(),
    syncEntities: vi.fn(),
    render: vi.fn(),
    triggerMuzzleFlash: vi.fn(),
    triggerImpactFlash: vi.fn(),
    triggerPlayerDamageFlash: vi.fn(),
    reset: vi.fn(),
    dispose: vi.fn(),
  };

  const mockAudioPort: IAudioPort = {
    playPistolShot: vi.fn(),
    playLogicalPulse: vi.fn(),
    playZeroFlagOverload: vi.fn(),
    playShieldDeflect: vi.fn(),
    playPlayerHurt: vi.fn(),
    playEnemyDeath: vi.fn(),
    playDoorSlide: vi.fn(),
    playTerminalAccess: vi.fn(),
    playVictory: vi.fn(),
    setMuted: vi.fn(),
    isMuted: vi.fn().mockReturnValue(false),
  };

  it('deve executar o loop completo de combate, quebra de escudo XOR e reset de partida em memória', () => {
    const world = new World();
    const blueprint = MvpSectorBlueprint.create();
    const aluEngine = new AluEngine(new XorGateStrategy());
    const registerBank = new RegisterBank([Nibble.fromBinaryString('1010')]);
    const cycleTracker = new InstructionCycleTracker(250);
    const ammoCapacitor = new AmmoCapacitor();
    const scoreLedger = new ScoreLedger();
    const codexTracker = new CodexTracker();
    const eventBus = new EventBus();
    const fsm = new GameStateMachine();

    const isSolidCell = (cx: number, cy: number): boolean => {
      const row = blueprint.grid[cy];
      if (!row) return true;
      return row[cx] === CellType.WALL;
    };

    function setupSession() {
      world.clear();
      registerBank.reset();
      ammoCapacitor.reset();
      scoreLedger.reset();
      codexTracker.reset();

      const playerId = EntityFactory.createPlayer(world, 5.5, 3.0);
      const overflow = EntityFactory.createOverflow(world, 5.5, 7.0, Nibble.fromBinaryString('1010'));
      const door = EntityFactory.createLogicDoor(world, 5.5, 15.0, Nibble.fromBinaryString('1010'));

      return { playerId, overflow, door };
    }

    let { playerId, overflow, door } = setupSession();
    fsm.transitionTo(GameState.MAIN_MENU);
    fsm.transitionTo(GameState.PLAYING);

    const input: InputSnapshot = {
      moveForward: false,
      moveBackward: false,
      moveLeft: false,
      moveRight: false,
      deltaMouseX: 0,
      deltaMouseY: 0,
      fireWeapon: false,
      fireLogicalPulse: true, // Aciona o pulso XOR
      cycleRegister: false,
      interact: false,
      toggleCodex: false,
    };

    const loop = new GameLoop(
      (dt) => {
        PlayerControlSystem.update(world, playerId, input);
        MovementAndCollisionSystem.update(world, dt, isSolidCell);
        WeaponSystem.update(
          world,
          dt,
          playerId,
          input.fireWeapon,
          ammoCapacitor,
          scoreLedger,
          isSolidCell,
          mockAudioPort,
          mockRenderPort
        );
        LogicalPulseSystem.update(
          world,
          dt,
          playerId,
          input.fireLogicalPulse,
          aluEngine,
          registerBank,
          cycleTracker,
          scoreLedger,
          eventBus,
          isSolidCell,
          mockAudioPort
        );
        AiFsmSystem.update(world, dt, playerId, isSolidCell, mockAudioPort, mockRenderPort);
        InteractionAndDoorSystem.update(
          world,
          dt,
          playerId,
          input.interact,
          codexTracker,
          eventBus,
          mockAudioPort
        );
        PickupSystem.update(world, playerId, ammoCapacitor);
        RenderSyncSystem.update(world, playerId, mockRenderPort);
      },
      () => {
        mockRenderPort.render();
      }
    );

    // 1. Simula disparo do Pulso XOR: REG_A (1010) XOR OVERFLOW (1010) = 0000 (ZF=1)
    loop.stepManual(1 / 60);

    const overflowLock = world.getComponent(overflow, 'binaryLock');
    expect(overflowLock?.mask.toBinaryString()).toBe('0000');
    expect(overflowLock?.active).toBe(false); // Escudo quebrado
    expect(overflowLock?.stunTimerSec).toBeGreaterThan(0); // Inimigo atordoado
    expect(mockAudioPort.playZeroFlagOverload).toHaveBeenCalled();
    expect(scoreLedger.getCurrentScore()).toBe(150); // Bônus de eficiência lógica

    // 2. Simula disparo balístico da PULSE-9 contra o inimigo atordoado
    input.fireLogicalPulse = false;
    input.fireWeapon = true;

    // Dispara 5 vezes para derrotar os 100 HP do OVERFLOW (20 dano por tiro desprotegido)
    for (let i = 0; i < 5; i++) {
      loop.stepManual(0.26); // Intervalo de cadência
    }

    expect(world.isAlive(overflow)).toBe(false); // Inimigo eliminado
    expect(mockAudioPort.playEnemyDeath).toHaveBeenCalled();
    expect(scoreLedger.getCurrentScore()).toBe(450); // 150 bônus + 300 OVERFLOW

    // 3. Testa reinício limpo de sessão em memória sem vazamentos
    for (let resetCount = 0; resetCount < 5; resetCount++) {
      const session = setupSession();
      playerId = session.playerId;
      overflow = session.overflow;
      door = session.door;

      expect(world.isAlive(playerId)).toBe(true);
      expect(world.isAlive(overflow)).toBe(true);
      expect(scoreLedger.getCurrentScore()).toBe(0);
    }
  });
});
