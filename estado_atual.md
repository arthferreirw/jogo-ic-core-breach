# ESTADO ATUAL DO PROJETO — BREACH CORE

**Última Atualização:** 2026-10-30  
**Milestone Atual:** Sprint 2 Planejada — Migração 3D -> 2D Top-Down 3/4 (`Canvas2D` + Fog of War) & Upgrade Visual (`agent-sprite-forge`)  
**Status Geral:** 🟡 MVP 1.0.0 Funcional / Plano `v2.0.0-2d` + Guia de Modelos por Tarefa Salvo (`DT-01`..`DT-12`)  

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

## 3. Backlog Priorizado — Sprint 2 (`v2.0.0-2d` — `docs/PLANO_REFATORACAO_E_VISUAL.md`)

- [ ] **Passo 1 `[Gemini 3.1 Pro]` (Blocker — `DT-01`, `DT-08`):** `SpatialCollisionIndex` para colisão/LoS/Fog dinâmica em `CellType.DOOR` + unificação de raycast 2D `castHitscan()`.
- [ ] **Passo 2 `[Gemini 3 Flash]` (Blocker — `DT-03`, `DT-04`):** Desbloqueio de máscaras `REG_A` nos terminais para solubilidade de `1111` em $\mathbb{F}_2^4$ + separação de `#hudRegA`, `#hudTargetRegB` e `#hudLastAluOp`.
- [ ] **Passo 3 `[Gemini 3 Flash]` (Blocker — `DT-02`, `DT-11`):** Fim do deadlock em `PAUSED` (`PauseModal`, `ControlsModal`, `OnboardingModal`, `CodexModal`) + input 2D por cursor livre no `<canvas>` (sem Pointer Lock), `e.repeat` e `AbortController`.
- [ ] **Passo 4 `[Gemini 3.1 Pro]` (Crítica — `DT-05`, `DT-09`, `DT-12`):** Extração da *God Closure* `main.ts` para `GameSession` + `IEcsSystem` + `Camera2D` (*cursor lead* + *screen-shake*), cache de queries em `World.ts`, vitória (`RN-05`) e blindagem de `src/ecs` em `boundaries.test.ts`.
- [ ] **Passo 5 `[Gemini 3 Flash]` (Crítica — `DT-07`, `DT-08`):** Projéteis físicos de plasma do `OVERFLOW` (`14 u/s`, `RF-21`) visíveis em 2D e validação estrita do bônus `ZF=1` no 1º pulso.
- [ ] **Passo 6 `[Gemini 3.1 Pro]` (Migração 2D — `DT-06`):** Remoção de `@babylonjs/core` (~5 MB) e criação de `Canvas2dRenderAdapter` (Offscreen Tilemap 3/4, `Z-sort`, protagonista 4 direções + rifle `PULSE-9` 360°, badges diegéticos `[REG_B]`) + `FogOfWarVisibility2D` (sombras reais de paredes/portas lógicas).
- [ ] **Passo 7 `[Gemini 3 Flash + host_image / gpt-image-2.5-sunburst]` (Visual 2D — `DT-10`):** Produção, quantização na paleta oficial e QA (`--strict-qc`) de sprites 3/4 (Protagonista, `PULSE-9`, `BITLING`, `OVERFLOW`), tileset PCB e VFX (`codeart2d`) via `ForgeSpriteAssetAdapter`.
- [ ] **Passo 8 `[Gemini 3 Flash]` (Qualidade):** Testes Vitest (`Camera2D`, `FogOfWarVisibility2D`, `GameplayLoop`) + suíte E2E Playwright 2D e fechamento do Memory Bank `v2.0.0-2d`.
