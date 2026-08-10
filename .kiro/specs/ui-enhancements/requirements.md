# Requirements Document

## Introduction

This document specifies requirements for five UI enhancements to the MusicPages application: fixing the dark mode theme, adding a navigation header menu, creating a Scale Circle visualization container, adding a Circle of Fifths interactive container, and embedding a Songsterr iframe container. All enhancements integrate with the existing vanilla JavaScript (IIFE pattern) single-page architecture, reuse the existing AudioEngine for sound playback, and respect the current CSS custom property theming system.

## Glossary

- **MusicPages_App**: The single-page HTML application for music theory learning, containing a fretboard, virtual keyboard, scale calculator, and metronome.
- **Dark_Mode**: The alternate color theme activated via the `#themeToggle` checkbox, applying the `body.dark` CSS class.
- **Header_Menu**: A navigation bar in the header section providing quick-jump links to all application sections.
- **Hamburger_Menu**: A collapsed mobile-friendly menu icon (three horizontal lines) that expands to reveal navigation links on small screens.
- **Scale_Circle_Viz**: A container that displays musical scale notes arranged in a circular layout, allowing visual comparison of scales.
- **Circle_of_Fifths**: An interactive circular diagram showing the relationship between the twelve tones of the chromatic scale, with major keys on the outer ring and relative minor keys on the inner ring.
- **Songsterr_Iframe**: A container with an embedded iframe element pointing to the Songsterr tablature website.
- **AudioEngine**: The existing global singleton (`window.AudioEngine`) responsible for synthesizing and playing notes via the Web Audio API.
- **Scale_Selection**: The current tonica (`#tonica`) and scale type (`#tipoEscala`) dropdowns used to calculate the active scale.
- **Container**: A visually distinct section of the page with its own heading, background, and border styling.

## Requirements

### Requirement 1: Dark Mode Contrast Fix

**User Story:** As a user, I want all UI elements to display correct colors and adequate contrast in dark mode, so that I can comfortably use the application in low-light environments.

#### Acceptance Criteria

1. WHILE Dark_Mode is active, THE MusicPages_App SHALL apply dark background colors (luminance below 25%) and light text colors (contrast ratio of at least 4.5:1 against background) to all Container elements, including the metronome group, input group, output section, keyboard container, and fretboard container.
2. WHILE Dark_Mode is active, THE MusicPages_App SHALL style all `<select>`, `<input>`, and `<button>` elements with dark backgrounds and light text that maintain a minimum contrast ratio of 4.5:1.
3. WHILE Dark_Mode is active, THE MusicPages_App SHALL apply appropriate dark-themed styling to the interval table, general scale table, and harmonic field output areas so that text, borders, and header cells remain legible.
4. WHILE Dark_Mode is active, THE MusicPages_App SHALL ensure the virtual keyboard retains visual distinction between white keys, black keys, and highlighted (scale-note) keys with adequate contrast.
5. WHILE Dark_Mode is active, THE MusicPages_App SHALL ensure the metronome preset buttons (`.preset-btn`) display legible text with appropriate border colors for their tempo category (slow, moderate, fast).
6. WHILE Dark_Mode is active, THE MusicPages_App SHALL style all newly added containers (Scale_Circle_Viz, Circle_of_Fifths, Songsterr_Iframe, Header_Menu) with consistent dark theme colors.

### Requirement 2: Header Navigation Menu

**User Story:** As a user, I want a navigation menu at the top of the page, so that I can quickly jump to any section of the application without scrolling.

#### Acceptance Criteria

1. THE Header_Menu SHALL display navigation links for: Metrônomo, Calculadora de Escalas, Teclado Virtual, Braço do Instrumento, Círculo de Escalas, Ciclo de Quintas, and Songsterr.
2. WHEN a user clicks a navigation link in the Header_Menu, THE MusicPages_App SHALL scroll the corresponding section into the visible viewport.
3. WHILE the viewport width is greater than 768 pixels, THE Header_Menu SHALL display all navigation links in a horizontal row.
4. WHILE the viewport width is 768 pixels or less, THE Header_Menu SHALL collapse all navigation links behind a Hamburger_Menu icon.
5. WHEN a user clicks the Hamburger_Menu icon, THE Header_Menu SHALL expand to reveal all navigation links in a vertical list.
6. WHEN a user clicks a navigation link while the Hamburger_Menu is open, THE Header_Menu SHALL close the expanded menu after scrolling to the target section.
7. WHILE Dark_Mode is active, THE Header_Menu SHALL use dark background and light text colors consistent with the application theme.

