/**
 * Unit tests for computeHarmonicField function
 * Tests the harmonic field computation logic from the ChordVisualizer module.
 *
 * Requirements: 1.1, 1.2, 1.4
 */

const ChordVisualizer = require('../../../scripts/script-chord-diagrams.js');

describe('computeHarmonicField', () => {
  it('computes harmonic field for C major scale', () => {
    const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const result = ChordVisualizer.computeHarmonicField('C', 'maior', notes);

    expect(result).toHaveLength(7);
    expect(result[0]).toEqual({ name: 'CMaj7', degree: 'I', quality: 'Maj7', root: 'C' });
    expect(result[1]).toEqual({ name: 'Dm7', degree: 'ii', quality: 'm7', root: 'D' });
    expect(result[2]).toEqual({ name: 'Em7', degree: 'iii', quality: 'm7', root: 'E' });
    expect(result[3]).toEqual({ name: 'FMaj7', degree: 'IV', quality: 'Maj7', root: 'F' });
    expect(result[4]).toEqual({ name: 'G7', degree: 'V', quality: '7', root: 'G' });
    expect(result[5]).toEqual({ name: 'Am7', degree: 'vi', quality: 'm7', root: 'A' });
    expect(result[6]).toEqual({ name: 'Bm7b5', degree: 'viiº', quality: 'm7b5', root: 'B' });
  });

  it('computes harmonic field for A minor natural scale', () => {
    const notes = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const result = ChordVisualizer.computeHarmonicField('A', 'menor_natural', notes);

    expect(result).toHaveLength(7);
    expect(result[0]).toEqual({ name: 'Am7', degree: 'i', quality: 'm7', root: 'A' });
    expect(result[1]).toEqual({ name: 'Bm7b5', degree: 'iiº', quality: 'm7b5', root: 'B' });
    expect(result[2]).toEqual({ name: 'CMaj7', degree: 'III', quality: 'Maj7', root: 'C' });
    expect(result[3]).toEqual({ name: 'Dm7', degree: 'iv', quality: 'm7', root: 'D' });
    expect(result[4]).toEqual({ name: 'Em7', degree: 'v', quality: 'm7', root: 'E' });
    expect(result[5]).toEqual({ name: 'FMaj7', degree: 'VI', quality: 'Maj7', root: 'F' });
    expect(result[6]).toEqual({ name: 'G7', degree: 'VII', quality: '7', root: 'G' });
  });

  it('computes harmonic field for D dorian scale', () => {
    const notes = ['D', 'E', 'F', 'G', 'A', 'B', 'C'];
    const result = ChordVisualizer.computeHarmonicField('D', 'dorico', notes);

    expect(result).toHaveLength(7);
    expect(result[0]).toEqual({ name: 'Dm7', degree: 'i', quality: 'm7', root: 'D' });
    expect(result[3]).toEqual({ name: 'G7', degree: 'IV', quality: '7', root: 'G' });
    expect(result[6]).toEqual({ name: 'CMaj7', degree: 'VII', quality: 'Maj7', root: 'C' });
  });

  it('computes harmonic field for C pentatonic major scale', () => {
    const notes = ['C', 'D', 'E', 'G', 'A'];
    const result = ChordVisualizer.computeHarmonicField('C', 'pentatonica_maior', notes);

    expect(result).toHaveLength(5);
    expect(result[0]).toEqual({ name: 'CMaj', degree: 'I', quality: 'Maj', root: 'C' });
    expect(result[1]).toEqual({ name: 'Dm', degree: 'II', quality: 'm', root: 'D' });
    expect(result[4]).toEqual({ name: 'Am', degree: 'VI', quality: 'm', root: 'A' });
  });

  it('returns empty array for unknown scale type', () => {
    const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const result = ChordVisualizer.computeHarmonicField('C', 'unknown_scale', notes);

    expect(result).toEqual([]);
  });

  it('handles jonico as alias for maior', () => {
    const notes = ['G', 'A', 'B', 'C', 'D', 'E', 'F#'];
    const result = ChordVisualizer.computeHarmonicField('G', 'jonico', notes);

    expect(result).toHaveLength(7);
    expect(result[0]).toEqual({ name: 'GMaj7', degree: 'I', quality: 'Maj7', root: 'G' });
  });

  it('handles eolio as alias for menor_natural', () => {
    const notes = ['E', 'F#', 'G', 'A', 'B', 'C', 'D'];
    const result = ChordVisualizer.computeHarmonicField('E', 'eolio', notes);

    expect(result).toHaveLength(7);
    expect(result[0]).toEqual({ name: 'Em7', degree: 'i', quality: 'm7', root: 'E' });
  });

  it('computes harmonic field for blues_maior (uses pentatonic major campo)', () => {
    const notes = ['C', 'D', 'E', 'G', 'A'];
    const result = ChordVisualizer.computeHarmonicField('C', 'blues_maior', notes);

    expect(result).toHaveLength(5);
    expect(result[0]).toEqual({ name: 'CMaj', degree: 'I', quality: 'Maj', root: 'C' });
  });

  it('computes harmonic field for diminuta_tom_e_semitom', () => {
    const notes = ['C', 'D', 'Eb', 'F', 'F#', 'G#', 'A', 'B'];
    const result = ChordVisualizer.computeHarmonicField('C', 'diminuta_tom_e_semitom', notes);

    expect(result).toHaveLength(8);
    expect(result[0]).toEqual({ name: 'Cdim7', degree: 'I', quality: 'dim7', root: 'C' });
    expect(result[1]).toEqual({ name: 'D7', degree: 'II', quality: '7', root: 'D' });
  });

  it('computes harmonic field for cromatica', () => {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const result = ChordVisualizer.computeHarmonicField('C', 'cromatica', notes);

    expect(result).toHaveLength(12);
    expect(result[0]).toEqual({ name: 'C7', degree: 'I', quality: '7', root: 'C' });
    expect(result[1]).toEqual({ name: 'C#7', degree: 'IIb', quality: '7', root: 'C#' });
  });

  it('skips entries when notes array is shorter than campo harmonico', () => {
    // Simulate incomplete notes array
    const notes = ['C', 'D', 'E'];
    const result = ChordVisualizer.computeHarmonicField('C', 'maior', notes);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ name: 'CMaj7', degree: 'I', quality: 'Maj7', root: 'C' });
    expect(result[2]).toEqual({ name: 'Em7', degree: 'iii', quality: 'm7', root: 'E' });
  });
});

