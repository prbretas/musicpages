# Requirements Document

## Introduction

Visualização de acordes no fretboard interativo. Ao clicar em um card de acorde no campo harmônico, o fretboard substitui o destaque da escala pelas notas do acorde selecionado. Múltiplos shapes (posições alternativas) são navegáveis um por vez através de botões de navegação (◀ ▶) diretamente no fretboard. A comunicação entre componentes utiliza um CustomEvent `chord-selected`, mantendo a arquitetura desacoplada existente.

## Glossary

- **Fretboard**: Componente visual do braço do instrumento renderizado por `script-fretboard.js`, responsável por exibir notas e destaques.
- **ChordVisualizer**: IIFE global (`script-chord-diagrams.js`) que renderiza diagramas SVG de acordes no grid do campo harmônico.
- **ChordCard**: Elemento DOM (`.chord-card`) que exibe um acorde individual no grid do campo harmônico.
- **ChordShape**: Objeto de dados contendo frets, fingers, startFret e barre que define uma posição específica de acorde no braço.
- **ShapeNavigator**: Componente de navegação (◀ ▶) exibido no fretboard que permite alternar entre shapes do acorde selecionado.
- **chord-selected**: CustomEvent disparado quando o usuário clica em um ChordCard, contendo os dados necessários para o fretboard exibir o acorde.
- **HighlightMode**: Estado do fretboard indicando se o destaque ativo é de escala ou de acorde.

## Requirements

### Requirement 1: Disparo do evento chord-selected ao clicar no card

**User Story:** As a musician, I want to click on a chord card in the harmonic field so that I can see its positions on the fretboard.

#### Acceptance Criteria

1. WHEN the user clicks on a ChordCard, THE ChordVisualizer SHALL dispatch a `chord-selected` CustomEvent on the document.
2. THE `chord-selected` event detail SHALL contain the chord name, root note, and the complete array of ChordShape objects available for that chord.
3. WHEN the ChordCard has no available shapes in LocalChordDB, THE ChordVisualizer SHALL not dispatch the `chord-selected` event.
4. WHEN the user clicks on the voicing navigation buttons (◀ ▶) inside the ChordCard, THE ChordVisualizer SHALL not dispatch the `chord-selected` event.

### Requirement 2: Destaque de notas do acorde no fretboard

**User Story:** As a musician, I want the fretboard to highlight the notes of the selected chord so that I can visualize them across the neck.

#### Acceptance Criteria

1. WHEN a `chord-selected` event is received, THE Fretboard SHALL remove any active scale highlighting from all note cells.
2. WHEN a `chord-selected` event is received, THE Fretboard SHALL highlight only the note cells that belong to the first ChordShape of the selected chord.
3. THE Fretboard SHALL apply a distinct CSS class `in-chord` to note cells that match the fretted positions of the active ChordShape.
4. THE Fretboard SHALL apply a distinct CSS class `chord-root` to note cells that match the root note position within the active ChordShape.
5. THE Fretboard SHALL highlight only the fret range covered by the active ChordShape (from startFret to startFret + 4), leaving other frets without chord highlighting.
6. WHEN a note cell has fret value -1 (muted) in the active ChordShape, THE Fretboard SHALL not highlight that string at the given fret range.

### Requirement 3: Navegação entre shapes no fretboard

**User Story:** As a musician, I want to navigate between alternative chord shapes on the fretboard so that I can learn different positions for the same chord.

#### Acceptance Criteria

1. WHEN a `chord-selected` event is received with more than one ChordShape, THE Fretboard SHALL display a ShapeNavigator component with previous (◀) and next (▶) buttons.
2. WHEN a `chord-selected` event is received with exactly one ChordShape, THE Fretboard SHALL not display the ShapeNavigator component.
3. WHEN the user clicks the next button (▶) on the ShapeNavigator, THE Fretboard SHALL display the next ChordShape in the array, wrapping cyclically to the first shape after the last.
4. WHEN the user clicks the previous button (◀) on the ShapeNavigator, THE Fretboard SHALL display the previous ChordShape in the array, wrapping cyclically to the last shape after the first.
5. THE ShapeNavigator SHALL display a position indicator in the format "N/T" where N is the current 1-indexed shape position and T is the total number of shapes.
6. WHEN the user navigates to a different ChordShape, THE Fretboard SHALL update the highlighted notes to reflect the new shape positions.

### Requirement 4: Restauração do destaque de escala

**User Story:** As a musician, I want to return to the scale view on the fretboard so that I can continue studying the scale after viewing a chord.

#### Acceptance Criteria

1. WHEN a new `scale-changed` event is received while a chord is highlighted, THE Fretboard SHALL remove the chord highlighting and restore scale highlighting.
2. WHEN a `scale-changed` event is received, THE Fretboard SHALL hide the ShapeNavigator component.
3. WHEN the user clicks on the currently active (already selected) ChordCard, THE ChordVisualizer SHALL dispatch a `chord-deselected` CustomEvent to restore the previous scale highlight.
4. WHEN a `chord-deselected` event is received, THE Fretboard SHALL remove chord highlighting and restore the last known scale highlighting from stored state.

### Requirement 5: Indicação visual do acorde selecionado no grid

**User Story:** As a musician, I want to see which chord card is currently selected so that I know which chord is shown on the fretboard.

#### Acceptance Criteria

1. WHEN a ChordCard is clicked and the `chord-selected` event is dispatched, THE ChordVisualizer SHALL apply a CSS class `chord-card-active` to the selected ChordCard.
2. WHEN a different ChordCard is clicked, THE ChordVisualizer SHALL remove the `chord-card-active` class from the previously selected card and apply it to the new selection.
3. WHEN the chord is deselected (via `chord-deselected` or `scale-changed`), THE ChordVisualizer SHALL remove the `chord-card-active` class from all ChordCards.

### Requirement 6: Acessibilidade da interação

**User Story:** As a keyboard user, I want to select chords and navigate shapes using the keyboard so that the feature is accessible without a mouse.

#### Acceptance Criteria

1. THE ChordCard elements SHALL be focusable via keyboard navigation (tabindex or native focusable element).
2. WHEN a ChordCard has focus and the user presses Enter or Space, THE ChordVisualizer SHALL dispatch the `chord-selected` event as if clicked.
3. THE ShapeNavigator buttons SHALL be focusable and operable via keyboard (Enter or Space).
4. THE ShapeNavigator buttons SHALL have appropriate `aria-label` attributes describing their function.
