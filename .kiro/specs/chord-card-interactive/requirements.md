# Requirements Document

## Introduction

Card de Acorde Interativo no campo harmônico. Ao passar o mouse sobre um card de acorde, um popup
flutuante mostra o diagrama do voicing atual. Ao clicar, o popup fica fixo e exibe dois controles:
botão **Variar** (navegar entre shapes alternativos em carrossel) e botão **▶ Play** (tocar o acorde
via AudioEngine). O popup é arrastável, reusando o sistema `FloatingPopup` existente. A feature é a
camada de UI que une as specs `chord-fretboard-visualization` e `chord-shape-selector`.

## Glossary

- **ChordCard**: Elemento DOM (`.chord-card`) que representa um acorde no grid do campo harmônico.
- **ChordPopup**: Popup flutuante e arrastável que exibe o diagrama do voicing ativo de um acorde.
- **VoiceCarousel**: Painel de carrossel horizontal de shapes alternativos, aberto pelo botão Variar.
- **FloatingPopup**: Sistema de popup arrastável existente em `script-floating-popup.js` (drag handle, overlay, focus trap).
- **ChordShape**: Objeto de dados com `frets`, `fingers`, `startFret`, `barre` — representa uma posição do acorde no braço.
- **ActiveCard**: O ChordCard que foi clicado e cujo ChordPopup está fixo na tela.
- **playChord**: Função existente em `script-chord-diagrams.js` que toca um ChordShape via AudioEngine.
- **LocalChordDB**: Base de dados local de shapes por acorde, já existente em `script-chord-diagrams.js`.
- **HoverTimer**: Delay de ~300ms antes de abrir o popup no hover, para evitar abertura acidental.

## Requirements

### Requirement 1: Hover abre popup flutuante

**User Story:** As a musician, I want a chord popup to appear when I hover over a chord card so that I can quickly preview the voicing without clicking.

#### Acceptance Criteria

1. WHEN the user hovers over a ChordCard for at least 300ms, THE ChordVisualizer SHALL open a ChordPopup positioned adjacent to the card.
2. THE ChordPopup SHALL display the chord name and the SVG diagram of the currently active ChordShape for that chord.
3. WHEN the user moves the mouse away from both the ChordCard and the ChordPopup, THE ChordVisualizer SHALL close the ChordPopup after a 150ms grace period.
4. WHEN a ChordCard has no shapes available in LocalChordDB, THE ChordVisualizer SHALL NOT open a ChordPopup on hover.
5. WHEN a ChordPopup is already fixed (pinned via click), hovering over a different ChordCard SHALL NOT open a second ChordPopup.

### Requirement 2: Clique fixa o popup e exibe controles

**User Story:** As a musician, I want to click a chord card to pin the popup open with controls, so that I can interact with the chord's voicing at my own pace.

#### Acceptance Criteria

1. WHEN the user clicks a ChordCard, THE ChordVisualizer SHALL pin the ChordPopup open (it no longer closes on mouse-out).
2. WHEN the ChordPopup is pinned, it SHALL display a **▶ Play** button and a **Variar** button in addition to the chord diagram.
3. WHEN the user clicks the `×` button on the pinned ChordPopup, THE ChordVisualizer SHALL close and destroy the popup.
4. WHEN the user clicks outside the pinned ChordPopup and outside any ChordCard, THE ChordVisualizer SHALL close and destroy the popup.
5. WHEN the user clicks the same ChordCard again while its popup is pinned, THE ChordVisualizer SHALL close the popup (toggle off).
6. WHEN a pinned ChordPopup is open and the user clicks a different ChordCard, THE ChordVisualizer SHALL close the current popup and pin a new one for the clicked card.
7. THE ChordCard that owns the pinned popup SHALL receive the CSS class `chord-card-active`.
8. WHEN the pinned popup is closed, THE ChordVisualizer SHALL remove `chord-card-active` from all ChordCards.

### Requirement 3: Botão ▶ Play — tocar o acorde

**User Story:** As a musician, I want to play the currently displayed chord voicing by clicking the Play button, so that I can hear the sound of the chord.

#### Acceptance Criteria

