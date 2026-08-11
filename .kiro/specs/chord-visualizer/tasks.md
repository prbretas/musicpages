# Implementation Plan: Chord Visualizer

## Overview

Implement the ChordVisualizer module as a single IIFE file (`scripts/script-chord-diagrams.js`) that renders SVG chord diagrams for the harmonic field of the selected scale. The module integrates with the Uberchord API (with local fallback), adapts diagrams to the active instrument profile, supports voicing navigation, audio playback via AudioEngine, and dark mode theming. Tests use Vitest + fast-check following existing project conventions.

## Tasks

- [x] 1. Set up module scaffold and data models
  - [x] 1.1 Create `scripts/script-chord-diagrams.js` with the IIFE scaffold exposing `window.ChordVisualizer`
    - Set up the IIFE wrapper with conditional `module.exports` for Vitest (same pattern as `script-instrument-registry.js`)
    - Define the public API object: `init(containerId)`, `render(chords)`, `playChord(chordShape)`, `destroy()`
    - Add `DOMContentLoaded` listener calling `init('#chordVisualizerContainer')`
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [x] 1.2 Define data model typedefs and helper utilities inside the IIFE
    - Add JSDoc typedefs for `ChordShape`, `ChordInfo`, `RenderOptions`
    - Implement `parseChordName(name)` to split a chord name into root + quality components
    - Implement `formatChordName(root, quality)` to compose a chord name string
    - _Requirements: 5.5_

  - [x] 1.3 Add the `<script defer src="scripts/script-chord-diagrams.js"></script>` tag and `#chordVisualizerContainer` div to `index.html`
    - Place the container in the appropriate section of the page (after the scale visualization area)
    - _Requirements: 9.2, 9.3_

- [x] 2. Implement harmonic field computation
  - [x] 2.1 Implement `computeHarmonicField(tonica, tipoEscala, notes)` inside the IIFE
    - Reuse quality maps from `script-escalas.js` (campoHarmonicoMaior, campoHarmonicoMenorNatural, etc.)
    - For each degree, combine the scale note with the quality to produce `ChordInfo[]`
    - Wire the `scale-changed` event listener to invoke this computation and pass results to `render()`
    - _Requirements: 1.1, 1.2, 1.4_

  - [ ]* 2.2 Write property test for harmonic field computation (Property 1)
    - **Property 1: Harmonic field computation correctness**
    - For any valid tonic and scale type, verify each chord's root matches the corresponding scale degree note and quality matches the campoHarmonico entry
    - **Validates: Requirements 1.1, 1.2**

  - [ ]* 2.3 Write property test for chord name round-trip (Property 11)
    - **Property 11: Chord name parse/format round-trip**
    - For any chord name string in `{root}{quality}` format, parse then format back produces the original string
    - **Validates: Requirements 5.5**

- [ ] 3. Implement SVGRenderer
  - [x] 3.1 Implement `SVGRenderer.renderDiagram(shape, options)` as a pure function inside the IIFE
    - Draw vertical string lines (count from `options.numStrings`)
    - Draw horizontal fret lines (`options.fretsToShow + 1` lines)
    - Draw nut (thick top line) when `startFret === 1`; display fret number text when `startFret > 1`
    - Draw finger position circles with finger numbers
    - Draw open (O) and muted (X) markers above the diagram
    - Store `frets` and `fingers` arrays as data attributes on the SVG for round-trip verification
    - _Requirements: 2.1, 2.3, 2.4, 2.5_

  - [ ] 3.2 Implement barre rendering in SVGRenderer
    - When `ChordShape.barre` is non-null, render a horizontal rectangle spanning `fromString` to `toString` at the barre fret
    - _Requirements: 2.2_

  - [ ] 3.3 Implement `SVGRenderer.updateTheme(svgElement, isDark)` for dark mode support
    - Use CSS custom properties for stroke/fill colors
    - When `body.dark` is active, apply light-on-dark color scheme
    - _Requirements: 8.1, 8.2_

  - [ ]* 3.4 Write property test for SVG structural correctness (Property 3)
    - **Property 3: SVG structural correctness**
    - For any valid ChordShape and string count (4–12), verify the SVG has the correct number of string lines, fret lines, and finger circles
    - **Validates: Requirements 2.1, 2.4**

  - [ ]* 3.5 Write property test for barre rendering (Property 4)
    - **Property 4: Barre rendering**
    - For any ChordShape with non-null barre, verify the SVG contains a barre element at the correct fret spanning the correct strings
    - **Validates: Requirements 2.2**

  - [ ]* 3.6 Write property test for fret position and nut rendering (Property 5)
    - **Property 5: Fret position and nut rendering**
    - For any ChordShape, verify nut vs fret number display logic based on `startFret`
    - **Validates: Requirements 2.3**

  - [ ]* 3.7 Write property test for SVG round-trip (Property 6)
    - **Property 6: SVG render/parse round-trip**
    - For any valid ChordShape, render to SVG and extract data attributes to verify equivalence with original frets/fingers arrays
    - **Validates: Requirements 2.5**