### Requirement 3: Scale Circle Visualization

**User Story:** As a user, I want to see the notes of a scale arranged in a circle, so that I can visually understand scale structures and compare different scales.

#### Acceptance Criteria

1. THE Scale_Circle_Viz SHALL display all 12 chromatic notes arranged evenly around a circle, with the notes belonging to the currently selected scale visually highlighted.
2. WHEN the user changes the Scale_Selection (tonica or tipoEscala), THE Scale_Circle_Viz SHALL update the circular display to reflect the new scale notes.
3. THE Scale_Circle_Viz SHALL provide a "Compare" mode with a secondary scale selector (tonica and scale type), displaying two overlapping visual indicators on the same circle so the user can identify shared and differing notes.
4. WHILE the Compare mode is active, THE Scale_Circle_Viz SHALL use distinct visual styles (different colors or line patterns) for each of the two scales and a third style for notes shared by both.
5. WHEN a user clicks a note on the Scale_Circle_Viz, THE AudioEngine SHALL play the corresponding note sound using the current timbre setting.
6. THE Scale_Circle_Viz SHALL draw connecting lines between consecutive scale notes to form a polygon shape inside the circle, making the intervallic structure visible.
7. THE Scale_Circle_Viz SHALL synchronize with the global Scale_Selection, updating whenever `calcularEscala()` is invoked.

### Requirement 4: Circle of Fifths

**User Story:** As a user, I want an interactive Circle of Fifths diagram, so that I can visually explore key relationships and hear the notes of each key.

#### Acceptance Criteria

1. THE Circle_of_Fifths SHALL display the 12 major keys arranged clockwise in fifths order (C, G, D, A, E, B, F#/Gb, Db, Ab, Eb, Bb, F) on an outer ring.
2. THE Circle_of_Fifths SHALL display the 12 relative minor keys (Am, Em, Bm, F#m, C#m, G#m, Ebm/D#m, Bbm, Fm, Cm, Gm, Dm) on an inner ring, each aligned with its relative major.
3. WHEN a user clicks a key segment on the Circle_of_Fifths, THE AudioEngine SHALL play the tonic note of the selected key.
4. WHEN a user clicks a key segment on the Circle_of_Fifths, THE Circle_of_Fifths SHALL visually highlight the selected segment and display the key signature information (number of sharps or flats).
5. THE Circle_of_Fifths SHALL visually indicate enharmonic equivalents (e.g., F#/Gb, C#/Db, Cb/B) at the bottom of the circle where they overlap.
6. WHILE Dark_Mode is active, THE Circle_of_Fifths SHALL use colors with adequate contrast for both the outer and inner ring labels and segment backgrounds.

### Requirement 5: Songsterr Iframe Container

**User Story:** As a user, I want to load Songsterr tablatures within the application, so that I can practice along with tabs without leaving the page.

#### Acceptance Criteria

1. THE Songsterr_Iframe SHALL display a text input field where the user can paste or type a Songsterr URL.
2. WHEN the user submits a valid Songsterr URL (matching the pattern `https://www.songsterr.com/a/wsa/*`), THE Songsterr_Iframe SHALL load the URL inside an iframe element.
3. IF the user submits a URL that does not match the Songsterr domain pattern, THEN THE Songsterr_Iframe SHALL display an error message stating "URL inválida. Insira um link válido do Songsterr."
4. THE Songsterr_Iframe SHALL set the iframe dimensions to a minimum width of 100% of the container and a minimum height of 500 pixels.
5. THE Songsterr_Iframe SHALL include a "Limpar" (Clear) button that removes the loaded iframe content and resets the input field.
6. WHILE Dark_Mode is active, THE Songsterr_Iframe input field, button, and container border SHALL use dark theme colors consistent with the application.
