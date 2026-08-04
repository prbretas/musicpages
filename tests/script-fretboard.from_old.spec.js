import { describe, it, expect, beforeEach } from 'vitest';
import {
  INSTRUMENT_PROFILES,
  noteNameToMidi,
  initializeFretboard,
  normalizeToSharp,
  highlightFretboardNotes,
} from '../Scripts/script-fretboard.js';

describe('script-fretboard', () => {
  beforeEach(() => {
    global.AudioEngine = { isSupported: () => false };
    document.body.innerHTML = `
      <div id="fretboard"></div>
      <select id="instrumentSelect"></select>
      <div id="customTuningPanel"></div>
    `;
  });

  it('renders the high string on top for a 6-string guitar', () => {
    initializeFretboard('fretboard', INSTRUMENT_PROFILES.guitar_6);
    const strings = document.querySelectorAll('.string');
    expect(strings.length).toBe(6);
    expect(strings[0].id).toBe('string-5');
    expect(strings[5].id).toBe('string-0');
  });

  it('converts note name and octave to MIDI correctly', () => {
    expect(noteNameToMidi('C', 4)).toBe(60);
    expect(noteNameToMidi('A', 4)).toBe(69);
    expect(noteNameToMidi('G#', 3)).toBe(56);
  });

  it('normalizes flat note names to sharp equivalents', () => {
    expect(normalizeToSharp('Db')).toBe('C#');
    expect(normalizeToSharp('bb')).toBe('A#');
    expect(normalizeToSharp('E')).toBe('E');
  });

  it('highlights scale notes and tonic notes on the fretboard', () => {
    initializeFretboard('fretboard', INSTRUMENT_PROFILES.guitar_6);
    highlightFretboardNotes(['E', 'G', 'A'], 'E');
    const tonic = document.querySelectorAll('.note-cell-fret.tonic');
    const inScale = document.querySelectorAll('.note-cell-fret.in-scale');
    expect(tonic.length).toBeGreaterThan(0);
    expect(inScale.length).toBeGreaterThan(0);
  });
});
