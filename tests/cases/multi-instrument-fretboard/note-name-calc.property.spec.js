/**
 * Property 5: Note name calculation correctness
 *
 * For any valid chromatic index (0-11) and fret number (0-36),
 * the computed note name equals NOTE_NAMES[(chromaticIndex + fretNumber) % 12].
 *
 * Validates: Requirements 3.4
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

const { getNoteName, NOTE_NAMES } = require('../../../scripts/script-fretboard.js');

describe('Property 5: Note name calculation correctness', () => {
    it('computed note name equals NOTE_NAMES[(chromaticIndex + fretNumber) % 12] for any valid inputs', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 0, max: 11 }),
                fc.integer({ min: 0, max: 36 }),
                (chromaticIndex, fretNumber) => {
                    const result = getNoteName(chromaticIndex, fretNumber);
                    const expected = NOTE_NAMES[(chromaticIndex + fretNumber) % 12];
                    expect(result).toBe(expected);
                }
            ),
            { numRuns: 30 }
        );
    });
});
