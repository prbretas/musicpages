/**
 * Property 7: Responsive container dimensions
 *
 * For any valid string count (4-12) and fret count (0-36), verify:
 * - calculateFretboardDimensions returns width = (frets + 1) * 40
 * - calculateFretboardDimensions returns height = min(strings * 50, 600)
 *
 * Validates: Requirements 3.6, 3.7, 9.1, 9.2, 9.5
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

const { calculateFretboardDimensions } = require('../../../scripts/script-fretboard.js');

describe('Property 7: Responsive container dimensions', () => {
    it('width equals (frets + 1) * 40 and height equals min(strings * 50, 600) for any valid inputs', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 4, max: 12 }),
                fc.integer({ min: 0, max: 36 }),
                (strings, frets) => {
                    const result = calculateFretboardDimensions(strings, frets);

                    const expectedWidth = (frets + 1) * 40;
                    const expectedHeight = Math.min(strings * 50, 600);

                    expect(result.width).toBe(expectedWidth);
                    expect(result.height).toBe(expectedHeight);
                }
            ),
            { numRuns: 30 }
        );
    });
});
