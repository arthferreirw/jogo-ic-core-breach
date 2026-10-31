# Auditoria Técnica, Plano de Refatoração Passo a Passo e Pipeline Visual (`agent-sprite-forge`)

**Projeto:** CORE BREACH (*Breach Core*)  
**Data da Auditoria:** 30 de outubro de 2026  
**Escopo:** Revisão arquitetural pós-MVP (`v1.0.0-mvp`), eliminação de *Blockers* e *VRAM Leaks*, blindagem Clean Architecture/ECS e upgrade visual completo com `0x0funky/agent-sprite-forge`.

---

## Sumário

1. [Resumo Executivo da Auditoria (4 Pilares)](#1-resumo-executivo-da-auditoria-4-pilares)
2. [Matriz Completa de Débito Técnico](#2-matriz-completa-de-débito-técnico)
3. [Diagnóstico do Ambiente `agent-sprite-forge`](#3-diagnóstico-do-ambiente-agent-sprite-forge)
4. [Passo a Passo de Execução (Roteiro Técnico Fases A -> H)](#4-passo-a-passo-de-execução-roteiro-técnico-fases-a---h)
   - [Passo 1 (Blocker): Colisão Dinâmica de Portas e Unificação de Hitscan (`SpatialCollisionIndex`)](#passo-1-blocker-colisão-dinâmica-de-portas-e-unificação-de-hitscan-spatialcollisionindex)
   - [Passo 2 (Blocker): Solubilidade Algébrica em GF(2) e Correção do HUD (`REG_A` / `TARGET`)](#passo-2-blocker-solubilidade-algébrica-em-gf2-e-correção-do-hud-reg_a--target)
   - [Passo 3 (Blocker): Fim do Deadlock de Pausa, Modais Faltantes e Higienização de Input](#passo-3-blocker-fim-do-deadlock-de-pausa-modais-faltantes-e-higienização-de-input)
   - [Passo 4 (Crítica): Refatoração da God Closure (`main.ts` -> `GameSession` + `IEcsSystem`)](#passo-4-crítica-refatoração-da-god-closure-maints---gamesession--iecssystem)
   - [Passo 5 (Crítica): Projéteis Reais do `OVERFLOW` e Regras Estritas do Bônus `ZF=1`](#passo-5-crítica-projéteis-reais-do-overflow-e-regras-estritas-do-bônus-zf1)
   - [Passo 6 (Crítica): Otimização WebGL (Mesh Merge, Flyweight Materials, Object Pool) e Cache ECS](#passo-6-crítica-otimização-webgl-mesh-merge-flyweight-materials-object-pool-e-cache-ecs)
   - [Passo 7 (Visual): Produção e Integração de Sprites/Texturas com `agent-sprite-forge`](#passo-7-visual-produção-e-integração-de-spritestexturas-com-agent-sprite-forge)
   - [Passo 8 (Qualidade): Testes de Integração, Playwright E2E e Fechamento do Memory Bank](#passo-8-qualidade-testes-de-integração-playwright-e2e-e-fechamento-do-memory-bank)

---

## 1. Resumo Executivo da Auditoria (4 Pilares)

O núcleo matemático de domínio (`Nibble`, `AluEngine`, `XorGateStrategy`, `DamageCalculator`, `AmmoCapacitor`) encontra-se íntegro e bem coberto por testes unitários, mas a camada de integração entre **ECS, Aplicação, Renderização WebGL e UI DOM** acumula **4 falhas *Blocker* de gameplay/estado** e **vazamentos graves de memória gráfica (VRAM)**.

### 1.1. Qualidade de Código (SOLID, Clean Code e DRY)
- ***God Closure* em `src/main.ts`:** A função `bootstrap()` (225 linhas) acumula injeção de dependências, estado mutável de sessão, orquestração procedural do loop, regras de vitória corrompidas e manipulação direta do DOM.
- **Violação de OCP e *Long Parameter List*:** Todos os 9 sistemas em `src/ecs/systems/` são classes estáticas sem interface comum (`IEcsSystem`); `LogicalPulseSystem.update()` recebe **11 argumentos posicionais**.
- **Violação de DRY:** O algoritmo de raycast DDA somado à interseção raio-círculo está triplicado literalmente em `WeaponSystem.ts`, `LogicalPulseSystem.ts` e `TargetInspectionSystem.ts`.
- **Métodos *No-Op* Ocultos:** `BabylonRenderAdapter.triggerMuzzleFlash()` e `triggerPlayerDamageFlash()` possuem corpos vazios.

### 1.2. Arquitetura (Acoplamento, Estado e DIP)
- **Violação Ascendente de Camada (`ECS -> Application`):** Sistemas dentro de `src/ecs/systems/` importam `@app/ports/*` e `@app/events/EventBus`, contrariando `Application -> ECS -> Domain`.
- **Lacuna em `tests/architecture/boundaries.test.ts`:** A verificação sobre `src/ecs` testa apenas 3 tokens (`@babylonjs`, `babylonjs`, `HTMLCanvasElement`), permitindo imports indevidos de `@app`, `@infra`, `window.` e `document.`.
- **Quebra de DIP na UI:** `HudPresenter.ts` importa diretamente `ProceduralPixelAssetAdapter` (`@infra`) e mantém referência direta à entidade de domínio `RegisterBank`.
- **Mutação Indevida em Consulta:** `TargetInspectionSystem.ts` chama `registerBank.storeOperation()` apenas ao apontar a mira para um alvo, sobrescrevendo o histórico `RES` sem execução da ULA.

### 1.3. Performance (Game Loop, Big O e Alocação de Memória)
- **Consultas ECS `O(N * K)` sem Cache:** `World.query()` varre todas as entidades vivas e aloca um novo array `EntityId[]` 8 vezes por frame (`480 arrays/s` a 60Hz).
- **Explosão de *Draw Calls* Estáticos:** `BabylonRenderAdapter.buildLevel()` cria ~280 `Mesh`es separados para paredes estáticas sem `Mesh.MergeMeshes` (~280 *draw calls*/frame) e reconstrói tudo a cada `restartGame()`.
- **Vazamento de VRAM (`StandardMaterial` Leak):** `triggerImpactFlash()` cria um `new StandardMaterial` a cada tiro e usa `setTimeout(() => impact.dispose(), 80)` — no Babylon.js, `mesh.dispose()` não descarta o material por padrão, acumulando materiais órfãos indefinidamente em `scene.materials`. O mesmo ocorre ao destruir inimigos em `syncEntities()`.
- **Thrashing de DOM a 60Hz:** `main.ts` publica `PLAYER_HEALTH_CHANGED`, `PLAYER_AMMO_CHANGED` e `SCORE_CHANGED` em **todos os frames**, forçando 180 atualizações de DOM/segundo sem necessidade.

### 1.4. UX e Mecânicas (Game Feel, Álgebra Booleana e Inputs)
- **Deadlock Irreversível em `PAUSED`:** Apertar `Esc` libera o *Pointer Lock* e transita para `GameState.PAUSED`, mas não há modal de pausa nem botão/handler de retorno para `PLAYING`. O jogo trava exigindo `F5`. Os controles `btnControls` e `Tab` (Códice) também estão desconectados.
- **Portas Lógicas Sem Colisão:** `isSolidCell` verifica apenas `CellType.WALL`, ignorando `CellType.DOOR` e `collider.isSolid`. O jogador atravessa portas trancadas caminhando e inimigos enxergam/atiram através delas.
- **Escudo `1111` Matematicamente Impossível ($\mathbb{F}_2^4$):** O jogador possui apenas `{1010, 1100}` em `REG_A` e nenhum terminal desbloqueia novas máscaras. Como $\text{span}_{\mathbb{F}_2}\{1010, 1100\} = \{0000, 1010, 1100, 0110\}$, o escudo `1111` do `OVERFLOW` final jamais pode ser zerado (`0000`).
- **`OVERFLOW` sem Projéteis Físicos:** `AiFsmSystem` aplica dano *hitscan* instantâneo em vez de disparar projéteis esquiváveis a `14 u/s` (`RF-21`).
- **Congelamento de `REG_A` no HUD:** Após o 1º Pulso XOR, `#hudRegStatus` passa a conter `'^'`, fazendo a condição `!textContent.includes('^')` em `HudPresenter.updateRegA()` impedir para sempre a atualização visual de `REG_A` ao pressionar `R`.

---

## 2. Matriz Completa de Débito Técnico

| ID | Componente | Problema Identificado | Solução Técnica | Prioridade | Esforço |
| :---: | :--- | :--- | :--- | :---: | :---: |
| **DT-01** | `main.ts` / `MovementAndCollisionSystem` | Portas Lógicas (`CellType.DOOR`) não bloqueiam jogador, tiros ou visão (LoS) dos inimigos. | Criar `SpatialCollisionIndex` rastreando células dinâmicas de portas sólidas (`slideProgress < 0.8`). | **Blocker** | Baixo |
| **DT-02** | `main.ts` / `index.html` | Estado `PAUSED` sem modal e sem transição de retorno (`PAUSED -> PLAYING`); `CONTROLS` e `Tab` mortos. | Implementar `UiRootController` com `PauseModal`, `ControlsModal`, `OnboardingModal` e `CodexModal`. | **Blocker** | Médio |
| **DT-03** | `MvpSectorBlueprint` / `InteractionAndDoorSystem` | Escudo `1111` insolúvel com `{1010, 1100}` em $\mathbb{F}_2^4$; terminais não carregam máscaras. | Adicionar `unlockMask` aos terminais (ex.: desbloquear `0101` ou `1111` na Câmara da ULA). | **Blocker** | Baixo |
| **DT-04** | `HudPresenter` / `TargetInspectionSystem` | `REG_A` congela no HUD após 1º XOR (`includes('^')`); mirar altera `RES` e não mostra `TARGET`. | Separar elementos DOM `#hudRegA`, `#hudTargetRegB` e `#hudLastOp`; publicar `TARGET_INSPECTED`. | **Blocker** | Baixo |
| **DT-05** | `main.ts` / `src/ecs/systems/*` | *God Closure*; sistemas estáticos acoplados a `@app/ports`; vitória por proximidade sem limpar sala ou apertar `[E]`. | Extrair `GameSession`, `IEcsSystem`, `SimulationEffectQueue` e `HudStateDiffer`; corrigir `RN-05`. | **Crítica** | Alto |
| **DT-06** | `BabylonRenderAdapter` | Vazamento de `StandardMaterial` na VRAM; ~280 *draw calls* estáticos; `setTimeout` fora do loop; sem `resize`. | `Mesh.MergeMeshes` nas paredes, materiais *Flyweight*, *Object Pool* de impactos por `dt` e `engine.resize()`. | **Crítica** | Médio |
| **DT-07** | `AiFsmSystem` | `OVERFLOW` causa dano instantâneo inevitável em vez de disparar projétil de plasma (`RF-21`). | Implementar `ProjectileComponent` e `ProjectileSystem` (`14 u/s`) com colisão de parede e jogador. | **Crítica** | Médio |
| **DT-08** | `WeaponSystem` / `LogicalPulseSystem` / `TargetInspectionSystem` | Código de raycast raio-círculo triplicado; Pulso XOR atinge travas já abertas e dá bônus `+150` após múltiplos tiros. | Centralizar `castHitscan()` em `SpatialCollisionIndex`; checar `binaryLock.active` e `pulseHitCount === 0`. | **Alta** | Médio |
| **DT-09** | `World.ts` / `main.ts` | `World.query()` aloca 480 arrays/s; `EventBus` sofre flood de 180 eventos/s sem mudança de estado. | Cachear arquétipos por assinatura em `World` e aplicar `HudStateDiffer` antes de publicar no `EventBus`. | **Alta** | Médio |
| **DT-10** | `ProceduralPixelAssetAdapter` | Sprites atuais são blocos retangulares simples em Canvas2D, sem quadros de animação, sombreamento ou atlas. | Substituir por assets RGBA pixel-art gerados e validados com `0x0funky/agent-sprite-forge` via `IAssetPort`. | **Alta** | Médio |
| **DT-11** | `BrowserInputAdapter` | Falta filtro `e.repeat` em teclas discretas (`Q`, `R`, `E`, `Tab`), bloqueio de `contextmenu` (`M2`) e `dispose()`. | Ignorar `e.repeat`, prevenir `contextmenu` no `<canvas>` e gerenciar listeners via `AbortController`. | **Média** | Baixo |
| **DT-12** | `boundaries.test.ts` | `src/ecs` não é auditado contra imports de `@app`, `@infra`, `@presentation` ou DOM. | Unificar regras estritas do *Boundary Enforcer* para `src/domain` e `src/ecs`. | **Média** | Baixo |

---

## 3. Diagnóstico do Ambiente `agent-sprite-forge`

O pacote `0x0funky/agent-sprite-forge` foi instalado no projeto em `.agents/skills/` para o Antigravity, disponibilizando **5 skills especializadas**:

| Skill Instalada | Caminho Local | Papel no Upgrade Visual de Core Breach |
| :--- | :--- | :--- |
| **`generate2dsprite`** | `.agents/skills/generate2dsprite/` | Criação, chroma-keying, corte (*slicing*), registro de âncora, redução pixel-art (`palette_tool.py`, `pixel_reduce.py`), QA e empacotamento de sprites (`BITLING`, `OVERFLOW`, `PULSE-9`, ícones e VFX). |
| **`generate2dmap`** | `.agents/skills/generate2dmap/` | Extração e validação *seamless* de tiles/texturas de cenário (`extract_terrain_tiles.py`, `extract_prop_pack.py`) para paredes, pisos, portas e terminais. |
| **`codeart2d`** | `.agents/skills/codeart2d/` | Arte declarativa via código (`PixelSpec`, `fx.v1`, `autotile_build.py`, `pixel_qa.py`) com validação matemática de paleta e emendas (*seam-proven*) quando solicitado `art_source: "code"`. |
| **`video2dsprite`** | `.agents/skills/video2dsprite/` | Animação *image-to-video* a partir de um *Master Still* aprovado (opcional caso uma chave `XAI_API_KEY` / `FAL_KEY` seja configurada). |
| **`generate2dmedia`** | `.agents/skills/generate2dmedia/` | Roteador de geração (`route_media.py`) e diagnóstico de ambiente (`forge_doctor.py`). |

### Status Verificado pelo `forge_doctor.py` nesta Máquina
- **Python 3.12.3 + NumPy 2.5.2 + Pillow 10.2.0 + FFmpeg 6.1.1:** `[OK]` (prontos para uso imediato).
- **Ferramenta Nativa de Imagem do Host (`image-generator` do Antigravity):** `[OK]` (permite gerar *Master Stills* e *Sprite Sheets* sem exigir chaves externas, passando os PNGs gerados para os scripts determinísticos de corte, paleta, pixel-art e QA do Forge).
- **Dependências Opcionais Recomendadas:**
  ```bash
  python3 -m pip install "scipy>=1.11" "resvg-py>=0.5,<0.6"
  ```
- **Atenção ao Caminho do Projeto (`WARN paths.cwd`):** Como o diretório contém espaço e acento (`Área de trabalho`), **sempre envolva caminhos entre aspas duplas `"..."`** ao executar os scripts Python do Forge e utilize nomes de pastas ASCII para saída (ex.: `art_forge/out_bitling_v1`).

---

## 4. Passo a Passo de Execução (Roteiro Técnico Fases A -> H)

Siga as etapas abaixo **exatamente na ordem listada**. Cada passo mantém o projeto compilável e testável.

---

### Passo 1 (Blocker): Colisão Dinâmica de Portas e Unificação de Hitscan (`SpatialCollisionIndex`)

**Objetivo:** Impedir que jogador, tiros e visão dos inimigos atravessem Portas Lógicas fechadas (`DT-01`) e eliminar a triplicação de código de raycasting (`DT-08`).

1. **Criar `src/ecs/spatial/SpatialCollisionIndex.ts`:**
   - Manter `closedDoorCells: Set<number>`.
   - Implementar `rebuildDynamicBlockers(world: World)`: consulta `world.query(['transform', 'doorSlide', 'collider'])` e, para cada porta com `collider.isSolid === true`, marca os tiles correspondentes `(cellZ * width + cellX)` como bloqueados.
   - Expor `isSolidCell = (cx: number, cz: number): boolean` retornando `true` fora dos limites do grid, em `CellType.WALL` ou quando `closedDoorCells.has(cz * width + cx)`.
   - Expor `castHitscan(...)` centralizando `DdaRaycaster.cast` + interseção raio-círculo sem instanciar `Vec2` dentro do loop de candidatos.
2. **Refatorar `WeaponSystem.ts`, `LogicalPulseSystem.ts` e `TargetInspectionSystem.ts`:**
   - Substituir os loops manuais de projeção vetorial por chamadas a `spatialIndex.castHitscan(...)`.
3. **Validação (TDD):**
   - Criar teste em `tests/integration/GameplayLoop.test.ts` movendo o jogador contra a *Porta Lógica 01* (`z = 15.0`) com `W` pressionado por 60 frames: afirmar `playerTransform.z < 14.65`. Disparar Pulso XOR com `REG_A = 1010`, avançar 30 frames (`0.5s`) para abertura da porta e afirmar `playerTransform.z > 15.5`.

---

### Passo 2 (Blocker): Solubilidade Algébrica em GF(2) e Correção do HUD (`REG_A` / `TARGET`)

**Objetivo:** Tornar todos os escudos e portas matematicamente anuláveis (`DT-03`) e garantir visibilidade contínua de `REG_A` e `REG_B` no HUD (`DT-04`).

1. **Estender Terminais com Carga de Registrador:**
   - Em `src/ecs/components/CombatComponents.ts`, adicionar `unlockMask?: Nibble` em `TerminalComponent`.
   - Em `src/domain/level/MvpSectorBlueprint.ts`:
     - Terminal `REGISTERS` (`x: 8, z: 2`): `unlockMask: Nibble.fromBinaryString('1100')`.
     - Terminal `ALU` (`x: 3, z: 17`): `unlockMask: Nibble.fromBinaryString('0101')` (pois `1010 ^ 0101 = 1111`, ou desbloquear diretamente `1111`, garantindo base completa para zerar o `OVERFLOW` `1111` na sala final com bônus `ZF=1` no 1º pulso!).
   - Em `InteractionAndDoorSystem.ts`, ao interagir (`[E]`) com um terminal que possua `unlockMask`, chamar `registerBank.unlockMask(comp.unlockMask)` e emitir evento `REGISTER_MASK_UNLOCKED`.
2. **Separar Inspeção de Alvo da Execução da ULA:**
   - Em `TargetInspectionSystem.ts`, **remover** `registerBank.storeOperation(...)`. Em vez disso, gravar o estado inspecionado (`targetMask: string | null`) em um estado de leitura/evento `TARGET_INSPECTED` apenas quando o alvo sob a mira mudar.
3. **Corrigir `index.html` e `HudPresenter.ts`:**
   - Dividir `#hudRegStatus` em três linhas/spans dedicados no painel superior esquerdo:
     - `REG_A: <span id="hudRegA">1010</span> [R]`
     - `TARGET (REG_B): <span id="hudTargetRegB">----</span>`
     - `LAST ALU OP: <span id="hudLastAluOp">NONE</span>`
   - Remover a condição defeituosa `!this.regStatus.textContent?.includes('^')` de `HudPresenter.updateRegA()`.

---

### Passo 3 (Blocker): Fim do Deadlock de Pausa, Modais Faltantes e Higienização de Input

**Objetivo:** Tornar todos os estados da `GameStateMachine` navegáveis (`DT-02`) e eliminar bugs de repetição de tecla/menu de contexto (`DT-11`).

1. **Adicionar Modais em `index.html`:**
   - `#onboardingModal`: Resumo rápido de controles antes da 1ª partida (`RF-02`) com botão `ENGAGE SYSTEM`.
   - `#pauseModal`: Exibido automaticamente em `GameState.PAUSED` (`RF-03`), contendo botões `RESUME`, `CONTROLES`, `MUTE AUDIO` e `QUIT TO MENU`.
   - `#controlsModal`: Tabela de teclas acessível tanto do Menu Inicial quanto da Pausa, com botão `VOLTAR`.
   - `#codexModal`: Overlay acionado por `[Tab]` (`RF-28`) listando os 5 conceitos de `CodexTracker.getAllConcepts()` (bloqueados vs aprendidos).
2. **Criar `src/presentation/ui/UiRootController.ts`:**
   - Ouvir `GAME_STATE_CHANGED` no `EventBus` e alternar `display: flex / none` de todos os modais a partir de uma única fonte de verdade.
   - Ao clicar em `RESUME`, executar `fsm.transitionTo(GameState.PLAYING)` e `inputPort.requestPointerLock()`.
3. **Corrigir `src/infrastructure/input/BrowserInputAdapter.ts`:**
   - No início de `handleKeyDown(e)`: adicionar `if (e.repeat) return;` antes das teclas discretas (`KeyQ`, `KeyR`, `KeyE`, `Tab`, `Escape`).
   - Em `bindCanvas(canvas)`: adicionar `canvas.addEventListener('contextmenu', (e) => e.preventDefault())` e remover a chamada automática de `requestPointerLock()` em cliques avulsos fora do estado `PLAYING`.
   - Encapsular todos os `addEventListener` com `AbortController` e implementar `dispose()`.

---

### Passo 4 (Crítica): Refatoração da God Closure (`main.ts` -> `GameSession` + `IEcsSystem`)

**Objetivo:** Restaurar Clean Architecture estrita, SOLID e regras exatas de vitória (`DT-05`, `DT-12`).

1. **Definir `src/ecs/core/IEcsSystem.ts`:**
   - Criar interface `IEcsSystem { update(dt: number, effects: SimulationEffectQueue): void }` e `SimulationEffectQueue` dentro de `src/ecs/` (zero imports de `@app`).
   - Converter os sistemas estáticos em classes instanciáveis com dependências de domínio/ECS injetadas no construtor.
2. **Criar `src/application/session/GameSession.ts` e `HudStateDiffer.ts`:**
   - Mover `initSession()`, o pipeline de execução dos `IEcsSystem[]`, o consumo da `SimulationEffectQueue` (traduzindo efeitos para chamadas em `IAudioPort` e `IRenderPort`) e a verificação de fim de partida para `GameSession`.
   - Usar `HudStateDiffer` para publicar `PLAYER_HEALTH_CHANGED`, `PLAYER_AMMO_CHANGED`, `SCORE_CHANGED` e `TARGET_INSPECTED` **somente quando houver alteração real de valor**.
   - Corrigir a condição de vitória (`RN-05` / `RF-25`):
     - Verificar se todos os inimigos da Câmara do Núcleo Central foram derrotados (`world.query(['aiFsm']).length === 0`), se `distToCore <= 2.5` (exibindo prompt `[E] RESTORE CPU CORE` no HUD) e se `input.interact === true`.
3. **Enxugar `src/main.ts`:**
   - Reduzir `main.ts` a ~45 linhas: apenas instanciação de adaptadores, injeção em `GameSession` e `UiRootController`, e start.
4. **Blindar `tests/architecture/boundaries.test.ts`:**
   - Aplicar a lista completa `FORBIDDEN_TOKENS` (incluindo `@app`, `src/application`, `@infra`, `@presentation`, `window.`, `document.`) também sobre `src/ecs/`.

---

### Passo 5 (Crítica): Projéteis Reais do `OVERFLOW` e Regras Estritas do Bônus `ZF=1`

**Objetivo:** Cumprir `RF-21` (esquiva lateral real contra projéteis de plasma) e `RN-05` (bônus lógico justo) (`DT-07`, `DT-08`).

1. **Implementar Projéteis Físicos:**
   - Adicionar `ProjectileComponent { ownerId: EntityId; damage: number; ttlSec: number }` em `CombatComponents.ts` e `EntityFactory.createPlasmaProjectile(world, x, z, dirX, dirZ)`.
   - Em `AiFsmSystem.ts`, quando `OVERFLOW` atacar, instanciar um projétil com velocidade `14.0 u/s` na direção atual do jogador em vez de aplicar dano imediato.
   - Criar `src/ecs/systems/ProjectileSystem.ts`: integra `(x, z)` do projétil, destrói ao colidir com `spatialIndex.isSolidCell`, ou aplica `DamageCalculator.applyDamageToPlayer` e destrói ao colidir com o raio do jogador (`CollisionMath.testCircleCircle`).
2. **Corrigir `LogicalPulseSystem.ts`:**
   - Adicionar `pulseHitsTaken: number` em `BinaryLockComponent` (iniciando em `0`).
   - Ignorar entidades onde `binaryLock.active === false` no predicado de `castHitscan`.
   - Ao atingir um alvo ativo, incrementar `binaryLock.pulseHitsTaken++` e só conceder `scoreLedger.recordLogicalEfficiencyBonus()` (`+150 pts`) se `operationResult.zeroFlag && binaryLock.pulseHitsTaken === 1`.

---

### Passo 6 (Crítica): Otimização WebGL (Mesh Merge, Flyweight Materials, Object Pool) e Cache ECS

**Objetivo:** Eliminar vazamentos de VRAM, reduzir *draw calls* em ~95% e cortar alocações no Game Loop (`DT-06`, `DT-09`).

1. **Otimizar `src/infrastructure/babylon/BabylonRenderAdapter.ts`:**
   - **Static Level Merge:** Em `buildLevel()`, mesclar todas as caixas de parede em uma única malha com `Mesh.MergeMeshes(wallBoxes, true, true)` + `mergedWalls.freezeWorldMatrix()`, construindo a geometria estática apenas uma vez (`if (this.staticLevelBuilt) return;`).
   - **Flyweight Materials:** Criar `sharedBitlingMat`, `sharedOverflowMat`, `sharedProjectileMat`, `sharedTerminalMat`, `sharedPickupMat` e `sharedImpactMat` uma única vez em `initMaterials()`, reutilizando-os em todas as entidades (nunca criar `new StandardMaterial` dentro de `syncEntities` ou `triggerImpactFlash`).
   - **Object Pool de Impactos & Feedback Visual:** Pré-alocar 12 planos de impacto desabilitados (`setEnabled(false)`) e avançar seus timers em `tickEffects(dt)` (eliminando `setTimeout`). Implementar `triggerMuzzleFlash()` (luz pontual curta + classe CSS `.firing` na arma) e `triggerPlayerDamageFlash()` (vinheta laranja/vermelha `#damageVignette` por `180ms`).
   - **Resize Listener:** Registrar `window.addEventListener('resize', this.handleResize)` e removê-lo em `dispose()`.
2. **Cachear Queries em `src/ecs/core/World.ts`:**
   - Manter `queryCache: Map<string, readonly EntityId[]>` indexado pela assinatura ordenada dos componentes (`'collider,transform,velocity'`) e invalidar o cache apenas em `addComponent`, `removeComponent`, `destroyEntity` e `clear`.

---

### Passo 7 (Visual): Produção e Integração de Sprites/Texturas com `agent-sprite-forge`

**Objetivo:** Elevar o padrão visual do jogo substituindo os retângulos provisórios de Canvas2D por spritesheets, ícones e texturas pixel-art RGBA autênticos e auditados pelas ferramentas de QA do `agent-sprite-forge` (`DT-10`).

#### 7.1. Arquitetura de Desacoplamento (`IAssetPort`)
Criar `src/application/ports/IAssetPort.ts` expondo URLs/DataURIs e metadados de frames (`SpriteClipManifest`), com duas implementações intercambiáveis:
- `ForgeSpriteAssetAdapter` (produção: carrega atlas `.png` + `animation-clips.json` gerados pelo Forge em `public/assets-forge/`);
- `ProceduralPixelAssetAdapter` (fallback leve para testes headless).

#### 7.2. Catálogo de Assets a Gerar com `agent-sprite-forge`

Paleta oficial obrigatória (`art_forge/core_breach_palette.json`):
- Metal escuro / sombras: `#0A0F14`, `#101820`, `#1B2631`, `#2A3B4D`, `#5B6B7D`
- Verde terminal: `#1E7A44`, `#39FF88`, `#A8FFCC`
- Ciano elétrico: `#006B80`, `#00D9FF`, `#B8F4FF`
- Laranja alerta: `#8F4700`, `#FF9D36`, `#FFD199`

| Lote | Asset | Skill Forge Responsável | Formato Alvo em `public/assets-forge/` |
| :---: | :--- | :--- | :--- |
| **1** | **BITLING** (`idle/chase`, `attack`, `hit/death`) | `generate2dsprite` (ou `codeart2d` PixelSpec) | `sprites/bitling/` (`64x64` RGBA, binary alpha, `NEAREST`) |
| **2** | **OVERFLOW** (`idle/walk`, `fire`, `shield_active`, `stunned`) | `generate2dsprite` (ou `codeart2d` PixelSpec) | `sprites/overflow/` (`96x96` RGBA, binary alpha, `NEAREST`) |
| **3** | **Viewmodel `PULSE-9`** (`idle`, `recoil_fire`, `xor_cast`) | `generate2dsprite` (`process --scale-strategy registered`) | `sprites/pulse9/` (`256x256` RGBA ancorado na base) |
| **4** | **VFX & Projéteis** (`muzzle_flash`, `impact_sparks`, `xor_ring`, `plasma_orb`) | `generate2dsprite` / `codeart2d` (`fx_build.py`) | `vfx/` (atlas horizontal RGBA + `clips.json`) |
| **5** | **Ícones HUD & Pickups** (`hp`, `shield`, `ammo`, `xor_bolt`, `cpu_core`, `terminal`) | `generate2dsprite` (`32x32` sheet `2x3`) | `ui/icons/` (6 PNGs `32x32` RGBA nítidos) |
| **6** | **Texturas Modulares 3D** (`wall_circuit`, `floor_bus`, `ceiling_grid`, `logic_door`, `core_panel`) | `generate2dmap` (`extract_terrain_tiles.py --edge-policy seamless`) | `textures/` (`128x128` PNG *seamless* validados) |

#### 7.3. Comandos Passo a Passo do Pipeline Forge

> **Regra de Ouro:** Sempre execute a partir da raiz do projeto colocando os caminhos entre aspas duplas devido ao espaço/acento no caminho do diretório.

1. **Gerar / Aprovar Master Still de Inimigos (usando `image-generator` do Antigravity ou API configurada + `generate2dsprite`):**
   - Gerar imagem base em fundo magenta puro `#FF00FF` (sem gradiente ou sombra no fundo), inspirada na silhueta conceitual de `assets/inimigo.jpeg` (`BITLING`) e `assets/inimigo_longa_distancia.jpeg` (`OVERFLOW`).
   - Aprovar, recortar chroma-key e registrar o *Master Still*:
     ```bash
     python3 ".agents/skills/generate2dsprite/scripts/master_still.py" approve \
       --still "art_forge/raw/bitling_raw.png" \
       --route "host_image" \
       --name "bitling" \
       --class "mob" \
       --facing "front" \
       --finish "pixel" \
       --key "#FF00FF" \
       --output-dir "art_forge/masters/bitling_v1"
     ```
2. **Validar, Fatiar e Quantizar Sprite Sheets (Arma `PULSE-9`, Ícones, Frames de Ação e VFX):**
   ```bash
   # 1. Auditar vazamento entre células (spill QC) antes do corte
   python3 ".agents/skills/generate2dsprite/scripts/sheet_qc.py" spill \
     --input "art_forge/raw/pulse9_sheet.png" \
     --rows 1 --cols 4 \
     --output-dir "art_forge/qc/pulse9_spill_v1"

   # 2. Remover fundo (chroma key), fatiar e registrar âncora com QC estrito
   python3 ".agents/skills/generate2dsprite/scripts/generate2dsprite.py" process \
     --input "art_forge/raw/pulse9_sheet.png" \
     --target asset \
     --mode horizontal_strip \
     --rows 1 --cols 4 \
     --scale-strategy registered \
     --output-dir "art_forge/processed/pulse9_v1" \
     --strict-qc

   # 3. Aplicar paleta oficial sci-fi retrô e grid pixel-art limpo (binary alpha, sem dither)
   python3 ".agents/skills/generate2dsprite/scripts/palette_tool.py" apply \
     --input "art_forge/processed/pulse9_v1" \
     --palette "art_forge/core_breach_palette.json" \
     --output-dir "art_forge/paletted/pulse9_v1"

   # 4. Empacotar clipes de animação JSON para consumo no Babylon.js / HUD
   python3 ".agents/skills/generate2dsprite/scripts/build_animation_clips.py" \
     --manifest "art_forge/manifests/pulse9_clips.json" \
     --output-dir "public/assets-forge/sprites/pulse9"
   ```
3. **Gerar VFX Determinísticos e Texturas Seamless (`codeart2d` / `generate2dmap`):**
   ```bash
   # Extrair e provar ausência de costura (seamless tiling) nas texturas 3D de parede e piso
   python3 ".agents/skills/generate2dmap/scripts/extract_terrain_tiles.py" \
     --input "art_forge/raw/sector_tiles_raw.png" \
     --edge-policy seamless \
     --strict-qc \
     --output-dir "public/assets-forge/textures"
   ```
4. **Inspeção Visual Obrigatória (Acceptance Gate do Forge):**
   - Abrir e inspecionar visualmente todos os arquivos `review/*.png` e `sheet-qc.json` gerados antes de publicar em `public/assets-forge/`, verificando ausência de halo magenta (`key_ring_spill`) sobre fundo `#101820` e `#FFFFFF`.

---

### Passo 8 (Qualidade): Testes de Integração, Playwright E2E e Fechamento do Memory Bank

1. **Executar Pipeline de Qualidade Automatizada:**
   ```bash
   # Tipagem estrita (0 erros)
   npm run typecheck

   # Testes Arquiteturais + Unitários + Integração Multi-Frame
   npm run test:run

   # Cobertura de código do Domínio e ECS (Meta >= 90%)
   npm run test:coverage

   # Build de produção otimizada
   npm run build
   ```
2. **Adicionar Teste E2E de Navegador (`tests/e2e/GameplayFlow.spec.ts` com Playwright):**
   - Validar abertura sem erros de console, fluxo `MAIN_MENU -> ONBOARDING -> PLAYING`, pausa com `Esc` e retomada via botão `RESUME`, abertura do Códice com `Tab`, atualização separada de `#hudRegA` / `#hudTargetRegB`, e reset via `Enter` em `< 500ms` sem `framenavigated`.
3. **Sincronizar o Memory Bank na Raiz:**
   - Atualizar `arquitetura.md` (registrando `ADR-004: Pipeline Visual Agent-Sprite-Forge + Static Mesh Merging`), `estado_atual.md` e `changelog.md` para a versão `v1.1.0`.
