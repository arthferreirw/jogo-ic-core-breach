import { describe, it, expect } from 'vitest';
import { Nibble } from '@domain/hardware/Nibble';
import { RegisterBank } from '@domain/hardware/RegisterBank';
import { InstructionCycleTracker, CycleStage } from '@domain/hardware/InstructionCycleTracker';

describe('Domain: RegisterBank & InstructionCycleTracker', () => {
  describe('RegisterBank', () => {
    it('deve inicializar REG_A com a primeira máscara do catálogo desbloqueado', () => {
      const masks = [Nibble.fromBinaryString('1010'), Nibble.fromBinaryString('1100')];
      const bank = new RegisterBank(masks);

      expect(bank.getRegA().toBinaryString()).toBe('1010');
      expect(bank.getRegB()).toBeNull();
      expect(bank.getRes()).toBeNull();
    });

    it('deve alternar circularmente entre máscaras desbloqueadas ao chamar cycleRegA()', () => {
      const masks = [
        Nibble.fromBinaryString('1010'),
        Nibble.fromBinaryString('1100'),
        Nibble.fromBinaryString('1111'),
      ];
      const bank = new RegisterBank(masks);

      expect(bank.getRegA().toBinaryString()).toBe('1010');
      bank.cycleRegA();
      expect(bank.getRegA().toBinaryString()).toBe('1100');
      bank.cycleRegA();
      expect(bank.getRegA().toBinaryString()).toBe('1111');
      bank.cycleRegA();
      expect(bank.getRegA().toBinaryString()).toBe('1010'); // Ciclou de volta
    });

    it('deve registrar novas máscaras desbloqueadas sem duplicatas', () => {
      const bank = new RegisterBank([Nibble.fromBinaryString('1010')]);
      expect(bank.getUnlockedMasks().length).toBe(1);

      bank.unlockMask(Nibble.fromBinaryString('1100'));
      expect(bank.getUnlockedMasks().length).toBe(2);

      bank.unlockMask(Nibble.fromBinaryString('1100')); // Repetido
      expect(bank.getUnlockedMasks().length).toBe(2);
    });

    it('deve armazenar operandos e resultado da última instrução', () => {
      const bank = new RegisterBank([Nibble.fromBinaryString('1010')]);
      const regB = Nibble.fromBinaryString('1100');
      const res = Nibble.fromBinaryString('0110');

      bank.storeOperation(regB, res);
      expect(bank.getRegB()?.toBinaryString()).toBe('1100');
      expect(bank.getRes()?.toBinaryString()).toBe('0110');
    });
  });

  describe('RN-04: InstructionCycleTracker (FETCH -> DECODE -> EXECUTE -> STORE)', () => {
    it('deve iniciar em IDLE e transitar deterministicamente através dos 4 estágios', () => {
      const tracker = new InstructionCycleTracker(250); // 250ms por estágio

      expect(tracker.getCurrentStage()).toBe(CycleStage.IDLE);
      expect(tracker.isExecuting()).toBe(false);

      tracker.startCycle();
      expect(tracker.getCurrentStage()).toBe(CycleStage.FETCH);
      expect(tracker.isExecuting()).toBe(true);

      // Avança 250ms -> DECODE
      tracker.update(250);
      expect(tracker.getCurrentStage()).toBe(CycleStage.DECODE);

      // Avança 250ms -> EXECUTE
      tracker.update(250);
      expect(tracker.getCurrentStage()).toBe(CycleStage.EXECUTE);

      // Avança 250ms -> STORE
      tracker.update(250);
      expect(tracker.getCurrentStage()).toBe(CycleStage.STORE);

      // Avança 250ms -> IDLE (Ciclo completado)
      tracker.update(250);
      expect(tracker.getCurrentStage()).toBe(CycleStage.IDLE);
      expect(tracker.isExecuting()).toBe(false);
    });

    it('não deve reiniciar o ciclo se já estiver em execução', () => {
      const tracker = new InstructionCycleTracker(250);
      tracker.startCycle();
      tracker.update(100);
      expect(tracker.getCurrentStage()).toBe(CycleStage.FETCH);

      const restarted = tracker.startCycle();
      expect(restarted).toBe(false);
      expect(tracker.getCurrentStage()).toBe(CycleStage.FETCH);
    });
  });
});
