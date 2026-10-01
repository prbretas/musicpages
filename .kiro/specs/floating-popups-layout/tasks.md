# Implementation Plan: Floating Popups Layout

## Overview

Implementação de um sistema genérico de popups flutuantes em vanilla JavaScript (IIFE pattern), com instâncias específicas para o Metrônomo e a Estrutura de Escalas. O plano segue uma abordagem incremental: primeiro as funções puras e utilitários internos (testáveis isoladamente), depois a montagem do DOM e integração com o menu de navegação, e por fim responsividade e acessibilidade.

## Tasks

- [x] 1. Criar arquivo do módulo e implementar funções puras do DragManager
  - [x] 1.1 Criar `scripts/script-floating-popup.js` com estrutura IIFE e implementar `computeDragPosition` e `clampPosition`
    - Criar o arquivo com a IIFE principal `FloatingPopup`
    - Implementar `computeDragPosition(initialPos, startPointer, currentPointer)` — retorna `{ x: initialPos.x + (currentPointer.x - startPointer.x), y: initialPos.y + (currentPointer.y - startPointer.y) }`
    - Implementar `clampPosition(position, popupSize, viewport, minVisible)` — restringe posição para manter pelo menos `minVisible` px da área de arraste visível
    - Exportar essas funções para testes via `window._FloatingPopupInternals` (padrão já usado no projeto para expor internals testáveis)
    - _Requirements: 1.3, 1.5, 1.9, 7.1, 7.3_

  - [ ]* 1.2 Write property test for `computeDragPosition`
    - **Property 1: Drag position is initial position plus pointer delta**
    - Gerar valores arbitrários para initialPos, startPointer, currentPointer usando `fc.record` com `fc.integer`
    - Assertar que resultado é exatamente `{ x: initialPos.x + (currentPointer.x - startPointer.x), y: initialPos.y + (currentPointer.y - startPointer.y) }`
    - Arquivo: `tests/cases/floating-popups-layout/drag-position.property.spec.js`
    - **Validates: Requirements 1.3, 7.1**

  - [ ]* 1.3 Write property test for `clampPosition`
    - **Property 2: Viewport clamping keeps drag area visible**
    - Gerar posições, tamanhos de popup e viewports arbitrários (positivos) com `fc.nat`
    - Assertar que resultado satisfaz: `clampedX + popupWidth >= minVisible`, `clampedX <= viewportWidth - minVisible`, `clampedY >= 0`, `clampedY <= viewportHeight - minVisible`
    - Arquivo: `tests/cases/floating-popups-layout/viewport-clamp.property.spec.js`
    - **Validates: Requirements 1.5, 1.9**

- [x] 2. Implementar ZIndexManager e ScaleHighlighter
  - [x] 2.1 Implementar `ZIndexManager` dentro da IIFE
    - Constantes `BASE_Z = 1000` e contador `current`
    - Método `bringToFront(popupElement)` — incrementa `current` e aplica no style do elemento
    - Método `getHighest()` — retorna o z-index mais alto atual
    - Expor via `window._FloatingPopupInternals`
    - _Requirements: 1.1, 1.8, 4.3_

  - [ ]* 2.2 Write property test for ZIndexManager
    - **Property 3: Last-focused popup has highest z-index**
    - Gerar sequências arbitrárias de chamadas `bringToFront` sobre N popups mockados
    - Assertar que o último popup focado sempre tem z-index estritamente maior que todos os outros
    - Arquivo: `tests/cases/floating-popups-layout/z-index-manager.property.spec.js`
    - **Validates: Requirements 1.8, 4.3**

  - [x] 2.3 Implementar `ScaleHighlighter` dentro da IIFE
    - Armazenar `currentScale` internamente
    - Método `highlight(tipoEscala)` — encontra a row na tabela por data-attribute ou texto e aplica classe `highlight-row`
    - Método `clear()` — remove destaque de todas as rows
    - Expor via `window._FloatingPopupInternals`
    - _Requirements: 3.3, 3.4, 5.1, 5.3, 5.4_

  - [ ]* 2.4 Write property tests for ScaleHighlighter
    - **Property 4: Scale highlight targets exactly one correct row**
    - **Property 5: Stored scale is applied on popup open**
    - Gerar valores `tipoEscala` arbitrários dentre as chaves do objeto `estruturasEscalas`
    - Assertar que exatamente uma row tem a classe de destaque e corresponde à escala correta
    - Assertar que valor armazenado é corretamente aplicado ao abrir popup
    - Arquivo: `tests/cases/floating-popups-layout/scale-highlight.property.spec.js`
    - **Validates: Requirements 3.3, 3.4, 5.1, 5.3**

