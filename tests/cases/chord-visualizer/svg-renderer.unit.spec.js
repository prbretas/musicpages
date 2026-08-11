/**
 * Unit tests for SVGRenderer.renderDiagram()
 * Validates: Requirements 2.1, 2.3, 2.4, 2.5
 */
import { describe, it, expect } from 'vitest'

const ChordVisualizer = require('../../../scripts/script-chord-diagrams.js');

const SVGRenderer = ChordVisualizer.SVGRenderer;

describe('SVGRenderer.renderDiagram', () => {
  // Standard Am7 open position shape
  const amShape = {
    chordName: 'Am7',
    frets: [-1, 0, 2, 0, 1, 0],
    fingers: [0, 0, 2, 0, 1, 0],
    startFret: 1,
    barre: null,
    source: 'local'
  };

  const defaultOptions = {
    numStrings: 6,
    isDark: false,
    diagramWidth: 80,
    diagramHeight: 100,
    fretsToShow: 5
  };

  it('should return an SVG element with class chord-svg', () => {
    const svg = SVGRenderer.renderDiagram(amShape, defaultOptions);
    expect(svg.tagName).toBe('svg');
    expect(svg.getAttribute('class')).toBe('chord-svg');
  });

  it('should set viewBox and dimensions', () => {
    const svg = SVGRenderer.renderDiagram(amShape, defaultOptions);
    expect(svg.getAttribute('viewBox')).toBe('0 0 80 100');
    expect(svg.getAttribute('width')).toBe('80');
    expect(svg.getAttribute('height')).toBe('100');
  });

  it('should draw the correct number of fret lines (fretsToShow + 1)', () => {
    const svg = SVGRenderer.renderDiagram(amShape, defaultOptions);
    const fretLines = svg.querySelectorAll('.chord-fret');
    expect(fretLines.length).toBe(6); // 5 + 1
  });

  it('should draw the correct number of string lines', () => {
    const svg = SVGRenderer.renderDiagram(amShape, defaultOptions);
    const stringLines = svg.querySelectorAll('.chord-string');
    expect(stringLines.length).toBe(6);
  });

  it('should draw a nut line when startFret === 1', () => {
    const svg = SVGRenderer.renderDiagram(amShape, defaultOptions);
    const nut = svg.querySelector('.chord-nut');
    expect(nut).not.toBeNull();
    expect(nut.getAttribute('stroke-width')).toBe('3');
  });

  it('should NOT draw a nut when startFret > 1', () => {
    const shape = { ...amShape, startFret: 5, frets: [0, 1, 2, 3, 1, 0], fingers: [0, 1, 2, 3, 1, 0] };
    const svg = SVGRenderer.renderDiagram(shape, defaultOptions);
    const nut = svg.querySelector('.chord-nut');
    expect(nut).toBeNull();
  });

  it('should display fret number when startFret > 1', () => {
    const shape = { ...amShape, startFret: 5, frets: [0, 1, 2, 3, 1, 0], fingers: [0, 1, 2, 3, 1, 0] };
    const svg = SVGRenderer.renderDiagram(shape, defaultOptions);
    const fretNum = svg.querySelector('.chord-fret-number');
    expect(fretNum).not.toBeNull();
    expect(fretNum.textContent).toBe('5');
  });

  it('should NOT display fret number when startFret === 1', () => {
    const svg = SVGRenderer.renderDiagram(amShape, defaultOptions);
    const fretNum = svg.querySelector('.chord-fret-number');
    expect(fretNum).toBeNull();
  });

  it('should draw muted (X) markers for frets with -1', () => {
    const svg = SVGRenderer.renderDiagram(amShape, defaultOptions);
    const mutedMarkers = svg.querySelectorAll('.chord-marker-muted');
    expect(mutedMarkers.length).toBe(1); // first string is muted
    expect(mutedMarkers[0].textContent).toBe('X');
  });

  it('should draw open (O) markers for frets with 0', () => {
    const svg = SVGRenderer.renderDiagram(amShape, defaultOptions);
    const openMarkers = svg.querySelectorAll('.chord-marker-open');
    expect(openMarkers.length).toBe(3); // strings 2, 4, 6 are open
  });

  it('should draw finger circles for frets > 0', () => {
    const svg = SVGRenderer.renderDiagram(amShape, defaultOptions);
    const fingerCircles = svg.querySelectorAll('.chord-finger');
    expect(fingerCircles.length).toBe(2); // frets 2 and 1
  });

  it('should draw finger text for non-zero finger values', () => {
    const svg = SVGRenderer.renderDiagram(amShape, defaultOptions);
    const fingerTexts = svg.querySelectorAll('.chord-finger-text');
    expect(fingerTexts.length).toBe(2);
    // Fingers 2 and 1 (for fret positions 2 and 1)
    const texts = Array.from(fingerTexts).map(t => t.textContent);
    expect(texts).toContain('2');
    expect(texts).toContain('1');
  });

  it('should store data-frets attribute for round-trip verification', () => {
    const svg = SVGRenderer.renderDiagram(amShape, defaultOptions);
    const dataFrets = svg.getAttribute('data-frets');
    expect(JSON.parse(dataFrets)).toEqual([-1, 0, 2, 0, 1, 0]);
  });

  it('should store data-fingers attribute for round-trip verification', () => {
    const svg = SVGRenderer.renderDiagram(amShape, defaultOptions);
    const dataFingers = svg.getAttribute('data-fingers');
    expect(JSON.parse(dataFingers)).toEqual([0, 0, 2, 0, 1, 0]);
  });

  it('should adapt to different numStrings (e.g., 4 for ukulele)', () => {
    const ukeShape = {
      chordName: 'C',
      frets: [0, 0, 0, 3],
      fingers: [0, 0, 0, 3],
      startFret: 1,
      barre: null
    };
    const svg = SVGRenderer.renderDiagram(ukeShape, { ...defaultOptions, numStrings: 4 });
    const stringLines = svg.querySelectorAll('.chord-string');
    expect(stringLines.length).toBe(4);
  });

  it('should use default options when not provided', () => {
    const svg = SVGRenderer.renderDiagram(amShape);
    expect(svg.getAttribute('width')).toBe('80');
    expect(svg.getAttribute('height')).toBe('100');
    const stringLines = svg.querySelectorAll('.chord-string');
    expect(stringLines.length).toBe(6);
    const fretLines = svg.querySelectorAll('.chord-fret');
    expect(fretLines.length).toBe(6); // 5 + 1
  });
});
