# CORE BREACH
## Briefing de Produto e Desenvolvimento

**Versão:** 1.0  
**Categoria:** Jogo educacional — First-Person Shooter (FPS)  
**Plataforma:** Navegador desktop  
**Gênero:** FPS arcade com elementos de aprendizagem  
**Direção visual:** Sci-fi retrô inspirado nos jogos de tiro dos anos 1990

---

## 1. Visão geral do projeto

CORE BREACH é um jogo FPS educacional ambientado no interior de um processador computacional corrompido. O jogador assume o papel de um programa de segurança encarregado de combater ameaças digitais, recuperar setores comprometidos e reativar o núcleo central do sistema.

O jogo combina a ação rápida de um FPS arcade com conceitos fundamentais de Arquitetura de Computadores. Durante a partida, o jogador encontra referências práticas a componentes como CPU, Unidade Lógica e Aritmética (ULA/ALU), registradores e ciclo de instrução.

A proposta é transformar conceitos tradicionalmente estudados de forma teórica em uma experiência interativa, na qual o jogador aprende enquanto explora, combate inimigos e utiliza habilidades relacionadas ao funcionamento de um processador.

O jogo deve priorizar a diversão, a clareza visual e a facilidade de compreensão. O conteúdo educacional deve estar integrado às mecânicas, sem interromper excessivamente o ritmo da partida.

## 2. Problema que o jogo pretende resolver

O estudo de Arquitetura de Computadores envolve conceitos abstratos que podem ser difíceis de visualizar, especialmente para estudantes que estão entrando em contato com o funcionamento interno de um computador.

CORE BREACH busca reduzir essa dificuldade por meio de uma representação interativa desses conceitos.

Em vez de apenas apresentar definições, o jogo permite que o jogador observe componentes computacionais representados no cenário, utilize operações lógicas como parte do combate e receba explicações curtas sobre os conceitos envolvidos.

O objetivo não é substituir aulas, livros ou exercícios tradicionais, mas oferecer uma experiência complementar que estimule a curiosidade e ajude a consolidar o aprendizado.

## 3. Objetivos do projeto

### 3.1. Objetivo geral

Desenvolver um FPS educacional para navegador que combine combate arcade, exploração de ambientes tecnológicos e aprendizagem prática de conceitos fundamentais de Arquitetura de Computadores.

### 3.2. Objetivos específicos

- Criar uma experiência de jogo simples de iniciar e fácil de compreender.
- Implementar movimentação em primeira pessoa, combate e interação com o cenário.
- Representar visualmente componentes de um sistema computacional.
- Introduzir conceitos de CPU, ULA, registradores e ciclo de instrução.
- Utilizar operações lógicas em mecânicas de jogo que apresentem resultados verificáveis.
- Fornecer feedback educacional curto, contextualizado e opcionalmente aprofundável.
- Manter o projeto tecnicamente simples, modular e viável para desenvolvimento independente.
- Permitir reiniciar a partida rapidamente e repetir desafios para consolidar o aprendizado.

## 4. Público-alvo

O público principal é composto por estudantes de Computação, especialmente aqueles que estão estudando Arquitetura de Computadores ou disciplinas introdutórias relacionadas ao funcionamento dos processadores.

O jogo também pode ser utilizado por pessoas interessadas em tecnologia que desejam compreender conceitos básicos de computação por meio de uma experiência interativa.

**Perfil esperado do jogador:**

- Conhecimento básico ou intermediário de computadores.
- Interesse por jogos de ação e experiências interativas.
- Pouca ou nenhuma experiência prévia com programação de baixo nível.
- Preferência por sessões curtas, objetivos claros e feedback imediato.

## 5. Proposta de valor

CORE BREACH transforma conceitos abstratos de Arquitetura de Computadores em elementos concretos de uma experiência de FPS.

A proposta se apoia em três pilares:

**Ação:** movimentação, combate, inimigos e progressão em ritmo arcade.