describe('getCampoHarmonico', () => {
  it('returns correct array for all supported scale types', () => {
    const supportedTypes = [
      'maior', 'jonico', 'menor_natural', 'eolio',
      'menor_harmonica', 'menor_melodica',
      'dorico', 'frigio', 'lidio', 'mixolidio', 'locrio',
      'pentatonica_maior', 'pentatonica_menor',
      'blues_maior', 'blues_menor',
      'egipcia', 'hirajoshi', 'iwato', 'man_gong', 'ritusen',
      'diminuta_tom_e_semitom', 'diminuta_semitom_e_tom',
      'tons_inteiros', 'cromatica'
    ];

    for (const type of supportedTypes) {
      const campo = ChordVisualizer.getCampoHarmonico(type);
      expect(campo).not.toBeNull();
      expect(Array.isArray(campo)).toBe(true);
      expect(campo.length).toBeGreaterThan(0);

      // Each entry must have grau and qualidade
      for (const entry of campo) {
        expect(entry).toHaveProperty('grau');
        expect(entry).toHaveProperty('qualidade');
        expect(typeof entry.grau).toBe('string');
        expect(typeof entry.qualidade).toBe('string');
      }
    }
  });

  it('returns null for unsupported scale types', () => {
    expect(ChordVisualizer.getCampoHarmonico('unknown')).toBeNull();
    expect(ChordVisualizer.getCampoHarmonico('')).toBeNull();
    expect(ChordVisualizer.getCampoHarmonico(undefined)).toBeNull();
  });
});

describe('scale-changed event integration', () => {
  beforeEach(() => {
    // Set up a container in the DOM
    document.body.innerHTML = '<div id="chordVisualizerContainer"></div>';
  });

  afterEach(() => {
    ChordVisualizer.destroy();
    document.body.innerHTML = '';
  });

  it('shows unavailable message for unsupported scale types', () => {
    ChordVisualizer.init('#chordVisualizerContainer');

    // Dispatch event with an unsupported scale type
    document.dispatchEvent(new CustomEvent('scale-changed', {
      detail: {
        notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
        tonica: 'C',
        tipoEscala: 'unsupported_type',
        tonicaIndex: 0
      }
    }));

    const container = document.querySelector('#chordVisualizerContainer');
    expect(container.innerHTML).toContain('Campo harm');
    expect(container.innerHTML).toContain('indispon');
  });

  it('calls render with computed chords on valid scale-changed event', () => {
    ChordVisualizer.init('#chordVisualizerContainer');

    // Dispatch event with C major
    document.dispatchEvent(new CustomEvent('scale-changed', {
      detail: {
        notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
        tonica: 'C',
        tipoEscala: 'maior',
        tonicaIndex: 0
      }
    }));

    // render() is a stub that doesn't do much yet, but we verify no errors
    const container = document.querySelector('#chordVisualizerContainer');
    // Container should NOT show unavailable message for a valid scale
    expect(container.innerHTML).not.toContain('indispon');
  });

  it('ignores events with missing detail fields', () => {
    ChordVisualizer.init('#chordVisualizerContainer');

    // Dispatch event with incomplete detail
    document.dispatchEvent(new CustomEvent('scale-changed', {
      detail: { notes: ['C'], tonica: 'C' }
      // missing tipoEscala
    }));

    const container = document.querySelector('#chordVisualizerContainer');
    expect(container.innerHTML).toBe('');
  });
});