1. WHEN the user clicks **▶ Play** in a pinned ChordPopup, THE ChordVisualizer SHALL call `playChord` with the currently displayed ChordShape.
2. WHEN `playChord` is called, THE ChordVisualizer SHALL use the AudioEngine already active — no new audio context SHALL be created.
3. WHEN the AudioEngine is unavailable or not initialized, THE play button SHALL be disabled (greyed out) and clicking it SHALL have no effect.
4. THE Play button SHALL have `aria-label="Tocar acorde"`.

### Requirement 4: Botão Variar — carrossel de shapes

**User Story:** As a musician, I want to open a shape carousel by clicking Variar so that I can browse and select an alternative voicing for the chord.

#### Acceptance Criteria

1. WHEN the user clicks **Variar**, THE ChordPopup SHALL expand to show the VoiceCarousel panel with all available ChordShapes displayed horizontally.
2. THE VoiceCarousel SHALL highlight the currently active shape with a distinct visual indicator.
3. WHEN the user clicks a shape in the VoiceCarousel, THE ChordPopup SHALL update the main diagram to that shape and mark it as active.
4. WHEN a shape is selected in the VoiceCarousel, THE ChordVisualizer SHALL dispatch a `chord-shape-changed` CustomEvent with `{ chordName, shapeIndex }` so that other components (fretboard, chord-shape-selector) can react.
5. WHEN the VoiceCarousel has more shapes than fit horizontally, navigation arrows SHALL appear to scroll through them.
6. WHEN a chord has only one available shape, THE **Variar** button SHALL be disabled (greyed out).
7. THE **Variar** button SHALL have `aria-label="Variar posição do acorde"`.

### Requirement 5: Popup arrastável

**User Story:** As a musician, I want to drag the chord popup to a convenient position on screen so that it does not obstruct the content I am reading.

#### Acceptance Criteria

1. THE pinned ChordPopup SHALL be draggable by its title/handle area, reusing the drag logic of `FloatingPopup`.
2. WHEN the user drags the ChordPopup, it SHALL move freely within the viewport without going offscreen.
3. THE ChordPopup drag handle SHALL have a visual affordance (grab cursor, dot-grid icon) consistent with the existing `FloatingPopup` style.
4. THE ChordPopup SHALL NOT use a full-page overlay (unlike modal dialogs) — background content remains interactive.

### Requirement 6: Posicionamento inicial do popup

**User Story:** As a musician, I want the popup to appear near the chord card I interacted with so that the context is clear.

#### Acceptance Criteria

1. WHEN a ChordPopup opens (hover or click), it SHALL appear adjacent to the triggering ChordCard, preferring to open below-right.
2. WHEN opening below-right would place the popup partially outside the viewport, THE ChordVisualizer SHALL flip the position (below-left, above-right, or above-left) to keep it fully visible.
3. WHEN a previously pinned ChordPopup was moved by the user, reopening it for the same card SHALL position it at the card again, not at the previous dragged position.

### Requirement 7: Integração com scale-changed

**User Story:** As a musician, I want the chord popup to close when I change the scale so that stale chord data is not displayed.

#### Acceptance Criteria

1. WHEN a `scale-changed` event fires, THE ChordVisualizer SHALL close and destroy any open ChordPopup.
2. WHEN a `scale-changed` event fires, THE ChordVisualizer SHALL remove `chord-card-active` from all ChordCards.

### Requirement 8: Acessibilidade

**User Story:** As a keyboard user, I want to interact with the chord popup using only the keyboard so that the feature is accessible.

#### Acceptance Criteria

1. WHEN the ChordPopup is pinned open, focus SHALL move to the popup.
2. THE ChordPopup SHALL trap focus within itself while open (Tab cycles through interactive elements inside).
3. WHEN the user presses Escape while the ChordPopup is open, it SHALL close and return focus to the triggering ChordCard.
4. THE `×` close button SHALL have `aria-label="Fechar popup do acorde"`.
5. THE ChordPopup SHALL have `role="dialog"` and `aria-label` with the chord name (e.g. `aria-label="Acorde Am7"`).
6. THE VoiceCarousel shape buttons SHALL have `aria-label` with the shape position (e.g. `aria-label="Shape 1 de 3"`).
