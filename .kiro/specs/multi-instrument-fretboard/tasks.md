# Implementation Plan: Multi-Instrument Fretboard

## Overview

This plan transforms the MusicPages fretboard from a hardcoded 6-string guitar to a configurable multi-instrument system. Implementation follows an incremental approach: first building the data layer (InstrumentRegistry), then refactoring the renderer to consume profiles dynamically, adding the selector UI, custom tuning panel, scale highlighting persistence, and finally wiring audio playback with correct MIDI numbers. All code uses the existing IIFE/global pattern (no ES6 modules in production) and JavaScript.

## Tasks

- [x] 1. Create InstrumentRegistry module with profile data
  - [x] 1.1 Create `scripts/script-instrument-registry.js` with the InstrumentRegistry IIFE
    - Define the `profiles` array with all 7 instrument profiles (guitarra-6, guitarra-7, viola-10, violao-12, ukulele, baixo-4, violao-7) including id, name, strings, tuning, octaves, frets, and fretless fields
    - Expose public API: `getAll()`, `getById(id)`, `getDefaultId()`
    - Use `var InstrumentRegistry = (function() { ... })();` pattern matching existing codebase
    - Add conditional `module.exports` for testability with Vitest
    - _Requirements: 1.1, 1.2, 1.3_

  - [x]* 1.2 Write property test for profile schema validity
    - **Property 1: Instrument profile schema validity**
    - Verify all profiles in the registry satisfy: id (1-32 chars), name (1-64 chars), strings (4-12), tuning array length === strings with valid note names, octaves array length === strings with integers 0-8, frets (0-36), fretless boolean
    - **Validates: Requirements 1.2**

  - [x]* 1.3 Write unit tests for InstrumentRegistry
    - Test `getAll()` returns all 7 profiles in correct order
    - Test `getById('guitarra-6')` returns correct profile
    - Test `getById('nonexistent')` returns null
    - Test `getDefaultId()` returns 'guitarra-6'
    - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Refactor FretboardRenderer to consume instrument profiles
  - [x] 2.1 Refactor `scripts/script-fretboard.js` to use profiles from InstrumentRegistry
    - Replace hardcoded `TUNING`, `OPEN_STRING_MIDI`, `NUMBER_OF_FRETS` constants with dynamic state from `_activeFretboardState`
    - Implement `applyInstrumentProfile(profileId, tuningOverride)` that tears down and rebuilds the fretboard
    - Implement `getActiveFretboardState()` returning current profileId, tuning, and octaves
    - Implement `rebuildString(stringIndex, newNote)` for single-string updates
    - Maintain `_lastScaleState` module-level variable for highlighting persistence
    - Calculate MIDI numbers as `(octave + 1) * 12 + chromaticIndex + fretNumber`
    - Calculate note names as `NOTE_NAMES[(chromaticIndex + fretNumber) % 12]`
    - Render strings in reverse order (highest pitch at top, lowest at bottom)
    - Set container dimensions dynamically: width = `(frets + 1) * 40`px, height = `min(strings * 50, 600)`px
    - Calculate string thickness linearly from 1px (highest) to 4px (lowest)
    - Keep `initializeFretboard` as entry point but have it call `applyInstrumentProfile(getDefaultId())`
    - _Requirements: 1.3, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 4.1, 4.2, 4.3, 4.4, 4.5, 9.1, 9.2, 9.5_

  - [x]* 2.2 Write property test for note name calculation
    - **Property 5: Note name calculation correctness**
    - For any valid chromatic index (0-11) and fret number (0-36), verify computed note name equals `NOTE_NAMES[(chromaticIndex + fretNumber) % 12]`
    - **Validates: Requirements 3.4**

  - [x]* 2.3 Write property test for MIDI number calculation
    - **Property 6: MIDI number calculation correctness**
    - For any valid octave (0-8), chromatic index (0-11), and fret number (0-36), verify MIDI = `(octave + 1) * 12 + chromaticIndex + fretNumber`
    - **Validates: Requirements 3.5, 8.3**

  - [x]* 2.4 Write property test for fretboard rebuild string count
    - **Property 3: Fretboard rebuild produces correct string count**
    - For any valid InstrumentProfile, after applying it, the DOM contains exactly `profile.strings` string row elements
    - **Validates: Requirements 2.3, 3.1, 3.2**

  - [x]* 2.5 Write property test for fretboard rebuild fret count
    - **Property 4: Fretboard rebuild produces correct fret count**
    - For any valid InstrumentProfile, each string row contains exactly `profile.frets + 1` fret cell elements
    - **Validates: Requirements 3.3**

  - [x]* 2.6 Write property test for responsive container dimensions
    - **Property 7: Responsive container dimensions**
    - For any valid string count (4-12) and fret count (0-36), verify width = `(frets + 1) * 40` and height = `min(strings * 50, 600)`
    - **Validates: Requirements 3.6, 3.7, 9.1, 9.2, 9.5**

  - [x]* 2.7 Write property test for visual string ordering
    - **Property 8: Visual string ordering is reverse of tuning array**
    - For any valid tuning array, the visual row at index 0 (top) displays the last element of the tuning array and row N-1 (bottom) displays the first element
    - **Validates: Requirements 4.1, 4.2, 4.3**

  - [x]* 2.8 Write property test for string thickness monotonicity
    - **Property 9: String thickness monotonicity**
    - For any string count (4-12), computed thicknesses form a monotonically non-decreasing sequence from 1px (top) to 4px (bottom)
    - **Validates: Requirements 4.4**

