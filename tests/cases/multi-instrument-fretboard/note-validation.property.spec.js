/**
 * Property 11: Note name validation
 *
 * For any input string, the tuning panel accepts it as valid if and only if
 * it matches [A-Ga-g][#b]? with total length at most 2.
 *
 * **Validates: Requirements 5.4, 5.5**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

const { isValidNoteName } = require('../../../scripts/script-custom-tuning.js');

describe('Property 11: Note name validation', () => {
  const VALID_NOTES = fc.constantFrom(
    'C','C#','D','D#','E','F','F#','G','G#','A','A#','B',
    'c','c#','d','d#','e','f','f#','g','g#','a','a#','b',
    'Db','Eb','Gb','Ab','Bb','db','eb','gb','ab','bb'
  );

  const INVALID_NOTES = fc.string({ minLength: 0, maxLength: 5 })
    .filter(s => !/^[A-Ga-g][#b]?$/.test(s));

  it('accepts all valid note names matching [A-Ga-g][#b]?', () => {
    fc.assert(
      fc.property(VALID_NOTES, (note) => {
        expect(isValidNoteName(note)).toBe(true);
      }),
      { numRuns: 30 }
    );
  });

  it('rejects all strings that do not match [A-Ga-g][#b]?', () => {
    fc.assert(
      fc.property(INVALID_NOTES, (str) => {
        expect(isValidNoteName(str)).toBe(false);
      }),
      { numRuns: 30 }
    );
  });
});
