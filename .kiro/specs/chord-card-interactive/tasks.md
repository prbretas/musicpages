# Implementation Plan: Chord Card Interactive

## Overview

Construir o popup flutuante de acorde sobre sistemas já existentes: `FloatingPopup` (drag/overlay/
focus trap), `createVoicingNavigator` (índice cíclico), `playChord` (AudioEngine) e `LocalChordDB`
(shapes). O ponto de entrada é o `handleChordCardClick` existente em `script-chord-diagrams.js`.
Toda a implementação segue o padrão IIFE/Vanilla JS do projeto — sem build step, sem novas deps.

## Tasks

- [x] 1. Criar ChordPopupManager e fábrica createChordPopup (estrutura base)
  - [x] 1.1 Criar `ChordPopupManager` como objeto singleton dentro do IIFE em `script-chord-diagrams.js`
    - Implementar estado interno: `_activePopup`, `_activeCard`, `_hoverTimer`, `_closeTimer`, `_state`
    - Implementar `open(cardEl, chord, pinned)` — cria popup, anexa ao `document.body`, posiciona adjacente ao card
    - Implementar `pin()` — chama `_activePopup.upgrade()` para injetar controles Play/Variar + focus trap
    - Implementar `close()` / `_destroyPopup()` — remove popup, `chord-card-active`, focus trap e listener de clique fora
    - Implementar `cancelHoverTimer()` e `cancelCloseTimer()`
    - _Requirements: 1.5, 2.4, 2.5, 2.6, 2.7, 2.8, 7.1, 7.2_

  - [x] 1.2 Criar função `createChordPopup(chord, activeShapeIndex, opts)` dentro do IIFE
    - Modo transient: handle de drag + diagrama SVG
    - `upgrade(opts)`: header (handle+título+×), actions (Play+Variar), carrossel de shapes, role=dialog
    - `destroy()`: remove do DOM
    - `updateShape(idx)`: atualiza SVG do diagrama principal
    - Drag via `_FloatingPopupInternals.computeDragPosition` + `clampPosition` (com fallback manual)
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 5.1, 5.2, 5.3, 8.1, 8.4, 8.5_

  - [x] 1.3 Implementar lógica de posicionamento inicial do popup
    - `_computePopupPosition`: below-right com flip para below-left/above quando overflow de viewport
    - _Requirements: 6.1, 6.2, 6.3_

- [x] 2. Integrar hover nos ChordCards
  - [x] 2.1 Criar `handleChordCardHover(chord, cardEl, entering)` dentro do IIFE
    - entering=true: agenda `open` após 300ms, cancela closeTimer
    - entering=false: cancela hoverTimer, agenda `close` após 150ms se não pinned
    - _Requirements: 1.1, 1.3, 1.5_

  - [x] 2.2 Adicionar `mouseenter`/`mouseleave` em cada `.chord-card` dentro de `render()`
    - _Requirements: 1.1, 1.3_

- [x] 3. Estender handleChordCardClick para delegar ao ChordPopupManager
  - [x] 3.1 Modificar `handleChordCardClick` para usar `ChordPopupManager`
    - Pinned do mesmo card → `close()` (toggle off)
    - Qualquer outro estado → `open(cardEl, chord, true)` (pin imediato)
    - Mantém dispatch de `chord-selected` para compatibilidade com fretboard
    - _Requirements: 2.1, 2.2, 2.5, 2.6, 2.7, 2.8_

- [x] 4. Checkpoint — estrutura base
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implementar botão ▶ Play
  - [x] 5.1 Criar e conectar o botão Play no `upgrade()` de `createChordPopup`
    - `<button class="chord-popup__play" aria-label="Tocar acorde">▶ Play</button>`
    - Chama `playChord(chord.shapes[activeShapeIndex])`
    - Desabilitado se AudioEngine não disponível
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 6. Implementar VoiceCarousel (botão Variar + painel)
  - [x] 6.1 Carrossel inline dentro de `upgrade()` — container `.chord-popup__carousel` oculto
    - `.carousel__item` por shape (SVG mini 60×75 + aria-label "Shape N de T")
    - `.carousel__item--active` marcado ao selecionar
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 8.6_

  - [x] 6.2 Conectar botão Variar ao VoiceCarousel
    - Toggle `hidden` do carrossel
    - Desabilitado se shapes.length ≤ 1
    - _Requirements: 4.1, 4.6, 4.7_

  - [x] 6.3 Disparar `chord-shape-changed` ao selecionar shape no carrossel
    - `document.dispatchEvent(new CustomEvent('chord-shape-changed', { detail: { chordName, shapeIndex } }))`
    - _Requirements: 4.3, 4.4_

- [x] 7. Integração com scale-changed e acessibilidade
  - [x] 7.1 Registrar listener `scale-changed` no init() — fecha popup ativo
    - _Requirements: 7.1, 7.2_

  - [x] 7.2 Focus trap via `_FloatingPopupInternals.createFocusTrap` ao pinnar
    - _Requirements: 8.1, 8.2_

  - [x] 7.3 Conectar Escape ao fechamento do popup
    - Listener `keydown` no documento dentro de `init()`
    - _Requirements: 8.3_

- [x] 8. Adicionar estilos CSS
  - [x] 8.1 Criar regras CSS do ChordPopup em `styles/style.css`
    - `.chord-popup`, `.chord-popup--pinned`, `.chord-popup__handle`, `.chord-popup__header`
    - `.chord-popup__title`, `.chord-popup__close`, `.chord-popup__diagram`, `.chord-popup__actions`
    - `.chord-popup__play`, `.chord-popup__variar`, `.chord-popup__carousel`
    - `.carousel__item`, `.carousel__item--active`
    - Dark mode completo
    - _Requirements: 5.3_

  - [x] 8.2 Responsividade mobile
    - `max-width: calc(100vw - 16px)` via clampPosition

- [x] 9. Checkpoint — integração completa
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks com `*` são testes opcionais — não implementados neste MVP.
- O `FloatingPopup` existente não foi reutilizado diretamente (usa contentSelector para mover DOM);
  em vez disso, `computeDragPosition`, `clampPosition` e `createFocusTrap` são reusados via
  `window._FloatingPopupInternals`.
- `playChord` já existe — não reimplementado.
- A spec chord-shape-changed é gerada no seletor do carrossel.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.2", "1.3"] },
    { "id": 1, "tasks": ["1.1", "6.1"] },
    { "id": 2, "tasks": ["2.1", "2.2", "3.1", "5.1", "6.2", "6.3"] },
    { "id": 3, "tasks": ["7.1", "7.2", "7.3", "8.1", "8.2"] }
  ]
}
```