- [x] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement InstrumentSelector UI
  - [x] 4.1 Create `scripts/script-instrument-selector.js` with the InstrumentSelector module
    - Implement `initializeInstrumentSelector()` that creates a labeled `<select>` element inside `#fretboardContainer`
    - Populate options from `InstrumentRegistry.getAll()` using each profile's `name` as display text
    - Set default selected option to `InstrumentRegistry.getDefaultId()`
    - On change event, call `applyInstrumentProfile(selectedId)`
    - Add accessible `<label>` element for the dropdown
    - Add conditional `module.exports` for testability
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x]* 4.2 Write property test for selector options matching registry
    - **Property 2: Instrument selector options match registry**
    - For any set of profiles in the registry, the selector contains exactly one option per profile with matching display text in registry order
    - **Validates: Requirements 2.2**

  - [x]* 4.3 Write unit tests for InstrumentSelector
    - Test selector renders inside `#fretboardContainer` with an accessible label
    - Test default selection is 'guitarra-6'
    - Test changing selector triggers fretboard rebuild with new profile
    - _Requirements: 2.1, 2.3, 2.4_

- [x] 5. Implement CustomTuningPanel UI
  - [x] 5.1 Create `scripts/script-custom-tuning.js` with the CustomTuningPanel module
    - Implement `initializeCustomTuningPanel(profile)` that renders one input field per string
    - Pre-populate inputs with current open notes (reversed to match visual order: highest pitch first)
    - Validate note names against pattern `[A-Ga-g][#b]?` (max 2 chars)
    - On valid commit (Enter or blur), call `rebuildString(stringIndex, newNote)` and reapply scale highlighting
    - On invalid input, show red border and tooltip "Nota inválida"; do not modify fretboard
    - On empty input on blur, revert to previous valid value
    - Implement `resetTuningToDefault()` that restores profile defaults and rebuilds fretboard
    - Render a visible reset button at all times
    - Preserve original octave from profile when overriding open note
    - Add conditional `module.exports` for testability
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 6.1, 6.2, 6.3_

  - [x]* 5.2 Write property test for tuning panel input count
    - **Property 10: Tuning panel input count and pre-population**
    - For any valid InstrumentProfile with N strings, the panel renders exactly N inputs each matching the profile's tuning array (visual order)
    - **Validates: Requirements 5.1, 5.2**

  - [x]* 5.3 Write property test for note name validation
    - **Property 11: Note name validation**
    - For any input string, acceptance iff it matches `[A-Ga-g][#b]?` with total length at most 2
    - **Validates: Requirements 5.4, 5.5**

  - [x]* 5.4 Write property test for single string rebuild
    - **Property 12: Single string rebuild note correctness**
    - For any valid note committed at string index I, all note cells on that string equal `NOTE_NAMES[(newNoteChromIndex + F) % 12]`
    - **Validates: Requirements 5.3**

  - [x]* 5.5 Write property test for octave preservation
    - **Property 13: Octave preservation on tuning override**
    - When overriding open note, MIDI calculation continues using the original octave from the profile
    - **Validates: Requirements 5.7**

  - [x]* 5.6 Write property test for reset restoring defaults
    - **Property 14: Reset restores profile defaults**
    - For any profile and any set of overrides, reset restores tuning and octaves to original profile defaults
    - **Validates: Requirements 6.2, 6.3**

