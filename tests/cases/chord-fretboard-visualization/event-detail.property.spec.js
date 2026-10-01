/**
 * Property test 4.3: Event detail structure completeness.
 *
 * For any chord name in LocalChordDB that has shapes, handleChordCardClick
 * dispatches `chord-selected` with:
 *   - chordName: non-empty string matching the chord name
 *   - root: non-empty string (parsed root note)
 *   - shapes: same array returned by LocalChordDB.getChordShapes(name)
 *
 * Validates: Requirements 1.2
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';

const ChordVisualizer = require('../../../scripts/script-chord-diagrams.js');

// Collect all chord names in the DB that have at least 1 shape.
const db = ChordVisualizer.LocalChordDB;
const roots = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const qualities = ['', 'm', 'maj7', 'm7', '7', 'dim', 'm7b5'];
const ALL_NAMES = roots.flatMap(r => qualities.map(q => r + q)).filter(n => db.hasChord(n));

/**
 * Calls handleChordCardClick and returns the first `chord-selected` detail,
 * or null if none was dispatched.
 */
function clickAndCapture(chordName) {
  let captured = null;
  const handler = (e) => { captured = e.detail; };
  document.addEventListener('chord-selected', handler);

  // Fresh card and clean state so every call is a first-click (not a toggle-off).
  ChordVisualizer.setActiveChordCard(null);
  const card = document.createElement('div');
  card.className = 'chord-card';
  document.body.appendChild(card);

  const chord = { name: chordName, root: ChordVisualizer.parseChordName(chordName).root };
  ChordVisualizer.handleChordCardClick(chord, card);

  // Cleanup
  document.removeEventListener('chord-selected', handler);
  ChordVisualizer.setActiveChordCard(null);
  card.remove();

  return captured;
}

describe('Property 1: Event detail structure completeness', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    ChordVisualizer.setActiveChordCard(null);
  });

  it('dispatches correct detail for every chord in LocalChordDB that has shapes', () => {
    expect(ALL_NAMES.length).toBeGreaterThan(0);

    for (const name of ALL_NAMES) {
      const detail = clickAndCapture(name);

      expect(detail, `chord-selected not dispatched for ${name}`).not.toBeNull();
      expect(typeof detail.chordName).toBe('string');
      expect(detail.chordName).toBe(name);
      expect(detail.root.length).toBeGreaterThan(0);
      expect(detail.shapes).toEqual(db.getChordShapes(name));
    }
  });

  it('fast-check: detail is valid for any chord in the DB', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: ALL_NAMES.length - 1 }),
        (idx) => {
          const name = ALL_NAMES[idx];
          const detail = clickAndCapture(name);

          if (!detail) return false;
          return (
            detail.chordName === name &&
            detail.root.length > 0 &&
            detail.shapes.length === db.getChordShapes(name).length
          );
        }
      ),
      { numRuns: 30 }
    );
  });
});
