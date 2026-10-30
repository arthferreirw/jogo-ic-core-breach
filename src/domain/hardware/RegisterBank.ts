import { Nibble } from './Nibble';

/**
 * Banco de registradores didático do processador.
 * Gerencia REG_A (operando ativo do jogador), REG_B (operando do alvo) e RES (resultado da ULA).
 */
export class RegisterBank {
  private unlockedMasks: Nibble[] = [];
  private currentMaskIndex = 0;
  private regB: Nibble | null = null;
  private res: Nibble | null = null;

  constructor(initialMasks: Nibble[]) {
    if (initialMasks.length === 0) {
      this.unlockedMasks = [Nibble.fromNumber(0)];
    } else {
      this.unlockedMasks = [...initialMasks];
    }
  }

  public getRegA(): Nibble {
    const mask = this.unlockedMasks[this.currentMaskIndex];
    if (!mask) {
      return Nibble.fromNumber(0);
    }
    return mask;
  }

  public cycleRegA(): Nibble {
    if (this.unlockedMasks.length === 0) return Nibble.fromNumber(0);
    this.currentMaskIndex = (this.currentMaskIndex + 1) % this.unlockedMasks.length;
    return this.getRegA();
  }

  public unlockMask(mask: Nibble): void {
    const alreadyExists = this.unlockedMasks.some((m) => m.equals(mask));
    if (!alreadyExists) {
      this.unlockedMasks.push(mask);
    }
  }

  public getUnlockedMasks(): readonly Nibble[] {
    return this.unlockedMasks;
  }

  public storeOperation(targetRegB: Nibble, resultRes: Nibble): void {
    this.regB = targetRegB;
    this.res = resultRes;
  }

  public getRegB(): Nibble | null {
    return this.regB;
  }

  public getRes(): Nibble | null {
    return this.res;
  }

  public reset(): void {
    this.currentMaskIndex = 0;
    this.regB = null;
    this.res = null;
  }
}