**Aprendizagem:** conceitos computacionais representados em cenários, habilidades, desafios e feedbacks.

**Simplicidade:** controles familiares, sessões curtas e implementação visual baseada em recursos reutilizáveis.

O jogo deve ensinar sem parecer uma sequência de slides ou um questionário convencional. O conteúdo educacional deve fazer sentido dentro do universo ficcional e contribuir para a experiência do jogador.

## 6. Universo e narrativa

O jogo se passa dentro de um sistema computacional que sofreu uma corrupção crítica. Setores da instalação foram comprometidos por entidades digitais hostis, comprometendo o funcionamento do processador central.

O jogador controla um programa de segurança que precisa atravessar os setores afetados, neutralizar as ameaças e restaurar o núcleo do sistema.

A narrativa deve ser simples e funcional. Ela existe para contextualizar os ambientes, os inimigos, as habilidades e os objetivos, sem exigir longas cenas, diálogos extensos ou sistemas complexos de história.

### Premissa narrativa

O núcleo computacional perdeu sua integridade. A corrupção se espalha pela instalação, transformando processos defeituosos em ameaças hostis. O programa de segurança precisa recuperar o controle do sistema antes que o núcleo entre em colapso.

### Direção de ambientação

- Corredores industriais e salas de processamento.
- Terminais, painéis, circuitos e estruturas metálicas.
- Núcleos de energia e áreas de processamento.
- Indicadores luminosos que comunicam o estado dos sistemas.
- Ambientes escuros com iluminação verde, ciano e laranja.

## 7. Experiência principal de jogo

O jogador percorre um ambiente tridimensional em primeira pessoa, enfrenta inimigos, utiliza sua arma e habilidades e avança até o objetivo principal da fase.

O ciclo de jogo esperado é:

1. Entrar no setor comprometido.
2. Explorar o ambiente e identificar ameaças.
3. Combater inimigos utilizando armas e habilidades.
4. Interagir com elementos computacionais quando necessário.
5. Receber feedback contextual sobre conceitos de Arquitetura de Computadores.
6. Alcançar o objetivo do setor.
7. Receber o resultado da partida e poder reiniciar.

O ritmo deve ser rápido e acessível, com partidas de aproximadamente 3 a 5 minutos no MVP.

## 8. Controles e interação

O jogo será desenvolvido prioritariamente para computadores desktop, utilizando teclado e mouse.

- **W, A, S, D:** movimentação.
- **Mouse:** controle da câmera e mira.
- **Botão esquerdo do mouse:** disparo da arma.
- **Tecla de habilidade:** ativação da habilidade lógica.
- **Tecla de interação:** interação com terminais ou objetivos, quando implementados.
- **Esc:** pausa ou abertura do menu.

Os controles devem ser apresentados antes do início da primeira partida. A implementação deve priorizar respostas rápidas, movimentação previsível e uma experiência familiar para jogadores de FPS.

## 9. Mecânicas principais

### 9.1. Movimentação e câmera

O jogador se movimenta por um cenário 3D com perspectiva em primeira pessoa. A câmera acompanha o mouse, enquanto o teclado controla o deslocamento.

A implementação inicial deve contemplar colisões básicas com paredes e objetos, limites do cenário e prevenção de movimentação através de obstáculos.

### 9.2. Combate

O jogador utiliza uma arma principal para eliminar ameaças digitais. O sistema deve oferecer mira central, detecção de acertos, dano aos inimigos, feedback visual e atualização da pontuação.

O combate deve ser direto e legível, sem exigir sistemas avançados de inventário, equipamentos ou progressão.

### 9.3. Habilidade lógica

O jogador possui uma habilidade especial baseada em uma operação lógica, inicialmente XOR.

Exemplo de operação:

`1010 XOR 1100 = 0110`

O resultado precisa ser matematicamente correto. A operação deve ser executada por uma implementação real da lógica binária, e não apenas apresentada como efeito visual.

