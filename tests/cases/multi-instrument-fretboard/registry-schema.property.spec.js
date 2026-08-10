/**
 * Property 1: Instrument profile schema validity
 *
 * For any InstrumentProfile in the registry, the profile SHALL have:
 * - id: string, length 1-32
 * - name: string, length 1-64
 * - strings: integer, 4-12
 * - tuning: array with exactly `strings` entries, each a valid note name
 * - octaves: array with exactly `strings` entries, each integer 0-8
 * - frets: integer, 0-36
 * - fretless: boolean
 *
 * Validates: Requirements 1.2
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

const InstrumentRegistry = require('../../../scripts/script-instrument-registry.js');

// Valid note name pattern: A-G optionally followed by # or b
const VALID_NOTE_REGEX = /^[A-G][#b]?$/;

describe('Property 1: Instrument profile schema validity', () => {
  const allProfiles = InstrumentRegistry.getAll();

  it('registry is not empty', () => {
    expect(allProfiles.length).toBeGreaterThan(0);
  });

  it('every profile satisfies schema constraints', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...allProfiles),
        (profile) => {
          // id: string, length 1-32
          expect(typeof profile.id).toBe('string');
          expect(profile.id.length).toBeGreaterThanOrEqual(1);
          expect(profile.id.length).toBeLessThanOrEqual(32);

          // name: string, length 1-64
          expect(typeof profile.name).toBe('string');
          expect(profile.name.length).toBeGreaterThanOrEqual(1);
          expect(profile.name.length).toBeLessThanOrEqual(64);

          // strings: integer, 4-12
          expect(Number.isInteger(profile.strings)).toBe(true);
          expect(profile.strings).toBeGreaterThanOrEqual(4);
          expect(profile.strings).toBeLessThanOrEqual(12);

          // tuning: array with exactly `strings` entries, each a valid note name
          expect(Array.isArray(profile.tuning)).toBe(true);
          expect(profile.tuning.length).toBe(profile.strings);
          for (const note of profile.tuning) {
            expect(typeof note).toBe('string');
            expect(note).toMatch(VALID_NOTE_REGEX);
          }

          // octaves: array with exactly `strings` entries, each integer 0-8
          expect(Array.isArray(profile.octaves)).toBe(true);
          expect(profile.octaves.length).toBe(profile.strings);
          for (const octave of profile.octaves) {
            expect(Number.isInteger(octave)).toBe(true);
            expect(octave).toBeGreaterThanOrEqual(0);
            expect(octave).toBeLessThanOrEqual(8);
          }

          // frets: integer, 0-36
          expect(Number.isInteger(profile.frets)).toBe(true);
          expect(profile.frets).toBeGreaterThanOrEqual(0);
          expect(profile.frets).toBeLessThanOrEqual(36);

          // fretless: boolean
          expect(typeof profile.fretless).toBe('boolean');
        }
      ),
      { numRuns: 30 }
    );
  });
});
