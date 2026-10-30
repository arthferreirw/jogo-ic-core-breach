import { Nibble } from './Nibble';

export interface LogicGateResult {
  operandA: Nibble;
  operandB: Nibble;
  result: Nibble;
  zeroFlag: boolean;
  operationName: string;
}

/**
 * Estratégia de porta lógica da ULA (Open/Closed Principle).
 * Permite plugar novas operações (AND, OR, NOT) sem modificar a ULA.
 */
export interface ILogicGateStrategy {
  readonly name: string;
  compute(a: Nibble, b: Nibble): LogicGateResult;
}
