# Requirements Document

## Introduction

Seleção e persistência de chord shapes (voicings) no ChordVisualizer. As setas ◀ ▶ já existentes permitem preview imediato entre shapes disponíveis para cada acorde do campo harmônico. Um botão de confirmação (✓) individual aparece quando o shape exibido difere do shape persistido, permitindo ao usuário salvar a escolha no localStorage. O shape selecionado é restaurado automaticamente ao reabrir a mesma escala.

## Glossary

- **ChordVisualizer**: IIFE global (`window.ChordVisualizer`) responsável por renderizar diagramas SVG de acordes do campo harmônico da escala selecionada.
- **VoicingNavigator**: Objeto interno que mantém o índice do shape atual para cada acorde e expõe `next()`, `prev()` e `getIndicator()`.
- **ChordShape**: Objeto de dados contendo `frets`, `fingers`, `startFret`, `barre` e metadados de um voicing específico.
- **ShapeIndex**: Posição (0-indexed) de um ChordShape dentro do array de shapes disponíveis para um acorde.
- **ConfirmButton**: Botão ✓ individual por acorde que persiste o ShapeIndex selecionado no localStorage.
- **StorageKey**: Chave composta no formato `chordShape:{chordName}:{scaleKey}` usada para identificar unicamente o shape salvo.
- **ScaleKey**: Identificador derivado da tônica e tipo de escala (ex: `C_maior`) usado como parte da StorageKey.
- **PreviewState**: Estado visual temporário onde o diagrama SVG reflete o shape navegado mas ainda não persistido.

## Requirements

### Requirement 1: Preview imediato via navegação

**User Story:** As a musician, I want to see the chord shape change immediately when I press the navigation arrows, so that I can quickly compare different voicings visually.

#### Acceptance Criteria

1. WHEN the user clicks the ▶ button on a chord card, THE ChordVisualizer SHALL advance the VoicingNavigator to the next ShapeIndex and render the corresponding ChordShape SVG within 50ms.
2. WHEN the user clicks the ◀ button on a chord card, THE ChordVisualizer SHALL move the VoicingNavigator to the previous ShapeIndex and render the corresponding ChordShape SVG within 50ms.
3. WHEN the VoicingNavigator reaches the last ShapeIndex and the user clicks ▶, THE ChordVisualizer SHALL wrap to ShapeIndex 0 and render the first ChordShape.
4. WHEN the VoicingNavigator is at ShapeIndex 0 and the user clicks ◀, THE ChordVisualizer SHALL wrap to the last ShapeIndex and render the last ChordShape.
5. WHEN navigation occurs, THE ChordVisualizer SHALL update the voicing indicator text to reflect the new position in format "N/T" where N is 1-indexed current and T is total.

### Requirement 2: Botão de confirmação individual

**User Story:** As a musician, I want a confirm button that appears only when I navigate to a different shape, so that I can deliberately save my preferred voicing without accidental changes.

#### Acceptance Criteria

1. WHEN the displayed ShapeIndex differs from the persisted ShapeIndex for a chord, THE ChordVisualizer SHALL display the ConfirmButton (✓) adjacent to the voicing indicator.
2. WHEN the displayed ShapeIndex equals the persisted ShapeIndex for a chord, THE ChordVisualizer SHALL hide the ConfirmButton for that chord.
3. WHEN the user clicks the ConfirmButton, THE ChordVisualizer SHALL persist the current ShapeIndex to localStorage using the StorageKey and hide the ConfirmButton.
4. WHILE no shape has been persisted for a chord, THE ChordVisualizer SHALL treat ShapeIndex 0 as the default persisted value.
5. WHEN the user navigates back to the persisted ShapeIndex without clicking confirm, THE ChordVisualizer SHALL hide the ConfirmButton.

### Requirement 3: Persistência em localStorage

**User Story:** As a musician, I want my selected chord shapes to be saved and restored when I revisit the same scale, so that I do not lose my preferred voicing choices.

#### Acceptance Criteria

1. WHEN the ConfirmButton is clicked, THE ChordVisualizer SHALL write the ShapeIndex to localStorage with the StorageKey `chordShape:{chordName}:{scaleKey}`.
2. WHEN a scale-changed event fires and chord cards are rendered, THE ChordVisualizer SHALL read the localStorage for each chord using the corresponding StorageKey.
3. WHEN a valid persisted ShapeIndex exists in localStorage for a chord, THE ChordVisualizer SHALL set the VoicingNavigator to that ShapeIndex and render the corresponding ChordShape.
4. IF the persisted ShapeIndex exceeds the available shapes count for a chord, THEN THE ChordVisualizer SHALL fall back to ShapeIndex 0 and remove the invalid entry from localStorage.
5. WHEN localStorage is unavailable or throws an error, THE ChordVisualizer SHALL default to ShapeIndex 0 and continue operation without persistence.
6. THE ChordVisualizer SHALL derive the ScaleKey from the tonica and tipoEscala values in the format `{tonica}_{tipoEscala}` (ex: `C_maior`, `A_menor_natural`).

### Requirement 4: Comportamento ao trocar escala

**User Story:** As a musician, I want independent shape selections per scale, so that switching scales restores the correct voicings for each context.

#### Acceptance Criteria

1. WHEN a scale-changed event fires, THE ChordVisualizer SHALL compute a new ScaleKey from the event detail and use it for all localStorage lookups during rendering.
2. WHEN a scale-changed event fires and a chord appears in both old and new scales, THE ChordVisualizer SHALL restore the persisted ShapeIndex specific to the new ScaleKey independently of the old scale.
3. WHEN a scale-changed event fires and a chord has no persisted ShapeIndex for the new ScaleKey, THE ChordVisualizer SHALL render ShapeIndex 0 for that chord.
4. WHEN a scale-changed event fires, THE ChordVisualizer SHALL hide all ConfirmButtons since displayed shapes match persisted shapes after restoration.

### Requirement 5: Acessibilidade e UI do ConfirmButton

**User Story:** As a musician using assistive technology, I want the confirm button to be accessible and clearly labeled, so that I can interact with it effectively.

#### Acceptance Criteria

1. THE ConfirmButton SHALL have an `aria-label` attribute with value "Confirmar shape selecionado" for screen reader accessibility.
2. THE ConfirmButton SHALL use the CSS class `chord-confirm-btn` for styling.
3. WHEN the ConfirmButton is hidden, THE ChordVisualizer SHALL set `display: none` on the element rather than removing it from the DOM.
4. THE ConfirmButton SHALL be rendered as a `<button>` element with text content "✓" and positioned after the voicing indicator within the navigation container.
5. WHEN the ConfirmButton receives focus via keyboard, THE ChordVisualizer SHALL apply a visible focus indicator consistent with the application theme.

### Requirement 6: Integração com acorde de shape único

**User Story:** As a musician, I want chords with only one available shape to behave consistently, so that the interface remains predictable.

#### Acceptance Criteria

1. WHILE a chord has only one available ChordShape, THE ChordVisualizer SHALL render the diagram without navigation arrows, indicator, or ConfirmButton.
2. WHILE a chord has only one available ChordShape, THE ChordVisualizer SHALL not write any entry to localStorage for that chord.
3. WHEN a chord transitions from multiple shapes to a single shape due to scale change, THE ChordVisualizer SHALL render without navigation controls and ignore any previously persisted ShapeIndex.
