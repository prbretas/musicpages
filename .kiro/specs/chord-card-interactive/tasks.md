# Implementation Plan: Chord Card Interactive

## Overview

Construir o popup flutuante de acorde sobre sistemas já existentes: `FloatingPopup` (drag/overlay/
focus trap), `createVoicingNavigator` (índice cíclico), `playChord` (AudioEngine) e `LocalChordDB`
(shapes). O ponto de entrada é o `handleChordCardClick` existente em `script-chord-diagrams.js`.
Toda a implementação segue o padrão IIFE/Vanilla JS do projeto — sem build step, sem novas deps.

## Tasks

- [ ] 1. Criar ChordPopupManager e fábrica createChordPopup (estrutura base)
  - [ ] 1.1 Criar `ChordPopupManager` como objeto singleton dentro do IIFE em `script-chord-diagrams.js`
    - Adicionar após `createVoicingNavigator` e antes de `init`
    - Implementar estado interno: `_activePopup`, `_activeCard`, `_hoverTimer`, `_closeTimer`
    - Implementar `open(cardEl, chord, pinned)` — cria popup via `createChordPopup`, anexa ao `document.body`, posiciona adjacente ao card
    - Implementar `pin()` — chama `_activePopup.upgrade()` para injetar controles Play/Variar
    - Implementar `close()` — chama `_activePopup.destroy()`, remove `chord-card-active` de todos os cards, limpa estado
    - Implementar `cancelHoverTimer()` e `cancelCloseTimer()`
    - _Requirements: 1.5, 2.4, 2.5, 2.6, 2.7, 2.8, 7.1, 7.2_

  - [ ] 1.2 Criar função `createChordPopup(chord, activeShapeIndex, opts)` dentro do IIFE
    - Gerar estrutura DOM do popup no modo transient (handle + diagram SVG, sem actions)
    - Integrar com `FloatingPopup` para drag (passar `el` como container, handle como drag handle)
    - Retornar `{ el, upgrade(opts), destroy() }`
    - `upgrade(opts)`: injeta header com título + close button, bloco de actions (Play + Variar), muda `role` para `dialog`
    - `destroy()`: remove `el` do DOM, desfaz listeners, libera foco se necessário
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 5.1, 5.2, 5.3, 8.1, 8.4, 8.5_

  - [ ] 1.3 Implementar lógica de posicionamento inicial do popup
    - Calcular posição `below-right` relativa ao `cardEl` usando `getBoundingClientRect()`
    - Detectar overflow de viewport e flipar para `below-left`, `above-right` ou `above-left`
    - Aplicar posição como `position: fixed` com `left` e `top`
    - _Requirements: 6.1, 6.2, 6.3_

- [ ] 2. Integrar hover nos ChordCards
  - [ ] 2.1 Criar `handleChordCardHover(chord, cardEl, entering)` dentro do IIFE
    - Se `entering === true`: agendar `ChordPopupManager.open(cardEl, chord, false)` após 300ms via `_hoverTimer`
    - Se `entering === false`: cancelar `_hoverTimer`; se popup aberto e não pinned, agendar `ChordPopupManager.close()` após 150ms via `_closeTimer`
    - Ao entrar no popup (mouseenter no elemento popup): cancelar `_closeTimer`
    - Ao sair do popup (mouseleave no elemento popup): reagendar `_closeTimer`
    - _Requirements: 1.1, 1.3, 1.5_

  - [ ] 2.2 Adicionar `mouseenter`/`mouseleave` em cada `.chord-card` dentro de `render()`
    - Adicionar após o listener de `click` existente
    - Chamar `handleChordCardHover(chord, cardEl, true/false)`
    - _Requirements: 1.1, 1.3_

