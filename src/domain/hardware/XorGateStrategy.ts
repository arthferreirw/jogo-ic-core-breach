import { Nibble } from './Nibble';
import { ILogicGateStrategy, LogicGateResult } from './ILogicGateStrategy';

/**
 * Implementação real da operação lógica XOR bit a bit de 4 bits (RN-01).
 * RES[i] = A[i] XOR B[i]
 */
export class XorGateStrategy implements ILogicGateStrategy {
  public readonly name = 'XOR';

  public compute(a: Nibble, b: Nibble): LogicGateResult {
    const xorValue = a.value ^ b.value;
    const result = Nibble.fromNumber(xorValue);
    const zeroFlag = result.value === 0;

    return {
      operandA: a,
      operandB: b,
      result,
      zeroFlag,
      operationName: this.name,
    };
  }
}
