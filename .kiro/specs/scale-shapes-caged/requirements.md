# Requirements Document

## Introduction

Visualização de escalas no fretboard segmentada por shapes (método CAGED). O sistema calcula dinamicamente os shapes com base nos intervalos da escala selecionada e nas posições do braço, exibe todos simultaneamente com cores distintas, e permite interação via hover (destaque de shape individual) e toggle on/off por shape.

## Glossary

- **ShapeEngine**: Módulo JavaScript responsável pelo cálculo algorítmico dos shapes de escala no fretboard, segmentando notas em regiões posicionais baseadas nos graus da escala como notas-raiz de cada shape.
- **Fretboard**: Componente visual que renderiza o braço do instrumento e exibe notas (script-fretboard.js).
- **ScaleModule**: Módulo existente que contém estruturasEscalas e dispara o evento scale-changed (script-escalas.js).
- **Shape**: Subconjunto de notas de uma escala agrupadas por região de trastes no braço, onde cada shape cobre uma posição confortável para a mão (tipicamente 4-5 trastes de extensão).
- **ShapeCount**: Número de shapes gerados para uma escala, igual ao número de notas distintas na escala (5 para pentatônicas, 7 para diatônicas, 6 para blues, etc.).
- **ShapeOverlay**: Camada visual aplicada sobre as note-cells do fretboard que colore cada shape com uma cor distinta.
- **ShapeTogglePanel**: Painel de controle com botões toggle para ativar/desativar a exibição individual de cada shape.

## Requirements

### Requirement 1: Cálculo dinâmico de shapes

**User Story:** As a guitarist, I want the system to automatically compute scale shapes based on the selected scale intervals, so that I can visualize CAGED-style positions for any scale without hardcoded data.

#### Acceptance Criteria

1. WHEN the ScaleModule dispatches a scale-changed event, THE ShapeEngine SHALL compute a set of shapes equal to the ShapeCount of the selected scale.
2. THE ShapeEngine SHALL derive each shape by using each degree of the scale as the root note that defines the starting fret position of that shape.
3. THE ShapeEngine SHALL assign to each shape all scale notes reachable within a contiguous fret region of 4 to 5 frets from the shape root position on each string.
4. THE ShapeEngine SHALL ensure that the union of all shapes covers every occurrence of every scale note across the entire fretboard without omission.
5. WHEN the selected scale has 5 notes, THE ShapeEngine SHALL produce exactly 5 shapes.
6. WHEN the selected scale has 7 notes, THE ShapeEngine SHALL produce exactly 7 shapes.
7. WHEN the selected scale has a note count different from 5 or 7, THE ShapeEngine SHALL produce a number of shapes equal to the note count of the scale.
8. THE ShapeEngine SHALL support all scales defined in the estruturasEscalas object of the ScaleModule.

### Requirement 2: Visualização simultânea com cores distintas

**User Story:** As a guitarist, I want to see all shapes displayed simultaneously on the fretboard with distinct colors, so that I can visually distinguish shape regions at a glance.

#### Acceptance Criteria

1. WHEN shape data is computed, THE ShapeOverlay SHALL apply a unique CSS color class to the note-cells belonging to each shape on the Fretboard.
2. THE ShapeOverlay SHALL use a palette of at least 7 distinct colors to differentiate shapes visually.
3. THE ShapeOverlay SHALL display all shapes simultaneously on the Fretboard by default after a scale-changed event.
4. WHEN a note-cell belongs to an overlapping region of two adjacent shapes, THE ShapeOverlay SHALL assign that note-cell to both shapes by applying both shape color classes, rendering the note with the color of the lower-numbered shape.
5. THE ShapeOverlay SHALL preserve the existing tonic note visual indicator (gold border, scale 1.3) for tonic notes within each shape.

### Requirement 3: Interação via hover

**User Story:** As a guitarist, I want to hover over a note to highlight the entire shape it belongs to, so that I can focus on one position at a time while keeping context of the others.

#### Acceptance Criteria

1. WHEN the user hovers (mouseenter) over a note-cell that belongs to a shape, THE ShapeOverlay SHALL visually emphasize all note-cells belonging to that same shape by increasing their opacity to full.
2. WHEN the user hovers over a note-cell belonging to a shape, THE ShapeOverlay SHALL reduce the opacity of note-cells belonging to all other shapes to 0.3.
3. WHEN the user moves the pointer away (mouseleave) from all shape note-cells, THE ShapeOverlay SHALL restore all shapes to full opacity.
4. THE ShapeOverlay SHALL apply hover transitions with a CSS transition duration of 150 milliseconds for opacity changes.

### Requirement 4: Toggle on/off por shape

**User Story:** As a guitarist, I want toggle buttons to show or hide individual shapes, so that I can study specific positions in isolation or combination.

#### Acceptance Criteria

1. WHEN shape data is computed, THE ShapeTogglePanel SHALL render one toggle button for each shape, labeled with the shape number (1, 2, 3, etc.).
2. THE ShapeTogglePanel SHALL display toggle buttons in a horizontal row positioned above the Fretboard.
3. WHEN the user clicks a toggle button that is active, THE ShapeTogglePanel SHALL hide the corresponding shape notes from the Fretboard by setting their visibility to hidden.
4. WHEN the user clicks a toggle button that is inactive, THE ShapeTogglePanel SHALL show the corresponding shape notes on the Fretboard by restoring their visibility.
5. THE ShapeTogglePanel SHALL indicate the active/inactive state of each toggle button using the assigned shape color as background when active and a neutral gray when inactive.
6. WHEN the scale changes via a new scale-changed event, THE ShapeTogglePanel SHALL reset all toggles to the active state and regenerate buttons matching the new ShapeCount.

### Requirement 5: Integração com o sistema existente

**User Story:** As a developer, I want the shapes feature to integrate seamlessly with the existing fretboard and scale modules, so that no existing functionality breaks.

#### Acceptance Criteria

1. THE ShapeEngine SHALL listen exclusively to the scale-changed custom event dispatched by the ScaleModule to trigger shape computation.
2. THE ShapeEngine SHALL read tonic, scale notes, and scale type from the scale-changed event detail object containing notes, tonica, tipoEscala, and tonicaIndex properties.
3. THE ShapeOverlay SHALL apply shape colors as additional CSS classes on the existing note-cell-fret elements without removing existing color or in-scale classes.
4. WHEN no scale is active (highlightFretboardNotes receives an empty array), THE ShapeOverlay SHALL remove all shape visual indicators from the Fretboard.
5. THE ShapeEngine SHALL be implemented as a single IIFE-pattern JavaScript file compatible with the project convention of no build step and global scope exposure.
6. THE ShapeOverlay SHALL define all shape-specific styles in a dedicated CSS file or appended section in style-fretboard.css, using class names prefixed with "shape-".