- [ ] 3. Estender handleChordCardClick para delegar ao ChordPopupManager
  - [ ] 3.1 Modificar `handleChordCardClick` para usar `ChordPopupManager`
    - Se popup pinned do mesmo card: chamar `ChordPopupManager.close()` (toggle off) — req 2.5
    - Se popup pinned de outro card: `ChordPopupManager.close()` depois `ChordPopupManager.open(cardEl, chord, true)` — req 2.6
    - Se popup transient do mesmo card: chamar `ChordPopupManager.pin()` — req 2.1
    - Se nenhum popup aberto: `ChordPopupManager.open(cardEl, chord, true)` — req 2.1
    - Aplicar `chord-card-active` ao `cardEl` quando pinnar — req 2.7
    - _Requirements: 2.1, 2.2, 2.5, 2.6, 2.7, 2.8_

- [ ] 4. Checkpoint — estrutura base
  - Verificar que hover abre popup transient e clique pinna com controles
  - Verificar que close e toggle funcionam
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implementar botão ▶ Play
  - [ ] 5.1 Criar e conectar o botão Play no `upgrade()` de `createChordPopup`
    - Criar `<button class="chord-popup__play" aria-label="Tocar acorde">▶ Play</button>`
    - No click: chamar `playChord(chord.shapes[activeShapeIndex])`
    - Verificar disponibilidade do AudioEngine: se não disponível, setar `disabled` no botão
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 5.2 Write unit test: Play button
    - Testar que `playChord` é chamado com o shape correto ao clicar Play
    - Testar que botão é desabilitado quando AudioEngine não está disponível
    - Arquivo: `tests/cases/chord-card-interactive/play-button.unit.spec.js`
    - _Requirements: 3.1, 3.3_

- [ ] 6. Implementar VoiceCarousel (botão Variar + painel)
  - [ ] 6.1 Criar função `createVoiceCarousel(shapes, activeIndex, onSelect)` dentro do IIFE
    - Criar container `.chord-popup__carousel` com `hidden` inicial
    - Renderizar um `.carousel__item` por shape (SVG mini + aria-label "Shape N de T")
    - Marcar o `activeIndex` com `carousel__item--active`
    - Adicionar botões ‹ › se shapes.length > número visível (scroll lateral com overflow hidden)
    - No click em item: chamar `onSelect(index)`, atualizar `activeShapeIndex` e re-marcar ativo
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 8.6_

  - [ ] 6.2 Conectar botão Variar ao VoiceCarousel
    - Criar `<button class="chord-popup__variar" aria-label="Variar posição do acorde">Variar</button>`
    - No click: toggle `hidden` no `.chord-popup__carousel`
    - Se `shapes.length <= 1`: setar `disabled` no botão Variar
    - _Requirements: 4.1, 4.6, 4.7_

  - [ ] 6.3 Disparar `chord-shape-changed` ao selecionar shape no carrossel
    - No callback `onSelect(index)` de `createVoiceCarousel`:
      - Atualizar diagrama SVG principal do popup com o novo shape
      - Dispatch `chord-shape-changed` com `{ chordName: chord.name, shapeIndex: index }`
    - _Requirements: 4.3, 4.4_

  - [ ]* 6.4 Write unit test: VoiceCarousel
    - Testar que shape clicado atualiza diagrama e emite `chord-shape-changed` com índice correto
    - Testar que botão Variar está desabilitado para acordes com 1 shape
    - Testar aria-labels nos items do carrossel
    - Arquivo: `tests/cases/chord-card-interactive/voice-carousel.unit.spec.js`
    - _Requirements: 4.3, 4.4, 4.6, 8.6_

- [ ] 7. Integração com scale-changed e acessibilidade
  - [ ] 7.1 Registrar listener `scale-changed` no ChordPopupManager
    - `document.addEventListener('scale-changed', function() { ChordPopupManager.close(); })`
    - _Requirements: 7.1, 7.2_

  - [ ] 7.2 Implementar focus trap e retorno de foco no popup pinned
    - Ao fazer `pin()`: mover foco para o primeiro elemento interativo do popup
    - Implementar Tab/Shift+Tab cycling dentro do popup (reusar lógica do FloatingPopup se exposta)
    - Ao fechar: retornar foco para `_activeCard`
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ] 7.3 Conectar Escape ao fechamento do popup
    - Listener `keydown` no documento: se `key === 'Escape'` e popup aberto → `ChordPopupManager.close()`
    - Remover listener ao fechar
    - _Requirements: 8.3_