- [x] 3. Implementar FocusTrap
  - [x] 3.1 Implementar `createFocusTrap(container)` e `getFocusableElements(container)` dentro da IIFE
    - `getFocusableElements` — retorna array de elementos focáveis (a, button, input, select, textarea, [tabindex]) não disabled e visíveis
    - `createFocusTrap` — retorna `{ activate(), deactivate() }` que intercepta keydown Tab/Shift+Tab
    - Ciclicidade: Tab no último foca o primeiro, Shift+Tab no primeiro foca o último
    - Expor via `window._FloatingPopupInternals`
    - _Requirements: 6.3, 6.4_

  - [ ]* 3.2 Write property test for FocusTrap cycling
    - **Property 6: Focus trap cycles through all focusable elements**
    - Gerar containers com N (1..20) elementos focáveis via jsdom
    - Simular Tab/Shift+Tab e assertar cycling correto
    - Arquivo: `tests/cases/floating-popups-layout/focus-trap.property.spec.js`
    - **Validates: Requirements 6.3**

- [x] 4. Checkpoint - Funções puras e utilitários
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implementar a factory `FloatingPopup.create` e ciclo de vida do popup
  - [x] 5.1 Implementar criação do DOM do popup e `FloatingPopup.create(config)`
    - Criar o elemento container com header (title + close button), body (conteúdo movido via `contentSelector`)
    - Atribuir atributos ARIA: `role="dialog"`, `aria-label`, `aria-modal="true"`
    - Implementar `open()` — exibe centralizado, ativa focus trap, aplica body scroll lock, traz para frente via ZIndexManager
    - Implementar `close()` — oculta, desativa focus trap, remove scroll lock, retorna foco ao `triggerElement`
    - Implementar `toggle()` — alterna entre open/close
    - Implementar `isOpen()`, `destroy()`, `getElement()`
    - Singleton por ID: se `config.id` já existir, retornar instância existente
    - _Requirements: 1.1, 1.2, 1.6, 1.7, 2.1, 2.3, 2.7, 3.1, 3.5, 3.6, 3.7, 6.4, 6.5, 6.7_

  - [x] 5.2 Implementar drag-and-drop no popup via Pointer Events
    - Registrar `pointerdown` na Area_Arraste — inicia drag, armazena posições iniciais
    - Registrar `pointermove` no document — calcula nova posição via `computeDragPosition`, aplica `clampPosition`, atualiza style
    - Registrar `pointerup` no document — finaliza drag
    - Filtrar: não iniciar drag se target é elemento interativo (button, input, select, a, textarea)
    - Fallback para `mousedown`/`touchstart` se PointerEvent indisponível
    - `touch-action: none` na Area_Arraste para evitar scroll/pull-to-refresh durante drag
    - Considerar apenas primeiro toque em multi-touch
    - _Requirements: 1.3, 1.4, 1.5, 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ]* 5.3 Write property test for drag initiation filtering
    - **Property 7: Non-drag-area interactions don't initiate drag**
    - Gerar eventos sobre diferentes tipos de elementos interativos dentro do popup
    - Assertar que `isDragging` permanece false quando target não é a Area_Arraste
    - Arquivo: `tests/cases/floating-popups-layout/drag-initiation.property.spec.js`
    - **Validates: Requirements 7.5**

  - [ ]* 5.4 Write unit tests for popup lifecycle
    - Popup inicia oculto (`isOpen() === false`)
    - `open()` torna visível com posição centralizada
    - `close()` oculta e retorna foco ao trigger
    - `toggle()` alterna corretamente
    - Singleton por ID — segunda chamada com mesmo ID retorna mesma instância
    - Escape fecha o popup
    - Atributos ARIA presentes e corretos
    - Body scroll lock ativado/desativado corretamente
    - Arquivo: `tests/cases/floating-popups-layout/popup-lifecycle.unit.spec.js`
    - _Requirements: 1.1, 1.6, 1.7, 6.4, 6.5, 6.7_

