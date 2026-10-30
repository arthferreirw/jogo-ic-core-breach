import { LOGICAL_PULSE_BALANCE } from '../config/GameBalance';

export interface PlayerDamageResult {
  hp: number;
  shield: number;
  isDead: boolean;
  absorbedByShield: number;
  inflictedToHp: number;
}

/**
 * Calculador de dano e mitigação (RN-03).
 */
export class DamageCalculator {
  public static applyDamageToPlayer(
    currentHp: number,
    currentShield: number,
    incomingDamage: number
  ): PlayerDamageResult {
    const damage = Math.max(0, incomingDamage);
    const absorbedByShield = Math.min(currentShield, damage);
    const newShield = currentShield - absorbedByShield;

    const remainingDamage = damage - absorbedByShield;
    const inflictedToHp = Math.min(currentHp, remainingDamage);
    const newHp = Math.max(0, currentHp - inflictedToHp);

    return {
      hp: newHp,
      shield: newShield,
      isDead: newHp <= 0,
      absorbedByShield,
      inflictedToHp,
    };
  }

  public static calculateBallisticDamageToEnemy(
    baseDamage: number,
    hasActiveBinaryShield: boolean
  ): number {
    if (!hasActiveBinaryShield) {
      return baseDamage;
    }
    // Mitigação de 80% enquanto o escudo binário estiver ativo
    return Math.round(baseDamage * (1 - LOGICAL_PULSE_BALANCE.SHIELD_DAMAGE_MITIGATION));
  }
}
