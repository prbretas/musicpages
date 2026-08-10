# Implementation Plan: UI Enhancements

## Overview

This plan implements five UI enhancements for MusicPages: dark mode contrast fix, header navigation menu with hamburger, Scale Circle visualization, Circle of Fifths interactive diagram, and Songsterr iframe container. All implementations follow the existing vanilla JavaScript IIFE pattern, integrate with the AudioEngine singleton, and respect the CSS custom property theming via `body.dark`.

## Tasks

- [x] 1. Dark mode contrast fix (CSS only)
  - [x] 1.1 Update `styles/style.css` with dark mode rules for all containers
    - Add `body.dark` selectors for `.metronome-group`, `.input-group`, `.output-section`, `.output-box`, and form elements (`select`, `input`, `button`)
    - Ensure background luminance below 25% and text contrast ratio of at least 4.5:1
    - Style the interval table, general scale table, and harmonic field output with dark borders and legible header cells
    - Style `.preset-btn.slow`, `.preset-btn.moderate`, `.preset-btn.fast` with appropriate border colors and legible text
    - _Requirements: 1.1, 1.2, 1.3, 1.5_

  - [x] 1.2 Update `styles/style-fretboard.css` with dark mode rules for the fretboard and keyboard containers
    - Add `body.dark` selectors for `#fretboardContainer` and `#tecladoVirtualContainer`
    - Ensure visual distinction between white keys, black keys, and highlighted scale-note keys
    - _Requirements: 1.4_

- [x] 2. Header navigation menu
  - [x] 2.1 Add HTML structure for navigation in `index.html`
    - Insert `<nav id="headerNav">` element with anchor links for all sections (Metrônomo, Calculadora de Escalas, Teclado Virtual, Braço do Instrumento, Círculo de Escalas, Ciclo de Quintas, Songsterr)
    - Include hamburger button with `aria-expanded` and `aria-controls` attributes
    - Add `<script src="./scripts/script-nav.js" defer></script>` to `<head>`
    - _Requirements: 2.1_

  - [x] 2.2 Create `scripts/script-nav.js` implementing the HeaderNav IIFE
    - Implement `init()` to attach click listeners for navigation links
    - Implement `scrollToSection(sectionId)` using `element.scrollIntoView({ behavior: 'smooth' })`
    - Implement `toggleMobileMenu()` to toggle `.nav-open` class and update `aria-expanded`
    - Implement `closeMobileMenu()` called after link click on mobile
    - Call `HeaderNav.init()` at end of IIFE
    - _Requirements: 2.2, 2.5, 2.6_

  - [x] 2.3 Add CSS for header navigation in `styles/style.css` and `styles/style-responsive.css`
    - Style `.header-nav` and `.nav-links` for horizontal layout above 768px
    - Add `@media (max-width: 768px)` rules for hamburger toggle and vertical menu
    - Add `body.dark .header-nav` styles for dark mode
    - _Requirements: 2.3, 2.4, 2.7_

  - [ ]* 2.4 Write unit tests for HeaderNav scroll and toggle behavior
    - Test `scrollToSection` calls `scrollIntoView` on correct element
    - Test `toggleMobileMenu` toggles aria-expanded attribute
    - Test `closeMobileMenu` removes nav-open class
    - _Requirements: 2.2, 2.5, 2.6_

- [x] 3. Checkpoint - Ensure dark mode and navigation work
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Scale Circle visualization
  - [x] 4.1 Add HTML container for Scale Circle in `index.html`
    - Insert `<div id="scaleCircleContainer">` section after the fretboard container
    - Add `<script src="./scripts/script-scale-circle.js" defer></script>` to `<head>`
    - _Requirements: 3.1, 3.7_

  - [x] 4.2 Create `scripts/script-scale-circle.js` implementing the ScaleCircle IIFE
    - Implement pure function `computeNotePositions(centerX, centerY, radius, startAngle)` returning array of `{x, y, note, index, angle}`
    - Implement pure function `computeScalePolygon(notePositions, scaleNotes)` returning SVG points string
    - Implement pure function `computeOverlap(scaleA, scaleB)` returning `{shared, onlyA, onlyB}`
    - Implement `init(containerId)` to build SVG with 12 note circles and listen for `'scale-changed'` event
    - Implement `render(scaleNotes, compareNotes)` to update highlighted notes and polygon
    - Implement `enableCompareMode()` with secondary tonica/scale type selectors
    - Implement `handleNoteClick(noteName)` calling `AudioEngine.playNote()`
    - Export pure functions on the returned object for testing
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [x] 4.3 Modify `scripts/script-escalas.js` to dispatch `'scale-changed'` event
    - At the end of `calcularEscala()`, dispatch `new CustomEvent('scale-changed', { detail: { notes, tonica, tipoEscala, tonicaIndex } })` on `document`
    - _Requirements: 3.2, 3.7_

  - [x] 4.4 Add CSS for Scale Circle container and dark mode in `styles/style.css`
    - Style `#scaleCircleContainer` with appropriate dimensions, background, and border
    - Add `body.dark #scaleCircleContainer` rules for dark theme
    - Style SVG elements (circles, polygon, text) with CSS for both light and dark modes
    - _Requirements: 1.6, 3.1_

  - [ ]* 4.5 Write unit tests for ScaleCircle pure functions
    - Test `computeNotePositions` returns 12 positions equally spaced
    - Test `computeScalePolygon` returns correct points for known scale
    - Test `computeOverlap` correctly identifies shared and unique notes
    - _Requirements: 3.1, 3.3, 3.4, 3.6_

