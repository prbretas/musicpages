/**
 * Property test 5.3: Hover opacities — emphasis and dimming.
 * Property 7 from the spec.
 *
 * For any totalShapes > 0 and any hoveredShapeIndex:
 *   - hoveredShapeIndex === -1 → all opacities are 1.0
 *   - 0 <= hoveredShapeIndex < totalShapes → hovered = 1.0, others = 0.3
 *   - length of returned array equals totalShapes
 *
 * Validates: Requirements 3.1, 3.2, 3.3
 */
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

const { computeHoverOpacities } = require('../../../scripts/script-scale-shapes.js');

describe('Property 7: Hover opacities — emphasis and dimming', () => {
  it('returns all 1.0 when hoveredShapeIndex is -1 (no hover)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }),
        (totalShapes) => {
          const opacities = computeHoverOpacities(-1, totalShapes);
          expect(opacities.length).toBe(totalShapes);
          return opacities.every(op => op === 1.0);
        }
      ),
      { numRuns: 30 }
    );
  });

  it('hovered shape gets 1.0, all others get 0.3', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }),
        (totalShapes) => {
          // Test every valid hoveredIndex for this totalShapes
          for (let hoveredIdx = 0; hoveredIdx < totalShapes; hoveredIdx++) {
            const opacities = computeHoverOpacities(hoveredIdx, totalShapes);

            // Length must equal totalShapes
            if (opacities.length !== totalShapes) return false;

            // Hovered index must be 1.0
            if (opacities[hoveredIdx] !== 1.0) return false;

            // All others must be 0.3
            for (let i = 0; i < totalShapes; i++) {
              if (i !== hoveredIdx && opacities[i] !== 0.3) return false;
            }
          }
          return true;
        }
      ),
      { numRuns: 30 }
    );
  });

  it('output length always equals totalShapes', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }),
        fc.integer({ min: -1, max: 19 }),
        (totalShapes, hoveredIdx) => {
          // Clamp hoveredIdx to valid range or -1
          const clamped = hoveredIdx >= totalShapes ? -1 : hoveredIdx;
          const opacities = computeHoverOpacities(clamped, totalShapes);
          return opacities.length === totalShapes;
        }
      ),
      { numRuns: 50 }
    );
  });

  it('each opacity value is exactly 1.0 or 0.3 (no other values)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 15 }),
        fc.integer({ min: -1, max: 14 }),
        (totalShapes, hoveredIdx) => {
          const clamped = hoveredIdx >= totalShapes ? -1 : hoveredIdx;
          const opacities = computeHoverOpacities(clamped, totalShapes);
          return opacities.every(op => op === 1.0 || op === 0.3);
        }
      ),
      { numRuns: 50 }
    );
  });
});
