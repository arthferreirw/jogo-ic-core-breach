import { describe, it, expect } from 'vitest';
import { DamageCalculator } from '@domain/combat/DamageCalculator';
import { AmmoCapacitor } from '@domain/combat/AmmoCapacitor';
import { ScoreLedger } from '@domain/combat/ScoreLedger';
import { CodexTracker } from '@domain/education/CodexTracker';

describe('Domain: Combat Rules, Ammo Capacitor, Score & Codex (RN-02..RN-06)', () => {
  describe('RN-03: DamageCalculator (Absorção Shield/HP e Mitigação de Escudo Binário)', () => {
    it('deve absorver dano primeiramente no escudo 1:1 e o excedente na vida', () => {
      const result = DamageCalculator.applyDamageToPlayer(100, 100, 30);
      expect(result.shield).toBe(70);
      expect(result.hp).toBe(100);
      expect(result.isDead).toBe(false);

      const resultOver = DamageCalculator.applyDamageToPlayer(100, 20, 50);
      expect(resultOver.shield).toBe(0);
      expect(resultOver.hp).toBe(70); // 100 - (50 - 20)
      expect(resultOver.isDead).toBe(false);
    });

    it('deve declarar morte do jogador quando HP atinge 0', () => {
      const result = DamageCalculator.applyDamageToPlayer(40, 0, 50);
      expect(result.hp).toBe(0);
      expect(result.shield).toBe(0);
      expect(result.isDead).toBe(true);
    });

    it('deve aplicar 80% de mitigação em disparos contra inimigo com escudo binário ativo', () => {
      // Dano base da PULSE-9 = 20
      const mitigated = DamageCalculator.calculateBallisticDamageToEnemy(20, true);
      expect(mitigated).toBe(4); // 20 * (1 - 0.8) = 4

      const unmitigated = DamageCalculator.calculateBallisticDamageToEnemy(20, false);
      expect(unmitigated).toBe(20);
    });
  });

  describe('RN-03: AmmoCapacitor (Consumo e Regeneração de Emergência)', () => {
    it('deve consumir munição corretamente', () => {
      const ammo = new AmmoCapacitor(99, 150);
      const shot = ammo.consumeShot();
      expect(shot).toBe(true);
      expect(ammo.getCurrentAmmo()).toBe(98);
    });

    it('deve impedir tiro quando munição for 0', () => {
      const ammo = new AmmoCapacitor(0, 150);
      const shot = ammo.consumeShot();
      expect(shot).toBe(false);
      expect(ammo.getCurrentAmmo()).toBe(0);
    });

    it('deve regenerar 1 AMMO a cada 1.5s até o limite de emergência de 10 AMMO quando zerado', () => {
      const ammo = new AmmoCapacitor(0, 150);
      expect(ammo.getCurrentAmmo()).toBe(0);

      ammo.update(1.0); // 1.0s decorrido
      expect(ammo.getCurrentAmmo()).toBe(0);

      ammo.update(0.6); // Total 1.6s decorrido -> regenera 1 AMMO
      expect(ammo.getCurrentAmmo()).toBe(1);

      // Simula passar tempo suficiente para atingir o teto de emergência (10 AMMO)
      for (let i = 0; i < 20; i++) {
        ammo.update(1.5);
      }
      expect(ammo.getCurrentAmmo()).toBe(10);
    });
  });

  describe('RN-05: ScoreLedger (Pontuação e Bônus de Eficiência)', () => {
    it('deve computar eliminações de BITLING e OVERFLOW', () => {
      const score = new ScoreLedger();
      score.recordEnemyDefeated('BITLING');
      expect(score.getCurrentScore()).toBe(100);

      score.recordEnemyDefeated('OVERFLOW');
      expect(score.getCurrentScore()).toBe(400); // 100 + 300
    });

    it('deve conceder bônus de eficiência lógica (+150) ao zerar escudo no 1º pulso', () => {
      const score = new ScoreLedger();
      score.recordLogicalEfficiencyBonus();
      expect(score.getCurrentScore()).toBe(150);
    });
  });

  describe('RN-06: CodexTracker (Controle de Conceitos e Deduplicação de Toasts)', () => {
    it('deve desbloquear conceito educacional e permitir toast apenas no primeiro encontro', () => {
      const codex = new CodexTracker();
      expect(codex.isDiscovered('XOR')).toBe(false);

      const shouldToastFirst = codex.discoverConcept('XOR');
      expect(shouldToastFirst).toBe(true);
      expect(codex.isDiscovered('XOR')).toBe(true);
      expect(codex.getDiscoveredCount()).toBe(1);

      const shouldToastSecond = codex.discoverConcept('XOR');
      expect(shouldToastSecond).toBe(false);
      expect(codex.getDiscoveredCount()).toBe(1);
    });
  });
});
