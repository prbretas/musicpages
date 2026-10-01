/**
 * Unit tests for mapShapeToPositions
 * Validates: Requirements 2.2, 2.3, 2.4, 2.5, 2.6
 */
import { describe, it, expect, beforeEach } from 'vitest';

// Import from script-fretboard.js
const fretboard = require('../../../scripts/script-fretboard.js');
const { mapShapeToPositions, getChromaticIndex, NOTE_NAMES, _setActiveFretboardState } = fretboard;

describe('mapShapeToPositions', () => {
    beforeEach(() => {
        // Set standard guitar tuning for tests
        _setActiveFretboardState({
            profileId: 'guitarra-6',
            tuning: ['E', 'A', 'D', 'G', 'B', 'E'],
            octaves: [2, 2, 3, 3, 3, 4]
        });
    });

    it('should return empty array for shape with all muted strings', () => {
        var shape = { frets: [-1, -1, -1, -1, -1, -1], startFret: 1 };
        var result = mapShapeToPositions(shape, 6, 'A');
        expect(result).toEqual([]);
    });

    it('should exclude muted strings (fret === -1)', () => {
        // Am open shape: x02210
        var shape = { frets: [-1, 0, 2, 2, 1, 0], startFret: 1 };
        var result = mapShapeToPositions(shape, 6, 'A');
        // String 0 (E low) is muted, so we should get 5 positions
        expect(result.length).toBe(5);
        expect(result.every(p => p.stringIndex !== 0)).toBe(true);
    });

    it('should keep open strings (fret 0) at absolute fret 0', () => {
        // Am open: x02210 with startFret=1
        var shape = { frets: [-1, 0, 2, 2, 1, 0], startFret: 1 };
        var result = mapShapeToPositions(shape, 6, 'A');

        // String 1 (A) is open -> fret 0
        var string1 = result.find(p => p.stringIndex === 1);
        expect(string1.fret).toBe(0);

        // String 5 (E high) is open -> fret 0
        var string5 = result.find(p => p.stringIndex === 5);
        expect(string5.fret).toBe(0);
    });

    it('should calculate absolute fret = startFret + fretValue - 1 for non-open strings', () => {
        // Shape with startFret=1: frets [0, 0, 2, 2, 1, 0]
        // String 2 (D): fret 2, startFret 1 -> absolute = 1 + 2 - 1 = 2
        // String 3 (G): fret 2, startFret 1 -> absolute = 1 + 2 - 1 = 2
        // String 4 (B): fret 1, startFret 1 -> absolute = 1 + 1 - 1 = 1
        var shape = { frets: [0, 0, 2, 2, 1, 0], startFret: 1 };
        var result = mapShapeToPositions(shape, 6, 'A');

        var string2 = result.find(p => p.stringIndex === 2);
        expect(string2.fret).toBe(2);

        var string3 = result.find(p => p.stringIndex === 3);
        expect(string3.fret).toBe(2);

        var string4 = result.find(p => p.stringIndex === 4);
        expect(string4.fret).toBe(1);
    });

    it('should handle higher startFret positions correctly', () => {
        // Barre chord at fret 5: shape frets [1, 1, 3, 3, 3, 1], startFret=5
        // String 0 (E): fret 1 -> absolute = 5 + 1 - 1 = 5
        // String 2 (D): fret 3 -> absolute = 5 + 3 - 1 = 7
        var shape = { frets: [1, 1, 3, 3, 3, 1], startFret: 5 };
        var result = mapShapeToPositions(shape, 6, 'A');

        expect(result.find(p => p.stringIndex === 0).fret).toBe(5);
        expect(result.find(p => p.stringIndex === 2).fret).toBe(7);
    });

    it('should mark isRoot=true for positions matching rootNote', () => {
        // Standard guitar tuning: E A D G B E
        // Am open: x02210 startFret=1 root=A
        // String 1 (A) open = A -> isRoot=true
        // String 2 (D) fret 2 = E -> isRoot=false
        // String 3 (G) fret 2 = A -> isRoot=true
        // String 4 (B) fret 1 = C -> isRoot=false
        // String 5 (E) open = E -> isRoot=false
        var shape = { frets: [-1, 0, 2, 2, 1, 0], startFret: 1 };
        var result = mapShapeToPositions(shape, 6, 'A');

        var string1 = result.find(p => p.stringIndex === 1);
        expect(string1.isRoot).toBe(true); // A open = A

        var string3 = result.find(p => p.stringIndex === 3);
        expect(string3.isRoot).toBe(true); // G + 2 frets = A

        var string2 = result.find(p => p.stringIndex === 2);
        expect(string2.isRoot).toBe(false); // D + 2 frets = E

        var string4 = result.find(p => p.stringIndex === 4);
        expect(string4.isRoot).toBe(false); // B + 1 fret = C

        var string5 = result.find(p => p.stringIndex === 5);
        expect(string5.isRoot).toBe(false); // E open = E
    });

    it('should handle shape with fewer frets than numStrings', () => {
        // Only 4 frets provided for a 6-string instrument
        var shape = { frets: [1, 2, 3, 1], startFret: 3 };
        var result = mapShapeToPositions(shape, 6, 'C');
        expect(result.length).toBe(4);
        expect(result.every(p => p.stringIndex < 4)).toBe(true);
    });

    it('should handle missing startFret (default to 0)', () => {
        var shape = { frets: [0, 0, 0, 0, 0, 0] };
        var result = mapShapeToPositions(shape, 6, 'E');
        // All open strings -> all frets should be 0
        expect(result.every(p => p.fret === 0)).toBe(true);
    });
});
