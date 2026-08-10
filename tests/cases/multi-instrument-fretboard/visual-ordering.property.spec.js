/**
 * Property 8: Visual string ordering is reverse of tuning array
 *
 * For any valid tuning array, the visual row at index 0 (top) displays
 * the last element of the tuning array and row N-1 (bottom) displays the first element.
 *
 * **Validates: Requirements 4.1, 4.2, 4.3**
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';

const {
    applyInstrumentProfile
} = require('../../../scripts/script-fretboard.js');

// Valid note names for generating profiles
const VALID_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Generator for a valid InstrumentProfile with consistent array lengths
const arbProfile = fc.integer({ min: 4, max: 12 }).chain(strings =>
    fc.record({
        id: fc.stringMatching(/^[a-z][a-z0-9-]{0,30}[a-z0-9]$/),
        name: fc.string({ minLength: 1, maxLength: 64 }).filter(s => s.trim().length > 0),
        strings: fc.constant(strings),
        tuning: fc.array(fc.constantFrom(...VALID_NOTES), { minLength: strings, maxLength: strings }),
        octaves: fc.array(fc.integer({ min: 0, max: 8 }), { minLength: strings, maxLength: strings }),
        frets: fc.integer({ min: 1, max: 24 }),
        fretless: fc.boolean()
    })
);

describe('Property 8: Visual string ordering is reverse of tuning array', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="fretboard"></div>';
    });

    afterEach(() => {
        delete global.InstrumentRegistry;
        document.body.innerHTML = '';
    });

    it('first string row open note === tuning[last] and last string row open note === tuning[0]', { timeout: 30000 }, () => {
        fc.assert(
            fc.property(arbProfile, (profile) => {
                // Mock InstrumentRegistry globally
                global.InstrumentRegistry = {
                    getById: (id) => id === profile.id ? profile : null,
                    getDefaultId: () => profile.id
                };

                // Reset DOM
                document.body.innerHTML = '<div id="fretboard"></div>';

                // Apply the profile
                applyInstrumentProfile(profile.id);

                // Get all .string elements in DOM order (top to bottom)
                const stringRows = document.querySelectorAll('.string');
                expect(stringRows.length).toBe(profile.strings);

                // Read the first open-note cell from each string row
                const firstRow = stringRows[0];
                const lastRow = stringRows[stringRows.length - 1];

                const firstOpenNote = firstRow.querySelector('.note-cell-fret.open-note');
                const lastOpenNote = lastRow.querySelector('.note-cell-fret.open-note');

                expect(firstOpenNote).not.toBeNull();
                expect(lastOpenNote).not.toBeNull();

                // Visual row 0 (top) should display tuning[last] (highest pitch)
                expect(firstOpenNote.textContent).toBe(profile.tuning[profile.tuning.length - 1]);

                // Visual row N-1 (bottom) should display tuning[0] (lowest pitch)
                expect(lastOpenNote.textContent).toBe(profile.tuning[0]);
            }),
            { numRuns: 20 }
        );
    });
});
