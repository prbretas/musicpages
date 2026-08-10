/**
 * Property 10: Tuning panel input count and pre-population
 *
 * For any valid InstrumentProfile with N strings, the panel renders exactly N inputs
 * each matching the profile's tuning array (in visual order = reversed).
 *
 * **Validates: Requirements 5.1, 5.2**
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';

const {
    initializeCustomTuningPanel
} = require('../../../scripts/script-custom-tuning.js');

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

describe('Property 10: Tuning panel input count and pre-population', () => {
    beforeEach(() => {
        // Set up DOM with fretboardContainer and fretboard divs
        document.body.innerHTML = '<div id="fretboardContainer"><div id="fretboard"></div></div>';
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('renders exactly N tuning inputs for a profile with N strings', { timeout: 30000 }, () => {
        fc.assert(
            fc.property(arbProfile, (profile) => {
                // Reset DOM
                document.body.innerHTML = '<div id="fretboardContainer"><div id="fretboard"></div></div>';

                // Initialize custom tuning panel with the profile
                initializeCustomTuningPanel(profile);

                // Assert: number of .tuning-input elements equals profile.strings
                const inputs = document.querySelectorAll('.tuning-input');
                expect(inputs.length).toBe(profile.strings);
            }),
            { numRuns: 20 }
        );
    });

    it('each input value matches the tuning array in reversed order (visual order: highest pitch first)', { timeout: 30000 }, () => {
        fc.assert(
            fc.property(arbProfile, (profile) => {
                // Reset DOM
                document.body.innerHTML = '<div id="fretboardContainer"><div id="fretboard"></div></div>';

                // Initialize custom tuning panel with the profile
                initializeCustomTuningPanel(profile);

                // Get all tuning inputs in DOM order (visual order)
                const inputs = document.querySelectorAll('.tuning-input');

                // Visual order is reversed: input at visual index 0 → tuning[strings - 1]
                for (let visualIndex = 0; visualIndex < profile.strings; visualIndex++) {
                    const dataIndex = profile.strings - 1 - visualIndex;
                    expect(inputs[visualIndex].value).toBe(profile.tuning[dataIndex]);
                }
            }),
            { numRuns: 20 }
        );
    });
});
