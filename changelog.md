# CHANGELOG — BREACH CORE

Todas as alterações notáveis deste projeto serão documentadas neste arquivo.
O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

---

## [0.2.0-phase2] - 2026-10-30

### Added
- **Hardware Computacional e ULA (RN-01, RN-04, RE-01..RE-05):**
  - `Nibble.ts`: Value Object de 4 bits com validações, conversões bin/hex e indexação de bits.
  - `ILogicGateStrategy.ts` & `XorGateStrategy.ts`: Estratégia extensível OCP calculando XOR bit a bit e Zero Flag (`ZF`).
  - `AluEngine.ts`: Motor da ULA desacoplado de engine gráfica.
  - `RegisterBank.ts`: Gestão didática dos registradores `REG_A`, `REG_B`, `RES` e rotação de máscaras desbloqueadas.
  - `InstructionCycleTracker.ts`: FSM com avanço determinístico de estágios (`FETCH -> DECODE -> EXECUTE -> STORE`).
- **Regras de Negócio e Combate (RN-02, RN-03, RN-05, RN-06):**
  - `DamageCalculator.ts`: Absorção 1:1 `SHLD` antes de `HP` e mitigação de 80% em escudos binários ativos.
  - `AmmoCapacitor.ts`: Consumo de munição e capacitor de emergência (regenera até 10 AMMO).
  - `ScoreLedger.ts`: Pontuação por BITLING, OVERFLOW e bônus de eficiência lógica (`ZF=1`).
  - `CodexTracker.ts`: Controle de conceitos pedagógicos descobertos e deduplicação de toasts contextuais.
- **Kernel ECS e Aplicação:**
  - `World.ts`: Registro leve de entidades com stores de componentes POD indexados e queries rápidas.
  - `CombatComponents.ts`: Definições tipadas de Transform, Velocity, Collider, Health, Shield, BinaryLock, AiFsm, Weapon, etc.
  - `EntityFactory.ts`: Fábrica para instanciar Player, Bitling, Overflow, LogicDoor, Terminal e Pickups.
  - `EventBus.ts`: Barramento tipado Observer para desacoplar sistemas e UI.
  - `GameStateMachine.ts`: Máquina de estados global (`BOOT` até `DEBRIEF`).
  - `GameLoop.ts`: Loop desacoplado com Fixed Timestep (1/60s).
- **Testes Unitários:**
  - 40 testes automatizados passando em Node.js com cobertura limpa em `tests/unit/domain/**`, `tests/unit/ecs/**` e `tests/unit/app/**`.

---

## [0.1.0-phase1] - 2026-10-30

### Added
- **Protocolo de Gerenciamento de Contexto (Memory Bank):**
  - `arquitetura.md`, `estado_atual.md`, `changelog.md`.
- **Toolchain e Configurações de Qualidade:**
  - `package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`.
- **Camada de Domínio (Configurações):**
  - `GameBalance.ts`, `PedagogicalCatalog.ts`.
- **Testes Arquiteturais:**
  - `boundaries.test.ts`: Enforcing automático de Clean Architecture.
