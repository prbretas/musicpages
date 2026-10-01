/**
 * Property F1: fret geometry is linear position + constant width (in px).
 * For any fretNumber >= 0 and fretWidth > 0:
 *   computeFretGeometry(n, w) === { leftPx: n * w, widthPx: w }
 *
 * Validates: Requirements 1.1 (fixed-width px columns, no overlap).
 */
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

const { computeFretGeometry } = require('../../../scripts/script-fretboard.js');

describe('Property F1: computeFretGeometry', () => {
  it('left is fretNumber*fretWidth and width is constant for any valid inputs', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 36 }),
        fc.integer({ min: 1, max: 200 }),
        (fretNumber, fretWidth) => {
          const g = computeFretGeometry(fretNumber, fretWidth);
          expect(g.leftPx).toBe(fretNumber * fretWidth);
          expect(g.widthPx).toBe(fretWidth);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('adjacent fret columns are exactly fretWidth apart (no gap/overlap)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 35 }),
        fc.integer({ min: 1, max: 200 }),
        (fretNumber, fretWidth) => {
          const a = computeFretGeometry(fretNumber, fretWidth);
          const b = computeFretGeometry(fretNumber + 1, fretWidth);
          expect(b.leftPx - a.leftPx).toBe(fretWidth);
        }
      ),
      { numRuns: 50 }
    );
  });
});
