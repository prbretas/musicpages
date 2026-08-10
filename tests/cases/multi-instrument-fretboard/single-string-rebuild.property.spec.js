/**
 * Property 12: Single string rebuild note correctness
 *
 * For any valid note committed at string index I, all note cells on that
 * string equal `NOTE_NAMES[(newNoteChromIndex + F) % 12]`.
 *
 * **Validates: Requirements 5.3**
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';

const {
    applyInstrumentProfile,
    rebuildString,
    getChromaticIndex,
    NOTE_NAMES
} = require('../../../scripts/script-fretboard.js');

// Standard 6-string guitar profile for testing
const GUITAR_PROFILE = {
    id: 'guitarra-6',
    name: 'Guitarra 6 cordas',
    strings: 6,
    tuning: ['E', 'A', 'D', 'G', 'B', 'E'],
    octaves: [2, 2, 3, 3, 3, 4],
    frets: 24,
    fretless: false
};

// Generator for valid note names (sharps only, matching NOTE_NAMES)
const arbValidNote = fc.constantFrom(...NOTE_NAMES);

// Generator for a valid string index (0 to strings-1)
const arbStringIndex = fc.integer({ min: 0, max: GUITAR_PROFILE.strings - 1 });

describe('Property 12: Single string rebuild note correctness', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="fretboard"></div>';

        // Mock InstrumentRegistry globally
        global.InstrumentRegistry = {
            getById: (id) => id === GUITAR_PROFILE.id ? GUITAR_PROFILE : null,
            getDefaultId: () => GUITAR_PROFILE.id
        };

        // Apply the initial profile to render the fretboard
        applyInstrumentProfile(GUITAR_PROFILE.id);
    });

    afterEach(() => {
        delete global.InstrumentRegistry;
        document.body.innerHTML = '';
    });

    it('all note cells on a rebuilt string equal NOTE_NAMES[(chromaticIndex + fret) % 12]', { timeout: 30000 }, () => {
        fc.assert(
            fc.property(arbValidNote, arbStringIndex, (newNote, stringIndex) => {
                // Reset DOM and re-apply profile before each iteration
                document.body.innerHTML = '<div id="fretboard"></div>';
                applyInstrumentProfile(GUITAR_PROFILE.id);

                // Call rebuildString with the new note at the given string index
                rebuildString(stringIndex, newNote);

                // Calculate the visual index from the data (string) index
                var numStrings = GUITAR_PROFILE.strings;
                var visualIndex = numStrings - 1 - stringIndex;

                // Get the rebuilt string row by visual index
                var stringRows = document.querySelectorAll('.string');
                var targetRow = stringRows[visualIndex];
                expect(targetRow).not.toBeNull();

                // Get all note cells on this string
                var noteCells = targetRow.querySelectorAll('.note-cell-fret');
                expect(noteCells.length).toBe(GUITAR_PROFILE.frets + 1);

                // Get the chromatic index of the new note
                var newNoteChromIndex = getChromaticIndex(newNote);
                expect(newNoteChromIndex).toBeGreaterThanOrEqual(0);

                // Verify each fret's note cell
                for (var fret = 0; fret <= GUITAR_PROFILE.frets; fret++) {
                    var expectedNote = NOTE_NAMES[(newNoteChromIndex + fret) % 12];
                    var cell = noteCells[fret];

                    if (fret === 0) {
                        // Fret 0 shows the raw open note name
                        expect(cell.textContent).toBe(newNote);
                        expect(cell.dataset.note).toBe(newNote);
                    } else {
                        // All other frets follow chromatic calculation
                        expect(cell.textContent).toBe(expectedNote);
                        expect(cell.dataset.note).toBe(expectedNote);
                    }
                }
            }),
            { numRuns: 20 }
        );
    });
});
