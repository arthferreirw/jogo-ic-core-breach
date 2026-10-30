# CHANGELOG — BREACH CORE

Todas as alterações notáveis deste projeto serão documentadas neste arquivo.
O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

---

## [1.0.0-mvp] - 2026-10-30

### Added
- **Sistemas de Simulação Física e Cinemática (RF-05..RF-08):**
  - `Vec2.ts`: Vetores 2D com normalização diagonal estrita (elimina aceleração indevida com W+D).
  - `AngleMath.ts`: Clamping de pitch da câmera em primeira pessoa [-75°, +75°].
  - `CollisionMath.ts`: Cálculo de projeção de deslizamento em paredes (*wall-sliding* suave).
  - `DdaRaycaster.ts`: Algoritmo DDA para raycasting em grid 2.5D milimétrico sem motor externo.
- **Level Design Declarativo (RF-22..RF-25):**
  - `MvpSectorBlueprint.ts`: Setor único completo com 5 áreas conectadas (Boot Sector -> Barramento -> Porta Lógica 01 -> Câmara da ULA -> Câmara do Núcleo Central), com spawns de Bitlings, Overflows, terminais pedagógicos e pickups.
- **Sistemas de Gameplay ECS:**
  - `PlayerControlSystem.ts`: Movimentação WASD e rotação Mouse Look (Pointer Lock).
  - `MovementAndCollisionSystem.ts`: Integração física com *wall-sliding* contra paredes e portas trancadas.
  - `WeaponSystem.ts`: Disparo da `PULSE-9` com *hitscan* DDA, cadência de tiro e capacitor de emergência.
  - `LogicalPulseSystem.ts`: Disparo do Pulso XOR contra alvos binários (OVERFLOW e Portas Lógicas), cálculo de `REG_A XOR REG_B`, anulação com `ZF=1` e atordoamento de 1.5s.
  - `AiFsmSystem.ts`: Inteligência artificial para BITLING (perseguição melee) e OVERFLOW (combate à média distância e escudo frontal) com verificação de linha de visão (LoS).
  - `InteractionAndDoorSystem.ts`: Interação [E] com terminais pedagógicos e animação de abertura de portas destravadas.
  - `PickupSystem.ts`: Coleta automática de vida, escudo e munição.
  - `TargetInspectionSystem.ts`: Inspeção do estado de registrador do alvo sob o retículo da mira.
  - `RenderSyncSystem.ts`: Sincronização agnóstica de entidades ECS com a porta de renderização.
- **Adaptadores de Infraestrutura e Portas:**
  - `BabylonRenderAdapter.ts`: Renderizador 3D WebGL2 com Babylon.js 7, iluminação sci-fi neon, malhas modulares e sprites em *billboarding* no eixo Y.
  - `ProceduralPixelAssetAdapter.ts`: Síntese procedural de texturas e sprites pixel-art RGBA (`NEAREST_SAMPLINGMODE`) em Canvas2D fiel à paleta oficial.
  - `BrowserInputAdapter.ts`: Gestor de teclado, mouse, Pointer Lock e pausa automática ao perder foco.
  - `WebAudioSynthAdapter.ts`: Sintetizador retrô Web Audio puro sem dependências externas.
- **Camada de Apresentação UI (RF-01..RF-04, RF-26..RF-28):**
  - `retro-terminal.css`: Estilização CRT/Terminal com paleta oficial (`#101820`, `#39FF88`, `#00D9FF`, `#FF9D36`).
  - `HudPresenter.ts`: Atualização reativa de HP, SHLD, AMMO, LEDs do ciclo de instrução, mira central, distância do Núcleo e toasts de 5.5s.
  - `index.html`: Shell da aplicação contendo canvas, layout HUD e modais de Menu e Debrief com reinício em memória via `Enter`.
- **Testes de Integração e Build:**
  - `GameplayLoop.test.ts`: Teste multi-frame comprovando combate, quebra de escudo XOR, eliminação e múltiplos resets consecutivos em memória sem recarregar a página.
  - 47 testes automatizados passando em 1.1s.
  - Build de produção compilada via Vite e TypeScript.

---

## [0.2.0-phase2] - 2026-10-30

### Added
- Módulos de hardware computacional e ULA (Nibble, AluEngine, XorGateStrategy, RegisterBank, InstructionCycleTracker).
- Regras de combate e pontuação (DamageCalculator, AmmoCapacitor, ScoreLedger, CodexTracker).
- Kernel ECS (World, CombatComponents, EntityFactory, EventBus, GameStateMachine, GameLoop).

---

## [0.1.0-phase1] - 2026-10-30

### Added
- Toolchain de compilação estrita e Memory Bank (`arquitetura.md`, `estado_atual.md`, `changelog.md`).
- Teste arquitetural `boundaries.test.ts` e catálogos de domínio.