A habilidade pode consumir energia, possuir tempo de recarga ou depender de uma quantidade limitada de utilizações. A regra escolhida deve ser simples e comunicada claramente.

### 9.4. Inimigos

**BITLING — inimigo básico**

- Aproxima-se do jogador.
- Causa dano ao entrar em alcance.
- Possui comportamento simples e previsível.
- Serve para ensinar o funcionamento básico do combate.

**OVERFLOW — inimigo de maior complexidade**

- Ataca à distância.
- Pode utilizar um escudo ou mecanismo defensivo.
- Exige que o jogador observe seus padrões de ataque.
- Pode introduzir desafios que incentivem o uso da habilidade lógica.

Os inimigos devem possuir vida, dano, velocidade e estados de comportamento claramente definidos. A inteligência artificial deve permanecer simples no MVP.

### 9.5. Progressão e objetivos

A primeira versão contará com um único setor principal. O jogador inicia em uma área segura, enfrenta ameaças progressivamente e chega ao núcleo computacional.

A progressão não deve depender de um sistema complexo de missões. Um objetivo principal, alguns encontros de combate e uma condição clara de conclusão são suficientes.

## 10. Conteúdo educacional

O conteúdo educacional será integrado ao cenário, às habilidades e ao feedback apresentado durante o jogo.

### CPU — Unidade Central de Processamento

Representada pelo sistema que executa instruções e coordena operações. O cenário e a narrativa ajudam o jogador a compreender a função geral do processador.

### ULA/ALU — Unidade Lógica e Aritmética

Representada por uma área ou componente responsável por operações aritméticas e lógicas. A habilidade baseada em XOR oferece uma oportunidade para demonstrar uma operação lógica real.

### Registradores

Representados por pequenos espaços de armazenamento temporário utilizados durante as operações. O jogador pode visualizar operandos e resultados em uma interface contextual.

### Ciclo de instrução

Representado conceitualmente por uma sequência de etapas: busca, decodificação, execução e armazenamento do resultado.

A representação deve deixar claro que se trata de um modelo didático simplificado. O jogo não precisa simular integralmente a arquitetura interna de um processador real.

### Princípios pedagógicos

- Explicações curtas e contextualizadas.
- Exemplos com valores reais e resultados corretos.
- Feedback associado a ações realizadas pelo jogador.
- Possibilidade de revisar conceitos após o combate.
- Separação visual entre informação essencial para jogar e informação educacional complementar.

O jogo deve evitar apresentar informações incorretas apenas para justificar uma mecânica. A ficção pode simplificar a representação, mas os conceitos fundamentais precisam permanecer corretos.

## 11. Identidade visual

A direção de arte será inspirada em FPS de PC dos anos 1990, combinando texturas de baixa resolução, geometria simples, iluminação industrial e elementos de interface com aparência de terminal.

### Paleta principal

- Metal escuro: `#101820`.
- Verde terminal: `#39FF88`.
- Ciano elétrico: `#00D9FF`.
- Laranja de alerta: `#FF9D36`.

### Elementos visuais

- Cenários tridimensionais construídos com módulos reutilizáveis.
- Texturas de paredes e pisos com detalhes computacionais.
- Inimigos representados por sprites 2D, quando adequado.
- Arma visível na parte inferior da tela.
- HUD minimalista com vida, munição, habilidade, pontuação e informações contextuais.
- Efeitos de disparo, impacto e destruição com recursos leves.

A prioridade é obter consistência visual e legibilidade. O projeto não depende de modelos 3D complexos, animações sofisticadas ou cenários altamente detalhados.

## 12. Escopo do MVP

O MVP deve validar se a combinação entre combate e aprendizagem é divertida, compreensível e tecnicamente viável.

### Funcionalidades incluídas

- Menu inicial e instruções de controle.
- Cenário tridimensional único.
- Movimentação em primeira pessoa e colisões.
- Arma principal e sistema de disparo.
- Dois tipos de inimigos.
- Sistema de vida, dano, munição e pontuação.
- Uma habilidade lógica baseada em XOR.
- Representação básica de registradores e resultado da operação.
- Feedback educacional contextual.
- Condições de vitória e derrota.
- Tela de resultado e opção de reiniciar.
- Efeitos visuais e sonoros básicos.

