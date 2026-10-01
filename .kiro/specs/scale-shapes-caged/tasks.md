# Implementation Plan: Scale Shapes CAGED

## Overview

Implementação da visualização de escalas no fretboard por shapes (CAGED). O sistema calcula shapes dinamicamente a partir dos intervalos da escala, renderiza com cores distintas no fretboard existente, e oferece interação via hover e toggle. Implementação em Vanilla JS (IIFE pattern), sem build step.

## Tasks

- [x] 1. Criar estrutura base e funções puras do ShapeEngine
  - [x] 1.1 Criar `scripts/script-scale-shapes.js` com IIFE pattern, contendo constantes (SHAPE_COLORS, notasCromaticas local) e funções auxiliares puras: `computeShapeRange(rootFret, numFrets)`, `findNotePositions(targetNote, tuning, numFrets)`, `getScaleNotesInRange(openNote, startFret, endFret, scaleNotes, numFrets)`
    - Expor funções via `module.exports` condicional para testabilidade
    - Incluir paleta de pelo menos 12 cores com prefixo "shape-"
    - _Requirements: 1.3, 5.5, 5.6_

  - [x] 1.2 Implementar `computeShapes({ scaleNotes, tonic, tuning, numFrets })` no mesmo arquivo
    - Para cada nota da escala (grau), encontrar a posição raiz na corda mais grave
    - Calcular faixa de trastes (4-5 frets) via `computeShapeRange`
    - Coletar notas da escala na faixa para cada corda via `getScaleNotesInRange`
    - Retornar array de Shape objects `{ index, rootNote, rootFret, startFret, endFret, notes[] }`
    - Garantir que o número de shapes == número de notas da escala
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_

  - [ ]* 1.3 Write property test: Shape count equals scale note count
    - **Property 1: Shape count equals scale note count**
    - **Validates: Requirements 1.1, 1.5, 1.6, 1.7**
    - Arquivo: `tests/cases/scale-shapes-caged/shape-count.property.spec.js`
    - Gerar escalas arbitrárias de 5 a 12 notas usando fast-check e verificar `shapes.length === scaleNotes.length`

  - [ ]* 1.4 Write property test: Shape fret span invariant
    - **Property 2: Shape fret span invariant**
    - **Validates: Requirements 1.3**
    - Arquivo: `tests/cases/scale-shapes-caged/shape-fret-span.property.spec.js`
    - Para qualquer shape computado, verificar `endFret - startFret <= 4`

  - [ ]* 1.5 Write property test: Shape union covers all fretboard scale notes
    - **Property 3: Shape union covers all fretboard scale notes**
    - **Validates: Requirements 1.4**
    - Arquivo: `tests/cases/scale-shapes-caged/shape-coverage.property.spec.js`
    - Unir todas as notas de todos shapes e comparar com o conjunto completo de notas da escala no fretboard

  - [ ]* 1.6 Write property test: Each shape root is a unique scale degree
    - **Property 4: Each shape root is a unique scale degree**
    - **Validates: Requirements 1.2**
    - Arquivo: `tests/cases/scale-shapes-caged/shape-root-uniqueness.property.spec.js`
    - Verificar que rootNotes são únicos e formam exatamente o conjunto de notas da escala

- [x] 2. Checkpoint - Validar ShapeEngine
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Implementar ShapeOverlay e estilos CSS
  - [x] 3.1 Implementar funções `getShapeColorClass(shapeIndex)`, `applyShapeOverlay(shapes)`, e `clearShapeOverlay()` em `script-scale-shapes.js`
    - `getShapeColorClass` retorna `shape-N` com módulo para wrapping de paleta
    - `applyShapeOverlay` adiciona classes shape-N nas note-cells correspondentes (string + fret match)
    - `clearShapeOverlay` remove todas classes que começam com "shape-" de todas note-cells
    - Não remover classes existentes (`in-scale`, `color-X`, `tonic`)
    - Notas em overlap (2 shapes adjacentes) recebem ambas classes
    - _Requirements: 2.1, 2.3, 2.4, 2.5, 5.3_

  - [x] 3.2 Adicionar estilos CSS de shapes em `styles/style-fretboard.css` (seção dedicada no final) ou em novo arquivo `styles/style-scale-shapes.css`
    - Definir `.shape-0` a `.shape-11` com cores de background-color distintas
    - Garantir que `.tonic` mantém borda dourada e escala 1.3 mesmo com shape
    - Definir transition: opacity 150ms para classes de shape
    - Regra de prioridade: nota com dois shapes usa cor do shape de menor índice
    - _Requirements: 2.1, 2.2, 2.4, 2.5, 3.4_

  - [ ]* 3.3 Write property test: Color class uniqueness per shape
    - **Property 5: Color class uniqueness per shape**
    - **Validates: Requirements 2.1**
    - Arquivo: `tests/cases/scale-shapes-caged/shape-color-class.property.spec.js`
    - Para N <= palette size, verificar que getShapeColorClass retorna nomes únicos

  - [ ]* 3.4 Write property test: Overlay preserves existing CSS classes
    - **Property 6: Overlay preserves existing CSS classes**
    - **Validates: Requirements 5.3**
    - Arquivo: `tests/cases/scale-shapes-caged/overlay-preserves-classes.property.spec.js`
    - Simular note-cells com classes pré-existentes, aplicar overlay, verificar que originais permanecem

  - [ ]* 3.5 Write property test: Overlapping notes have both shape classes
    - **Property 11: Overlapping notes have both shape classes**
    - **Validates: Requirements 2.4**
    - Arquivo: `tests/cases/scale-shapes-caged/overlap-both-classes.property.spec.js`
    - Para notas em faixa de 2 shapes adjacentes, verificar ambas classes aplicadas

