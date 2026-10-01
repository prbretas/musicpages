/**
 * Unit tests for scale-shapes-caged helper functions (Task 1.1)
 * Tests computeShapeRange, findNotePositions, getScaleNotesInRange
 */
import { describe, it, expect } from 'vitest';

const {
    SHAPE_COLORS,
    notasCromaticas,
    computeShapeRange,
    findNotePositions,
    getScaleNotesInRange
} = require('../../../scripts/script-scale-shapes.js');

describe('scale-shapes-caged: Constants', () => {
    it('SHAPE_COLORS has at least 12 colors', () => {
        expect(SHAPE_COLORS.length).toBeGreaterThanOrEqual(12);
    });

    it('SHAPE_COLORS entries all start with "shape-" prefix', () => {
        SHAPE_COLORS.forEach((color) => {
            expect(color).toMatch(/^shape-/);
        });
    });

    it('notasCromaticas has exactly 12 notes', () => {
        expect(notasCromaticas).toEqual(['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']);
    });
});

describe('scale-shapes-caged: computeShapeRange', () => {
    it('returns a range of at most 5 frets (endFret - startFret <= 4)', () => {
        const result = computeShapeRange(5, 24);
        expect(result.endFret - result.startFret).toBeLessThanOrEqual(4);
    });

    it('starts at rootFret when there is room', () => {
        const result = computeShapeRange(5, 24);
        expect(result.startFret).toBe(5);
        expect(result.endFret).toBe(9);
    });

    it('clamps to numFrets when rootFret is near the end', () => {
        const result = computeShapeRange(22, 24);
        expect(result.endFret).toBeLessThanOrEqual(24);
        expect(result.endFret - result.startFret).toBeLessThanOrEqual(4);
    });

    it('handles rootFret 0', () => {
        const result = computeShapeRange(0, 24);
        expect(result.startFret).toBe(0);
        expect(result.endFret).toBe(4);
    });

    it('handles edge case when numFrets is small', () => {
        const result = computeShapeRange(0, 3);
        expect(result.startFret).toBe(0);
        expect(result.endFret).toBe(3);
        expect(result.endFret - result.startFret).toBeLessThanOrEqual(4);
    });
});

describe('scale-shapes-caged: findNotePositions', () => {
    const standardTuning = ['E', 'A', 'D', 'G', 'B', 'E'];

    it('finds G on standard guitar tuning', () => {
        const positions = findNotePositions('G', standardTuning, 24);
        // E string: G is 3 semitones up -> fret 3
        expect(positions[0]).toBe(3);
        // A string: G is 10 semitones up -> fret 10
        expect(positions[1]).toBe(10);
        // D string: G is 5 semitones up -> fret 5
        expect(positions[2]).toBe(5);
        // G string: G is 0 semitones (open) -> fret 0
        expect(positions[3]).toBe(0);
        // B string: G is 8 semitones up -> fret 8
        expect(positions[4]).toBe(8);
        // E string: G is 3 semitones up -> fret 3
        expect(positions[5]).toBe(3);
    });

    it('finds open string note at fret 0', () => {
        const positions = findNotePositions('E', standardTuning, 24);
        expect(positions[0]).toBe(0); // 1st string E is open
        expect(positions[5]).toBe(0); // 6th string E is open
    });

    it('returns -1 for invalid note', () => {
        const positions = findNotePositions('X', standardTuning, 24);
        positions.forEach((pos) => {
            expect(pos).toBe(-1);
        });
    });

    it('returns array with same length as tuning', () => {
        const tuning4 = ['G', 'D', 'A', 'E'];
        const positions = findNotePositions('C', tuning4, 24);
        expect(positions.length).toBe(4);
    });
});

describe('scale-shapes-caged: getScaleNotesInRange', () => {
    const cMajorScale = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

    it('finds scale notes in range for E string, frets 0-4', () => {
        const notes = getScaleNotesInRange('E', 0, 4, cMajorScale, 24);
        // E(0), F(1), G(3) are in C major within frets 0-4
        // fret 0 = E, fret 1 = F, fret 2 = F#(not in scale), fret 3 = G, fret 4 = G#(not in scale)
        expect(notes).toEqual([
            { note: 'E', fret: 0 },
            { note: 'F', fret: 1 },
            { note: 'G', fret: 3 }
        ]);
    });

    it('returns empty array for invalid open note', () => {
        const notes = getScaleNotesInRange('X', 0, 4, cMajorScale, 24);
        expect(notes).toEqual([]);
    });

    it('respects numFrets boundary', () => {
        const notes = getScaleNotesInRange('E', 22, 26, cMajorScale, 24);
        // Should not go beyond fret 24
        notes.forEach((n) => {
            expect(n.fret).toBeLessThanOrEqual(24);
        });
    });

    it('returns empty array when startFret > endFret after clamping', () => {
        const notes = getScaleNotesInRange('E', 25, 28, cMajorScale, 24);
        expect(notes).toEqual([]);
    });

    it('finds notes for A string in pentatonic minor', () => {
        const pentatonicAm = ['A', 'C', 'D', 'E', 'G'];
        const notes = getScaleNotesInRange('A', 0, 4, pentatonicAm, 24);
        // fret 0 = A, fret 1 = A#(no), fret 2 = B(no), fret 3 = C, fret 4 = C#(no)
        // Wait: D is at fret 5 so not included in 0-4
        expect(notes).toEqual([
            { note: 'A', fret: 0 },
            { note: 'C', fret: 3 }
        ]);
    });
});
