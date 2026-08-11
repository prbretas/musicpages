# Requirements Document

## Introduction

O Chord Visualizer é um módulo que exibe diagramas SVG de acordes do campo harmônico da escala selecionada. Integra-se com a Uberchord API como fonte de dados primária (com fallback para banco local) e com o AudioEngine para reprodução sonora. O módulo adapta os diagramas ao instrumento ativo no InstrumentRegistry e reage ao evento `scale-changed` para atualizar automaticamente os acordes exibidos.

## Glossary

- **Chord_Visualizer**: Módulo IIFE (`scripts/script-chord-diagrams.js`) responsável por renderizar e gerenciar os diagramas de acordes no container dedicado.
- **Chord_Diagram**: Representação SVG de um acorde contendo frets, cordas, posições dos dedos (bolinhas numeradas), pestana (barre), cordas abertas (O) e cordas mudas (X).
- **Voicing**: Uma posição/digitação específica de um acorde no braço do instrumento. Um mesmo acorde pode ter múltiplos voicings.
- **Campo_Harmônico**: Conjunto de acordes derivados dos graus de uma escala musical.
- **Uberchord_Client**: Sub-módulo responsável por consumir a API REST da Uberchord (`https://api.uberchord.com/`) via fetch.
- **Local_Chord_DB**: Banco de dados local (objeto JavaScript) contendo shapes de acordes comuns como fallback quando a Uberchord API está indisponível.
- **InstrumentRegistry**: Módulo global existente que fornece perfis de instrumentos (afinação, número de cordas, número de frets).
- **AudioEngine**: Módulo global existente (singleton) que sintetiza e reproduz notas via Web Audio API.
- **Chord_Shape**: Estrutura de dados que descreve a digitação de um acorde — inclui posição por corda (fret number ou mute/open), dedos utilizados e presença de pestana.
- **SVG_Renderer**: Sub-componente do Chord_Visualizer que converte um Chord_Shape em elemento SVG visual.

## Requirements

### Requirement 1: Exibição Automática do Campo Harmônico

**User Story:** As a musician, I want to see the chord diagrams of the harmonic field automatically when I select a scale, so that I can quickly visualize the chords available in that key.

#### Acceptance Criteria

1. WHEN the `scale-changed` event is dispatched, THE Chord_Visualizer SHALL render one Chord_Diagram for each chord of the Campo_Harmônico corresponding to the selected scale.
2. WHEN the `scale-changed` event includes a `tipoEscala` and `tonica`, THE Chord_Visualizer SHALL compute the Campo_Harmônico using the same chord quality mapping as `script-escalas.js` (`estruturasAcordes` and `campoHarmonicoMaior`, etc.).
3. THE Chord_Visualizer SHALL display each chord with its name (root + quality, e.g. "Am7") and its roman numeral degree label (e.g. "vi").
4. WHEN the page loads and `calcularEscala()` fires the initial `scale-changed` event, THE Chord_Visualizer SHALL render the initial set of chord diagrams without requiring additional user interaction.

### Requirement 2: Renderização SVG dos Diagramas de Acordes

**User Story:** As a musician, I want to see clear fretboard diagrams with finger positions, so that I can learn chord shapes visually.

#### Acceptance Criteria

1. THE SVG_Renderer SHALL render each Chord_Diagram as an inline SVG element containing: vertical lines representing strings, horizontal lines representing frets, numbered circles representing finger positions, a thick top line representing the nut (when starting at fret 1), and position markers for open (O) and muted (X) strings.
2. WHEN a Chord_Shape contains a barre (pestana), THE SVG_Renderer SHALL render it as a horizontal bar spanning the affected strings at the specified fret.
3. WHEN a Chord_Shape starts at a fret higher than 1, THE SVG_Renderer SHALL display the starting fret number to the left of the diagram and omit the thick nut line.
4. THE SVG_Renderer SHALL render the correct number of strings based on the active instrument profile from InstrumentRegistry (e.g., 6 strings for guitar, 4 strings for ukulele/bass).
5. FOR ALL valid Chord_Shape objects, rendering to SVG and parsing the SVG back to extract finger positions SHALL produce values equivalent to the original Chord_Shape (round-trip property).

### Requirement 3: Navegação entre Voicings

**User Story:** As a musician, I want to switch between different voicings of the same chord, so that I can learn multiple ways to play it on the fretboard.

#### Acceptance Criteria

1. WHEN multiple voicings are available for a chord, THE Chord_Visualizer SHALL display navigation controls (previous/next buttons) on the Chord_Diagram.
2. WHEN the user clicks the "next" navigation button, THE Chord_Visualizer SHALL display the next Voicing of the current chord and update the diagram.
3. WHEN the user clicks the "previous" navigation button, THE Chord_Visualizer SHALL display the previous Voicing of the current chord and update the diagram.
4. WHEN only one Voicing is available for a chord, THE Chord_Visualizer SHALL hide the navigation controls for that diagram.
5. THE Chord_Visualizer SHALL display a position indicator (e.g. "2/5") showing the current Voicing index and total count.

### Requirement 4: Adaptação ao Instrumento Selecionado

**User Story:** As a musician, I want chord diagrams that match my selected instrument, so that the shapes are accurate for my guitar, ukulele, or bass tuning.

