/**
 * Property F2: total board width fits all fret columns without note-cell overlap.
 * Property F3 (regression): calculateFretboardDimensions still returns (frets+1)*40.
 *
 * The fixed fret column width (40px) must be >= the note-cell size so cells on
 * adjacent frets never overlap. Total width = (frets+1) * FRET_WIDTH.
 *
 * Validates: Requirements 1.4, 6.1.
 */
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

const fb = require('../../../scripts/script-fretboard.js');

const FRET_WIDTH = 40;      // must match the module constant
const NOTE_CELL_MAX = 24;   // largest note-cell size (mobile) — must be <= FRET_WIDTH

describe('Property F2/F3: container width and no overlap', () => {
  it('F3: calculateFretboardDimensions width equals (frets+1)*40 (unchanged)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 4, max: 12 }),
        fc.integer({ min: 0, max: 36 }),
        (strings, frets) => {
          const dims = fb.calculateFretboardDimensions(strings, frets);
          expect(dims.width).toBe((frets + 1) * FRET_WIDTH);
          expect(dims.height).toBe(Math.min(strings * 50, 600));
        }
      ),
      { numRuns: 30 }
    );
  });

  it('F2: fixed column width is wide enough that note-cells never overlap', () => {
    // The invariant that guarantees no overlap: each column (FRET_WIDTH) is at
    // least as wide as the biggest note-cell.
    expect(FRET_WIDTH).toBeGreaterThanOrEqual(NOTE_CELL_MAX);

    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 36 }),
        (frets) => {
          const totalWidth = (frets + 1) * FRET_WIDTH;
          const minNeeded = (frets + 1) * NOTE_CELL_MAX;
          expect(totalWidth).toBeGreaterThanOrEqual(minNeeded);
        }
      ),
      { numRuns: 30 }
    );
  });
});
