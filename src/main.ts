import { World } from '@ecs/core/World';
import { EntityFactory } from '@ecs/factories/EntityFactory';
import { EntityId } from '@ecs/components/CombatComponents';
import { MvpSectorBlueprint, CellType } from '@domain/level/MvpSectorBlueprint';
import { Nibble } from '@domain/hardware/Nibble';
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

// Sistemas ECS
import { PlayerControlSystem } from '@ecs/systems/PlayerControlSystem';
import { MovementAndCollisionSystem } from '@ecs/systems/MovementAndCollisionSystem';
import { WeaponSystem } from '@ecs/systems/WeaponSystem';
import { LogicalPulseSystem } from '@ecs/systems/LogicalPulseSystem';
import { AiFsmSystem } from '@ecs/systems/AiFsmSystem';
import { InteractionAndDoorSystem } from '@ecs/systems/InteractionAndDoorSystem';
import { PickupSystem } from '@ecs/systems/PickupSystem';
import { TargetInspectionSystem } from '@ecs/systems/TargetInspectionSystem';
import { RenderSyncSystem } from '@ecs/systems/RenderSyncSystem';

// Adaptadores de Infraestrutura
import { BabylonRenderAdapter } from '@infra/babylon/BabylonRenderAdapter';
import { BrowserInputAdapter } from '@infra/input/BrowserInputAdapter';
import { WebAudioSynthAdapter } from '@infra/audio/WebAudioSynthAdapter';

// Apresentadores UI
import { HudPresenter } from '@presentation/ui/HudPresenter';

/**
 * Ponto de entrada e Composition Root da aplicação.
 */
