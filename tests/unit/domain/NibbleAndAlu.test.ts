import { describe, it, expect } from 'vitest';
import { Nibble } from '@domain/hardware/Nibble';
import { AluEngine } from '@domain/hardware/AluEngine';
import { XorGateStrategy } from '@domain/hardware/XorGateStrategy';

describe('Domain: Nibble & ULA (AluEngine com XorGateStrategy)', () => {
  describe('Nibble Value Object (4 bits)', () => {
    it('deve instanciar valores válidos de 0 a 15 (0000 a 1111)', () => {
      const n0 = Nibble.fromNumber(0);
      const n15 = Nibble.fromNumber(15);
      expect(n0.value).toBe(0);
      expect(n0.toBinaryString()).toBe('0000');
      expect(n0.toHexString()).toBe('0x0');

      expect(n15.value).toBe(15);
      expect(n15.toBinaryString()).toBe('1111');
      expect(n15.toHexString()).toBe('0xF');
    });

    it('deve instanciar a partir de string binária de 4 bits', () => {
      const n = Nibble.fromBinaryString('1010');
      expect(n.value).toBe(10);
      expect(n.toBinaryString()).toBe('1010');
      expect(n.toHexString()).toBe('0xA');
    });

    it('deve lançar RangeError para números fora de 0..15', () => {
      expect(() => Nibble.fromNumber(-1)).toThrow(RangeError);
      expect(() => Nibble.fromNumber(16)).toThrow(RangeError);
      expect(() => Nibble.fromNumber(2.5)).toThrow(RangeError);
    });

    it('deve lançar SyntaxError para strings binárias inválidas', () => {
      expect(() => Nibble.fromBinaryString('101')).toThrow(SyntaxError);
      expect(() => Nibble.fromBinaryString('10101')).toThrow(SyntaxError);
      expect(() => Nibble.fromBinaryString('1020')).toThrow(SyntaxError);
    });

    it('deve inspecionar bits individuais por índice (0=MSB, 3=LSB)', () => {
      // 1010: bit0=1, bit1=0, bit2=1, bit3=0
      const n = Nibble.fromBinaryString('1010');
      expect(n.bitAt(0)).toBe(1);
      expect(n.bitAt(1)).toBe(0);
      expect(n.bitAt(2)).toBe(1);
      expect(n.bitAt(3)).toBe(0);
    });
  });

  describe('RN-01: Autenticidade Matemática do XOR e Zero Flag', () => {
    const alu = new AluEngine(new XorGateStrategy());

    it('deve calcular o exemplo mandatório do briefing: 1010 XOR 1100 = 0110', () => {
      const regA = Nibble.fromBinaryString('1010');
      const regB = Nibble.fromBinaryString('1100');
      const result = alu.execute(regA, regB);

      expect(result.result.toBinaryString()).toBe('0110');
      expect(result.result.value).toBe(6);
      expect(result.zeroFlag).toBe(false);
    });

    it('deve ativar a Zero Flag (ZF=1) quando entradas forem idênticas (X XOR X = 0000)', () => {
      const regA = Nibble.fromBinaryString('1100');
      const regB = Nibble.fromBinaryString('1100');
      const result = alu.execute(regA, regB);

      expect(result.result.toBinaryString()).toBe('0000');
      expect(result.result.value).toBe(0);
      expect(result.zeroFlag).toBe(true);
    });

    it('deve satisfazer elemento neutro: A XOR 0000 = A', () => {
      const regA = Nibble.fromBinaryString('1011');
      const zero = Nibble.fromNumber(0);
      const result = alu.execute(regA, zero);

      expect(result.result.value).toBe(regA.value);
      expect(result.zeroFlag).toBe(false);
    });

    it('deve cobrir exaustivamente todos os 256 pares de 4 bits (0x0..0xF)', () => {
      for (let a = 0; a <= 15; a++) {
        for (let b = 0; b <= 15; b++) {
          const res = alu.execute(Nibble.fromNumber(a), Nibble.fromNumber(b));
          const expected = a ^ b;
          expect(res.result.value).toBe(expected);
          expect(res.zeroFlag).toBe(expected === 0);
        }
      }
    });
  });
});
