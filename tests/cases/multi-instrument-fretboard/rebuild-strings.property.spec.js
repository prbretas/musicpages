/**
 * Property 3: Fretboard rebuild produces correct string count
 *
 * For any valid InstrumentProfile, after applying it, the DOM contains
 * exactly `profile.strings` string row elements.
 *
 * **Validates: Requirements 2.3, 3.1, 3.2**
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
        frets: fc.integer({ min: 0, max: 36 }),
        fretless: fc.boolean()
    })
);

describe('Property 3: Fretboard rebuild produces correct string count', () => {
    beforeEach(() => {
        // Set up a DOM with a #fretboard div
        document.body.innerHTML = '<div id="fretboard"></div>';
    });

    afterEach(() => {
        // Clean up global mocks
        delete global.InstrumentRegistry;
        document.body.innerHTML = '';
    });

    it('DOM contains exactly profile.strings string row elements after applying any valid profile', { timeout: 30000 }, () => {
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

                // Assert DOM contains exactly profile.strings string rows
                const stringRows = document.querySelectorAll('.string');
                expect(stringRows.length).toBe(profile.strings);
            }),
            { numRuns: 20 }
        );
    });
});
