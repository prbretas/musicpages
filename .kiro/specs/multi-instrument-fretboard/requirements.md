# Requirements Document

## Introduction

This feature extends the MusicPages fretboard section to support multiple stringed instruments beyond the currently hardcoded 6-string guitar. Users can select from a list of instruments (Guitarra 6 cordas, Guitarra 7 cordas, Viola 10 cordas, Violão 12 cordas, Ukulele, Baixo, Violão), and the entire fretboard recalculates accordingly — new tuning, new string count, new note mapping. Custom tuning per string is also supported.

## Glossary

- **Fretboard_Renderer**: The JavaScript module responsible for building and displaying the fretboard DOM elements based on an instrument profile
- **Instrument_Profile**: A data object defining an instrument's characteristics: id, name, number of strings, default tuning, octaves, number of frets, and fretless flag
- **Instrument_Selector**: The UI dropdown control that allows the user to choose which instrument to display on the fretboard
- **Custom_Tuning_Panel**: The UI section displaying editable inputs for each string's open note, allowing per-string tuning override
- **Scale_Highlighter**: The function (highlightFretboardNotes) that applies visual CSS classes to fretboard note cells matching the active scale
- **Audio_Engine**: The existing Web Audio API singleton (AudioEngine) that synthesizes and plays notes via MIDI number
- **Note_Cell**: A DOM element representing a single note at a specific fret and string intersection on the fretboard
- **MIDI_Number**: An integer (0–127) identifying a musical pitch, calculated from note name and octave
- **Open_Note**: The note that sounds when a string is played without pressing any fret (fret 0)
- **Tuning_Array**: An ordered array of note names representing the open notes of all strings, from lowest-pitched string to highest-pitched string

## Requirements

### Requirement 1: Instrument Profile Registry

**User Story:** As a musician, I want the application to have a predefined set of instrument profiles, so that I can quickly switch between common instruments without manual configuration.

#### Acceptance Criteria

1. THE Fretboard_Renderer SHALL maintain an Instrument_Profile registry containing at minimum the following instruments: Guitarra 6 cordas (tuning: E2 A2 D3 G3 B3 E4, 24 frets), Guitarra 7 cordas (tuning: B1 E2 A2 D3 G3 B3 E4, 24 frets), Viola 10 cordas (tuning: A2 A3 D3 D4 G3 G4 B3 B3 E4 E4, Rio Abaixo cebolão, 22 frets), Violão 12 cordas (tuning: E2 E3 A2 A3 D3 D4 G3 G4 B3 B3 E4 E4, 20 frets), Ukulele (tuning: G4 C4 E4 A4, 15 frets), Baixo 4 cordas (tuning: E1 A1 D2 G2, 24 frets), and Violão 7 cordas (tuning: B1 E2 A2 D3 G3 B3 E4, 19 frets)
2. THE Fretboard_Renderer SHALL store for each Instrument_Profile: a unique string identifier (1 to 32 characters), a display name (1 to 64 characters), the number of strings (integer from 4 to 12), a Tuning_Array of open note names ordered from lowest to highest pitch with one entry per string, an array of corresponding octave numbers (integers from 0 to 8) with one entry per string, the number of frets (integer from 0 to 36), and a fretless boolean flag
3. THE Fretboard_Renderer SHALL load the Guitarra 6 cordas Instrument_Profile as the default profile on page initialization

### Requirement 2: Instrument Selection UI

**User Story:** As a musician, I want a dropdown control in the fretboard section, so that I can select which instrument to display.

#### Acceptance Criteria

1. THE Instrument_Selector SHALL render as a labeled dropdown element (with an accessible text label) within the fretboard container section of the page
2. THE Instrument_Selector SHALL list all instruments from the Instrument_Profile registry with their display names, in the same order they appear in the registry
3. WHEN the user selects a different instrument from the Instrument_Selector, THE Fretboard_Renderer SHALL remove all existing fretboard content and rebuild the fretboard using the selected Instrument_Profile
4. THE Instrument_Selector SHALL display the default Instrument_Profile as selected on initial page load, and reflect the currently active instrument after any instrument change

### Requirement 3: Fretboard Recalculation on Instrument Change