#### Acceptance Criteria

1. WHEN the active instrument changes in InstrumentRegistry, THE Chord_Visualizer SHALL re-render all chord diagrams using the tuning and string count of the new instrument profile.
2. THE Chord_Visualizer SHALL query chord shapes that are compatible with the current instrument's tuning (e.g., standard guitar EADGBE, ukulele GCEA).
3. WHEN the instrument has a custom tuning set via the Custom Tuning panel, THE Chord_Visualizer SHALL use that custom tuning to determine chord shapes from the Local_Chord_DB.
4. IF no chord shapes are available for the current instrument/tuning combination, THEN THE Chord_Visualizer SHALL display a message "Acorde indisponível para este instrumento" in place of the diagram.

### Requirement 5: Integração com Uberchord API

**User Story:** As a developer, I want to fetch chord data from the Uberchord API, so that I can provide accurate and comprehensive chord diagrams without maintaining a large local database.

#### Acceptance Criteria

1. WHEN a chord diagram is needed, THE Uberchord_Client SHALL send a GET request to `https://api.uberchord.com/v1/chords/{chordName}` to retrieve chord data.
2. WHEN searching for chords by partial name, THE Uberchord_Client SHALL send a GET request to `https://api.uberchord.com/v1/chords?nameLike={partial}`.
3. THE Uberchord_Client SHALL parse the JSON response and transform it into a Chord_Shape object compatible with the SVG_Renderer.
4. THE Uberchord_Client SHALL cache successful API responses in memory to avoid redundant network requests during the same session.
5. FOR ALL chord names that produce a valid API response, parsing the response into a Chord_Shape and then formatting back to the API chord name format SHALL produce the original chord name (round-trip property).

### Requirement 6: Fallback para Banco de Dados Local

**User Story:** As a user, I want chord diagrams to still work when the Uberchord API is unavailable, so that the app remains functional offline or during API outages.

#### Acceptance Criteria

1. IF the Uberchord API request fails (network error, HTTP status >= 400, or timeout after 5 seconds), THEN THE Uberchord_Client SHALL fall back to the Local_Chord_DB to retrieve chord data.
2. THE Local_Chord_DB SHALL contain chord shapes for at least the following qualities in all 12 root notes for standard guitar tuning: Major, Minor, Major7, Minor7, Dominant7, Diminished, and Minor7b5.
3. WHEN serving data from the Local_Chord_DB, THE Chord_Visualizer SHALL display a subtle indicator (e.g., small icon or text "offline") to inform the user that local data is being used.
4. WHEN the Uberchord API becomes available again after a failure, THE Uberchord_Client SHALL resume fetching from the API for subsequent chord requests.

### Requirement 7: Reprodução Sonora do Acorde

**User Story:** As a musician, I want to hear the chord when I click on its diagram, so that I can associate the visual shape with its sound.

#### Acceptance Criteria

1. WHEN the user clicks on a Chord_Diagram, THE Chord_Visualizer SHALL trigger AudioEngine.playNote() for each note of the chord in a slight strum pattern (sequential notes with a short delay between each).
2. THE Chord_Visualizer SHALL calculate the MIDI note numbers for each string of the chord based on the instrument tuning and fret positions from the current Chord_Shape.
3. WHEN a string is marked as muted (X) in the Chord_Shape, THE Chord_Visualizer SHALL skip that string during playback.
4. THE Chord_Visualizer SHALL play notes from lowest-pitched string to highest-pitched string with a configurable strum delay (default: 30ms between notes).

### Requirement 8: Suporte a Dark Mode

**User Story:** As a user, I want chord diagrams to look good in both light and dark themes, so that the diagrams are readable regardless of my theme preference.

#### Acceptance Criteria

1. WHILE the `body.dark` CSS class is active, THE SVG_Renderer SHALL render chord diagrams with inverted color scheme (light lines/dots on dark background).
2. WHILE the `body.dark` CSS class is active, THE Chord_Visualizer container and controls SHALL use colors consistent with the application's existing dark mode palette.
3. WHEN the user toggles the theme via `#themeToggle`, THE SVG_Renderer SHALL update all currently rendered diagrams to match the new theme without requiring a page reload.

### Requirement 9: Arquitetura e Padrão de Código

**User Story:** As a developer, I want the Chord Visualizer to follow the existing IIFE pattern and integration conventions, so that it integrates seamlessly with the rest of MusicPages.

#### Acceptance Criteria

1. THE Chord_Visualizer SHALL be implemented as an IIFE exposing a global `ChordVisualizer` variable on `window`.
2. THE Chord_Visualizer SHALL reside in a single file `scripts/script-chord-diagrams.js` loaded with the `defer` attribute in `index.html`.
3. THE Chord_Visualizer SHALL initialize on `DOMContentLoaded` by rendering into the container element `#chordVisualizerContainer`.
4. THE Chord_Visualizer SHALL expose a public API with at minimum: `init(containerId)`, `render(chords)`, and `playChord(chordShape)` methods for testability.
5. THE Chord_Visualizer SHALL include a conditional `module.exports` for Node.js/Vitest compatibility, following the same pattern as `script-instrument-registry.js`.