- [ ] 8. Adicionar estilos CSS
  - [ ] 8.1 Criar regras CSS do ChordPopup em `styles/style.css`
    - `.chord-popup`: position fixed, z-index acima do conteúdo mas abaixo de modals, border-radius, box-shadow, fundo com variável de tema
    - `.chord-popup__handle`: cursor grab, ícone de pontos (⠿), consistent com FloatingPopup
    - `.chord-popup__header`: flex row, align-center, gap
    - `.chord-popup__actions`: flex row com gap, botões estilizados consistentes com tema
    - `.chord-popup--transient`: menor padding, sem header completo
    - `.chord-popup--pinned`: header completo, actions visíveis
    - `.chord-popup__carousel`: flex row, overflow-x hidden, scroll lateral, max-width
    - `.carousel__item`: min-width definido, cursor pointer; `.carousel__item--active`: borda/destaque
    - Garantir dark/light mode via variáveis CSS existentes
    - _Requirements: 5.3_

  - [ ] 8.2 Garantir responsividade mobile
    - Em telas < 480px: popup ocupa largura quase total (max-width: calc(100vw - 16px))
    - Carrossel com scroll touch (overflow-x: auto, -webkit-overflow-scrolling: touch)

- [ ] 9. Checkpoint — integração completa
  - [ ] 9.1 Write unit test: ciclo de vida completo do popup
    - Testar open transient → pin → close com `chord-card-active`
    - Testar que segundo `open()` fecha o primeiro
    - Testar Escape fecha e retorna foco
    - Testar `scale-changed` fecha popup
    - Arquivo: `tests/cases/chord-card-interactive/chord-popup-lifecycle.unit.spec.js`
    - _Requirements: 1.5, 2.4, 2.5, 2.6, 2.7, 2.8, 7.1, 8.3_

  - [ ]* 9.2 Write property test: exclusividade de popup e active card
    - **Property 1**: sequência aleatória de open/close — no máximo 1 popup no DOM
    - **Property 2**: sequência de cliques — no máximo 1 `chord-card-active`
    - Arquivo: `tests/cases/chord-card-interactive/popup-exclusivity.property.spec.js`
    - _Requirements: 1.5, 2.6, 2.7, 2.8_

  - [ ]* 9.3 Write property test: chord-shape-changed reflete seleção
    - **Property 5**: para qualquer índice clicado no carrossel, `detail.shapeIndex` === índice clicado
    - Arquivo: `tests/cases/chord-card-interactive/carousel-event.property.spec.js`
    - _Requirements: 4.4_

  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marcadas com `*` são opcionais (testes extras); o MVP funciona sem elas.
- Cada task referencia os requirements para rastreabilidade.
- O `FloatingPopup` existente já tem drag, contenção no viewport e focus trap — priorizar reuso
  antes de reimplementar qualquer dessas mecânicas.
- `playChord` já existe em `script-chord-diagrams.js` — não reimplementar.
- Ao término, deletar `issue-k-body.md` (arquivo temporário criado durante triagem).

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.2", "1.3"] },
    { "id": 1, "tasks": ["1.1", "6.1"] },
    { "id": 2, "tasks": ["2.1", "2.2", "3.1", "5.1", "6.2", "6.3"] },
    { "id": 3, "tasks": ["7.1", "7.2", "7.3", "8.1", "8.2"] },
    { "id": 4, "tasks": ["5.2", "6.4", "9.1", "9.2", "9.3"] }
  ]
}
```
