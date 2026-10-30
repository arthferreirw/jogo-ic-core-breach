import { SCORE_VALUES } from '../config/GameBalance';

/**
 * Livro-razão de pontuação da partida (RN-05).
 */
export class ScoreLedger {
  private currentScore = 0;
  private enemiesDefeatedCount = 0;

  public recordEnemyDefeated(archetype: 'BITLING' | 'OVERFLOW'): number {
    const points =
      archetype === 'BITLING' ? SCORE_VALUES.DEFEAT_BITLING : SCORE_VALUES.DEFEAT_OVERFLOW;
    this.currentScore += points;
    this.enemiesDefeatedCount++;
    return points;
  }

  public recordLogicalEfficiencyBonus(): number {
    this.currentScore += SCORE_VALUES.BONUS_LOGICAL_EFFICIENCY;
    return SCORE_VALUES.BONUS_LOGICAL_EFFICIENCY;
  }

  public recordConceptUnlocked(): number {
    this.currentScore += SCORE_VALUES.CONCEPT_UNLOCKED;
    return SCORE_VALUES.CONCEPT_UNLOCKED;
  }

  public recordCoreRestored(): number {
    this.currentScore += SCORE_VALUES.RESTORE_CORE;
    return SCORE_VALUES.RESTORE_CORE;
  }

  public getCurrentScore(): number {
    return this.currentScore;
  }

  public getEnemiesDefeatedCount(): number {
    return this.enemiesDefeatedCount;
  }

  public reset(): void {
    this.currentScore = 0;
    this.enemiesDefeatedCount = 0;
  }
}