- [ ] 4. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement VoicingNavigator and chord label rendering
  - [ ] 5.1 Implement `VoicingNavigator` state manager inside the IIFE
    - Track `currentIndex`, `total`; implement `next()`, `prev()`, `getIndicator()`
    - Wrap navigation cyclically: next at end goes to 0, prev at 0 goes to end
    - _Requirements: 3.2, 3.3, 3.5_

  - [ ] 5.2 Implement navigation controls UI (prev/next buttons, position indicator)
    - Show/hide navigation controls based on voicing count (visible if N > 1, hidden if N === 1)
    - Clicking next/prev updates the displayed ChordShape and re-renders the SVG
    - Display chord name and roman numeral degree label on each diagram card
    - _Requirements: 3.1, 3.4, 1.3_

  - [ ]* 5.3 Write property test for voicing navigation consistency (Property 7)
    - **Property 7: Voicing navigation consistency**
    - For any voicing list length N ≥ 2 and starting index i, verify next/prev produce correct cyclic indices
    - **Validates: Requirements 3.2, 3.3**

  - [ ]* 5.4 Write property test for voicing position indicator format (Property 8)
    - **Property 8: Voicing position indicator format**
    - For any count N ≥ 1 and index i, verify `getIndicator()` returns `"${i+1}/${N}"`
    - **Validates: Requirements 3.5**

  - [ ]* 5.5 Write property test for navigation control visibility (Property 9)
    - **Property 9: Navigation control visibility**
    - For any chord with voicing count N, verify controls visible iff N > 1
    - **Validates: Requirements 3.1, 3.4**

  - [ ]* 5.6 Write property test for chord label rendering completeness (Property 2)
    - **Property 2: Chord label rendering completeness**
    - For any valid ChordInfo, verify the rendered container contains the full chord name and roman numeral degree string
    - **Validates: Requirements 1.3**

- [ ] 6. Implement UberchordClient and LocalChordDB
  - [ ] 6.1 Implement `UberchordClient` sub-module inside the IIFE
    - Implement `fetchChord(chordName)` with GET to `https://api.uberchord.com/v1/chords/{chordName}`
    - Implement `searchChords(partial)` with GET to `https://api.uberchord.com/v1/chords?nameLike={partial}`
    - Parse API response (`strings`, `fingering` fields) into `ChordShape[]`
    - Add AbortController with 5-second timeout
    - Implement in-memory cache (Map keyed by chord name)
    - On failure (network error, HTTP >= 400, timeout), fall back to LocalChordDB
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.1, 6.4_

  - [x] 6.2 Implement `LocalChordDB` sub-module with fallback chord data
    - Create static object with chord shapes for 12 roots × 7 qualities (Major, Minor, Major7, Minor7, Dom7, Dim, m7b5) for standard guitar tuning
    - Implement `getChordShapes(chordName, tuning)` and `hasChord(chordName)`
    - _Requirements: 6.2_

  - [ ] 6.3 Add offline indicator UI when serving from local data
    - Display subtle "offline" text or icon when chord data source is "local"
    - _Requirements: 6.3_

  - [ ]* 6.4 Write property test for API response parsing (Property 10)
    - **Property 10: API response parsing produces valid ChordShape**
    - For any valid Uberchord API response object, verify parsing produces ChordShape with correct array lengths and valid fret values
    - **Validates: Requirements 5.3**

  - [ ]* 6.5 Write property test for local chord database completeness (Property 12)
    - **Property 12: Local chord database completeness**
    - For any root note and supported quality, verify `LocalChordDB.hasChord(root + quality)` returns true
    - **Validates: Requirements 6.2**