**User Story:** As a musician, I want the fretboard to fully recalculate when I switch instruments, so that I see the correct notes for the new instrument.

#### Acceptance Criteria

1. WHEN a new Instrument_Profile is applied, THE Fretboard_Renderer SHALL remove all existing fretboard DOM elements before rendering the new fretboard
2. WHEN a new Instrument_Profile is applied, THE Fretboard_Renderer SHALL render exactly the number of strings defined in the profile
3. WHEN a new Instrument_Profile is applied, THE Fretboard_Renderer SHALL render exactly the number of frets defined in the profile (fret 0 through fret N, inclusive)
4. WHEN a new Instrument_Profile is applied, THE Fretboard_Renderer SHALL calculate each Note_Cell's note name as NOTE_NAMES[(Open_Note_chromatic_index + fret_number) mod 12], ascending in pitch from fret 0
5. WHEN a new Instrument_Profile is applied, THE Fretboard_Renderer SHALL assign to each Note_Cell a MIDI_Number computed as (octave + 1) × 12 + chromaticIndex + fretOffset, where octave and chromaticIndex come from the string's Open_Note definition in the profile
6. WHEN a new Instrument_Profile is applied, THE Fretboard_Renderer SHALL set the fretboard container width to (number_of_frets + 1) multiplied by the fret cell width
7. WHEN a new Instrument_Profile is applied, THE Fretboard_Renderer SHALL set the fretboard container height to accommodate one row per string as defined by the profile's string count

### Requirement 4: Visual String Ordering

