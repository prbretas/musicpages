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

  it('finger circles use diagram-relative position when startFret > 1 (bug fix)', () => {
    // Bm7b5 shape: frets [-1, 2, 3, 2, 3, -1], startFret: 2.
    // fret value 2 with startFret 2 → relative fret = 1 → circle should be in
    // the FIRST fret space of the diagram (cy close to diagramTop + 0.5 * fretSpacing).
    // Before the fix, fretVal was used directly (rel=2), placing circles one row too low.
    const bm7b5Shape = {
      chordName: 'Bm7b5',
      frets: [-1, 2, 3, 2, 3, -1],
      fingers: [0, 1, 3, 2, 4, 0],
      startFret: 2,
      barre: null,
      source: 'local'
    };

    const opts = { numStrings: 6, isDark: false, diagramWidth: 80, diagramHeight: 100, fretsToShow: 5 };
    const svg = SVGRenderer.renderDiagram(bm7b5Shape, opts);

    // Layout parameters (must match renderDiagram internals)
    const diagramTop = 16;
    const fretAreaHeight = 100 - 6 - diagramTop;  // 78
    const fretSpacing = fretAreaHeight / 5;         // 15.6

    // All finger circles — collect their cy values
    const circles = svg.querySelectorAll('.chord-finger');
    const cyValues = Array.from(circles).map(c => parseFloat(c.getAttribute('cy')));

    // With the fix: fretVal=2, startFret=2 → relFret=1 → cy = 16 + 0.5*15.6 = 23.8
    //              fretVal=3, startFret=2 → relFret=2 → cy = 16 + 1.5*15.6 = 39.4
    // Before the fix: fretVal=2 → cy = 16 + 1.5*15.6 = 39.4  (one row too low)
    const expectedCy1 = diagramTop + 0.5 * fretSpacing;  // relFret 1
    const expectedCy2 = diagramTop + 1.5 * fretSpacing;  // relFret 2

    const tolerance = 0.5;
    const hasCy1 = cyValues.some(cy => Math.abs(cy - expectedCy1) < tolerance);
    const hasCy2 = cyValues.some(cy => Math.abs(cy - expectedCy2) < tolerance);

    expect(hasCy1).toBe(true);  // circles at relative fret 1
    expect(hasCy2).toBe(true);  // circles at relative fret 2

    // None of the circles should be at the OLD (incorrect) position for relFret 2
    // (which was where relFret=1 circles ended up before the fix)
    const oldBugPosition = diagramTop + 1.5 * fretSpacing; // what fretVal=2 produced before fix
    // oldBugPosition equals expectedCy2, which is correct for fretVal=3.
    // So verify there are NO circles at relFret 3 (oldBugPosition+fretSpacing)
    const wrongPosition = diagramTop + 2.5 * fretSpacing;
    const hasWrongPosition = cyValues.some(cy => Math.abs(cy - wrongPosition) < tolerance);
    expect(hasWrongPosition).toBe(false);  // no circles at relFret 3 (no fret value of 4)
  });

  it('startFret:1 circles remain at same position (no regression)', () => {
    // When startFret===1, (startFret-1)===0, so relFret===fretVal — behaviour unchanged.
    const amShape = {
      chordName: 'Am7',
      frets: [-1, 0, 2, 0, 1, 0],
      fingers: [0, 0, 2, 0, 1, 0],
      startFret: 1,
      barre: null,
      source: 'local'
    };
    const opts = { numStrings: 6, isDark: false, diagramWidth: 80, diagramHeight: 100, fretsToShow: 5 };
    const svg = SVGRenderer.renderDiagram(amShape, opts);

    const diagramTop = 16;
    const fretSpacing = (100 - 6 - diagramTop) / 5;

    const circles = svg.querySelectorAll('.chord-finger');
    const cyValues = Array.from(circles).map(c => parseFloat(c.getAttribute('cy')));

    // fretVal=2, startFret=1 → relFret=2 → cy = diagramTop + 1.5 * fretSpacing
    // fretVal=1, startFret=1 → relFret=1 → cy = diagramTop + 0.5 * fretSpacing
    const expectedFret2 = diagramTop + 1.5 * fretSpacing;
    const expectedFret1 = diagramTop + 0.5 * fretSpacing;
    const tol = 0.5;

    expect(cyValues.some(cy => Math.abs(cy - expectedFret2) < tol)).toBe(true);
    expect(cyValues.some(cy => Math.abs(cy - expectedFret1) < tol)).toBe(true);
  });
});
