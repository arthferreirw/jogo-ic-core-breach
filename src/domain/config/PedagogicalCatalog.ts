/**
 * Catálogo Pedagógico oficial do jogo Breach Core.
 * Mapeia as 5 pílulas educacionais obrigatórias (RE-01 a RE-05 do ERS).
 * As mensagens rápidas em tela (toasts) respeitam o limite não-intrusivo de até ~140 caracteres.
 */
export interface PedagogicalConcept {
  id: string;
  code: 'RE-01' | 'RE-02' | 'RE-03' | 'RE-04' | 'RE-05';
  title: string;
  shortToast: string;
  codexSummary: string;
  codexDetail: string;
}

export const PEDAGOGICAL_CATALOG: Record<string, PedagogicalConcept> = {
  CPU: {
    id: 'CPU',
    code: 'RE-01',
    title: 'Unidade Central de Processamento (CPU)',
    shortToast: '[CPU] Setor Central identificado: a CPU coordena componentes e executa instruções do sistema.',
    codexSummary: 'O cérebro executivo do computador, integrando Unidade de Controle, ULA e Registradores.',
    codexDetail:
      'A CPU (Central Processing Unit) é o componente fundamental de processamento de um computador. Ela busca instruções da memória principal, decodifica cada operação e comanda os demais componentes do sistema para executá-las em sequência lógica de clock.',
  },
  REGISTERS: {
    id: 'REGISTERS',
    code: 'RE-02',
    title: 'Registradores (Registers)',
    shortToast: '[REG] Registrador carregado: memória ultrarrápida interna à CPU para operandos ativos.',
    codexSummary: 'Memórias de altíssima velocidade e capacidade limitada situadas no topo da hierarquia.',
    codexDetail:
      'Os registradores residem dentro do próprio chip do processador, permitindo acesso quase instantâneo aos dados (1 ciclo de clock). São utilizados para manter operandos temporários (como REG_A e REG_B) e armazenar o resultado imediato (RES) das operações da ULA.',
  },
  ALU: {
    id: 'ALU',
    code: 'RE-03',
    title: 'Unidade Lógica e Aritmética (ULA / ALU)',
    shortToast: '[ULA] Operação executada na ULA: circuito responsável pelos cálculos aritméticos e lógicos.',
    codexSummary: 'Circuito combinacional encarregado de efetuar operações aritméticas (+, -) e lógicas (AND, OR, XOR).',
    codexDetail:
      'A ULA recebe entradas dos registradores, seleciona a operação solicitada pela Unidade de Controle através de multiplexadores e portas lógicas, e produz o resultado final acompanhado de flags de estado (como a Zero Flag, Overflow e Carry).',
  },
  XOR: {
    id: 'XOR',
    code: 'RE-04',
    title: 'Operação Lógica XOR (OU Exclusivo)',
    shortToast: '[XOR] Bits iguais geram 0; bits diferentes geram 1. Exemplo: 1010 XOR 1100 = 0110.',
    codexSummary: 'Porta lógica essencial para criptografia, cálculo de paridade, inversão de bits e limpeza de registradores.',
    codexDetail:
      'A operação XOR retorna 1 apenas quando as entradas forem distintas. Possui propriedades notáveis: comutatividade (A ^ B = B ^ A), elemento neutro (A ^ 0 = A) e anulação idempotente (A ^ A = 0). Em Assembly, a instrução XOR REG, REG é historicamente a forma mais rápida de zerar um registrador.',
  },
  INSTRUCTION_CYCLE: {
    id: 'INSTRUCTION_CYCLE',
    code: 'RE-05',
    title: 'Ciclo de Instrução da CPU',
    shortToast: '[CICLO] Busca -> Decodificação -> Execução -> Armazenamento concluídos.',
    codexSummary: 'A sequência clássica em 4 fases fundamentais para processar qualquer instrução.',
    codexDetail:
      '1. FETCH (Busca): A instrução é lida da memória para o Registrador de Instruções.\n2. DECODE (Decodificação): A Unidade de Controle interpreta o código de operação (Opcode).\n3. EXECUTE (Execução): A ULA executa a operação necessária.\n4. STORE (Armazenamento): O resultado é gravado no registrador de destino ou memória.',
  },
} as const;
