export enum CycleStage {
  IDLE = 'IDLE',
  FETCH = 'FETCH',
  DECODE = 'DECODE',
  EXECUTE = 'EXECUTE',
  STORE = 'STORE',
}

/**
 * Sequenciador do ciclo de instrução (RN-04).
 * Apresenta didaticamente a passagem pelas 4 fases: Busca, Decodificação, Execução e Gravação.
 */
export class InstructionCycleTracker {
  private currentStage: CycleStage = CycleStage.IDLE;
  private timerMs = 0;

  constructor(private stageDurationMs: number = 250) {}

  public startCycle(): boolean {
    if (this.currentStage !== CycleStage.IDLE) {
      return false; // Ciclo já em andamento
    }
    this.currentStage = CycleStage.FETCH;
    this.timerMs = 0;
    return true;
  }

  public update(deltaMs: number): void {
    if (this.currentStage === CycleStage.IDLE) return;

    this.timerMs += deltaMs;

    if (this.timerMs >= this.stageDurationMs) {
      this.timerMs -= this.stageDurationMs;
      this.advanceStage();
    }
  }

  private advanceStage(): void {
    switch (this.currentStage) {
      case CycleStage.FETCH:
        this.currentStage = CycleStage.DECODE;
        break;
      case CycleStage.DECODE:
        this.currentStage = CycleStage.EXECUTE;
        break;
      case CycleStage.EXECUTE:
        this.currentStage = CycleStage.STORE;
        break;
      case CycleStage.STORE:
        this.currentStage = CycleStage.IDLE;
        this.timerMs = 0;
        break;
      case CycleStage.IDLE:
        break;
    }
  }

  public getCurrentStage(): CycleStage {
    return this.currentStage;
  }

  public isExecuting(): boolean {
    return this.currentStage !== CycleStage.IDLE;
  }

  public reset(): void {
    this.currentStage = CycleStage.IDLE;
    this.timerMs = 0;
  }
}
