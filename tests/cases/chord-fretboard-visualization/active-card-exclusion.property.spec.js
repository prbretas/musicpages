/**
 * Property test 4.4: Mutual exclusion of active chord card.
 *
 * For any sequence of card clicks, at most 1 card has the class
 * `chord-card-active` at any point in time.
 *
 * Validates: Requirements 5.1, 5.2, 5.3
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';

const ChordVisualizer = require('../../../scripts/script-chord-diagrams.js');

function makeCard() {
  const card = document.createElement('div');
  card.className = 'chord-card';
  document.body.appendChild(card);
  return card;
}

function activeCount() {
  return document.querySelectorAll('.chord-card-active').length;
}

describe('Property 5: Mutual exclusion of active chord card', () => {
  beforeEach(() => {
    const div = document.createElement('div');
    div.id = 'chordVisualizerContainer';
    document.body.appendChild(div);
    ChordVisualizer.init('#chordVisualizerContainer');
    ChordVisualizer.setActiveChordCard(null);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    ChordVisualizer.setActiveChordCard(null);
  });

  it('clicking different cards leaves at most 1 active', () => {
    // Use Cmaj7 — guaranteed to have shapes in LocalChordDB.
    const chord = { name: 'Cmaj7', root: 'C' };

    const cards = [makeCard(), makeCard(), makeCard()];

    for (const card of cards) {
      ChordVisualizer.handleChordCardClick(chord, card);
      expect(activeCount()).toBeLessThanOrEqual(1);
    }
  });

  it('toggling the active card deactivates it → 0 active', () => {
    const chord = { name: 'Am7', root: 'A' };
    const card = makeCard();

    ChordVisualizer.handleChordCardClick(chord, card);
    expect(activeCount()).toBe(1);

    // Second click on the same card = toggle off
    ChordVisualizer.handleChordCardClick(chord, card);
    expect(activeCount()).toBe(0);
  });

  it('fast-check: any sequence of N clicks keeps active count <= 1', () => {
    const chord = { name: 'Dm7', root: 'D' };
    const cards = [makeCard(), makeCard(), makeCard(), makeCard(), makeCard()];

    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: cards.length - 1 }), { minLength: 1, maxLength: 15 }),
        (sequence) => {
          // Reset state before each property run
          document.querySelectorAll('.chord-card-active').forEach(el => {
            el.classList.remove('chord-card-active');
          });
          ChordVisualizer.setActiveChordCard(null);

          for (const idx of sequence) {
            ChordVisualizer.handleChordCardClick(chord, cards[idx]);
            if (activeCount() > 1) return false;
          }
          return true;
        }
      ),
      { numRuns: 30 }
    );
  });
});
