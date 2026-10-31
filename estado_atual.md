# ESTADO ATUAL DO PROJETO — BREACH CORE

**Última Atualização:** 2026-10-30  
**Milestone Atual:** Sprint 2 — Hardening Arquitetural & Upgrade Visual (`agent-sprite-forge`) Planejado  
**Status Geral:** 🟡 MVP 1.0.0 Funcional / Backlog de Refatoração Pós-Auditoria Documentado (`DT-01`..`DT-12`)  

---

## 1. Matriz de Status dos Requisitos

| Requisito / Diretiva | Descrição | Status | Notas |
| :--- | :--- | :---: | :--- |
| **Setup do Ambiente** | Configuração do package.json, TypeScript estrito, Vite e Vitest | 🟢 Concluído | Fase 1 |
| **Memory Bank** | Criação e inicialização de `arquitetura.md`, `estado_atual.md` e `changelog.md` | 🟢 Concluído | Fase 1 |
| **Limites Arquiteturais** | Teste automatizado de fronteiras da Clean Architecture | 🟢 Concluído | `boundaries.test.ts` passando |
| **Configuração de Domínio** | `GameBalance.ts` e `PedagogicalCatalog.ts` | 🟢 Concluído | Fase 1 |
| **RN-01 (XOR 4 bits)** | Módulo ULA (Nibble, AluEngine, XorGateStrategy, ZeroFlag) | 🟢 Concluído | Fase 2 |
| **RN-02 (Pulso Lógico)** | Lógica de pulso com cooldown e anulação/mutação | 🟢 Concluído | Testado unitária e integradamente |
| **RN-03 (Dano e Munição)** | Absorção de dano Shield->HP e capacitor de munição | 🟢 Concluído | Integrado |
| **RN-04 (Ciclo Instrução)** | Sequenciador FETCH -> DECODE -> EXECUTE -> STORE | 🟢 Concluído | Integrado aos LEDs do HUD |
| **RN-05 (Pontuação)** | Ledger de score e bônus de eficiência lógica (ZF=1) | 🟢 Concluído | Integrado com debrief |
| **RN-06 (Feedback Contextual)**| Codex e toasts sem pausar combate | 🟢 Concluído | Integrado |
| **Kernel ECS** | World, Stores de componentes e EntityFactory | 🟢 Concluído | Fase 2 |
| **GameLoop & EventBus** | Loop com Fixed-Timestep (1/60s) e Observer tipado | 🟢 Concluído | Fase 2 |
| **RF-01 a RF-04 (Sessão & Telas)**| Menu Inicial, HUD, Debrief e reinício com Enter | 🟢 Concluído | Reset em memória < 50ms |
| **RF-05 a RF-12 (Movimento & Combate)**| WASD + Mouse Look, PULSE-9 com recuo e pickups | 🟢 Concluído | Cinemática e raycasting DDA puros |
| **RF-18 a RF-21 (IA Inimigos)**| Billboards 2D e FSM de Bitling e Overflow | 🟢 Concluído | LoS por raycast e ataques melee/plasma |
| **RF-22 a RF-25 (Cenário & Portas)**| Blueprint modular, portas lógicas deslizantes e Núcleo | 🟢 Concluído | Setor único de 5 câmaras completo |
| **RF-26 a RF-29 (HUD & Áudio)** | HUD minimalista e sintetizador procedural Web Audio | 🟢 Concluído | Áudio procedural e visual retrô |

---

## 2. Métricas de Testes e Qualidade

- **Testes Automatizados (Unitários e Integração):** 47 passando (100% de sucesso)
- **Erros de Tipagem TypeScript:** 0 erros (`tsc --noEmit` limpo)
- **Build de Produção:** Concluída com sucesso (`dist/` gerado via Vite)
- **Reset de Partida:** Verificado em teste multi-frame (< 50ms sem reload de página)

---

## 3. Backlog Priorizado — Sprint 2 (`docs/PLANO_REFATORACAO_E_VISUAL.md`)

- [ ] **Passo 1 (Blocker — `DT-01`, `DT-08`):** `SpatialCollisionIndex` para colisão/LoS dinâmica em `CellType.DOOR` + unificação de raycast `castHitscan()`.
- [ ] **Passo 2 (Blocker — `DT-03`, `DT-04`):** Desbloqueio de máscaras `REG_A` nos terminais para solubilidade de `1111` em $\mathbb{F}_2^4$ + correção do congelamento de `#hudRegStatus` e mutação de `RES` ao mirar.
- [ ] **Passo 3 (Blocker — `DT-02`, `DT-11`):** Eliminação do deadlock em `GameState.PAUSED` (`PauseModal`, `ControlsModal`, `CodexModal`) + filtro `e.repeat` e `contextmenu` em `BrowserInputAdapter`.
- [ ] **Passo 4 (Crítica — `DT-05`, `DT-12`):** Extração da *God Closure* `main.ts` para `GameSession` + `IEcsSystem`, correção da condição de vitória (`RN-05`) e blindagem de `src/ecs` em `boundaries.test.ts`.
- [ ] **Passo 5 (Crítica — `DT-07`, `DT-08`):** Projéteis reais de plasma do `OVERFLOW` (`14 u/s`, `RF-21`) e validação estrita do bônus `ZF=1` no 1º pulso.
- [ ] **Passo 6 (Crítica — `DT-06`, `DT-09`):** `Mesh.MergeMeshes`, materiais *Flyweight* e *Object Pool* no `BabylonRenderAdapter` + cache de queries no `World` e `HudStateDiffer`.
- [ ] **Passo 7 (Alta — `DT-10`):** Geração, QC (`--strict-qc`) e integração de spritesheets/texturas pixel-art RGBA com `0x0funky/agent-sprite-forge` (`.agents/skills/`) via `ForgeSpriteAssetAdapter`.
- [ ] **Passo 8 (Qualidade):** Novos testes unitários/integração Vitest + suíte E2E Playwright e sincronização final do Memory Bank.
