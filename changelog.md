# CHANGELOG — BREACH CORE

Todas as alterações notáveis deste projeto serão documentadas neste arquivo.
O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

---

## [0.1.0-phase1] - 2026-10-30

### Added
- **Protocolo de Gerenciamento de Contexto (Memory Bank):**
  - `arquitetura.md`: Documentação viva das camadas de Clean Architecture, Hybrid ECS, pipeline de assets desacoplado e ADRs 001 a 003.
  - `estado_atual.md`: Snapshot operacional com matriz de rastreabilidade para RFs, RNs e REs.
  - `changelog.md`: Livro-razão cronológico de engenharia de software.
- **Toolchain e Configurações de Qualidade:**
  - `package.json`: Configurado com scripts `dev`, `build`, `typecheck`, `test`, `test:run`, `test:coverage`.
  - `tsconfig.json`: TypeScript 5 estrito (`strict: true`, `noUncheckedIndexedAccess: true`, aliases `@domain`, `@ecs`, `@app`, `@infra`, `@presentation`).
  - `vite.config.ts` e `vitest.config.ts`: Configurações de empacotamento e testes automatizados.
  - `@types/node` e `@babylonjs/core`.
- **Camada de Domínio (Configurações):**
  - `src/domain/config/GameBalance.ts`: Constantes de balanceamento (HP, Shield, PULSE-9, Cooldowns, Scores, Paleta oficial).
  - `src/domain/config/PedagogicalCatalog.ts`: Catálogo pedagógico (RE-01 a RE-05 com toasts de até 140 chars e códice).
- **Testes Arquiteturais:**
  - `tests/architecture/boundaries.test.ts`: Validador de fronteiras Clean Architecture assegurando zero dependências de DOM ou Babylon.js dentro de `src/domain` e `src/ecs`.