- [x] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement scale highlighting persistence
  - [x] 7.1 Update `scripts/script-fretboard.js` to persist and reapply scale state
    - Store last scale state (`_lastScaleState = { scaleNotes, tonic }`) whenever `highlightFretboardNotes` is called
    - After every fretboard rebuild (instrument change or string rebuild), call `highlightFretboardNotes(_lastScaleState.scaleNotes, _lastScaleState.tonic)` if a scale is active
    - If no scale is active (null/empty), do not apply any highlighting
    - Ensure highlighting is applied AFTER DOM rendering completes
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x]* 7.2 Write property test for scale highlighting persistence
    - **Property 15: Scale highlighting persistence across instrument change**
    - For any active scale and any instrument change, after rebuild, "tonic" class applied to tonic note cells and "in-scale" class to non-tonic scale note cells
    - **Validates: Requirements 7.1, 7.3, 7.5**

  - [x]* 7.3 Write property test for scale highlighting CSS correctness
    - **Property 16: Scale highlighting CSS class correctness**
    - For any set of scale notes and tonic, a Note_Cell has "tonic" iff its note matches tonic, and "in-scale" iff it matches a non-tonic scale note
    - **Validates: Requirements 7.3**

- [x] 8. Wire audio playback with dynamic MIDI numbers
  - [x] 8.1 Update pointer event handlers in refactored FretboardRenderer
    - Attach `pointerdown` handler that calls `AudioEngine.playNote(midiNumber, undefined, { hold: true })`
    - Attach `pointerup`, `pointercancel`, `pointerleave` handlers that call `AudioEngine.stopNote(midiNumber)`
    - Compute MIDI per cell as `(octave + 1) * 12 + chromaticIndex + fretNumber` using the active profile's octave values
    - Handle re-press of same cell: stop existing then start new
    - Clamp MIDI to 0-127 range
    - Gracefully handle missing Web Audio API (no errors thrown)
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x]* 8.2 Write unit tests for audio integration
    - Test pointerdown triggers `AudioEngine.playNote` with correct MIDI number
    - Test pointerup/cancel/leave triggers `AudioEngine.stopNote`
    - Test re-press stops then restarts note
    - Test missing Web Audio API does not throw errors
    - _Requirements: 8.1, 8.2, 8.4, 8.5_

- [x] 9. Add responsive CSS and fret-zero sticky behavior
  - [x] 9.1 Update `styles/style-fretboard.css` for dynamic string/fret counts
    - Remove hardcoded `height: 320px` from `#fretboard` (height now set dynamically by JS)
    - Add `overflow-y: auto` when container height exceeds 600px
    - Add `position: sticky; left: 0; z-index: 10;` to fret-zero column (`.fret:first-child`)
    - Ensure minimum Note_Cell size of 24px diameter is maintained
    - Remove hardcoded string-specific thickness rules (`#string-0::before` through `#string-5::before`) — thickness is now calculated dynamically per-string via inline styles
    - Add styles for the custom tuning panel (inputs, reset button, error states)
    - Add styles for the instrument selector dropdown
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 10. Wire HTML and script loading order
  - [x] 10.1 Update `index.html` to include new scripts and UI containers
    - Add `<script src="./scripts/script-instrument-registry.js" defer></script>` BEFORE `script-fretboard.js`
    - Add `<script src="./scripts/script-instrument-selector.js" defer></script>` AFTER `script-fretboard.js`
    - Add `<script src="./scripts/script-custom-tuning.js" defer></script>` AFTER instrument selector script
    - Add placeholder containers inside `#fretboardContainer` for the selector and tuning panel if needed
    - Ensure script order: registry → audio-engine → fretboard → selector → custom-tuning
    - _Requirements: 2.1, 5.1, 6.1_

- [x] 11. Install fast-check dependency for property-based testing
  - [x] 11.1 Add `fast-check` to devDependencies in `package.json`
    - Run `npm install --save-dev fast-check`
    - Ensure Vitest config has `jsdom` environment for DOM-based property tests
    - Create test directory `tests/cases/multi-instrument-fretboard/`
    - _Requirements: Testing Strategy_

- [x] 12. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- All new modules follow the existing IIFE pattern with `var ModuleName = (function() { ... })();`
- Conditional `module.exports` added to all new modules for Vitest testability
- fast-check is used as the PBT library (integrates natively with Vitest)
- Test files use naming convention: `*.property.spec.js` for PBT, `*.unit.spec.js` for example-based

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "11.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4", "2.5", "2.6", "2.7", "2.8"] },
    { "id": 3, "tasks": ["4.1", "5.1"] },
    { "id": 4, "tasks": ["4.2", "4.3", "5.2", "5.3", "5.4", "5.5", "5.6"] },
    { "id": 5, "tasks": ["7.1", "8.1", "9.1"] },
    { "id": 6, "tasks": ["7.2", "7.3", "8.2", "10.1"] }
  ]
}
```