- [ ] 6. Implementar instâncias específicas (Metrônomo e Estrutura de Escalas)
  - [ ] 6.1 Configurar instância do popup do Metrônomo
    - Criar instância via `FloatingPopup.create` com config: id `metronome-popup`, title `Metrônomo Digital`, contentSelector `#metronomeContainer`, size `380px` width
    - Implementar callback `onClose`: verificar se metrônomo está tocando, se sim parar áudio e resetar botão para "▶ Iniciar"
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [x] 6.2 Configurar instância do popup de Estrutura de Escalas
    - Criar instância via `FloatingPopup.create` com config: id `scale-structure-popup`, title `Estruturas de Escalas`, contentSelector `#tabelaGeralEscalasResultado`, size `600px` width / `500px` height
    - Registrar listener para evento `scale-changed` no document — chamar `ScaleHighlighter.highlight(e.detail.tipoEscala)` se popup aberto, caso contrário armazenar valor
    - Implementar callback `onOpen`: aplicar `ScaleHighlighter.highlight` com o valor armazenado
    - Tratar `tipoEscala` inexistente: `ScaleHighlighter.clear()` sem erro
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6, 3.7, 5.1, 5.2, 5.3, 5.4_

- [x] 7. Integrar com Menu de Navegação e viewport resize
  - [x] 7.1 Adicionar itens de menu e conectar toggle dos popups
    - Adicionar atributos `data-popup="metronome"` e `data-popup="scale-structure"` nos itens do menu no HTML
    - Em `script-floating-popup.js`, registrar click handlers nos menu items via `menuItemSelector`
    - Ao clicar: chamar `toggle()` se popup fechado, ou `ZIndexManager.bringToFront()` se já aberto
    - Aplicar/remover classe `active` no menu item conforme estado do popup
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 7.2 Implementar listener de resize com debounce e re-clamp
    - Registrar `resize` listener no window com debounce de 100ms
    - Ao disparar: re-executar `clampPosition` para cada popup visível, reposicionando se necessário
    - _Requirements: 1.9_

  - [ ]* 7.3 Write unit tests for menu integration
    - Click no menu item abre popup
    - Segundo click com popup aberto traz para frente
    - Classe `active` aplicada/removida corretamente
    - Arquivo: `tests/cases/floating-popups-layout/popup-accessibility.unit.spec.js`
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 8. Checkpoint - Funcionalidade core completa
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implementar responsividade (modo bottom sheet)
  - [x] 9.1 Implementar modo bottom sheet para viewport < 768px
    - Detectar viewport width via `matchMedia('(max-width: 767px)')`
    - Em modo mobile: popup ocupa 100% largura, max-height 80vh, posicionado na parte inferior
    - Animação de entrada (slide-up) com `transition` de no máximo 300ms
    - Desabilitar drag livre em modo bottom sheet
    - Ao mudar de mobile → desktop: restaurar posição livre e re-clampar
    - _Requirements: 6.1, 6.2_

  - [ ]* 9.2 Write unit tests for responsive behavior
    - Em viewport < 768px, popup renderiza como bottom sheet
    - Em viewport >= 768px, popup renderiza como flutuante livre
    - Transição entre modos preserva conteúdo
    - Arquivo: `tests/cases/floating-popups-layout/popup-accessibility.unit.spec.js` (adicionar ao arquivo existente)
    - _Requirements: 6.1, 6.2_

- [x] 10. Integrar CSS e atualizar HTML
  - [x] 10.1 Criar estilos CSS para os popups flutuantes
    - Adicionar estilos em `styles/style.css` ou criar `styles/style-floating-popup.css`
    - Estilizar: container do popup, area de arraste, botão fechar, classe `highlight-row`, bottom sheet mode
    - Usar CSS custom properties existentes para compatibilidade com tema claro/escuro
    - Garantir contraste mínimo 4.5:1 (WCAG AA)
    - _Requirements: 6.6, 3.3_

  - [x] 10.2 Atualizar `index.html` para integrar o sistema de popups
    - Adicionar `<script src="scripts/script-floating-popup.js" defer></script>` no HTML
    - Adicionar atributos `data-popup` nos itens de menu relevantes
    - Remover ou ocultar as seções fixas do metrônomo e estrutura de escalas do fluxo principal (mantendo os containers para que o popup os mova)
    - _Requirements: 2.7, 3.5, 4.1, 4.2_

- [ ] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- O padrão IIFE com exposição via `window._FloatingPopupInternals` segue o mesmo approach dos outros módulos do projeto para testabilidade
- Testes usam vitest + jsdom (já configurado) e fast-check para property-based tests

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "2.1", "2.3", "3.1"] },
    { "id": 2, "tasks": ["2.2", "2.4", "3.2"] },
    { "id": 3, "tasks": ["5.1", "5.2"] },
    { "id": 4, "tasks": ["5.3", "5.4", "6.1", "6.2"] },
    { "id": 5, "tasks": ["7.1", "7.2"] },
    { "id": 6, "tasks": ["7.3", "9.1", "10.1"] },
    { "id": 7, "tasks": ["9.2", "10.2"] }
  ]
}
```
