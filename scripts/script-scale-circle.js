/**
 * script-scale-circle.js
 * ScaleCircle IIFE — Circular visualization of chromatic notes with scale polygon overlay.
 *
 * Renders a 400×400 SVG inside the target container with 12 note circles arranged
 * clock-wise starting from C at the 12 o'clock position. Highlights notes belonging
 * to the current scale, draws a polygon connecting them, and supports a compare mode
 * with a second scale overlay.
 *
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7
 */

/* global AudioEngine, document, window, calcularEscala, notasCromaticas, estruturasEscalas, getChromaticIndex */

var ScaleCircle = (function () {
  'use strict';

  // ---------------------------------------------------------------
  // Constants
  // ---------------------------------------------------------------
  var CHROMATIC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  var SVG_NS = 'http://www.w3.org/2000/svg';
  var SVG_SIZE = 400;
  var CENTER_X = SVG_SIZE / 2;
  var CENTER_Y = SVG_SIZE / 2;
  var RADIUS = 150;
  var NOTE_CIRCLE_RADIUS = 20;
  var DEFAULT_START_ANGLE = -Math.PI / 2; // 12 o'clock

  // Colors
  var COLOR_PRIMARY = '#4a90d9';
  var COLOR_COMPARE = '#e87c3e';
  var COLOR_SHARED = '#7c3ee8';
  var COLOR_DEFAULT_FILL = '#f0f0f0';
  var COLOR_DEFAULT_STROKE = '#666';
  var COLOR_TEXT = '#333';

  // ---------------------------------------------------------------
  // State
  // ---------------------------------------------------------------
  var _svg = null;
  var _noteElements = []; // Array of { circle, text, note }
  var _polygonPrimary = null;
  var _polygonCompare = null;
  var _currentScaleNotes = [];
  var _currentCompareNotes = [];
  var _compareModeEnabled = false;
  var _container = null;
  var _compareControls = null;

  // ---------------------------------------------------------------
  // Pure Functions (exported for testing)
  // ---------------------------------------------------------------

  /**
   * Computes the x/y positions for 12 chromatic notes arranged in a circle.
   * @param {number} centerX - Center X coordinate
   * @param {number} centerY - Center Y coordinate
   * @param {number} radius - Circle radius
   * @param {number} startAngle - Starting angle in radians (default: -PI/2 for 12 o'clock)
   * @returns {Array<{x: number, y: number, note: string, index: number, angle: number}>}
   */
  function computeNotePositions(centerX, centerY, radius, startAngle) {
    if (startAngle === undefined || startAngle === null) {
      startAngle = DEFAULT_START_ANGLE;
    }
    var positions = [];
    for (var i = 0; i < 12; i++) {
      var angle = startAngle + (2 * Math.PI * i) / 12;
      positions.push({
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        note: CHROMATIC_NOTES[i],
        index: i,
        angle: angle
      });
    }
    return positions;
  }

  /**
   * Computes the SVG polygon points string connecting notes that belong to the scale.
   * @param {Array<{x: number, y: number, note: string, index: number}>} notePositions - All 12 note positions
   * @param {Array<string>} scaleNotes - Notes in the scale (e.g. ['C', 'D', 'E', 'F', 'G', 'A', 'B'])
   * @returns {string} SVG points attribute value (e.g. "200,50 350,200 ...")
   */
  function computeScalePolygon(notePositions, scaleNotes) {
    if (!scaleNotes || scaleNotes.length === 0) {
      return '';
    }
    // Normalize scale notes to chromatic index for matching
    var scaleIndices = scaleNotes.map(function (note) {
      return chromaticIndex(note);
    }).filter(function (idx) {
      return idx !== -1;
    });

    var points = [];
    for (var i = 0; i < notePositions.length; i++) {
      if (scaleIndices.indexOf(notePositions[i].index) !== -1) {
        points.push(notePositions[i].x + ',' + notePositions[i].y);
      }
    }
    return points.join(' ');
  }

  /**
   * Computes the overlap between two scales.
   * @param {Array<string>} scaleA - First scale notes
   * @param {Array<string>} scaleB - Second scale notes
   * @returns {{shared: Array<string>, onlyA: Array<string>, onlyB: Array<string>}}
   */
  function computeOverlap(scaleA, scaleB) {
    var indicesA = (scaleA || []).map(chromaticIndex).filter(function (i) { return i !== -1; });
    var indicesB = (scaleB || []).map(chromaticIndex).filter(function (i) { return i !== -1; });

    var shared = [];
    var onlyA = [];
    var onlyB = [];

    for (var i = 0; i < indicesA.length; i++) {
      if (indicesB.indexOf(indicesA[i]) !== -1) {
        shared.push(CHROMATIC_NOTES[indicesA[i]]);
      } else {
        onlyA.push(CHROMATIC_NOTES[indicesA[i]]);
      }
    }

    for (var j = 0; j < indicesB.length; j++) {
      if (indicesA.indexOf(indicesB[j]) === -1) {
        onlyB.push(CHROMATIC_NOTES[indicesB[j]]);
      }
    }

    return { shared: shared, onlyA: onlyA, onlyB: onlyB };
  }

  // ---------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------

  /**
   * Convert a note name (possibly with flats) to a chromatic index 0-11.
   */
  function chromaticIndex(noteName) {
    if (!noteName) return -1;
    var idx = CHROMATIC_NOTES.indexOf(noteName);
    if (idx !== -1) return idx;
    // Handle flats
    var flatMap = { 'Db': 1, 'Eb': 3, 'Gb': 6, 'Ab': 8, 'Bb': 10, 'Fb': 4, 'Cb': 11 };
    var upper = noteName.charAt(0).toUpperCase() + noteName.slice(1);
    if (flatMap[upper] !== undefined) return flatMap[upper];
    return -1;
  }

  /**
   * Convert a note name to MIDI note number (octave 4).
   */
  function noteToMidi(noteName) {
    var idx = chromaticIndex(noteName);
    if (idx === -1) return 60; // fallback C4
    return 60 + idx; // C4 = 60
  }

  /**
   * Create an SVG element with attributes.
   */
  function svgEl(tag, attrs) {
    var el = document.createElementNS(SVG_NS, tag);
    if (attrs) {
      for (var key in attrs) {
        if (attrs.hasOwnProperty(key)) {
          el.setAttribute(key, attrs[key]);
        }
      }
    }
    return el;
  }

  // ---------------------------------------------------------------
  // DOM Functions
  // ---------------------------------------------------------------

  /**
   * Initializes the Scale Circle visualization inside the given container.
   * @param {string} containerId - ID of the container element
   */
  function init(containerId) {
    _container = document.getElementById(containerId);
    if (!_container) return;

    // Build SVG
    _svg = svgEl('svg', {
      width: SVG_SIZE,
      height: SVG_SIZE,
      viewBox: '0 0 ' + SVG_SIZE + ' ' + SVG_SIZE,
      'aria-label': 'Círculo de Escalas'
    });
    _svg.style.display = 'block';
    _svg.style.margin = '0 auto';

    // Create polygon layers (behind note circles)
    _polygonPrimary = svgEl('polygon', {
      points: '',
      fill: COLOR_PRIMARY,
      'fill-opacity': '0.2',
      stroke: COLOR_PRIMARY,
      'stroke-width': '2'
    });
    _svg.appendChild(_polygonPrimary);

    _polygonCompare = svgEl('polygon', {
      points: '',
      fill: COLOR_COMPARE,
      'fill-opacity': '0.15',
      stroke: COLOR_COMPARE,
      'stroke-width': '2',
      'stroke-dasharray': '5,3'
    });
    _svg.appendChild(_polygonCompare);

    // Compute positions and create note circles
    var positions = computeNotePositions(CENTER_X, CENTER_Y, RADIUS, DEFAULT_START_ANGLE);
    _noteElements = [];

    for (var i = 0; i < positions.length; i++) {
      var pos = positions[i];

      // Group for click handling
      var group = svgEl('g', { 'data-note': pos.note, style: 'cursor: pointer;' });

      var circle = svgEl('circle', {
        cx: pos.x,
        cy: pos.y,
        r: NOTE_CIRCLE_RADIUS,
        fill: COLOR_DEFAULT_FILL,
        stroke: COLOR_DEFAULT_STROKE,
        'stroke-width': '2'
      });

      var text = svgEl('text', {
        x: pos.x,
        y: pos.y + 5,
        'text-anchor': 'middle',
        'font-size': '12',
        'font-family': 'Arial, sans-serif',
        'font-weight': 'bold',
        fill: COLOR_TEXT,
        'pointer-events': 'none'
      });
      text.textContent = pos.note;

      group.appendChild(circle);
      group.appendChild(text);
      _svg.appendChild(group);

      _noteElements.push({ circle: circle, text: text, note: pos.note, group: group });

      // Click listener
      (function (noteName) {
        group.addEventListener('click', function () {
          handleNoteClick(noteName);
        });
      })(pos.note);
    }

    _container.appendChild(_svg);

    // Add compare mode toggle button
    var compareBtn = document.createElement('button');
    compareBtn.textContent = 'Comparar Escalas';
    compareBtn.className = 'scale-circle-compare-btn';
    compareBtn.addEventListener('click', function () {
      if (_compareModeEnabled) {
        disableCompareMode();
        compareBtn.textContent = 'Comparar Escalas';
        compareBtn.classList.remove('scale-circle-compare-btn-active');
      } else {
        enableCompareMode();
        compareBtn.textContent = '✕ Fechar Comparação';
        compareBtn.classList.add('scale-circle-compare-btn-active');
      }
    });
    _container.appendChild(compareBtn);

    // Compare controls (hidden initially)
    _compareControls = document.createElement('div');
    _compareControls.className = 'scale-circle-compare-controls';
    _compareControls.style.display = 'none';
    _compareControls.innerHTML = buildCompareControlsHTML();
    _container.appendChild(_compareControls);

    // Listen for scale-changed event
    document.addEventListener('scale-changed', function (e) {
      var detail = e.detail || {};
      _currentScaleNotes = detail.notes || [];
      render(_currentScaleNotes, _compareModeEnabled ? _currentCompareNotes : null);
    });
  }

  /**
   * Builds the HTML for compare mode selectors.
   */
  function buildCompareControlsHTML() {
    var tonicOptions = CHROMATIC_NOTES.map(function (note) {
      return '<option value="' + note + '">' + note + '</option>';
    }).join('');

    var scaleTypes = [
      { value: 'maior', label: 'Maior' },
      { value: 'menor_natural', label: 'Menor Natural' },
      { value: 'menor_harmonica', label: 'Menor Harmônica' },
      { value: 'menor_melodica', label: 'Menor Melódica' },
      { value: 'dorico', label: 'Dórico' },
      { value: 'frigio', label: 'Frígio' },
      { value: 'lidio', label: 'Lídio' },
      { value: 'mixolidio', label: 'Mixolídio' },
      { value: 'pentatonica_maior', label: 'Pentatônica Maior' },
      { value: 'pentatonica_menor', label: 'Pentatônica Menor' }
    ];

    var scaleOptions = scaleTypes.map(function (s) {
      return '<option value="' + s.value + '">' + s.label + '</option>';
    }).join('');

    return '<label>Tônica: <select class="compare-tonica">' + tonicOptions + '</select></label>' +
      ' <label>Escala: <select class="compare-tipo">' + scaleOptions + '</select></label>';
  }

  /**
   * Computes scale notes for a given tonic and scale type using interval structure.
   */
  function computeScaleFromSelection(tonica, tipoEscala) {
    // Use the global estruturasEscalas if available, otherwise define locally
    var structures = (typeof estruturasEscalas !== 'undefined') ? estruturasEscalas : {
      maior: [2, 2, 1, 2, 2, 2, 1],
      menor_natural: [2, 1, 2, 2, 1, 2, 2],
      menor_harmonica: [2, 1, 2, 2, 1, 3, 1],
      menor_melodica: [2, 1, 2, 2, 2, 2, 1],
      dorico: [2, 1, 2, 2, 2, 1, 2],
      frigio: [1, 2, 2, 2, 1, 2, 2],
      lidio: [2, 2, 2, 1, 2, 2, 1],
      mixolidio: [2, 2, 1, 2, 2, 1, 2],
      pentatonica_maior: [2, 2, 3, 2, 3],
      pentatonica_menor: [3, 2, 2, 3, 2]
    };

    var intervals = structures[tipoEscala];
    if (!intervals) return [];

    var startIndex = chromaticIndex(tonica);
    if (startIndex === -1) return [];

    var notes = [CHROMATIC_NOTES[startIndex]];
    var current = startIndex;
    for (var i = 0; i < intervals.length - 1; i++) {
      current = (current + intervals[i]) % 12;
      notes.push(CHROMATIC_NOTES[current]);
    }
    return notes;
  }

  /**
   * Enables compare mode: shows secondary tonica/scale type selectors.
   */
  function enableCompareMode() {
    if (!_compareControls) return;
    _compareModeEnabled = true;
    _compareControls.style.display = 'block';

    var tonicaSelect = _compareControls.querySelector('.compare-tonica');
    var tipoSelect = _compareControls.querySelector('.compare-tipo');

    function updateCompare() {
      var tonica = tonicaSelect.value;
      var tipo = tipoSelect.value;
      _currentCompareNotes = computeScaleFromSelection(tonica, tipo);
      render(_currentScaleNotes, _currentCompareNotes);
    }

    tonicaSelect.addEventListener('change', updateCompare);
    tipoSelect.addEventListener('change', updateCompare);

    // Trigger initial comparison
    updateCompare();
  }

  /**
   * Disables compare mode: hides selectors, removes compare polygon, resets colors.
   */
  function disableCompareMode() {
    _compareModeEnabled = false;
    _currentCompareNotes = [];

    if (_compareControls) {
      _compareControls.style.display = 'none';
    }

    // Re-render without compare notes
    render(_currentScaleNotes, null);
  }

  /**
   * Renders the scale circle: highlights notes and draws polygon(s).
   * @param {Array<string>} scaleNotes - Primary scale notes
   * @param {Array<string>|null} compareNotes - Compare scale notes (optional)
   */
  function render(scaleNotes, compareNotes) {
    var positions = computeNotePositions(CENTER_X, CENTER_Y, RADIUS, DEFAULT_START_ANGLE);
    var scaleIndices = (scaleNotes || []).map(chromaticIndex).filter(function (i) { return i !== -1; });
    var compareIndices = (compareNotes || []).map(chromaticIndex).filter(function (i) { return i !== -1; });

    var overlap = computeOverlap(scaleNotes || [], compareNotes || []);
    var sharedIndices = overlap.shared.map(chromaticIndex);

    // Update each note circle
    for (var i = 0; i < _noteElements.length; i++) {
      var el = _noteElements[i];
      var noteIdx = chromaticIndex(el.note);
      var inScale = scaleIndices.indexOf(noteIdx) !== -1;
      var inCompare = compareIndices.indexOf(noteIdx) !== -1;
      var inShared = sharedIndices.indexOf(noteIdx) !== -1;

      if (inShared && compareNotes && compareNotes.length > 0) {
        el.circle.setAttribute('fill', COLOR_SHARED);
        el.circle.setAttribute('stroke', COLOR_SHARED);
        el.text.setAttribute('fill', '#fff');
      } else if (inScale) {
        el.circle.setAttribute('fill', COLOR_PRIMARY);
        el.circle.setAttribute('stroke', COLOR_PRIMARY);
        el.text.setAttribute('fill', '#fff');
      } else if (inCompare) {
        el.circle.setAttribute('fill', COLOR_COMPARE);
        el.circle.setAttribute('stroke', COLOR_COMPARE);
        el.text.setAttribute('fill', '#fff');
      } else {
        el.circle.setAttribute('fill', COLOR_DEFAULT_FILL);
        el.circle.setAttribute('stroke', COLOR_DEFAULT_STROKE);
        el.text.setAttribute('fill', COLOR_TEXT);
      }
    }

    // Update primary polygon
    var primaryPoints = computeScalePolygon(positions, scaleNotes);
    _polygonPrimary.setAttribute('points', primaryPoints);

    // Update compare polygon
    if (compareNotes && compareNotes.length > 0) {
      var comparePoints = computeScalePolygon(positions, compareNotes);
      _polygonCompare.setAttribute('points', comparePoints);
      _polygonCompare.style.display = '';
    } else {
      _polygonCompare.setAttribute('points', '');
      _polygonCompare.style.display = 'none';
    }
  }

  /**
   * Handles a click on a note circle — plays the note via AudioEngine.
   * @param {string} noteName - Name of the clicked note
   */
  function handleNoteClick(noteName) {
    if (typeof AudioEngine !== 'undefined' && AudioEngine.playNote) {
      var midi = noteToMidi(noteName);
      AudioEngine.playNote(midi);
    }
  }

  // ---------------------------------------------------------------
  // Auto-init on DOMContentLoaded
  // ---------------------------------------------------------------
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
      init('scaleCircleContainer');
    });
  }

  // ---------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------
  return {
    init: init,
    render: render,
    enableCompareMode: enableCompareMode,
    disableCompareMode: disableCompareMode,
    handleNoteClick: handleNoteClick,
    computeNotePositions: computeNotePositions,
    computeScalePolygon: computeScalePolygon,
    computeOverlap: computeOverlap
  };
})();