async function bootstrap() {
  const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
  const menuModal = document.getElementById('menuModal')!;
  const debriefModal = document.getElementById('debriefModal')!;
  const btnNewGame = document.getElementById('btnNewGame')!;
  const btnRestart = document.getElementById('btnRestart')!;

  // 1. Núcleo Lógico e Hardware do Domínio
  const aluEngine = new AluEngine(new XorGateStrategy());
  const registerBank = new RegisterBank([
    Nibble.fromBinaryString('1010'),
    Nibble.fromBinaryString('1100'),
  ]);
  const cycleTracker = new InstructionCycleTracker(250);
  const ammoCapacitor = new AmmoCapacitor();
  const scoreLedger = new ScoreLedger();
  const codexTracker = new CodexTracker();
  const eventBus = new EventBus();
  const fsm = new GameStateMachine();

  // 2. Kernel ECS
  const world = new World();
  let playerId: EntityId = 0;

  // 3. Adaptadores
  const renderAdapter = new BabylonRenderAdapter();
  await renderAdapter.init(canvas);

  const audioAdapter = new WebAudioSynthAdapter();
  const inputAdapter = new BrowserInputAdapter(() => {
    if (fsm.getCurrentState() === GameState.PLAYING) {
      fsm.transitionTo(GameState.PAUSED);
    }
  });
  inputAdapter.bindCanvas(canvas);

  // 4. Apresentador de UI
  const hudPresenter = new HudPresenter(eventBus, registerBank);

  // 5. Constrói Nível a partir do Blueprint
  const blueprint = MvpSectorBlueprint.create();
  const isSolidCell = (cx: number, cy: number): boolean => {
    const row = blueprint.grid[cy];
    if (!row) return true;
    const cell = row[cx];
    return cell === CellType.WALL;
  };

  function initSession() {
    world.clear();
    registerBank.reset();
    ammoCapacitor.reset();
    scoreLedger.reset();
    codexTracker.reset();

    // Spawna jogador
    playerId = EntityFactory.createPlayer(world, blueprint.playerSpawn.x, blueprint.playerSpawn.z);

    // Spawna inimigos
    for (const e of blueprint.enemies) {
      if (e.archetype === 'BITLING') {
        EntityFactory.createBitling(world, e.x, e.z);
      } else if (e.archetype === 'OVERFLOW' && e.shieldMask) {
        EntityFactory.createOverflow(world, e.x, e.z, e.shieldMask);
      }
    }

    // Spawna portas
    for (const d of blueprint.doors) {
      EntityFactory.createLogicDoor(world, d.x, d.z, d.lockMask);
    }

    // Spawna terminais
    for (const t of blueprint.terminals) {
      EntityFactory.createTerminal(world, t.x, t.z, t.conceptId);
    }

    // Spawna pickups
    for (const p of blueprint.pickups) {
      EntityFactory.createPickup(world, p.x, p.z, p.type, p.amount);
    }

    renderAdapter.buildLevel(blueprint.grid, blueprint.width, blueprint.height);
  }

  initSession();

  // 6. Loop de Jogo
  const loop = new GameLoop(
    (dt) => {
      if (fsm.getCurrentState() !== GameState.PLAYING) return;

      const input = inputAdapter.getSnapshot();

      // Cicla registradores
      if (input.cycleRegister) {
        registerBank.cycleRegA();
        hudPresenter.updateRegA();
      }

      // Sistemas em ordem determinística
      PlayerControlSystem.update(world, playerId, input);
      MovementAndCollisionSystem.update(world, dt, isSolidCell);
      TargetInspectionSystem.update(world, playerId, registerBank, isSolidCell);
      WeaponSystem.update(
        world,
        dt,
        playerId,
        input.fireWeapon,
        ammoCapacitor,
        scoreLedger,
        isSolidCell,
        audioAdapter,
        renderAdapter
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
        audioAdapter
      );
      AiFsmSystem.update(world, dt, playerId, isSolidCell, audioAdapter, renderAdapter);
      InteractionAndDoorSystem.update(
        world,
        dt,
        playerId,
        input.interact,
        codexTracker,
        eventBus,
        audioAdapter
      );
      PickupSystem.update(world, playerId, ammoCapacitor);

      cycleTracker.update(dt * 1000);
      hudPresenter.updateCycleStage(cycleTracker.getCurrentStage());

      const pulseComp = world.getComponent(playerId, 'logicalPulse');
      hudPresenter.updatePulseCooldown(pulseComp?.cooldownTimerSec || 0);

      // Distância do Núcleo
      const playerT = world.getComponent(playerId, 'transform')!;
      const distToCore = Math.hypot(
        blueprint.coreTerminal.x - playerT.x,
        blueprint.coreTerminal.z - playerT.z
      );
      hudPresenter.updateDistance(distToCore);

      // Notifica UI
      const healthComp = world.getComponent(playerId, 'health')!;
      const shieldComp = world.getComponent(playerId, 'shield')!;
      eventBus.publish('PLAYER_HEALTH_CHANGED', {
        hp: healthComp.current,
        shield: shieldComp.current,
      });
      eventBus.publish('PLAYER_AMMO_CHANGED', {
        ammo: ammoCapacitor.getCurrentAmmo(),
        maxAmmo: ammoCapacitor.getMaxAmmo(),
      });
      eventBus.publish('SCORE_CHANGED', { score: scoreLedger.getCurrentScore() });

      // Vitória (chegou no núcleo) ou Derrota (HP zerou)
      if (healthComp.current <= 0) {
        fsm.transitionTo(GameState.DEBRIEF_DEFEAT);
        inputAdapter.exitPointerLock();
        showDebrief(false);
      } else if (distToCore < 2.0) {
        scoreLedger.recordCoreRestored();
        audioAdapter.playVictory();
        fsm.transitionTo(GameState.DEBRIEF_VICTORY);
        inputAdapter.exitPointerLock();
        showDebrief(true);
      }

      RenderSyncSystem.update(world, playerId, renderAdapter);
    },
    () => {
      renderAdapter.render();
    }
  );

  function showDebrief(victory: boolean) {
    debriefModal.style.display = 'flex';
    const title = document.getElementById('debriefStatus')!;
    title.textContent = victory ? 'SYSTEM RECOVERY: SUCCESSFUL' : 'CRITICAL FAULT: SYSTEM HALTED';
    title.style.color = victory ? 'var(--color-terminal-green)' : 'var(--color-alert-orange)';

    document.getElementById('debriefScore')!.textContent = `SCORE: ${scoreLedger.getCurrentScore()}`;
    document.getElementById('debriefEnemies')!.textContent = `ENEMIES DEFEATED: ${scoreLedger.getEnemiesDefeatedCount()}`;
    document.getElementById('debriefConcepts')!.textContent = `CPU CONCEPTS LEARNED: ${codexTracker.getDiscoveredCount()}/${codexTracker.getTotalConceptsCount()}`;
  }

  function startGame() {
    fsm.transitionTo(GameState.PLAYING);
    menuModal.style.display = 'none';
    debriefModal.style.display = 'none';
    inputAdapter.requestPointerLock();
    loop.start();
  }

  function restartGame() {
    initSession();
    startGame();
  }

  btnNewGame.addEventListener('click', startGame);
  btnRestart.addEventListener('click', restartGame);

  window.addEventListener('keydown', (e) => {
    if (
      e.code === 'Enter' &&
      (fsm.getCurrentState() === GameState.DEBRIEF_VICTORY ||
        fsm.getCurrentState() === GameState.DEBRIEF_DEFEAT)
    ) {
      restartGame();
    }
  });

  fsm.transitionTo(GameState.MAIN_MENU);
}

window.addEventListener('DOMContentLoaded', bootstrap);
