# Implementation Plan: Chord Fretboard Visualization

## Overview

Conectar o grid de diagramas de acorde ao fretboard via CustomEvents (`chord-selected`, `chord-deselected`), implementando destaque de posições de acorde no braço, navegação entre shapes alternativos, e restauração automática do destaque de escala. Toda implementação segue o padrão IIFE/vanilla JS existente no projeto.

## Tasks

- [x] 1. Implementar função pura `mapShapeToPositions` e lógica de navegação cíclica
  - [x] 1.1 Criar `mapShapeToPositions(shape, numStrings)` em `script-fretboard.js`
    - Função pura que converte um ChordShape em array de posições absolutas `{ stringIndex, fret, isRoot }`
    - Exclui strings com fret === -1 (muted)
    - Calcula fret absoluto: `shape.startFret + shape.frets[i] - 1` (open = fret 0 permanece 0)
    - Determina `isRoot` comparando a nota resultante com rootNote
    - Exposição via `window.mapShapeToPositions` para testabilidade
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 1.2 Criar função `createVoicingNavigator(total)` em `script-fretboard.js`
    - Retorna objeto `{ next(), prev(), getIndex(), getIndicator() }`
    - `next()` incrementa index com wrap cíclico `(i + 1) % total`
    - `prev()` decrementa com wrap cíclico `(i - 1 + total) % total`
    - `getIndicator()` retorna string `"(index+1)/total"`
    - Exposição via `window.createVoicingNavigator` para testabilidade
    - _Requirements: 3.3, 3.4, 3.5_

  - [ ]* 1.3 Write property test: mapShapeToPositions (Property 2)
    - **Property 2: Chord highlighting matches shape positions exactly**
    - Gerar shapes arbitrários com fast-check; verificar que posições retornadas correspondem exatamente às non-muted entries do shape
    - Verificar que `isRoot` é true apenas nas posições cuja nota calculada == rootNote
    - Arquivo: `tests/cases/chord-fretboard-visualization/shape-positions.property.spec.js`
    - **Validates: Requirements 2.2, 2.3, 2.4, 2.5, 2.6**

  - [ ]* 1.4 Write property test: createVoicingNavigator (Properties 3, 4)
    - **Property 3: Cyclic shape navigation**
    - **Property 4: Position indicator format**
    - Gerar N arbitrário (2..50) e sequências de next/prev; verificar wrap cíclico
    - Verificar formato do indicator string para qualquer index/total
    - Arquivo: `tests/cases/chord-fretboard-visualization/cyclic-navigation.property.spec.js`
    - **Validates: Requirements 3.3, 3.4, 3.5**

- [x] 2. Implementar ChordHighlighter e ShapeNavigator DOM no fretboard
  - [x] 2.1 Criar `highlightChordOnFretboard(shape, rootNote, numStrings)` em `script-fretboard.js`
    - Chama `mapShapeToPositions` para obter posições
    - Remove classes `in-scale`, `tonic` de todas as note cells
    - Aplica classe `in-chord` nas cells correspondentes (query por `[data-string][data-fret]`)
    - Aplica classe `chord-root` nas cells com `isRoot === true`
    - Atualiza `_highlightMode = 'chord'` no estado do módulo
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 2.2 Criar `clearChordHighlight()` em `script-fretboard.js`
    - Remove classes `in-chord` e `chord-root` de todas as note cells
    - Não restaura escala (responsabilidade do caller)
    - _Requirements: 4.1, 4.4_

  - [x] 2.3 Criar `createFretboardShapeNavigator(shapes, onNavigate)` em `script-fretboard.js`
    - Cria container DOM com botões ◀ e ▶ e indicador "N/T"
    - Botões com `aria-label` ("Shape anterior", "Próximo shape")
    - Retorna `{ destroy(), update(index, total) }`
    - Só renderiza se `shapes.length > 1`; se length === 1, retorna objeto noop
    - Botões focáveis via teclado (Enter/Space)
    - _Requirements: 3.1, 3.2, 3.5, 6.3, 6.4_

  - [ ]* 2.4 Write unit tests for ChordHighlighter DOM behavior
    - Testar que `highlightChordOnFretboard` aplica classes corretas em jsdom
    - Testar que `clearChordHighlight` remove classes sem afetar outras
    - Testar que scale classes são removidas ao aplicar chord
    - Arquivo: `tests/cases/chord-fretboard-visualization/chord-highlight.unit.spec.js`
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 3. Checkpoint - Verificar lógica pura e componentes DOM
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implementar dispatch de eventos no ChordVisualizer
  - [x] 4.1 Implementar `handleChordCardClick(chord, cardElement)` em `script-chord-diagrams.js`
    - Verifica se chord tem shapes disponíveis via `LocalChordDB.getChordShapes(chord.name)`, se não tem: return sem dispatch
    - Se card já ativo (tem classe `chord-card-active`): dispatch `chord-deselected`, remove classe, return
    - Remove `chord-card-active` do card previamente ativo (se existir)
    - Aplica `chord-card-active` no card clicado
    - Dispatch `chord-selected` com `{ chordName, root, shapes }`
    - _Requirements: 1.1, 1.2, 1.3, 5.1, 5.2, 5.3_

  - [x] 4.2 Integrar handler no render de ChordCards
    - Adicionar event listener de `click` em cada `.chord-card` durante renderização
    - Adicionar `tabindex="0"` nos cards e handler para Enter/Space
    - Usar `stopPropagation` nos botões ◀ ▶ internos do card para não disparar `chord-selected`
    - _Requirements: 1.4, 6.1, 6.2_

  - [ ]* 4.3 Write property test: Event detail structure (Property 1)
    - **Property 1: Event detail structure completeness**
    - Para qualquer chord name em LocalChordDB, verificar que detail contém chordName (non-empty), root (non-empty) e shapes === getChordShapes(name)
    - Arquivo: `tests/cases/chord-fretboard-visualization/event-detail.property.spec.js`
    - **Validates: Requirements 1.2**

  - [ ]* 4.4 Write property test: Active card exclusion (Property 5)
    - **Property 5: Mutual exclusion of active chord card**
    - Para qualquer sequência de seleções, no máximo 1 card terá classe `chord-card-active`
    - Arquivo: `tests/cases/chord-fretboard-visualization/active-card-exclusion.property.spec.js`
    - **Validates: Requirements 5.1, 5.2, 5.3**

