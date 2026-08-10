/**
 * Property 9: String thickness monotonicity
 *
 * For any string count (4-12), computed thicknesses form a monotonically
 * non-decreasing sequence from 1px (top) to 4px (bottom).
 *
 * Validates: Requirements 4.4
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

const { calculateStringThickness } = require('../../../scripts/script-fretboard.js');

describe('Property 9: String thickness monotonicity', () => {
    it('thickness[0] === 1 (thinnest at top) for any string count 4-12', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 4, max: 12 }),
                (totalStrings) => {
                    const thickness = calculateStringThickness(0, totalStrings);
                    expect(thickness).toBe(1);
                }
            ),
            { numRuns: 30 }
        );
    });

    it('thickness[totalStrings-1] === 4 (thickest at bottom) for any string count 4-12', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 4, max: 12 }),
                (totalStrings) => {
                    const thickness = calculateStringThickness(totalStrings - 1, totalStrings);
                    expect(thickness).toBe(4);
                }
            ),
            { numRuns: 30 }
        );
    });

    it('sequence is monotonically non-decreasing for any string count 4-12', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 4, max: 12 }),
                (totalStrings) => {
                    const thicknesses = [];
                    for (let i = 0; i < totalStrings; i++) {
                        thicknesses.push(calculateStringThickness(i, totalStrings));
                    }

                    for (let i = 1; i < thicknesses.length; i++) {
                        expect(thicknesses[i]).toBeGreaterThanOrEqual(thicknesses[i - 1]);
                    }
                }
            ),
            { numRuns: 30 }
        );
    });
});
