/**
 * Property 6: MIDI number calculation correctness
 *
 * For any valid octave (0-8), chromatic index (0-11), and fret number (0-36),
 * the computed MIDI number SHALL equal (octave + 1) × 12 + chromaticIndex + fretNumber.
 *
 * **Validates: Requirements 3.5, 8.3**
 */
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

const { calculateMidi } = require('../../../scripts/script-fretboard.js');

describe('Property 6: MIDI number calculation correctness', () => {
    it('calculateMidi(octave, chromaticIndex, fretNumber) === (octave + 1) * 12 + chromaticIndex + fretNumber', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 0, max: 8 }),
                fc.integer({ min: 0, max: 11 }),
                fc.integer({ min: 0, max: 36 }),
                (octave, chromaticIndex, fretNumber) => {
                    const expected = (octave + 1) * 12 + chromaticIndex + fretNumber;
                    const result = calculateMidi(octave, chromaticIndex, fretNumber);
                    expect(result).toBe(expected);
                }
            ),
            { numRuns: 30 }
        );
    });
});