- [x] 5. Conectar listeners de eventos no fretboard
  - [x] 5.1 Registrar listener `chord-selected` em `script-fretboard.js`
    - Extrai `{ chordName, root, shapes }` do event detail
    - Atualiza estado interno: `_highlightMode = 'chord'`, armazena shapes, reset shapeIndex = 0
    - Chama `highlightChordOnFretboard(shapes[0], root, numStrings)`
    - Cria/atualiza ShapeNavigator se `shapes.length > 1`
    - Callback do navigator chama `highlightChordOnFretboard(shapes[newIndex], root, numStrings)` + update indicator
    - _Requirements: 2.1, 2.2, 3.1, 3.6_

  - [x] 5.2 Registrar listener `chord-deselected` em `script-fretboard.js`
    - Chama `clearChordHighlight()`
    - Destrói ShapeNavigator
    - Restaura destaque de escala via `highlightFretboardNotes(_lastScaleState.scaleNotes, _lastScaleState.tonic)`
    - Atualiza `_highlightMode = 'scale'`
    - _Requirements: 4.3, 4.4_

  - [x] 5.3 Modificar listener existente de `scale-changed` em `script-fretboard.js`
    - Se `_highlightMode === 'chord'`: chamar `clearChordHighlight()`, destruir ShapeNavigator
    - Atualizar `_highlightMode = 'scale'`
    - Disparar remoção de `chord-card-active` via dispatch de evento ou callback
    - _Requirements: 4.1, 4.2_

  - [x] 5.4 Registrar listener `scale-changed` no ChordVisualizer para limpar active card
    - Remover classe `chord-card-active` de todos os cards quando nova escala é selecionada
    - _Requirements: 5.3_

  - [ ]* 5.5 Write unit tests for event wiring and state transitions
    - Testar fluxo completo: chord-selected → highlight → navigate → chord-deselected → restore scale
    - Testar que scale-changed durante chord mode restaura escala
    - Testar que click em card ativo faz toggle
    - Arquivo: `tests/cases/chord-fretboard-visualization/chord-selection.unit.spec.js`
    - _Requirements: 1.1, 4.1, 4.3, 4.4_

- [x] 6. Adicionar estilos CSS para chord highlighting e active card
  - [x] 6.1 Adicionar regras CSS em `style-fretboard.css`
    - `.in-chord`: estilo visual distinto de `.in-scale` (border/background diferente)
    - `.chord-root`: destaque extra (ex: borda mais espessa ou cor diferenciada)
    - `.fretboard-shape-nav`: container flex com gap para botões e indicador
    - `.fretboard-shape-nav button`: estilo dos botões ◀ ▶
    - _Requirements: 2.3, 2.4, 3.1_

  - [x] 6.2 Adicionar regra CSS para `.chord-card-active` em `style.css`
    - Estilo visual de seleção (ex: border-color, box-shadow ou outline)
    - _Requirements: 5.1_

- [x] 7. Final checkpoint - Validação completa
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases with jsdom
- Todas as funções novas devem ser expostas em `window` para testabilidade (padrão existente do projeto)
- Testes usam vitest + fast-check (já configurados no projeto)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["1.3", "1.4", "2.1", "2.2", "2.3"] },
    { "id": 2, "tasks": ["2.4", "4.1"] },
    { "id": 3, "tasks": ["4.2", "4.3", "4.4"] },
    { "id": 4, "tasks": ["5.1", "5.2", "5.3", "5.4", "6.1", "6.2"] },
    { "id": 5, "tasks": ["5.5"] }
  ]
}
```