### Itens fora do escopo inicial

- Multiplayer ou partidas online.
- Campanha com múltiplas fases.
- Mundo aberto ou geração procedural de mapas.
- Inventário complexo e árvore de habilidades.
- Personalização avançada de personagens.
- Modelagem 3D e animação sofisticadas.
- Simulação completa de uma CPU real.
- Sistemas de contas, ranking online ou persistência em servidor.
- Integração obrigatória com modelos de IA durante a partida.

Esses itens podem ser avaliados futuramente, após a validação do MVP.

## 13. Requisitos técnicos

### Plataforma

Jogo executado em navegador desktop, sem exigir instalação de um aplicativo nativo.

### Tecnologia proposta

- **Motor 3D:** Babylon.js.
- **Linguagem:** TypeScript.
- **Interface:** HTML e CSS.
- **Lógica computacional:** módulos independentes para operações lógicas, registradores e ciclo de instrução.
- **Recursos visuais:** texturas, sprites e efeitos reutilizáveis.

### Organização conceitual

A lógica do jogo deve ser separada da representação visual sempre que isso trouxer benefícios claros.

Os componentes de movimentação, combate, inimigos, nível e interface devem possuir responsabilidades definidas. A lógica educacional deve poder ser testada sem depender da renderização 3D.

Não é necessário criar uma arquitetura excessivamente abstrata. A organização deve facilitar a leitura, a correção de bugs e a inclusão de novas mecânicas.

## 14. Critérios de sucesso

O projeto será considerado bem-sucedido quando atender aos seguintes critérios:

- O jogador consegue iniciar e concluir uma partida sem instruções externas.
- Os controles funcionam de forma consistente.
- O combate oferece feedback visual claro.
- A vitória e a derrota são detectadas corretamente.
- A operação XOR apresenta resultados matematicamente corretos.
- O jogador consegue relacionar pelo menos alguns elementos do cenário a conceitos de Arquitetura de Computadores.
- O jogo mantém desempenho aceitável em computadores comuns com navegador moderno.
- Uma partida pode ser reiniciada sem recarregar a página inteira, quando tecnicamente viável.

Após o protótipo, recomenda-se testar o jogo com estudantes e coletar feedback sobre diversão, clareza dos controles e compreensão dos conceitos apresentados.

## 15. Princípios de desenvolvimento

O desenvolvimento deve seguir alguns princípios fundamentais:

1. **Diversão antes da complexidade:** cada nova mecânica precisa melhorar a experiência.
2. **Aprendizagem integrada:** o conteúdo educacional deve fazer sentido no contexto do jogo.
3. **Implementação incremental:** cada sistema deve funcionar antes de receber novos recursos.
4. **Reutilização de assets:** priorizar elementos visuais que possam ser utilizados em diferentes partes do cenário.
5. **Precisão conceitual:** as explicações sobre computação devem ser corretas, mesmo quando simplificadas.
6. **Escopo controlado:** não adicionar sistemas que não sejam essenciais para validar a proposta.
7. **Testabilidade:** as regras de combate e as operações computacionais devem ser verificáveis.

## 16. Resultado esperado

Ao final do MVP, espera-se ter uma experiência jogável de FPS educacional que funcione diretamente no navegador, com identidade visual própria, combate básico, inimigos, uma habilidade lógica funcional e uma fase curta com começo, progressão e conclusão.

O resultado deve demonstrar que conceitos de Arquitetura de Computadores podem ser integrados a um jogo de ação de maneira intuitiva, sem sacrificar a diversão ou exigir uma implementação excessivamente complexa.

O CORE BREACH deve servir como uma base funcional para futuras expansões, mas sua primeira versão precisa ser pequena, consistente e suficientemente completa para ser testada por jogadores reais.