- [x] 5. Circle of Fifths interactive diagram
  - [x] 5.1 Add HTML container for Circle of Fifths in `index.html`
    - Insert `<div id="circleOfFifthsContainer">` section after the Scale Circle container
    - Add `<script src="./scripts/script-circle-of-fifths.js" defer></script>` to `<head>`
    - _Requirements: 4.1_

  - [x] 5.2 Create `scripts/script-circle-of-fifths.js` implementing the CircleOfFifths IIFE
    - Define `MAJOR_KEYS` and `MINOR_KEYS` arrays in fifths order
    - Define `KEY_SIGNATURES` map with sharps/flats count per key
    - Implement pure function `getSegmentAngle(index, total)` returning `{startAngle, endAngle}`
    - Implement pure function `getKeySignatureInfo(keyName)` returning `{count, type, notes}`
    - Implement pure function `getRelativeMinor(majorKey)` returning the relative minor key name
    - Implement pure function `isEnharmonicPosition(index)` returning boolean
    - Implement `init(containerId)` to build SVG with outer (major) and inner (minor) rings
    - Implement `handleSegmentClick(keyName, isMajor)` to highlight segment, show key sig info, and call `AudioEngine.playNote()`
    - Mark enharmonic equivalents (F#/Gb, C#/Db, Cb/B) visually at bottom of circle
    - Export pure functions on the returned object for testing
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 5.3 Add CSS for Circle of Fifths container and dark mode in `styles/style.css`
    - Style `#circleOfFifthsContainer` with appropriate dimensions, background, and border
    - Add `body.dark #circleOfFifthsContainer` rules with adequate contrast for labels and segments
    - _Requirements: 1.6, 4.6_

  - [ ]* 5.4 Write unit tests for CircleOfFifths pure functions
    - Test `getSegmentAngle` returns correct angles for indices 0-11
    - Test `getKeySignatureInfo` returns correct sharps/flats for known keys
    - Test `getRelativeMinor` maps correctly (C→Am, G→Em, etc.)
    - Test `isEnharmonicPosition` returns true for positions 5, 6, 7
    - _Requirements: 4.1, 4.2, 4.5_

- [x] 6. Checkpoint - Ensure Scale Circle and Circle of Fifths work
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Songsterr iframe container
  - [x] 7.1 Add HTML container for Songsterr in `index.html`
    - Insert `<div id="songsterrContainer">` section after the Circle of Fifths container
    - Add `<script src="./scripts/script-songsterr.js" defer></script>` to `<head>`
    - _Requirements: 5.1_

  - [x] 7.2 Create `scripts/script-songsterr.js` implementing the SongsterrEmbed IIFE
    - Define `URL_PATTERN` regex for `https://www.songsterr.com/a/wsa/*`
    - Implement pure function `validateSongsterrUrl(url)` returning `{valid, error}`
    - Implement `init(containerId)` to build input field, "Carregar" button, and iframe placeholder
    - Implement `loadUrl(url)` to validate and set iframe src with min dimensions (width 100%, height 500px)
    - Implement `clear()` to remove iframe and reset input
    - Display error message "URL inválida. Insira um link válido do Songsterr." for invalid URLs
    - Export `validateSongsterrUrl` and `URL_PATTERN` for testing
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 7.3 Add CSS for Songsterr container and dark mode in `styles/style.css`
    - Style `#songsterrContainer` with input field, button, and iframe area
    - Add `body.dark #songsterrContainer` rules for input, button, and border
    - _Requirements: 1.6, 5.6_

  - [ ]* 7.4 Write unit tests for SongsterrEmbed URL validation
    - Test valid Songsterr URLs pass validation
    - Test invalid URLs (wrong domain, missing path) fail with correct error message
    - Test empty string and null inputs
    - _Requirements: 5.2, 5.3_

- [x] 8. Integration and final wiring
  - [x] 8.1 Ensure all new containers have `id` attributes matching nav link anchors
    - Verify `#scaleCircleContainer`, `#circleOfFifthsContainer`, `#songsterrContainer` match the header nav links
    - Close the `<div class="container">` properly and ensure document structure is valid
    - _Requirements: 2.1, 2.2_

  - [x] 8.2 Add dark mode styles for all new containers in a single pass
    - Review and consolidate all `body.dark` rules for new containers to ensure consistency
    - Verify contrast ratios meet 4.5:1 minimum across all new sections
    - _Requirements: 1.6_

  - [ ]* 8.3 Write integration tests for event synchronization
    - Test that dispatching `'scale-changed'` event triggers ScaleCircle re-render
    - Test that header nav links scroll to correct containers
    - _Requirements: 3.7, 2.2_

- [x] 9. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- The design has no Correctness Properties section, so property-based tests are not included
- Unit tests validate pure function logic (note positions, polygon computation, URL validation, key signatures)
- All new scripts follow the existing IIFE pattern and are loaded with `defer`
- The `'scale-changed'` custom event is the primary integration mechanism between `calcularEscala()` and the new circular visualizations

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "2.1"] },
    { "id": 1, "tasks": ["2.2", "2.3", "4.1", "5.1", "7.1"] },
    { "id": 2, "tasks": ["2.4", "4.2", "4.3", "5.2", "7.2"] },
    { "id": 3, "tasks": ["4.4", "4.5", "5.3", "5.4", "7.3", "7.4"] },
    { "id": 4, "tasks": ["8.1", "8.2"] },
    { "id": 5, "tasks": ["8.3"] }
  ]
}
```
