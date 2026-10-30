/**
 * Value Object imutável representando uma palavra de 4 bits (nibble, 0 a 15).
 * Garante validação em runtime e operações puras de manipulação de bits.
 */
export class Nibble {
  private constructor(public readonly value: number) {}

  public static fromNumber(n: number): Nibble {
    if (!Number.isInteger(n) || n < 0 || n > 0b1111) {
      throw new RangeError(`Valor inválido para Nibble (4 bits): ${n}. Deve estar entre 0 e 15.`);
    }
    return new Nibble(n);
  }

  public static fromBinaryString(bits: string): Nibble {
    if (!/^[01]{4}$/.test(bits)) {
      throw new SyntaxError(`String binária inválida para Nibble: "${bits}". Esperado exatamente 4 bits [01].`);
    }
    return new Nibble(parseInt(bits, 2));
  }

  /**
   * Retorna o bit na posição especificada (0 = MSB / bit mais significativo, 3 = LSB).
   */
  public bitAt(index: 0 | 1 | 2 | 3): 0 | 1 {
    return ((this.value >> (3 - index)) & 1) as 0 | 1;
  }

  public toBinaryString(): string {
    return this.value.toString(2).padStart(4, '0');
  }

  public toHexString(): string {
    return `0x${this.value.toString(16).toUpperCase()}`;
  }

  public equals(other: Nibble): boolean {
    return this.value === other.value;
  }
}