**User Story:** As a guitarist, I want the fretboard to display strings from the highest-pitched at the top to the lowest-pitched at the bottom (musician's perspective), so that it matches what I see when looking down at my instrument.

#### Acceptance Criteria

1. THE Fretboard_Renderer SHALL render the highest-pitched string (last element of Tuning_Array) as the topmost string row in the fretboard display
2. THE Fretboard_Renderer SHALL render the lowest-pitched string (first element of Tuning_Array) as the bottommost string row in the fretboard display
3. THE Fretboard_Renderer SHALL render all intermediate strings in descending pitch order from top to bottom, such that the string at visual row index N has a pitch equal to or higher than the string at visual row index N+1
4. THE Fretboard_Renderer SHALL render each string's visual line thickness between a minimum of 1px for the highest-pitched string and a maximum of 4px for the lowest-pitched string, with intermediate strings assigned thicknesses that increase monotonically from highest-pitched to lowest-pitched
5. IF the Tuning_Array contains two or more strings with the same pitch, THEN THE Fretboard_Renderer SHALL preserve their relative order from the Tuning_Array when rendering them in the fretboard display

### Requirement 5: Custom Tuning Support

**User Story:** As a musician, I want to override the default tuning of any string, so that I can use alternate tunings like Drop D or Open G.

#### Acceptance Criteria

1. THE Custom_Tuning_Panel SHALL display one editable input field for each string of the currently active instrument
2. THE Custom_Tuning_Panel SHALL pre-populate each input with the current Open_Note of the corresponding string
3. WHEN the user commits a valid note name in a Custom_Tuning_Panel input by pressing Enter or moving focus away from the field, THE Fretboard_Renderer SHALL recalculate and redraw only the affected string
4. IF the user commits an invalid note name in a Custom_Tuning_Panel input, THEN THE Custom_Tuning_Panel SHALL display a visual error indicator on that input and leave the fretboard unchanged
5. THE Custom_Tuning_Panel SHALL accept note names in the format: a case-insensitive letter (A–G) optionally followed by a sharp symbol (#) or flat symbol (b), with a maximum input length of 2 characters
6. WHEN the user selects a different instrument from the Instrument_Selector, THE Custom_Tuning_Panel SHALL reset all inputs to the new instrument's default tuning
7. WHEN the user overrides an Open_Note via the Custom_Tuning_Panel, THE Fretboard_Renderer SHALL preserve the original octave number assigned to that string in the Instrument_Profile for MIDI_Number calculation

### Requirement 6: Reset Tuning to Default

**User Story:** As a musician, I want a button to reset the tuning back to the instrument's default, so that I can quickly undo custom tuning changes.

#### Acceptance Criteria

1. THE Custom_Tuning_Panel SHALL provide a visible reset button at all times
2. WHEN the user activates the reset button, THE Fretboard_Renderer SHALL restore the Tuning_Array and octave values to the current Instrument_Profile defaults and redraw the fretboard
3. WHEN the user activates the reset button, THE Custom_Tuning_Panel SHALL update all input fields to reflect the restored default tuning

### Requirement 7: Scale Highlighting Persistence Across Instrument Changes

**User Story:** As a musician, I want the scale highlighting to remain active when I switch instruments or change tuning, so that I can compare scale shapes across instruments.

#### Acceptance Criteria

1. WHEN a scale is active and the user selects a different instrument from the Instrument_Selector, THE Scale_Highlighter SHALL reapply the active scale highlighting to the newly rendered fretboard using the same tonic note and scale type that were last calculated
2. WHEN a scale is active and the user modifies a single string's tuning via the Custom_Tuning_Panel, THE Scale_Highlighter SHALL reapply the active scale highlighting to the affected string's Note_Cells
3. WHEN an instrument change or tuning modification triggers scale reapplication, THE Scale_Highlighter SHALL apply the "tonic" CSS class to Note_Cells matching the tonic note and the "in-scale" CSS class to Note_Cells matching non-tonic scale notes
4. IF no scale is active when the user changes the instrument or modifies tuning, THEN THE Scale_Highlighter SHALL not apply any highlighting to the fretboard
5. WHEN an instrument change triggers a fretboard rebuild, THE Scale_Highlighter SHALL reapply highlighting only after the Fretboard_Renderer has completed rendering all Note_Cells

### Requirement 8: Audio Playback Integration

**User Story:** As a musician, I want to hear the correct pitch when I click a note on the fretboard regardless of which instrument is selected, so that I can use the fretboard as a reference.

#### Acceptance Criteria

1. WHEN the user presses (pointerdown) a Note_Cell, THE Audio_Engine SHALL play the note corresponding to that cell's MIDI_Number in hold mode, sustaining the tone until explicitly stopped
2. WHEN the user releases (pointerup), cancels (pointercancel), or moves the pointer out of (pointerleave) a Note_Cell, THE Audio_Engine SHALL stop the note corresponding to that cell's MIDI_Number by applying a release envelope of 250 milliseconds fade to silence
3. THE Fretboard_Renderer SHALL compute MIDI_Number for each Note_Cell as: (openStringOctave + 1) × 12 + chromaticIndex + fretNumber, where chromaticIndex is the zero-based position of the string's Open_Note within the chromatic scale (C=0, C#=1, ... B=11) and fretNumber is the zero-based fret position on that string
4. IF the user presses a Note_Cell that is already sounding, THEN THE Audio_Engine SHALL stop the existing tone for that MIDI_Number before starting a new tone for the same MIDI_Number
5. IF the Web Audio API is not supported by the browser, THEN THE Audio_Engine SHALL silently skip playback without displaying an error or interrupting fretboard interaction

### Requirement 9: Responsive Fretboard Dimensions

**User Story:** As a musician, I want the fretboard to visually adjust to the number of strings and frets of each instrument, so that instruments with fewer strings do not waste vertical space and instruments with more strings remain readable.

#### Acceptance Criteria

1. WHEN a new Instrument_Profile is applied, THE Fretboard_Renderer SHALL set the fretboard container height equal to the number of strings multiplied by 50 pixels
2. WHEN a new Instrument_Profile is applied, THE Fretboard_Renderer SHALL set the fretboard container width equal to the number of frets plus one multiplied by 40 pixels
3. THE Fretboard_Renderer SHALL maintain a minimum Note_Cell size of 24px diameter regardless of the number of strings or frets
4. IF the calculated fretboard container width exceeds the visible viewport width, THEN THE Fretboard_Renderer SHALL enable horizontal scrolling on the fretboard container while keeping the fret-zero column visible without scrolling
5. WHILE the fretboard container height exceeds 600 pixels, THE Fretboard_Renderer SHALL constrain the container height to 600 pixels and enable vertical scrolling
