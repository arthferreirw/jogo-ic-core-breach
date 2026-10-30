import { describe, it, expect, vi } from 'vitest';
import { EventBus } from '@app/events/EventBus';
import { GameStateMachine, GameState } from '@app/state/GameStateMachine';
import { GameLoop } from '@app/loop/GameLoop';

describe('Application: EventBus, GameStateMachine & FixedTimestepGameLoop', () => {
  describe('TypedEventBus', () => {
    it('deve publicar e entregar eventos fortemente tipados para os assinantes', () => {
      const bus = new EventBus();
      const callback = vi.fn();

      bus.subscribe('ALU_OPERATION_EXECUTED', callback);
      bus.publish('ALU_OPERATION_EXECUTED', {
        operandA: '1010',
        operandB: '1100',
        result: '0110',
        zeroFlag: false,
      });

      expect(callback).toHaveBeenCalledWith({
        operandA: '1010',
        operandB: '1100',
        result: '0110',
        zeroFlag: false,
      });
    });

    it('deve desinscrever ouvintes corretamente', () => {
      const bus = new EventBus();
      const callback = vi.fn();

      const unsubscribe = bus.subscribe('PLAYER_HEALTH_CHANGED', callback);
      bus.publish('PLAYER_HEALTH_CHANGED', { hp: 80, shield: 100 });
      expect(callback).toHaveBeenCalledTimes(1);

      unsubscribe();
      bus.publish('PLAYER_HEALTH_CHANGED', { hp: 60, shield: 100 });
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('GameStateMachine', () => {
    it('deve iniciar em BOOT e permitir transições válidas', () => {
      const fsm = new GameStateMachine();
      expect(fsm.getCurrentState()).toBe(GameState.BOOT);

      expect(fsm.transitionTo(GameState.MAIN_MENU)).toBe(true);
      expect(fsm.getCurrentState()).toBe(GameState.MAIN_MENU);

      expect(fsm.transitionTo(GameState.PLAYING)).toBe(true);
      expect(fsm.getCurrentState()).toBe(GameState.PLAYING);

      expect(fsm.transitionTo(GameState.PAUSED)).toBe(true);
      expect(fsm.getCurrentState()).toBe(GameState.PAUSED);

      expect(fsm.transitionTo(GameState.PLAYING)).toBe(true);
      expect(fsm.transitionTo(GameState.DEBRIEF_VICTORY)).toBe(true);
      expect(fsm.getCurrentState()).toBe(GameState.DEBRIEF_VICTORY);
    });

    it('deve bloquear transições inválidas', () => {
      const fsm = new GameStateMachine();
      expect(fsm.getCurrentState()).toBe(GameState.BOOT);

      // Não pode ir direto de BOOT para PLAYING sem passar por MAIN_MENU
      expect(fsm.transitionTo(GameState.PLAYING)).toBe(false);
      expect(fsm.getCurrentState()).toBe(GameState.BOOT);
    });
  });

  describe('FixedTimestepGameLoop', () => {
    it('deve executar o número exato de passos fixos (1/60s = ~16.66ms) conforme o acumulador', () => {
      const updateFn = vi.fn();
      const renderFn = vi.fn();
      const loop = new GameLoop(updateFn, renderFn);

      // 2 * (1 / 60) = 0.03333333333333333
      loop.stepManual((2 / 60) + 0.001);

      expect(updateFn).toHaveBeenCalledTimes(2);
      expect(renderFn).toHaveBeenCalledTimes(1);
      expect(updateFn).toHaveBeenCalledWith(1 / 60);
    });

    it('deve limitar o acúmulo de tempo para evitar espiral da morte se houver travamento longo', () => {
      const updateFn = vi.fn();
      const renderFn = vi.fn();
      const loop = new GameLoop(updateFn, renderFn);

      // Simula um lag enorme de 5 segundos
      loop.stepManual(5.0);

      // Com teto de acumulador em 0.25s, executa no máximo 15 passos (0.25 / 0.01666)
      expect(updateFn.mock.calls.length).toBeLessThanOrEqual(16);
      expect(renderFn).toHaveBeenCalledTimes(1);
    });
  });
});