- [ ] 7. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement audio playback and instrument adaptation
  - [ ] 8.1 Implement `playChord(chordShape)` in ChordVisualizer
    - Calculate MIDI note numbers from instrument tuning + fret positions
    - Skip muted strings (fret === -1)
    - Call `AudioEngine.playNote()` for each non-muted string with strum delay (default 30ms between notes, low to high)
    - Gracefully no-op if AudioEngine is unavailable
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ] 8.2 Implement instrument change handling
    - Listen to `instrument-changed` event
    - On change, re-render all diagrams with new string count and tuning
    - Use custom tuning from Custom Tuning panel when available
    - Display "Acorde indisponível para este instrumento" when no shapes are found
    - Default to 6-string guitar (EADGBE) if InstrumentRegistry is unavailable
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ]* 8.3 Write property test for MIDI note calculation (Property 13)
    - **Property 13: MIDI note calculation from tuning and fret**
    - For any valid open string note, octave, and fret number (0–24), verify MIDI = `(octave + 1) * 12 + chromaticIndex(openNote) + fretNumber`, clamped to [0, 127]
    - **Validates: Requirements 7.2**

  - [ ]* 8.4 Write property test for muted string exclusion (Property 14)
    - **Property 14: Muted string exclusion in playback**
    - For any ChordShape, verify the count of notes played equals count of non-muted fret entries
    - **Validates: Requirements 7.3**

- [ ] 9. Dark mode integration and theme toggle wiring
  - [ ] 9.1 Wire theme toggle to update all rendered diagrams
    - Listen to the existing `#themeToggle` click event
    - On toggle, call `SVGRenderer.updateTheme()` on all currently rendered SVG elements
    - _Requirements: 8.3_

  - [ ] 9.2 Add CSS styles for the chord visualizer container (light and dark modes)
    - Style the container, navigation buttons, chord labels, and offline indicator
    - Use CSS custom properties consistent with the existing dark mode palette
    - _Requirements: 8.1, 8.2_

- [ ] 10. Integration wiring and final assembly
  - [ ] 10.1 Wire all sub-modules together in the orchestrator flow
    - Connect `scale-changed` → `computeHarmonicField` → `UberchordClient.fetchChord` → `SVGRenderer.renderDiagram` → DOM insertion
    - Connect click handlers on diagram cards → `playChord()`
    - Connect voicing navigation buttons → `VoicingNavigator` → re-render
    - Ensure `destroy()` removes event listeners and clears container
    - _Requirements: 1.1, 1.4, 7.1, 9.4_

  - [ ]* 10.2 Write unit tests for integration scenarios
    - Test initialization on DOMContentLoaded
    - Test API caching behavior
    - Test fallback flow on API failure
    - Test dark mode toggle updates SVGs
    - Test strum playback order and delay
    - Test instrument change triggers full re-render
    - Test "Acorde indisponível" message
    - _Requirements: 1.4, 4.1, 4.4, 5.4, 6.1, 6.3, 7.4, 8.3_

- [ ] 11. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific scenarios and edge cases
- The module follows the existing IIFE pattern with conditional `module.exports` for testability
- All test files go in `tests/cases/chord-visualizer/`
- The LocalChordDB (task 6.2) contains a large static data object — consider generating it from a structured source

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["2.1", "3.1", "6.2"] },
    { "id": 2, "tasks": ["2.2", "2.3", "3.2", "3.3", "5.1", "6.1"] },
    { "id": 3, "tasks": ["3.4", "3.5", "3.6", "3.7", "5.2", "6.3", "6.4", "6.5"] },
    { "id": 4, "tasks": ["5.3", "5.4", "5.5", "5.6", "8.1", "8.2"] },
    { "id": 5, "tasks": ["8.3", "8.4", "9.1", "9.2"] },
    { "id": 6, "tasks": ["10.1"] },
    { "id": 7, "tasks": ["10.2"] }
  ]
}
```
