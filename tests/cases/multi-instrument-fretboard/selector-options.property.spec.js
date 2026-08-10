/**
 * Property 2: Instrument selector options match registry
 *
 * For any set of profiles in the registry, the selector contains exactly one
 * option per profile with matching display text in registry order.
 *
 * **Validates: Requirements 2.2**
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';

const InstrumentSelector = require('../../../scripts/script-instrument-selector.js');

// Valid note names for generating profiles
const VALID_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Generator for a valid InstrumentProfile with consistent array lengths
const arbProfile = fc.integer({ min: 4, max: 12 }).chain(strings =>
    fc.record({
        id: fc.string({ minLength: 2, maxLength: 16, unit: fc.constantFrom(
            'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','0','1','2','-'
        ) }).map(s => 'x' + s.replace(/^-|-$/g, 'z')),
        name: fc.string({ minLength: 1, maxLength: 64 }).filter(s => s.trim().length > 0),
        strings: fc.constant(strings),
        tuning: fc.array(fc.constantFrom(...VALID_NOTES), { minLength: strings, maxLength: strings }),
        octaves: fc.array(fc.integer({ min: 0, max: 8 }), { minLength: strings, maxLength: strings }),
        frets: fc.integer({ min: 0, max: 36 }),
        fretless: fc.boolean()
    })
);

// Generator for a non-empty array of profiles with unique IDs
const arbProfiles = fc.array(arbProfile, { minLength: 1, maxLength: 7 })
    .map(profiles => {
        // Ensure unique IDs by appending index
        return profiles.map((p, i) => ({ ...p, id: p.id + '-' + i }));
    });

describe('Property 2: Instrument selector options match registry', () => {
    beforeEach(() => {
        // Set up DOM with #fretboardContainer > #fretboard
        document.body.innerHTML = '<div id="fretboardContainer"><div id="fretboard"></div></div>';
    });

    afterEach(() => {
        delete global.InstrumentRegistry;
        document.body.innerHTML = '';
    });

    it('selector contains exactly one option per profile with matching display text in registry order', { timeout: 30000 }, () => {
        fc.assert(
            fc.property(arbProfiles, (profiles) => {
                // Reset DOM for each iteration
                document.body.innerHTML = '<div id="fretboardContainer"><div id="fretboard"></div></div>';

                // Mock InstrumentRegistry with the generated profiles
                global.InstrumentRegistry = {
                    getAll: () => profiles.slice(),
                    getById: (id) => profiles.find(p => p.id === id) || null,
                    getDefaultId: () => profiles[0].id
                };

                // Initialize the selector
                InstrumentSelector.initializeInstrumentSelector();

                // Get the select element
                const select = document.getElementById('instrumentSelect');
                expect(select).not.toBeNull();

                const options = select.querySelectorAll('option');

                // Assert: number of options equals number of profiles
                expect(options.length).toBe(profiles.length);

                // Assert: each option's textContent matches profile name in order
                // Assert: each option's value matches profile id
                for (let i = 0; i < profiles.length; i++) {
                    expect(options[i].textContent).toBe(profiles[i].name);
                    expect(options[i].value).toBe(profiles[i].id);
                }
            }),
            { numRuns: 20 }
        );
    });
});
