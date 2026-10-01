# Requirements: Sidebar Navigation + Seletores no Topo

## Introdução

Esta feature redesenha a navegação do MusicPages substituindo o menu horizontal fixo do topo
(`#headerNav` com lista plana de links) por um **menu lateral retrátil (sidebar off-canvas)**,
acionável por um botão, que desliza a partir da borda esquerda e se esconde quando não usado.
Além disso, move os **seletores de Tônica e Tipo de Escala** para uma **barra superior sempre
visível**, dando acesso rápido à seleção sem rolar até a seção da calculadora.

Objetivos:
- Liberar espaço no topo e organizar a navegação conforme o app cresce.
- Tornar tônica/escala acessíveis a qualquer momento.
- Preservar 100% da integração existente baseada no evento `scale-changed` e nos popups
  (`data-popup`), sem regressões de comportamento ou acessibilidade.

Esta feature consolida as ideias **H** (sidebar retrátil) e **I** (seletores no topo) do
`melhorias.md`, que o dev decidiu seguir pela abordagem de sidebar (em vez do dropdown da ideia F).

## Glossário
- **Sidebar / Drawer**: painel de navegação off-canvas que desliza a partir da borda esquerda.
- **Overlay / Scrim**: camada semitransparente que escurece o conteúdo quando a sidebar está aberta.
- **Topbar**: barra fixa no topo contendo o botão de abrir a sidebar, os seletores de tônica/escala
  e o toggle de tema.
- **Botão de menu**: botão (ícone hambúrguer) que abre/fecha a sidebar.

## Requisitos

### Requisito 1 — Sidebar retrátil acionável
**User Story:** Como usuário, quero um menu lateral que fica escondido e abro quando preciso, para
que a navegação não ocupe espaço permanente na tela.

#### Acceptance Criteria
1. QUANDO a página carrega ENTÃO a sidebar DEVE iniciar **fechada** (fora da viewport).
2. QUANDO o usuário clica no botão de menu ENTÃO a sidebar DEVE abrir deslizando a partir da
   esquerda com animação de no máximo 300ms.
3. QUANDO a sidebar está aberta E o usuário clica no botão de menu (ou no botão de fechar interno)
   ENTÃO a sidebar DEVE fechar.
4. QUANDO a sidebar abre ENTÃO um overlay semitransparente DEVE cobrir o restante da tela.
5. QUANDO o usuário clica no overlay (fora da sidebar) ENTÃO a sidebar DEVE fechar.
6. QUANDO o usuário pressiona `Escape` com a sidebar aberta ENTÃO a sidebar DEVE fechar.
7. QUANDO o usuário clica em um item de navegação da sidebar ENTÃO a sidebar DEVE fechar após
   acionar a navegação.

### Requisito 2 — Itens de navegação e ações preservadas
**User Story:** Como usuário, quero que todos os destinos atuais continuem acessíveis pela sidebar,
para não perder nenhuma funcionalidade.

#### Acceptance Criteria
1. A sidebar DEVE conter todos os itens de navegação atuais: Metrônomo, Calculadora de Escalas,
   Estruturas de Escalas, Teclado Virtual, Braço do Instrumento, Acordes, Círculo de Escalas,
   Ciclo de Quintas, Songsterr.
2. QUANDO o usuário clica num item que é âncora de seção (`href="#..."`) ENTÃO a página DEVE rolar
   suavemente até a seção correspondente (comportamento atual de `scrollToSection`).
3. QUANDO o usuário clica num item com `data-popup` (Metrônomo, Estruturas de Escalas) ENTÃO o
   popup correspondente DEVE abrir/alternar (comportamento atual de FloatingPopup) e NÃO rolar.
4. Os atributos de acessibilidade dos itens de popup (`data-popup`) e âncoras DEVEM ser mantidos
   para que o wiring existente de `script-floating-popup.js` continue funcionando sem alteração.