- [x] 4. Implementar ShapeTogglePanel
  - [x] 4.1 Implementar `renderTogglePanel(shapeCount, onToggle)`, `resetToggles()`, e `getToggleStates()` em `script-scale-shapes.js`
    - Criar container div posicionado acima do fretboard no DOM
    - Renderizar um botão por shape, label = número do shape (1-based)
    - Background do botão = cor do shape quando ativo, cinza neutro quando inativo
    - Click toggle: callback `onToggle(shapeIndex, isActive)` + atualizar visual do botão
    - `resetToggles` coloca todos em ativo
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [ ]* 4.2 Write property test: Toggle round-trip restores visibility
    - **Property 8: Toggle round-trip restores visibility**
    - **Validates: Requirements 4.3, 4.4**
    - Arquivo: `tests/cases/scale-shapes-caged/toggle-roundtrip.property.spec.js`
    - Para qualquer shape, toggle off + toggle on == estado original

  - [ ]* 4.3 Write property test: Toggle button color reflects state
    - **Property 9: Toggle button color reflects state**
    - **Validates: Requirements 4.5**
    - Arquivo: `tests/cases/scale-shapes-caged/toggle-color-state.property.spec.js`
    - Verificar cor do botão corresponde ao estado ativo/inativo

  - [ ]* 4.4 Write property test: Scale change resets all toggles to active
    - **Property 10: Scale change resets all toggles to active**
    - **Validates: Requirements 4.6**
    - Arquivo: `tests/cases/scale-shapes-caged/scale-change-reset.property.spec.js`
    - Simular dois scale-changed eventos, verificar todos toggles ativos após o segundo

- [ ] 5. Implementar interação hover
  - [x] 5.1 Implementar `computeHoverOpacities(hoveredShapeIndex, totalShapes)` como função pura em `script-scale-shapes.js`
    - Retorna array de opacidades: 1.0 para shape hovered, 0.3 para demais
    - Quando hoveredShapeIndex === -1, retorna todos com 1.0
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ] 5.2 Implementar `setupHoverInteraction(shapes)` com event listeners em `script-scale-shapes.js`
    - mouseenter em note-cell com shape: aplicar opacidades via style inline ou toggle de classe
    - mouseleave (quando pointer sai de todas note-cells com shape): restaurar tudo a 1.0
    - Respeitar toggles — shapes desabilitados não participam do hover
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 5.3 Write property test: Hover opacities — emphasis and dimming
    - **Property 7: Hover opacities — emphasis and dimming**
    - **Validates: Requirements 3.1, 3.2, 3.3**
    - Arquivo: `tests/cases/scale-shapes-caged/hover-opacities.property.spec.js`
    - Para qualquer totalShapes e hoveredIndex, verificar opacidades corretas

- [x] 6. Checkpoint - Validar componentes visuais
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Integração e wiring com módulos existentes
  - [x] 7.1 Implementar o listener principal de `scale-changed` e orquestração em `script-scale-shapes.js`
    - `document.addEventListener('scale-changed', handler)`
    - Extrair `notes`, `tonica`, `tipoEscala`, `tonicaIndex` do `event.detail`
    - Obter tuning e numFrets do fretboard atual (via DOM ou variáveis globais)
    - Chamar `computeShapes()` → `clearShapeOverlay()` → `applyShapeOverlay()` → `renderTogglePanel()` → `setupHoverInteraction()`
    - Quando notes é vazio: `clearShapeOverlay()` + `resetToggles()` e parar
    - _Requirements: 5.1, 5.2, 5.4_

  - [x] 7.2 Incluir `<script src="scripts/script-scale-shapes.js"></script>` em `index.html` (após script-escalas.js e script-fretboard.js)
    - Incluir link para CSS de shapes se arquivo separado foi criado
    - _Requirements: 5.5_

  - [ ]* 7.3 Write unit tests de integração DOM
    - Arquivo: `tests/cases/scale-shapes-caged/shape-overlay.unit.spec.js`
    - Testar: overlay limpa tudo quando escala vazia (Req 5.4)
    - Testar: tonic notes mantêm classe `tonic` (Req 2.5)
    - Testar: toggle panel posicionado acima do fretboard (Req 4.2)
    - Testar: classes de shape usam prefixo "shape-" (Req 5.6)
    - Testar: ShapeEngine lê corretamente detail do evento (Req 5.2)
    - _Requirements: 2.5, 4.2, 5.2, 5.4, 5.6_

- [ ] 8. Final checkpoint - Validar integração completa
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Todas as funções puras (computeShapes, computeHoverOpacities, getShapeColorClass, etc.) são testáveis via fast-check sem DOM
- Funções DOM (applyShapeOverlay, setupHoverInteraction, renderTogglePanel) testadas com jsdom

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "3.2"] },
    { "id": 2, "tasks": ["1.3", "1.4", "1.5", "1.6", "3.1", "5.1"] },
    { "id": 3, "tasks": ["3.3", "3.4", "3.5", "4.1", "5.2"] },
    { "id": 4, "tasks": ["4.2", "4.3", "4.4", "5.3"] },
    { "id": 5, "tasks": ["7.1"] },
    { "id": 6, "tasks": ["7.2", "7.3"] }
  ]
}
```
