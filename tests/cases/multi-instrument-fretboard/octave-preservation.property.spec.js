/**
 * Property 13: Octave preservation on tuning override
 *
 * When overriding open note via custom tuning, MIDI calculation continues
 * using the original octave from the profile (not a new octave derived
 * from the note name).
 *
 * **Validates: Requirements 5.7**
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';

const {
    applyInstrumentProfile,
    rebuildString,
    calculateMidi,
    getChromaticIndex,
    NOTE_NAMES
} = require('../../../scripts/script-fretboard.js');

// Valid note names for generating overrides
const VALID_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Default profile for testing: guitarra-6
const GUITAR_6_PROFILE = {
    id: 'guitarra-6',
    name: 'Guitarra 6 cordas',
    strings: 6,
    tuning: ['E', 'A', 'D', 'G', 'B', 'E'],
    octaves: [2, 2, 3, 3, 3, 4],
    frets: 24,
    fretless: false
};

describe('Property 13: Octave preservation on tuning override', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="fretboardContainer"><div id="fretboard"></div></div>';

        // Mock InstrumentRegistry
        global.InstrumentRegistry = {
            getById: (id) => id === GUITAR_6_PROFILE.id ? GUITAR_6_PROFILE : null,
            getDefaultId: () => GUITAR_6_PROFILE.id
        };

        // Apply profile to initialize the fretboard
        applyInstrumentProfile(GUITAR_6_PROFILE.id);
    });

    afterEach(() => {
        delete global.InstrumentRegistry;
        document.body.innerHTML = '';
    });

    it('MIDI values use original profile octave after rebuildString with a new note', { timeout: 30000 }, () => {
        fc.assert(
            fc.property(
                fc.constantFrom(...VALID_NOTES),
                fc.integer({ min: 0, max: 5 }),
                (newNote, stringIndex) => {
                    // Reset fretboard for each iteration
                    document.body.innerHTML = '<div id="fretboardContainer"><div id="fretboard"></div></div>';
                    applyInstrumentProfile(GUITAR_6_PROFILE.id);

                    // Remember the original octave for this string
                    var originalOctave = GUITAR_6_PROFILE.octaves[stringIndex];

                    // Rebuild the string with the new note
                    rebuildString(stringIndex, newNote);

                    // Get the rebuilt string's note cells
                    // Visual index = numStrings - 1 - stringIndex
                    var numStrings = GUITAR_6_PROFILE.strings;
                    var visualIndex = numStrings - 1 - stringIndex;
                    var stringRows = document.querySelectorAll('.string');
                    var stringRow = stringRows[visualIndex];

                    expect(stringRow).toBeDefined();

                    var noteCells = stringRow.querySelectorAll('.note-cell-fret');
                    var newNoteChromaticIndex = getChromaticIndex(newNote);

                    // For each fret, verify MIDI = (originalOctave + 1) * 12 + getChromaticIndex(newNote) + fret
                    // clamped to 0-127
                    for (var fret = 0; fret < noteCells.length; fret++) {
                        var expectedMidi = calculateMidi(originalOctave, newNoteChromaticIndex, fret);
                        expectedMidi = Math.max(0, Math.min(127, expectedMidi));

                        var actualMidi = parseInt(noteCells[fret].dataset.midi, 10);
                        expect(actualMidi).toBe(expectedMidi);
                    }
                }
            ),
            { numRuns: 20 }
        );
    });
});