### Requisito 3 — Acessibilidade da sidebar
**User Story:** Como usuário de teclado/leitor de tela, quero navegar a sidebar sem mouse.

#### Acceptance Criteria
1. O botão de menu DEVE expor `aria-expanded` refletindo o estado (true aberto / false fechado) e
   `aria-controls` apontando para o id da sidebar.
2. A sidebar DEVE ter `role="navigation"` (ou `<nav>`) e um rótulo acessível (`aria-label`).
3. QUANDO a sidebar abre ENTÃO o foco DEVE mover-se para dentro dela (primeiro item ou botão fechar).
4. ENQUANTO a sidebar está aberta, `Tab`/`Shift+Tab` DEVEM ciclar o foco entre os elementos
   focáveis da sidebar (focus trap).
5. QUANDO a sidebar fecha ENTÃO o foco DEVE retornar ao botão de menu que a abriu.
6. Alvos de toque DEVEM ter no mínimo 44x44px.
7. Contraste de texto/ícones DEVE atender WCAG AA (mínimo 4.5:1) em tema claro e escuro.

### Requisito 4 — Seletores de Tônica e Escala no topo
**User Story:** Como usuário, quero escolher tônica e escala direto no topo, para mudar rápido sem
rolar até a calculadora.

#### Acceptance Criteria
1. A topbar DEVE conter um seletor de **Tônica** e um seletor de **Tipo de Escala** com exatamente
   as mesmas opções (incluindo optgroups) do formulário atual em `#scaleCalcSection`.
2. QUANDO o usuário altera a tônica OU a escala na topbar ENTÃO o cálculo DEVE ser disparado
   (equivalente a `calcularEscala()`), atualizando notas, campo harmônico, fretboard, círculos e
   demais ouvintes via o evento `scale-changed` existente.
3. A seleção na topbar e a seleção em `#scaleCalcSection` (se mantida) DEVEM permanecer
   **sincronizadas**: alterar uma reflete na outra, sem divergência de estado.
4. Os seletores DEVEM ter rótulos acessíveis associados (`<label for>` ou `aria-label`).
5. O comportamento atual (botão "Gerar Escala/Campo Harmônico") DEVE continuar funcionando; a
   topbar é um atalho adicional, não uma quebra do fluxo existente.

### Requisito 5 — Toggle de tema na topbar
**User Story:** Como usuário, quero o toggle de tema sempre acessível no topo.

#### Acceptance Criteria
1. O toggle de tema (switch sol/lua já existente) DEVE permanecer na topbar, visível e funcional.
2. A lógica existente de tema (`applyTheme`, persistência em localStorage, `aria-checked`) DEVE ser
   preservada sem alteração de comportamento.

### Requisito 6 — Responsividade
**User Story:** Como usuário mobile, quero a navegação adequada a telas pequenas.

#### Acceptance Criteria
1. EM qualquer largura, a sidebar DEVE funcionar como off-canvas (abre por botão, fecha por
   overlay/Esc/clique em item).
2. EM telas pequenas (< 768px), a topbar DEVE acomodar botão de menu + seletores + toggle de tema
   sem quebrar o layout (empilhar/encolher conforme necessário), mantendo alvos de toque de 44px.
3. QUANDO a viewport é redimensionada com a sidebar aberta ENTÃO a sidebar DEVE permanecer utilizável
   (sem travar o scroll do conteúdo de forma irreversível).

### Requisito 7 — Sem regressões
**User Story:** Como mantenedor, quero que a mudança não quebre nada do que já existe.

#### Acceptance Criteria
1. Todos os popups (`metronome`, `scale-structure`) DEVEM continuar abrindo pela nova navegação.
2. O evento `scale-changed` DEVE continuar sendo disparado exatamente como hoje (mesma `detail`).
3. A suíte de testes existente DEVE continuar passando (163 testes) após a mudança.
4. O scroll lock de popup (`body.popup-open`) e o da sidebar NÃO DEVEM entrar em conflito.
