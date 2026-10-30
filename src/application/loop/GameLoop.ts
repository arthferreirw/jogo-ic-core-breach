/**
 * Game Loop desacoplado com Fixed Timestep (1/60s = 0.01666s).
 * Garante física e simulação de IA determinísticas independentemente da taxa de quadros da tela.
 */
export class GameLoop {
  public static readonly FIXED_DT = 1 / 60;
  public static readonly MAX_ACCUMULATOR = 0.25; // 250ms máx de acúmulo contra 'spiral of death'

  private accumulator = 0;
  private isRunning = false;
  private lastTime = 0;
  private animFrameId: number | null = null;

  constructor(
    private updateFn: (dt: number) => void,
    private renderFn: () => void
  ) {}

  /**
   * Método executável manualmente em testes unitários/integração.
   */
  public stepManual(elapsedSeconds: number): void {
    let dt = Math.min(elapsedSeconds, GameLoop.MAX_ACCUMULATOR);
    this.accumulator += dt;

    while (this.accumulator >= GameLoop.FIXED_DT) {
      this.updateFn(GameLoop.FIXED_DT);
      this.accumulator -= GameLoop.FIXED_DT;
    }

    this.renderFn();
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.accumulator = 0;
    this.lastTime = performance.now();

    const tick = (now: number) => {
      if (!this.isRunning) return;

      const elapsedSec = (now - this.lastTime) / 1000;
      this.lastTime = now;

      this.stepManual(elapsedSec);
      this.animFrameId = requestAnimationFrame(tick);
    };

    this.animFrameId = requestAnimationFrame(tick);
  }

  public stop(): void {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  public isLoopRunning(): boolean {
    return this.isRunning;
  }
}
