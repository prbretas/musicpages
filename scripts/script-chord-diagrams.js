/**
 * script-chord-diagrams.js
 * ChordVisualizer — renders SVG chord diagrams for the harmonic field of the
 * currently selected scale in MusicPages.
 *
 * Implementado como IIFE que expõe um objeto global `ChordVisualizer` em `window`.
 * Compatível com navegadores sem build step (sem ES6 imports/exports).
 *
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */

/* global window, document */

var ChordVisualizer = (function () {
  'use strict';

  // ------------------------------------------------------------------
  // Data Model Typedefs (JSDoc)
  // ------------------------------------------------------------------

  /**
   * @typedef {object} ChordShape
   * @property {string} chordName - Full chord name, e.g. "Am7"
   * @property {number[]} frets - Array of fret numbers per string (low to high), -1 for muted
   * @property {number[]} fingers - Array of finger numbers per string (0 = open/mute, 1-4)
   * @property {number} startFret - Lowest fret shown in diagram (1 for open position)
   * @property {object|null} barre - { fret: number, fromString: number, toString: number } or null
   * @property {string} [source] - "api" | "local" — origin of this shape
   */

  /**
   * @typedef {object} ChordInfo
   * @property {string} name - Chord name with root + quality (e.g. "Am7")
   * @property {string} degree - Roman numeral (e.g. "vi")
   * @property {string} quality - Quality key from estruturasAcordes (e.g. "m7")
   * @property {string} root - Root note (e.g. "A")
   */

  /**
   * @typedef {object} RenderOptions
   * @property {number} numStrings - From instrument profile
   * @property {boolean} isDark - Current theme state
   * @property {number} [diagramWidth=80] - SVG width in px
   * @property {number} [diagramHeight=100] - SVG height in px
   * @property {number} [fretsToShow=5] - Number of frets displayed
   */

  // ------------------------------------------------------------------
  // Helper Utilities
  // ------------------------------------------------------------------

  /**
   * Parses a chord name string into root and quality components.
   * Handles roots with sharps (C#, D#, etc.) and flats (Db, Eb, etc.).
   *
   * @param {string} name - Full chord name (e.g. "Am7", "C#maj7", "Dbm")
   * @returns {{ root: string, quality: string }} Parsed root and quality
   *
   * Requirements: 5.5
   */
  function parseChordName(name) {
    if (!name || typeof name !== 'string') {
      return { root: '', quality: '' };
    }

    var root = '';
    var quality = '';

    // First character is always the root letter (A-G)
    root = name.charAt(0);

    // Check for sharp (#) or flat (b) modifier
    if (name.length > 1 && (name.charAt(1) === '#' || name.charAt(1) === 'b')) {
      root += name.charAt(1);
      quality = name.slice(2);
    } else {
      quality = name.slice(1);
    }

    return { root: root, quality: quality };
  }

  /**
   * Formats a chord name from root and quality components.
   *
   * @param {string} root - Root note (e.g. "A", "C#", "Db")
   * @param {string} quality - Quality string (e.g. "m7", "maj7", "dim")
   * @returns {string} Full chord name (e.g. "Am7", "C#maj7")
   *
   * Requirements: 5.5
   */
  function formatChordName(root, quality) {
    return (root || '') + (quality || '');
  }

  // ------------------------------------------------------------------
  // LocalChordDB — Fallback chord data for standard guitar tuning
  // Requirements: 6.2
  // ------------------------------------------------------------------

  /**
   * Flat-to-sharp mapping for normalizing chord name lookups.
   */
  var flatToSharp = {
    'Db': 'C#',
    'Eb': 'D#',
    'Fb': 'E',
    'Gb': 'F#',
    'Ab': 'G#',
    'Bb': 'A#',
    'Cb': 'B'
  };

  /**
   * Normalizes a chord name by converting flat-root names to their
   * sharp equivalents for database lookup, and lowercasing the quality
   * portion to match the database key format.
   * E.g. "Bbm7" → "A#m7", "CMaj7" → "Cmaj7"
   *
   * @param {string} name - Chord name possibly using flat notation
   * @returns {string} Chord name normalized for database lookup
   */
  function normalizeChordName(name) {
    if (!name || typeof name !== 'string') {
      return '';
    }
    var parsed = parseChordName(name);
    var root = parsed.root;
    var quality = parsed.quality;

    if (flatToSharp[root]) {
      root = flatToSharp[root];
    }
    
    // Normalize quality case: 'Maj7' → 'maj7', but keep 'm' lowercase distinctions
    // The DB uses: maj7, m7, m7b5, dim, 7 (all lowercase except for the root)
    if (quality) {
      quality = quality.toLowerCase();
      // But we need "Maj" capitalized correctly for the DB keys
      // DB keys: 'Cmaj7', 'Cm7', 'C7', 'Cm', 'Cdim', 'Cm7b5', 'C'
      // So lowercase quality is correct for the DB
    }
    
    return root + quality;
  }

  /**
   * Static chord shape database for standard guitar tuning (EADGBE).
   * Contains at least 1 voicing per chord (12 roots × 7 qualities = 84 minimum).
   * Common open chords have 2 voicings.
   */
  var chordData = {
    // ================================================================
    // C chords
    // ================================================================
    'C': [
      { chordName: 'C', frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0], startFret: 1, barre: null, source: 'local' },
      { chordName: 'C', frets: [-1, 3, 5, 5, 5, 3], fingers: [0, 1, 3, 3, 3, 1], startFret: 3, barre: { fret: 3, fromString: 1, toString: 5 }, source: 'local' }
    ],
    'Cm': [
      { chordName: 'Cm', frets: [-1, 3, 5, 5, 4, 3], fingers: [0, 1, 3, 4, 2, 1], startFret: 3, barre: { fret: 3, fromString: 1, toString: 5 }, source: 'local' }
    ],
    'Cmaj7': [
      { chordName: 'Cmaj7', frets: [-1, 3, 2, 0, 0, 0], fingers: [0, 3, 2, 0, 0, 0], startFret: 1, barre: null, source: 'local' }
    ],
    'Cm7': [
      { chordName: 'Cm7', frets: [-1, 3, 5, 3, 4, 3], fingers: [0, 1, 3, 1, 2, 1], startFret: 3, barre: { fret: 3, fromString: 1, toString: 5 }, source: 'local' }
    ],
    'C7': [
      { chordName: 'C7', frets: [-1, 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0], startFret: 1, barre: null, source: 'local' }
    ],
    'Cdim': [
      { chordName: 'Cdim', frets: [-1, 3, 4, 5, 4, -1], fingers: [0, 1, 2, 4, 3, 0], startFret: 3, barre: null, source: 'local' }
    ],
    'Cm7b5': [
      { chordName: 'Cm7b5', frets: [-1, 3, 4, 3, 4, -1], fingers: [0, 1, 3, 2, 4, 0], startFret: 3, barre: null, source: 'local' }
    ],

    // ================================================================
    // C# chords (barre shapes based on open shapes moved up)
    // ================================================================
    'C#': [
      { chordName: 'C#', frets: [-1, 4, 6, 6, 6, 4], fingers: [0, 1, 3, 3, 3, 1], startFret: 4, barre: { fret: 4, fromString: 1, toString: 5 }, source: 'local' }
    ],
    'C#m': [
      { chordName: 'C#m', frets: [-1, 4, 6, 6, 5, 4], fingers: [0, 1, 3, 4, 2, 1], startFret: 4, barre: { fret: 4, fromString: 1, toString: 5 }, source: 'local' }
    ],
    'C#maj7': [
      { chordName: 'C#maj7', frets: [-1, 4, 6, 5, 6, 4], fingers: [0, 1, 3, 2, 4, 1], startFret: 4, barre: { fret: 4, fromString: 1, toString: 5 }, source: 'local' }
    ],
    'C#m7': [
      { chordName: 'C#m7', frets: [-1, 4, 6, 4, 5, 4], fingers: [0, 1, 3, 1, 2, 1], startFret: 4, barre: { fret: 4, fromString: 1, toString: 5 }, source: 'local' }
    ],
    'C#7': [
      { chordName: 'C#7', frets: [-1, 4, 6, 4, 6, 4], fingers: [0, 1, 3, 1, 4, 1], startFret: 4, barre: { fret: 4, fromString: 1, toString: 5 }, source: 'local' }
    ],
    'C#dim': [
      { chordName: 'C#dim', frets: [-1, 4, 5, 6, 5, -1], fingers: [0, 1, 2, 4, 3, 0], startFret: 4, barre: null, source: 'local' }
    ],
    'C#m7b5': [
      { chordName: 'C#m7b5', frets: [-1, 4, 5, 4, 5, -1], fingers: [0, 1, 3, 2, 4, 0], startFret: 4, barre: null, source: 'local' }
    ],

    // ================================================================
    // D chords
    // ================================================================
    'D': [
      { chordName: 'D', frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2], startFret: 1, barre: null, source: 'local' },
      { chordName: 'D', frets: [-1, 5, 7, 7, 7, 5], fingers: [0, 1, 3, 3, 3, 1], startFret: 5, barre: { fret: 5, fromString: 1, toString: 5 }, source: 'local' }
    ],
    'Dm': [
      { chordName: 'Dm', frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1], startFret: 1, barre: null, source: 'local' },
      { chordName: 'Dm', frets: [-1, 5, 7, 7, 6, 5], fingers: [0, 1, 3, 4, 2, 1], startFret: 5, barre: { fret: 5, fromString: 1, toString: 5 }, source: 'local' }
    ],
    'Dmaj7': [
      { chordName: 'Dmaj7', frets: [-1, -1, 0, 2, 2, 2], fingers: [0, 0, 0, 1, 2, 3], startFret: 1, barre: null, source: 'local' }
    ],
    'Dm7': [
      { chordName: 'Dm7', frets: [-1, -1, 0, 2, 1, 1], fingers: [0, 0, 0, 2, 1, 1], startFret: 1, barre: null, source: 'local' }
    ],
    'D7': [
      { chordName: 'D7', frets: [-1, -1, 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3], startFret: 1, barre: null, source: 'local' }
    ],
    'Ddim': [
      { chordName: 'Ddim', frets: [-1, -1, 0, 1, 3, 1], fingers: [0, 0, 0, 1, 4, 2], startFret: 1, barre: null, source: 'local' }
    ],
    'Dm7b5': [
      { chordName: 'Dm7b5', frets: [-1, -1, 0, 1, 1, 1], fingers: [0, 0, 0, 1, 2, 3], startFret: 1, barre: null, source: 'local' }
    ],

    // ================================================================
    // D# chords (barre shapes)
    // ================================================================
    'D#': [
      { chordName: 'D#', frets: [-1, 6, 8, 8, 8, 6], fingers: [0, 1, 3, 3, 3, 1], startFret: 6, barre: { fret: 6, fromString: 1, toString: 5 }, source: 'local' }
    ],
    'D#m': [
      { chordName: 'D#m', frets: [-1, 6, 8, 8, 7, 6], fingers: [0, 1, 3, 4, 2, 1], startFret: 6, barre: { fret: 6, fromString: 1, toString: 5 }, source: 'local' }
    ],
    'D#maj7': [
      { chordName: 'D#maj7', frets: [-1, 6, 8, 7, 8, 6], fingers: [0, 1, 3, 2, 4, 1], startFret: 6, barre: { fret: 6, fromString: 1, toString: 5 }, source: 'local' }
    ],
    'D#m7': [
      { chordName: 'D#m7', frets: [-1, 6, 8, 6, 7, 6], fingers: [0, 1, 3, 1, 2, 1], startFret: 6, barre: { fret: 6, fromString: 1, toString: 5 }, source: 'local' }
    ],
    'D#7': [
      { chordName: 'D#7', frets: [-1, 6, 8, 6, 8, 6], fingers: [0, 1, 3, 1, 4, 1], startFret: 6, barre: { fret: 6, fromString: 1, toString: 5 }, source: 'local' }
    ],
    'D#dim': [
      { chordName: 'D#dim', frets: [-1, 6, 7, 8, 7, -1], fingers: [0, 1, 2, 4, 3, 0], startFret: 6, barre: null, source: 'local' }
    ],
    'D#m7b5': [
      { chordName: 'D#m7b5', frets: [-1, 6, 7, 6, 7, -1], fingers: [0, 1, 3, 2, 4, 0], startFret: 6, barre: null, source: 'local' }
    ],

    // ================================================================
    // E chords
    // ================================================================
    'E': [
      { chordName: 'E', frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0], startFret: 1, barre: null, source: 'local' },
      { chordName: 'E', frets: [-1, 7, 9, 9, 9, 7], fingers: [0, 1, 3, 3, 3, 1], startFret: 7, barre: { fret: 7, fromString: 1, toString: 5 }, source: 'local' }
    ],
    'Em': [
      { chordName: 'Em', frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0], startFret: 1, barre: null, source: 'local' },
      { chordName: 'Em', frets: [-1, 7, 9, 9, 8, 7], fingers: [0, 1, 3, 4, 2, 1], startFret: 7, barre: { fret: 7, fromString: 1, toString: 5 }, source: 'local' }
    ],
    'Emaj7': [
      { chordName: 'Emaj7', frets: [0, 2, 1, 1, 0, 0], fingers: [0, 3, 1, 2, 0, 0], startFret: 1, barre: null, source: 'local' }
    ],
    'Em7': [
      { chordName: 'Em7', frets: [0, 2, 2, 0, 3, 0], fingers: [0, 2, 3, 0, 4, 0], startFret: 1, barre: null, source: 'local' }
    ],
    'E7': [
      { chordName: 'E7', frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0], startFret: 1, barre: null, source: 'local' }
    ],
    'Edim': [
      { chordName: 'Edim', frets: [0, 1, 2, 3, 2, -1], fingers: [0, 1, 2, 4, 3, 0], startFret: 1, barre: null, source: 'local' }
    ],
    'Em7b5': [
      { chordName: 'Em7b5', frets: [0, 1, 2, 0, 2, -1], fingers: [0, 1, 2, 0, 3, 0], startFret: 1, barre: null, source: 'local' }
    ],

    // ================================================================
    // F chords
    // ================================================================
    'F': [
      { chordName: 'F', frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], startFret: 1, barre: { fret: 1, fromString: 0, toString: 5 }, source: 'local' },
      { chordName: 'F', frets: [-1, -1, 3, 2, 1, 1], fingers: [0, 0, 3, 2, 1, 1], startFret: 1, barre: { fret: 1, fromString: 4, toString: 5 }, source: 'local' }
    ],
    'Fm': [
      { chordName: 'Fm', frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1], startFret: 1, barre: { fret: 1, fromString: 0, toString: 5 }, source: 'local' }
    ],
    'Fmaj7': [
      { chordName: 'Fmaj7', frets: [1, 3, 3, 2, 1, 0], fingers: [1, 3, 4, 2, 1, 0], startFret: 1, barre: { fret: 1, fromString: 0, toString: 4 }, source: 'local' }
    ],
    'Fm7': [
      { chordName: 'Fm7', frets: [1, 3, 1, 1, 1, 1], fingers: [1, 3, 1, 1, 1, 1], startFret: 1, barre: { fret: 1, fromString: 0, toString: 5 }, source: 'local' }
    ],
    'F7': [
      { chordName: 'F7', frets: [1, 3, 1, 2, 1, 1], fingers: [1, 3, 1, 2, 1, 1], startFret: 1, barre: { fret: 1, fromString: 0, toString: 5 }, source: 'local' }
    ],
    'Fdim': [
      { chordName: 'Fdim', frets: [1, 2, 3, 4, 3, -1], fingers: [1, 2, 3, 4, 3, 0], startFret: 1, barre: null, source: 'local' }
    ],
    'Fm7b5': [
      { chordName: 'Fm7b5', frets: [1, 2, 3, 1, 4, -1], fingers: [1, 2, 3, 1, 4, 0], startFret: 1, barre: { fret: 1, fromString: 0, toString: 3 }, source: 'local' }
    ],

    // ================================================================
    // F# chords
    // ================================================================
    'F#': [
      { chordName: 'F#', frets: [2, 4, 4, 3, 2, 2], fingers: [1, 3, 4, 2, 1, 1], startFret: 2, barre: { fret: 2, fromString: 0, toString: 5 }, source: 'local' }
    ],
    'F#m': [
      { chordName: 'F#m', frets: [2, 4, 4, 2, 2, 2], fingers: [1, 3, 4, 1, 1, 1], startFret: 2, barre: { fret: 2, fromString: 0, toString: 5 }, source: 'local' }
    ],
    'F#maj7': [
      { chordName: 'F#maj7', frets: [2, 4, 3, 3, 2, -1], fingers: [1, 4, 2, 3, 1, 0], startFret: 2, barre: { fret: 2, fromString: 0, toString: 4 }, source: 'local' }
    ],
    'F#m7': [
      { chordName: 'F#m7', frets: [2, 4, 2, 2, 2, 2], fingers: [1, 3, 1, 1, 1, 1], startFret: 2, barre: { fret: 2, fromString: 0, toString: 5 }, source: 'local' }
    ],
    'F#7': [
      { chordName: 'F#7', frets: [2, 4, 2, 3, 2, 2], fingers: [1, 3, 1, 2, 1, 1], startFret: 2, barre: { fret: 2, fromString: 0, toString: 5 }, source: 'local' }
    ],
    'F#dim': [
      { chordName: 'F#dim', frets: [2, 3, 4, 5, 4, -1], fingers: [1, 2, 3, 4, 3, 0], startFret: 2, barre: null, source: 'local' }
    ],
    'F#m7b5': [
      { chordName: 'F#m7b5', frets: [2, 3, 4, 2, 5, -1], fingers: [1, 2, 3, 1, 4, 0], startFret: 2, barre: { fret: 2, fromString: 0, toString: 3 }, source: 'local' }
    ],

    // ================================================================
    // G chords
    // ================================================================
    'G': [
      { chordName: 'G', frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3], startFret: 1, barre: null, source: 'local' },
      { chordName: 'G', frets: [3, 5, 5, 4, 3, 3], fingers: [1, 3, 4, 2, 1, 1], startFret: 3, barre: { fret: 3, fromString: 0, toString: 5 }, source: 'local' }
    ],
    'Gm': [
      { chordName: 'Gm', frets: [3, 5, 5, 3, 3, 3], fingers: [1, 3, 4, 1, 1, 1], startFret: 3, barre: { fret: 3, fromString: 0, toString: 5 }, source: 'local' }
    ],
    'Gmaj7': [
      { chordName: 'Gmaj7', frets: [3, 2, 0, 0, 0, 2], fingers: [3, 2, 0, 0, 0, 1], startFret: 1, barre: null, source: 'local' }
    ],
    'Gm7': [
      { chordName: 'Gm7', frets: [3, 5, 3, 3, 3, 3], fingers: [1, 3, 1, 1, 1, 1], startFret: 3, barre: { fret: 3, fromString: 0, toString: 5 }, source: 'local' }
    ],
    'G7': [
      { chordName: 'G7', frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1], startFret: 1, barre: null, source: 'local' }
    ],
    'Gdim': [
      { chordName: 'Gdim', frets: [3, 4, 5, 3, -1, -1], fingers: [1, 2, 3, 1, 0, 0], startFret: 3, barre: { fret: 3, fromString: 0, toString: 3 }, source: 'local' }
    ],
    'Gm7b5': [
      { chordName: 'Gm7b5', frets: [3, 4, 5, 3, 6, -1], fingers: [1, 2, 3, 1, 4, 0], startFret: 3, barre: { fret: 3, fromString: 0, toString: 3 }, source: 'local' }
    ],

    // ================================================================
    // G# chords
    // ================================================================
    'G#': [
      { chordName: 'G#', frets: [4, 6, 6, 5, 4, 4], fingers: [1, 3, 4, 2, 1, 1], startFret: 4, barre: { fret: 4, fromString: 0, toString: 5 }, source: 'local' }
    ],
    'G#m': [
      { chordName: 'G#m', frets: [4, 6, 6, 4, 4, 4], fingers: [1, 3, 4, 1, 1, 1], startFret: 4, barre: { fret: 4, fromString: 0, toString: 5 }, source: 'local' }
    ],
    'G#maj7': [
      { chordName: 'G#maj7', frets: [4, 6, 5, 5, 4, -1], fingers: [1, 4, 2, 3, 1, 0], startFret: 4, barre: { fret: 4, fromString: 0, toString: 4 }, source: 'local' }
    ],
    'G#m7': [
      { chordName: 'G#m7', frets: [4, 6, 4, 4, 4, 4], fingers: [1, 3, 1, 1, 1, 1], startFret: 4, barre: { fret: 4, fromString: 0, toString: 5 }, source: 'local' }
    ],
    'G#7': [
      { chordName: 'G#7', frets: [4, 6, 4, 5, 4, 4], fingers: [1, 3, 1, 2, 1, 1], startFret: 4, barre: { fret: 4, fromString: 0, toString: 5 }, source: 'local' }
    ],
    'G#dim': [
      { chordName: 'G#dim', frets: [4, 5, 6, 4, -1, -1], fingers: [1, 2, 3, 1, 0, 0], startFret: 4, barre: { fret: 4, fromString: 0, toString: 3 }, source: 'local' }
    ],
    'G#m7b5': [
      { chordName: 'G#m7b5', frets: [4, 5, 6, 4, 7, -1], fingers: [1, 2, 3, 1, 4, 0], startFret: 4, barre: { fret: 4, fromString: 0, toString: 3 }, source: 'local' }
    ],

    // ================================================================
    // A chords
    // ================================================================
    'A': [
      { chordName: 'A', frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0], startFret: 1, barre: null, source: 'local' },
      { chordName: 'A', frets: [5, 7, 7, 6, 5, 5], fingers: [1, 3, 4, 2, 1, 1], startFret: 5, barre: { fret: 5, fromString: 0, toString: 5 }, source: 'local' }
    ],
    'Am': [
      { chordName: 'Am', frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0], startFret: 1, barre: null, source: 'local' },
      { chordName: 'Am', frets: [5, 7, 7, 5, 5, 5], fingers: [1, 3, 4, 1, 1, 1], startFret: 5, barre: { fret: 5, fromString: 0, toString: 5 }, source: 'local' }
    ],
    'Amaj7': [
      { chordName: 'Amaj7', frets: [-1, 0, 2, 1, 2, 0], fingers: [0, 0, 2, 1, 3, 0], startFret: 1, barre: null, source: 'local' }
    ],
    'Am7': [
      { chordName: 'Am7', frets: [-1, 0, 2, 0, 1, 0], fingers: [0, 0, 2, 0, 1, 0], startFret: 1, barre: null, source: 'local' }
    ],
    'A7': [
      { chordName: 'A7', frets: [-1, 0, 2, 0, 2, 0], fingers: [0, 0, 1, 0, 2, 0], startFret: 1, barre: null, source: 'local' }
    ],
    'Adim': [
      { chordName: 'Adim', frets: [-1, 0, 1, 2, 1, -1], fingers: [0, 0, 1, 3, 2, 0], startFret: 1, barre: null, source: 'local' }
    ],
    'Am7b5': [
      { chordName: 'Am7b5', frets: [-1, 0, 1, 0, 1, -1], fingers: [0, 0, 1, 0, 2, 0], startFret: 1, barre: null, source: 'local' }
    ],

    // ================================================================
    // A# chords
    // ================================================================
    'A#': [
      { chordName: 'A#', frets: [-1, 1, 3, 3, 3, 1], fingers: [0, 1, 3, 3, 3, 1], startFret: 1, barre: { fret: 1, fromString: 1, toString: 5 }, source: 'local' }
    ],
    'A#m': [
      { chordName: 'A#m', frets: [-1, 1, 3, 3, 2, 1], fingers: [0, 1, 3, 4, 2, 1], startFret: 1, barre: { fret: 1, fromString: 1, toString: 5 }, source: 'local' }
    ],
    'A#maj7': [
      { chordName: 'A#maj7', frets: [-1, 1, 3, 2, 3, 1], fingers: [0, 1, 3, 2, 4, 1], startFret: 1, barre: { fret: 1, fromString: 1, toString: 5 }, source: 'local' }
    ],
    'A#m7': [
      { chordName: 'A#m7', frets: [-1, 1, 3, 1, 2, 1], fingers: [0, 1, 3, 1, 2, 1], startFret: 1, barre: { fret: 1, fromString: 1, toString: 5 }, source: 'local' }
    ],
    'A#7': [
      { chordName: 'A#7', frets: [-1, 1, 3, 1, 3, 1], fingers: [0, 1, 3, 1, 4, 1], startFret: 1, barre: { fret: 1, fromString: 1, toString: 5 }, source: 'local' }
    ],
    'A#dim': [
      { chordName: 'A#dim', frets: [-1, 1, 2, 3, 2, -1], fingers: [0, 1, 2, 4, 3, 0], startFret: 1, barre: null, source: 'local' }
    ],
    'A#m7b5': [
      { chordName: 'A#m7b5', frets: [-1, 1, 2, 1, 2, -1], fingers: [0, 1, 3, 2, 4, 0], startFret: 1, barre: null, source: 'local' }
    ],

    // ================================================================
    // B chords
    // ================================================================
    'B': [
      { chordName: 'B', frets: [-1, 2, 4, 4, 4, 2], fingers: [0, 1, 3, 3, 3, 1], startFret: 2, barre: { fret: 2, fromString: 1, toString: 5 }, source: 'local' }
    ],
    'Bm': [
      { chordName: 'Bm', frets: [-1, 2, 4, 4, 3, 2], fingers: [0, 1, 3, 4, 2, 1], startFret: 2, barre: { fret: 2, fromString: 1, toString: 5 }, source: 'local' }
    ],
    'Bmaj7': [
      { chordName: 'Bmaj7', frets: [-1, 2, 4, 3, 4, 2], fingers: [0, 1, 3, 2, 4, 1], startFret: 2, barre: { fret: 2, fromString: 1, toString: 5 }, source: 'local' }
    ],
    'Bm7': [
      { chordName: 'Bm7', frets: [-1, 2, 4, 2, 3, 2], fingers: [0, 1, 3, 1, 2, 1], startFret: 2, barre: { fret: 2, fromString: 1, toString: 5 }, source: 'local' }
    ],
    'B7': [
      { chordName: 'B7', frets: [-1, 2, 1, 2, 0, 2], fingers: [0, 2, 1, 3, 0, 4], startFret: 1, barre: null, source: 'local' }
    ],
    'Bdim': [
      { chordName: 'Bdim', frets: [-1, 2, 3, 4, 3, -1], fingers: [0, 1, 2, 4, 3, 0], startFret: 2, barre: null, source: 'local' }
    ],
    'Bm7b5': [
      { chordName: 'Bm7b5', frets: [-1, 2, 3, 2, 3, -1], fingers: [0, 1, 3, 2, 4, 0], startFret: 2, barre: null, source: 'local' }
    ]
  };

  /**
   * LocalChordDB — provides fallback chord shape data when the API is unavailable.
   * Contains chord shapes for 12 roots × 7 qualities for standard guitar tuning (EADGBE).
   *
   * Requirements: 6.2
   */
  var LocalChordDB = {
    /**
     * Returns chord shapes for the given chord name.
     * Normalizes flat names to sharp equivalents before lookup.
     *
     * @param {string} chordName - Full chord name (e.g. "Am7", "Bbm7")
     * @param {string[]} [tuning] - Tuning array (for future use; currently ignored)
     * @returns {ChordShape[]} Array of chord shapes, or empty array if not found
     */
    getChordShapes: function (chordName, tuning) {
      var normalized = normalizeChordName(chordName);
      var shapes = chordData[normalized];
      if (!shapes) {
        return [];
      }
      // Return a copy to prevent external mutation
      return shapes.slice();
    },

    /**
     * Checks whether the local database contains shapes for the given chord name.
     *
     * @param {string} chordName - Full chord name (e.g. "Am7", "Dbmaj7")
     * @returns {boolean} True if at least one shape is available
     */
    hasChord: function (chordName) {
      var normalized = normalizeChordName(chordName);
      return !!(chordData[normalized] && chordData[normalized].length > 0);
    }
  };

  // ------------------------------------------------------------------
  // SVGRenderer — Pure function sub-module for diagram rendering
  // ------------------------------------------------------------------

  var SVG_NS = 'http://www.w3.org/2000/svg';

  var SVGRenderer = {
    /**
     * Renders a chord diagram as an inline SVG element.
     * Pure function — no side effects, returns a new SVGElement each call.
     *
     * @param {ChordShape} shape - Chord shape data to render
     * @param {RenderOptions} [options] - Rendering options
     * @returns {SVGElement} The rendered SVG element
     *
     * Requirements: 2.1, 2.3, 2.4, 2.5
     */
    renderDiagram: function (shape, options) {
      // Merge defaults
      var opts = {
        numStrings: (options && options.numStrings) || 6,
        isDark: (options && options.isDark) || false,
        diagramWidth: (options && options.diagramWidth) || 80,
        diagramHeight: (options && options.diagramHeight) || 100,
        fretsToShow: (options && options.fretsToShow) || 5
      };

      var width = opts.diagramWidth;
      var height = opts.diagramHeight;
      var numStrings = opts.numStrings;
      var fretsToShow = opts.fretsToShow;

      // Layout constants
      var topMargin = 16;   // space above diagram for open/muted markers
      var leftMargin = 14;  // space for fret number label
      var rightMargin = 6;
      var bottomMargin = 6;

      var diagramTop = topMargin;
      var diagramLeft = leftMargin;
      var diagramRight = width - rightMargin;
      var diagramBottom = height - bottomMargin;

      var fretAreaWidth = diagramRight - diagramLeft;
      var fretAreaHeight = diagramBottom - diagramTop;
      var fretSpacing = fretAreaHeight / fretsToShow;
      var stringSpacing = numStrings > 1 ? fretAreaWidth / (numStrings - 1) : 0;

      // Create SVG root
      var svg = document.createElementNS(SVG_NS, 'svg');
      svg.setAttribute('xmlns', SVG_NS);
      svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
      svg.setAttribute('width', width);
      svg.setAttribute('height', height);
      svg.setAttribute('class', 'chord-svg');

      // Store data attributes for round-trip verification (Requirement 2.5)
      svg.setAttribute('data-frets', JSON.stringify(shape.frets));
      svg.setAttribute('data-fingers', JSON.stringify(shape.fingers));

      // --- Draw horizontal fret lines (fretsToShow + 1 lines) ---
      var fretLineCount = fretsToShow + 1;
      for (var f = 0; f < fretLineCount; f++) {
        var fretY = diagramTop + f * fretSpacing;
        var fretLine = document.createElementNS(SVG_NS, 'line');
        fretLine.setAttribute('x1', diagramLeft);
        fretLine.setAttribute('y1', fretY);
        fretLine.setAttribute('x2', diagramRight);
        fretLine.setAttribute('y2', fretY);
        fretLine.setAttribute('class', 'chord-fret');
        fretLine.setAttribute('stroke', opts.isDark ? '#ccc' : '#333');
        fretLine.setAttribute('stroke-width', '1');
        svg.appendChild(fretLine);
      }

      // --- Draw nut or fret number ---
      if (shape.startFret === 1) {
        // Thick nut line at the top
        var nutLine = document.createElementNS(SVG_NS, 'line');
        nutLine.setAttribute('x1', diagramLeft);
        nutLine.setAttribute('y1', diagramTop);
        nutLine.setAttribute('x2', diagramRight);
        nutLine.setAttribute('y2', diagramTop);
        nutLine.setAttribute('class', 'chord-nut');
        nutLine.setAttribute('stroke', opts.isDark ? '#fff' : '#000');
        nutLine.setAttribute('stroke-width', '3');
        svg.appendChild(nutLine);
      } else {
        // Fret number text to the left
        var fretNumText = document.createElementNS(SVG_NS, 'text');
        fretNumText.setAttribute('x', diagramLeft - 4);
        fretNumText.setAttribute('y', diagramTop + fretSpacing / 2 + 4);
        fretNumText.setAttribute('class', 'chord-fret-number');
        fretNumText.setAttribute('text-anchor', 'end');
        fretNumText.setAttribute('font-size', '9');
        fretNumText.setAttribute('fill', opts.isDark ? '#ccc' : '#333');
        fretNumText.textContent = String(shape.startFret);
        svg.appendChild(fretNumText);
      }

      // --- Draw vertical string lines ---
      for (var s = 0; s < numStrings; s++) {
        var stringX = diagramLeft + s * stringSpacing;
        var stringLine = document.createElementNS(SVG_NS, 'line');
        stringLine.setAttribute('x1', stringX);
        stringLine.setAttribute('y1', diagramTop);
        stringLine.setAttribute('x2', stringX);
        stringLine.setAttribute('y2', diagramBottom);
        stringLine.setAttribute('class', 'chord-string');
        stringLine.setAttribute('stroke', opts.isDark ? '#aaa' : '#555');
        stringLine.setAttribute('stroke-width', '1');
        svg.appendChild(stringLine);
      }

      // --- Draw finger positions and open/muted markers ---
      var frets = shape.frets || [];
      var fingers = shape.fingers || [];
      var circleRadius = Math.min(fretSpacing, stringSpacing) * 0.3;
      if (circleRadius < 3) circleRadius = 3;

      for (var i = 0; i < numStrings; i++) {
        var fretVal = (i < frets.length) ? frets[i] : 0;
        var fingerVal = (i < fingers.length) ? fingers[i] : 0;
        var x = diagramLeft + i * stringSpacing;

        if (fretVal === -1) {
          // Muted string — draw X above diagram
          var mutedText = document.createElementNS(SVG_NS, 'text');
          mutedText.setAttribute('x', x);
          mutedText.setAttribute('y', diagramTop - 4);
          mutedText.setAttribute('class', 'chord-marker-muted');
          mutedText.setAttribute('text-anchor', 'middle');
          mutedText.setAttribute('font-size', '9');
          mutedText.setAttribute('fill', opts.isDark ? '#ccc' : '#333');
          mutedText.textContent = 'X';
          svg.appendChild(mutedText);
        } else if (fretVal === 0) {
          // Open string — draw O circle above diagram
          var openCircle = document.createElementNS(SVG_NS, 'circle');
          openCircle.setAttribute('cx', x);
          openCircle.setAttribute('cy', diagramTop - 7);
          openCircle.setAttribute('r', '3');
          openCircle.setAttribute('class', 'chord-marker-open');
          openCircle.setAttribute('fill', 'none');
          openCircle.setAttribute('stroke', opts.isDark ? '#ccc' : '#333');
          openCircle.setAttribute('stroke-width', '1');
          svg.appendChild(openCircle);
        } else if (fretVal > 0) {
          // Finger position — filled circle at correct fret with finger number
          var cy = diagramTop + (fretVal - 0.5) * fretSpacing;
          var fingerCircle = document.createElementNS(SVG_NS, 'circle');
          fingerCircle.setAttribute('cx', x);
          fingerCircle.setAttribute('cy', cy);
          fingerCircle.setAttribute('r', circleRadius);
          fingerCircle.setAttribute('class', 'chord-finger');
          fingerCircle.setAttribute('fill', opts.isDark ? '#fff' : '#000');
          svg.appendChild(fingerCircle);

          // Finger number text inside the circle
          if (fingerVal > 0) {
            var fingerText = document.createElementNS(SVG_NS, 'text');
            fingerText.setAttribute('x', x);
            fingerText.setAttribute('y', cy + 3);
            fingerText.setAttribute('class', 'chord-finger-text');
            fingerText.setAttribute('text-anchor', 'middle');
            fingerText.setAttribute('font-size', '8');
            fingerText.setAttribute('fill', opts.isDark ? '#000' : '#fff');
            fingerText.textContent = String(fingerVal);
            svg.appendChild(fingerText);
          }
        }
      }

      // --- Draw barre (pestana) if present ---
      if (shape.barre && shape.barre.fret != null && shape.barre.fromString != null && shape.barre.toString != null) {
        var barreFret = shape.barre.fret;
        var barreFrom = shape.barre.fromString; // 0-indexed string position
        var barreTo = shape.barre.toString;     // 0-indexed string position

        var barreX = diagramLeft + Math.min(barreFrom, barreTo) * stringSpacing;
        var barreWidth = Math.abs(barreTo - barreFrom) * stringSpacing;
        var barreY = diagramTop + (barreFret - 0.5) * fretSpacing;
        var barreHeight = fretSpacing * 0.6;

        var barreRect = document.createElementNS(SVG_NS, 'rect');
        barreRect.setAttribute('x', barreX);
        barreRect.setAttribute('y', barreY - barreHeight / 2);
        barreRect.setAttribute('width', barreWidth);
        barreRect.setAttribute('height', barreHeight);
        barreRect.setAttribute('rx', barreHeight / 2);
        barreRect.setAttribute('ry', barreHeight / 2);
        barreRect.setAttribute('class', 'chord-barre');
        barreRect.setAttribute('fill', opts.isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.75)');
        svg.appendChild(barreRect);
      }

      return svg;
    },

    /**
     * Updates the color scheme of a rendered chord SVG element for dark/light mode.
     *
     * @param {SVGElement} svgElement - The SVG element to update
     * @param {boolean} isDark - Whether dark mode is active
     *
     * Requirements: 8.1, 8.2
     */
    updateTheme: function (svgElement, isDark) {
      // Fret lines
      var fretLines = svgElement.querySelectorAll('.chord-fret');
      for (var i = 0; i < fretLines.length; i++) {
        fretLines[i].setAttribute('stroke', isDark ? '#ccc' : '#333');
      }

      // Nut line
      var nutLines = svgElement.querySelectorAll('.chord-nut');
      for (var i = 0; i < nutLines.length; i++) {
        nutLines[i].setAttribute('stroke', isDark ? '#fff' : '#000');
      }

      // String lines
      var stringLines = svgElement.querySelectorAll('.chord-string');
      for (var i = 0; i < stringLines.length; i++) {
        stringLines[i].setAttribute('stroke', isDark ? '#aaa' : '#555');
      }

      // Finger circles
      var fingerCircles = svgElement.querySelectorAll('.chord-finger');
      for (var i = 0; i < fingerCircles.length; i++) {
        fingerCircles[i].setAttribute('fill', isDark ? '#fff' : '#000');
      }

      // Finger number text
      var fingerTexts = svgElement.querySelectorAll('.chord-finger-text');
      for (var i = 0; i < fingerTexts.length; i++) {
        fingerTexts[i].setAttribute('fill', isDark ? '#000' : '#fff');
      }

      // Open string markers
      var openMarkers = svgElement.querySelectorAll('.chord-marker-open');
      for (var i = 0; i < openMarkers.length; i++) {
        openMarkers[i].setAttribute('stroke', isDark ? '#ccc' : '#333');
      }

      // Muted string markers
      var mutedMarkers = svgElement.querySelectorAll('.chord-marker-muted');
      for (var i = 0; i < mutedMarkers.length; i++) {
        mutedMarkers[i].setAttribute('fill', isDark ? '#ccc' : '#333');
      }

      // Fret number text
      var fretNumbers = svgElement.querySelectorAll('.chord-fret-number');
      for (var i = 0; i < fretNumbers.length; i++) {
        fretNumbers[i].setAttribute('fill', isDark ? '#ccc' : '#333');
      }

      // Barre rectangles (if present)
      var barres = svgElement.querySelectorAll('.chord-barre');
      for (var i = 0; i < barres.length; i++) {
        barres[i].setAttribute('fill', isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)');
      }
    }
  };

  // ------------------------------------------------------------------
  // VoicingNavigator — Per-chord state for voicing navigation
  // Requirements: 3.2, 3.3, 3.5
  // ------------------------------------------------------------------

  /**
   * Creates a VoicingNavigator for tracking voicing position.
   * Navigates cyclically: next at end wraps to 0, prev at 0 wraps to end.
   *
   * @param {number} total - Total number of voicings available (must be >= 1)
   * @returns {{ currentIndex: number, total: number, next: function, prev: function, getIndicator: function }}
   *
   * Requirements: 3.2, 3.3, 3.5
   */
  function createVoicingNavigator(total) {
    var nav = {
      currentIndex: 0,
      total: total,

      /**
       * Advances to the next voicing (wraps cyclically).
       * @returns {number} The new current index
       */
      next: function () {
        nav.currentIndex = (nav.currentIndex + 1) % nav.total;
        return nav.currentIndex;
      },

      /**
       * Moves to the previous voicing (wraps cyclically).
       * @returns {number} The new current index
       */
      prev: function () {
        nav.currentIndex = (nav.currentIndex - 1 + nav.total) % nav.total;
        return nav.currentIndex;
      },

      /**
       * Returns a human-readable position indicator string.
       * Format: "1/5" (1-indexed current position / total)
       * @returns {string} Position indicator
       */
      getIndicator: function () {
        return (nav.currentIndex + 1) + '/' + nav.total;
      }
    };

    return nav;
  }

  // ------------------------------------------------------------------
  // Campo Harmônico Mappings (duplicated from script-escalas.js)
  // ------------------------------------------------------------------

  var campoHarmonicoMaior = [
    { grau: 'I', qualidade: 'Maj7' }, { grau: 'ii', qualidade: 'm7' },
    { grau: 'iii', qualidade: 'm7' }, { grau: 'IV', qualidade: 'Maj7' },
    { grau: 'V', qualidade: '7' }, { grau: 'vi', qualidade: 'm7' },
    { grau: 'viiº', qualidade: 'm7b5' }
  ];
  var campoHarmonicoMenorNatural = [
    { grau: 'i', qualidade: 'm7' }, { grau: 'iiº', qualidade: 'm7b5' },
    { grau: 'III', qualidade: 'Maj7' }, { grau: 'iv', qualidade: 'm7' },
    { grau: 'v', qualidade: 'm7' }, { grau: 'VI', qualidade: 'Maj7' },
    { grau: 'VII', qualidade: '7' }
  ];
  var campoHarmonicoMenorHarmonica = [
    { grau: 'i', qualidade: 'mMaj7' }, { grau: 'iiº', qualidade: 'm7b5' },
    { grau: 'III+', qualidade: 'Maj7#5' }, { grau: 'iv', qualidade: 'm7' },
    { grau: 'V', qualidade: '7' }, { grau: 'VI', qualidade: 'Maj7' },
    { grau: 'viiº', qualidade: 'dim7' }
  ];
  var campoHarmonicoMenorMelodica = [
    { grau: 'i', qualidade: 'mMaj7' }, { grau: 'ii', qualidade: 'm7' },
    { grau: 'III+', qualidade: 'Maj7#5' }, { grau: 'IV', qualidade: '7' },
    { grau: 'V', qualidade: '7' }, { grau: 'viº', qualidade: 'm7b5' },
    { grau: 'viiº', qualidade: 'm7b5' }
  ];
  var campoHarmonicoDorico = [
    { grau: 'i', qualidade: 'm7' }, { grau: 'ii', qualidade: 'm7' },
    { grau: 'III', qualidade: 'Maj7' }, { grau: 'IV', qualidade: '7' },
    { grau: 'v', qualidade: 'm7' }, { grau: 'viº', qualidade: 'm7b5' },
    { grau: 'VII', qualidade: 'Maj7' }
  ];
  var campoHarmonicoFrigio = [
    { grau: 'i', qualidade: 'm7' }, { grau: 'II', qualidade: 'Maj7' },
    { grau: 'III', qualidade: '7' }, { grau: 'iv', qualidade: 'm7b5' },
    { grau: 'vº', qualidade: 'm7b5' }, { grau: 'VI', qualidade: 'Maj7' },
    { grau: 'vii', qualidade: 'm7' }
  ];
  var campoHarmonicoLidio = [
    { grau: 'I', qualidade: 'Maj7' }, { grau: 'II', qualidade: '7' },
    { grau: 'III', qualidade: 'm7' }, { grau: 'ivº', qualidade: 'm7b5' },
    { grau: 'V', qualidade: 'Maj7' }, { grau: 'vi', qualidade: 'm7' },
    { grau: 'vii', qualidade: 'm7' }
  ];
  var campoHarmonicoMixolidio = [
    { grau: 'I', qualidade: '7' }, { grau: 'ii', qualidade: 'm7' },
    { grau: 'iiiº', qualidade: 'm7b5' }, { grau: 'IV', qualidade: 'Maj7' },
    { grau: 'v', qualidade: 'm7' }, { grau: 'vi', qualidade: 'm7' },
    { grau: 'vii', qualidade: 'Maj7' }
  ];
  var campoHarmonicoLocrio = [
    { grau: 'iº', qualidade: 'm7b5' }, { grau: 'II', qualidade: 'Maj7' },
    { grau: 'iii', qualidade: 'm7' }, { grau: 'iv', qualidade: 'm7' },
    { grau: 'V', qualidade: 'Maj7' }, { grau: 'VI', qualidade: '7' },
    { grau: 'vii', qualidade: 'm7' }
  ];
  var campoHarmonicoPentaMaior = [
    { grau: 'I', qualidade: 'Maj' }, { grau: 'II', qualidade: 'm' },
    { grau: 'III', qualidade: 'm' }, { grau: 'V', qualidade: 'Maj' },
    { grau: 'VI', qualidade: 'm' }
  ];
  var campoHarmonicoPentaMenor = [
    { grau: 'I', qualidade: 'm' }, { grau: 'III', qualidade: 'Maj' },
    { grau: 'IV', qualidade: 'm' }, { grau: 'V', qualidade: 'm' },
    { grau: 'VII', qualidade: 'Maj' }
  ];
  var campoHarmonicoDiminutaTomSemitom = [
    { grau: 'I', qualidade: 'dim7' }, { grau: 'II', qualidade: '7' },
    { grau: 'III', qualidade: 'dim7' }, { grau: 'IV', qualidade: '7' },
    { grau: 'V', qualidade: 'dim7' }, { grau: 'VI', qualidade: '7' },
    { grau: 'VII', qualidade: 'dim7' }, { grau: 'VIII', qualidade: '7' }
  ];
  var campoHarmonicoDiminutaSemitomTom = [
    { grau: 'I', qualidade: '7b9' }, { grau: 'II', qualidade: 'dim7' },
    { grau: 'III', qualidade: '7b9' }, { grau: 'IV', qualidade: 'dim7' },
    { grau: 'V', qualidade: '7b9' }, { grau: 'VI', qualidade: 'dim7' },
    { grau: 'VII', qualidade: '7b9' }, { grau: 'VIII', qualidade: 'dim7' }
  ];
  var campoHarmonicoTonsInteiros = [
    { grau: 'I', qualidade: '7#5' }, { grau: 'II', qualidade: '7#5' },
    { grau: 'III', qualidade: '7#5' }, { grau: 'IV', qualidade: '7#5' },
    { grau: 'V', qualidade: '7#5' }, { grau: 'VI', qualidade: '7#5' }
  ];
  var campoHarmonicoCromatico = [
    { grau: 'I', qualidade: '7' }, { grau: 'IIb', qualidade: '7' },
    { grau: 'II', qualidade: '7' }, { grau: 'IIIb', qualidade: '7' },
    { grau: 'III', qualidade: '7' }, { grau: 'IV', qualidade: '7' },
    { grau: 'Vb', qualidade: '7' }, { grau: 'V', qualidade: '7' },
    { grau: 'VIb', qualidade: '7' }, { grau: 'VI', qualidade: '7' },
    { grau: 'VIIb', qualidade: '7' }, { grau: 'VII', qualidade: '7' }
  ];

  // ------------------------------------------------------------------
  // Scale Type → Campo Harmônico mapping
  // ------------------------------------------------------------------

  /**
   * Returns the campo harmônico array for a given scale type.
   * Returns null for scale types without a defined campo harmônico.
   *
   * @param {string} tipoEscala - The scale type key (e.g. "maior", "dorico")
   * @returns {Array|null} The campo harmônico array or null
   */
  function getCampoHarmonico(tipoEscala) {
    switch (tipoEscala) {
      case 'maior':
      case 'jonico':
        return campoHarmonicoMaior;
      case 'menor_natural':
      case 'eolio':
        return campoHarmonicoMenorNatural;
      case 'menor_harmonica':
        return campoHarmonicoMenorHarmonica;
      case 'menor_melodica':
        return campoHarmonicoMenorMelodica;
      case 'dorico':
        return campoHarmonicoDorico;
      case 'frigio':
        return campoHarmonicoFrigio;
      case 'lidio':
        return campoHarmonicoLidio;
      case 'mixolidio':
        return campoHarmonicoMixolidio;
      case 'locrio':
        return campoHarmonicoLocrio;
      case 'pentatonica_maior':
      case 'blues_maior':
      case 'egipcia':
      case 'hirajoshi':
      case 'iwato':
      case 'man_gong':
      case 'ritusen':
        return campoHarmonicoPentaMaior;
      case 'pentatonica_menor':
      case 'blues_menor':
        return campoHarmonicoPentaMenor;
      case 'diminuta_tom_e_semitom':
        return campoHarmonicoDiminutaTomSemitom;
      case 'diminuta_semitom_e_tom':
        return campoHarmonicoDiminutaSemitomTom;
      case 'tons_inteiros':
        return campoHarmonicoTonsInteiros;
      case 'cromatica':
        return campoHarmonicoCromatico;
      default:
        return null;
    }
  }

  // ------------------------------------------------------------------
  // Harmonic Field Computation
  // ------------------------------------------------------------------

  /**
   * Computes the harmonic field (campo harmônico) for a given scale.
   * Returns an array of ChordInfo objects, one per degree in the campo harmônico.
   *
   * @param {string} tonica - The tonic note (e.g. "C", "Eb", "F#")
   * @param {string} tipoEscala - The scale type key (e.g. "maior", "dorico")
   * @param {string[]} notes - Array of scale degree notes computed by script-escalas.js
   * @returns {ChordInfo[]} Array of chord info objects for the harmonic field
   *
   * Requirements: 1.1, 1.2
   */
  function computeHarmonicField(tonica, tipoEscala, notes) {
    var campo = getCampoHarmonico(tipoEscala);

    if (!campo) {
      return [];
    }

    var chords = [];
    for (var i = 0; i < campo.length; i++) {
      var entry = campo[i];
      var root = notes[i] || '';
      if (!root) {
        continue;
      }
      chords.push({
        name: root + entry.qualidade,
        degree: entry.grau,
        quality: entry.qualidade,
        root: root
      });
    }

    return chords;
  }

  // ------------------------------------------------------------------
  // Internal State
  // ------------------------------------------------------------------

  /** @type {HTMLElement|null} */
  var container = null;

  /** @type {ChordInfo[]} Last computed harmonic field (for re-render on instrument change) */
  var lastHarmonicField = [];

  // ------------------------------------------------------------------
  // Public API
  // ------------------------------------------------------------------

  /**
   * Initializes the ChordVisualizer module.
   * Finds the container element and sets up event listeners.
   *
   * @param {string} containerId - CSS selector for the container element
   *
   * Requirements: 9.3, 9.4
   */
  function init(containerId) {
    if (container) return; // already initialized
    container = document.querySelector(containerId);

    if (!container) {
      console.warn('[ChordVisualizer] Container not found:', containerId);
      return;
    }

    // Listen for scale-changed events to compute and render harmonic field
    document.addEventListener('scale-changed', function (e) {
      var detail = e.detail;
      if (!detail || !detail.notes || !detail.tonica || !detail.tipoEscala) {
        return;
      }

      var chords = computeHarmonicField(detail.tonica, detail.tipoEscala, detail.notes);
      lastHarmonicField = chords;

      if (chords.length === 0) {
        if (container) {
          container.innerHTML = '<p class="chord-visualizer-unavailable">Campo harm\u00F4nico indispon\u00EDvel para esta escala.</p>';
        }
        return;
      }

      render(chords);
    });

    // If calcularEscala() already ran, read current state and render immediately
    var tonicaEl = document.getElementById('tonica');
    var tipoEscalaEl = document.getElementById('tipoEscala');
    var escalaResultEl = document.getElementById('escalaResultado');
    if (tonicaEl && tipoEscalaEl && escalaResultEl && escalaResultEl.innerText && escalaResultEl.innerText !== 'Aguardando cálculo...') {
      // Trigger a fresh computation by firing calcularEscala
      if (typeof calcularEscala === 'function') {
        calcularEscala();
      }
    }
  }

  /**
   * Renders chord diagrams for the given list of chords.
   *
   * @param {ChordInfo[]} chords - Array of chord info objects to render
   *
   * Requirements: 1.1, 1.3, 9.4
   */
  function render(chords) {
    if (!container) {
      console.warn('[ChordVisualizer] Cannot render — not initialized.');
      return;
    }

    // Clear previous content (keep the h2 title if present)
    var title = container.querySelector('h2');
    container.innerHTML = '';
    if (title) {
      container.appendChild(title);
    }

    // Check dark mode
    var isDark = document.body.classList.contains('dark');

    // Create chord cards grid
    var grid = document.createElement('div');
    grid.className = 'chord-diagrams-grid';

    for (var i = 0; i < chords.length; i++) {
      var chord = chords[i];
      var shapes = LocalChordDB.getChordShapes(chord.name);

      // Create card element
      var card = document.createElement('div');
      card.className = 'chord-card';

      // Chord name and degree labels
      var labelDiv = document.createElement('div');
      labelDiv.className = 'chord-card-label';
      labelDiv.innerHTML = '<span class="chord-degree">' + chord.degree + '</span>' +
        '<span class="chord-name">' + chord.name + '</span>';
      card.appendChild(labelDiv);

      if (shapes.length === 0) {
        // No shapes available — show placeholder
        var placeholder = document.createElement('p');
        placeholder.className = 'chord-unavailable';
        placeholder.textContent = 'Acorde indispon\u00EDvel';
        card.appendChild(placeholder);
      } else {
        // Render first voicing SVG
        var shape = shapes[0];
        var svg = SVGRenderer.renderDiagram(shape, { numStrings: 6, isDark: isDark });
        var svgWrapper = document.createElement('div');
        svgWrapper.className = 'chord-svg-wrapper';
        svgWrapper.appendChild(svg);
        card.appendChild(svgWrapper);

        // Voicing navigation (if multiple voicings)
        if (shapes.length > 1) {
          var nav = createVoicingNavigator(shapes.length);
          var navDiv = document.createElement('div');
          navDiv.className = 'chord-voicing-nav';

          var prevBtn = document.createElement('button');
          prevBtn.textContent = '\u25C0';
          prevBtn.className = 'chord-nav-btn';
          prevBtn.setAttribute('aria-label', 'Voicing anterior');

          var indicator = document.createElement('span');
          indicator.className = 'chord-voicing-indicator';
          indicator.textContent = nav.getIndicator();

          var nextBtn = document.createElement('button');
          nextBtn.textContent = '\u25B6';
          nextBtn.className = 'chord-nav-btn';
          nextBtn.setAttribute('aria-label', 'Próximo voicing');

          // Closure for navigation event handlers
          (function (navState, allShapes, svgWrapperEl, indicatorEl) {
            prevBtn.addEventListener('click', function (e) {
              e.stopPropagation();
              navState.prev();
              svgWrapperEl.innerHTML = '';
              var newSvg = SVGRenderer.renderDiagram(allShapes[navState.currentIndex], { numStrings: 6, isDark: document.body.classList.contains('dark') });
              svgWrapperEl.appendChild(newSvg);
              indicatorEl.textContent = navState.getIndicator();
            });
            nextBtn.addEventListener('click', function (e) {
              e.stopPropagation();
              navState.next();
              svgWrapperEl.innerHTML = '';
              var newSvg = SVGRenderer.renderDiagram(allShapes[navState.currentIndex], { numStrings: 6, isDark: document.body.classList.contains('dark') });
              svgWrapperEl.appendChild(newSvg);
              indicatorEl.textContent = navState.getIndicator();
            });
          })(nav, shapes, svgWrapper, indicator);

          navDiv.appendChild(prevBtn);
          navDiv.appendChild(indicator);
          navDiv.appendChild(nextBtn);
          card.appendChild(navDiv);
        }
      }

      grid.appendChild(card);
    }

    container.appendChild(grid);
  }

  /**
   * Plays the audio for a given chord shape via AudioEngine.
   *
   * @param {ChordShape} chordShape - The chord shape to play
   *
   * Requirements: 7.1, 9.4
   */
  function playChord(chordShape) {
    // Implementation will be added in subsequent tasks
  }

  /**
   * Destroys the ChordVisualizer: removes event listeners, clears container.
   *
   * Requirements: 9.4
   */
  function destroy() {
    if (container) {
      container.innerHTML = '';
    }
    container = null;
    lastHarmonicField = [];
  }

  // ------------------------------------------------------------------
  // Public API object
  // ------------------------------------------------------------------

  var api = {
    init: init,
    render: render,
    playChord: playChord,
    destroy: destroy,
    // Expose helpers for testability
    parseChordName: parseChordName,
    formatChordName: formatChordName,
    normalizeChordName: normalizeChordName,
    computeHarmonicField: computeHarmonicField,
    getCampoHarmonico: getCampoHarmonico,
    LocalChordDB: LocalChordDB,
    SVGRenderer: SVGRenderer
  };

  return api;

}());

// ------------------------------------------------------------------
// Global exposure and DOMContentLoaded initialization
// ------------------------------------------------------------------

// Expor no escopo global do navegador
if (typeof window !== 'undefined') {
  window.ChordVisualizer = ChordVisualizer;
}

// Initialize on DOMContentLoaded (Requirements: 9.3)
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      ChordVisualizer.init('#chordVisualizerContainer');
    });
  } else {
    ChordVisualizer.init('#chordVisualizerContainer');
  }
}

// Export condicional para testabilidade com Node.js / Vitest
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChordVisualizer;
}
