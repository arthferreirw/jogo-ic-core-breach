import { Nibble } from './Nibble';
import { ILogicGateStrategy, LogicGateResult } from './ILogicGateStrategy';

/**
 * Motor da ULA (Unidade Lógica e Aritmética).
 * Recebe operandos dos registradores e delega a operação para a estratégia lógica ativa.
 */
export class AluEngine {
  constructor(private gateStrategy: ILogicGateStrategy) {}

  public setStrategy(strategy: ILogicGateStrategy): void {
    this.gateStrategy = strategy;
  }

  public getStrategyName(): string {
    return this.gateStrategy.name;
  }

  public execute(a: Nibble, b: Nibble): LogicGateResult {
    return this.gateStrategy.compute(a, b);
  }
}
