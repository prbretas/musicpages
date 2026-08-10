import { describe, it, expect, beforeEach } from 'vitest';
import {
  applyInstrumentProfile,
  getActiveFretboardState,
  calculateMidi,
  getChromaticIndex,
  initializeFretboard,
  normalizeToSharp,
  highlightFretboardNotes,
  NOTE_NAMES,
} from '../scripts/script-fretboard.js';

// Mock InstrumentRegistry globally so the fretboard module can find it
globalThis.InstrumentRegistry = {
  getById: function(id) {
    if (id === 'guitarra-6') {
      return {
        id: 'guitarra-6',
        name: 'Guitarra 6 cordas',
        strings: 6,
        tuning: ['E', 'A', 'D', 'G', 'B', 'E'],
        octaves: [2, 2, 3, 3, 3, 4],
        frets: 24,
        fretless: false
      };
    }
    return null;
  },
  getDefaultId: function() { return 'guitarra-6'; }
};

describe('script-fretboard', () => {
  beforeEach(() => {
    globalThis.AudioEngine = { isSupported: () => false };
    document.body.innerHTML = `
      <div id="fretboard"></div>
    `;
  });

  it('renders the high string on top for a 6-string guitar', () => {
    applyInstrumentProfile('guitarra-6');
    const strings = document.querySelectorAll('.string');
    expect(strings.length).toBe(6);
    // Visual index 0 (top) = highest pitch string (E4, data index 5)
    // The first .string rendered should have the highest pitch note (E) as open note
    const topStringOpenNote = strings[0].querySelector('.note-cell-fret.open-note');
    expect(topStringOpenNote.textContent).toBe('E'); // E4 - highest pitch
    const bottomStringOpenNote = strings[5].querySelector('.note-cell-fret.open-note');
    expect(bottomStringOpenNote.textContent).toBe('E'); // E2 - lowest pitch
  });

  it('converts note name and octave to MIDI correctly', () => {
    // calculateMidi(octave, chromaticIndex, fretNumber)
    // C4: octave=4, chromaticIndex=0, fret=0 → (4+1)*12 + 0 + 0 = 60
    expect(calculateMidi(4, getChromaticIndex('C'), 0)).toBe(60);
    // A4: octave=4, chromaticIndex=9, fret=0 → (4+1)*12 + 9 + 0 = 69
    expect(calculateMidi(4, getChromaticIndex('A'), 0)).toBe(69);
    // G#3: octave=3, chromaticIndex=8, fret=0 → (3+1)*12 + 8 + 0 = 56
    expect(calculateMidi(3, getChromaticIndex('G#'), 0)).toBe(56);
  });

  it('normalizes flat note names to sharp equivalents', () => {
    expect(normalizeToSharp('Db')).toBe('C#');
    expect(normalizeToSharp('E')).toBe('E');
  });

  it('highlights scale notes and tonic notes on the fretboard', () => {
    applyInstrumentProfile('guitarra-6');
    highlightFretboardNotes(['E', 'G', 'A'], 'E');
    const tonic = document.querySelectorAll('.note-cell-fret.tonic');
    const inScale = document.querySelectorAll('.note-cell-fret.in-scale');
    expect(tonic.length).toBeGreaterThan(0);
    expect(inScale.length).toBeGreaterThan(0);
  });
});
