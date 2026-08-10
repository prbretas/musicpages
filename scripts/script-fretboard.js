/**
 * script-fretboard.js
 * FretboardRenderer — módulo responsável por construir e exibir o fretboard
 * baseado em perfis de instrumentos do InstrumentRegistry.
 *
 * Implementado como IIFE-style com variáveis/funções globais.
 * Compatível com navegadores sem build step (sem ES6 imports/exports).
 *
 * Requirements: 1.3, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 4.1, 4.2, 4.3, 4.4, 4.5, 9.1, 9.2, 9.5
 */

/* global window, document, InstrumentRegistry, AudioEngine, notasEnarmonicas, highlightFretboardNotes */

// ------------------------------------------------------------------
// Constants
// ------------------------------------------------------------------

var NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

var NOTE_COLORS = {
    "C": "color-C",
    "C#": "color-Cs", "Db": "color-Cs",
    "D": "color-D",
    "D#": "color-Ds", "Eb": "color-Ds",
    "E": "color-E",
    "F": "color-F",
    "F#": "color-Fs", "Gb": "color-Fs",
    "G": "color-G",
    "G#": "color-Gs", "Ab": "color-Gs",
    "A": "color-A",
    "A#": "color-As", "Bb": "color-As",
    "B": "color-B"
};

var FRET_WIDTH = 40;       // px per fret cell
var STRING_HEIGHT = 50;    // px per string row
var MAX_HEIGHT = 600;      // px cap

// ------------------------------------------------------------------
// Module-level state
// ------------------------------------------------------------------

/** @type {{ profileId: string, tuning: string[], octaves: number[] }} */
var _activeFretboardState = {
    profileId: 'guitarra-6',
    tuning: ['E', 'A', 'D', 'G', 'B', 'E'],
    octaves: [2, 2, 3, 3, 3, 4]
};

/** @type {{ scaleNotes: string[]|null, tonic: string|null }} */
var _lastScaleState = { scaleNotes: null, tonic: null };

// ------------------------------------------------------------------
// Helper functions
// ------------------------------------------------------------------

/**
 * Returns the chromatic index (0-11) for a note name.
 * @param {string} noteName
 * @returns {number} Index 0-11, or -1 if invalid
 */
function getChromaticIndex(noteName) {
    if (!noteName) return -1;
    var index = NOTE_NAMES.indexOf(noteName);
    if (index !== -1) return index;

    // Handle flats
    var flatMap = {
        'DB': 1, 'EB': 3, 'FB': 4, 'GB': 6, 'AB': 8, 'BB': 10, 'CB': 11
    };
    var upper = noteName.toUpperCase();
    if (flatMap[upper] !== undefined) return flatMap[upper];

    // Handle enharmonics E#=F, B#=C
    var cleaned = noteName.replace('E#', 'F').replace('B#', 'C').replace('Fb', 'E').replace('Cb', 'B');
    index = NOTE_NAMES.indexOf(cleaned);
    if (index !== -1) return index;

    return -1;
}

/**
 * Calculates the note name for a given chromatic index and fret number.
 * @param {number} chromaticIndex - 0-11
 * @param {number} fretNumber - 0-36
 * @returns {string} Note name from NOTE_NAMES
 */
function getNoteName(chromaticIndex, fretNumber) {
    return NOTE_NAMES[(chromaticIndex + fretNumber) % 12];
}

/**
 * Calculates MIDI number for a given octave, chromatic index and fret number.
 * @param {number} octave - 0-8
 * @param {number} chromaticIndex - 0-11
 * @param {number} fretNumber - 0-36
 * @returns {number} MIDI number
 */
function calculateMidi(octave, chromaticIndex, fretNumber) {
    return (octave + 1) * 12 + chromaticIndex + fretNumber;
}

/**
 * Calculates string thickness for a given visual position.
 * Visual index 0 = top (highest pitch, thinnest), N-1 = bottom (lowest pitch, thickest).
 * @param {number} visualIndex - 0-based index from top
 * @param {number} totalStrings - Total number of strings
 * @returns {number} Thickness in px (1 to 4)
 */
function calculateStringThickness(visualIndex, totalStrings) {
    if (totalStrings <= 1) return 1;
    return Math.round(1 + (visualIndex / (totalStrings - 1)) * 3);
}

/**
 * Calculates the fretboard container dimensions for a given profile.
 * @param {number} strings - Number of strings
 * @param {number} frets - Number of frets
 * @returns {{ width: number, height: number }}
 */
function calculateFretboardDimensions(strings, frets) {
    var width = (frets + 1) * FRET_WIDTH;
    var rawHeight = strings * STRING_HEIGHT;
    var height = Math.min(rawHeight, MAX_HEIGHT);
    return { width: width, height: height };
}

// ------------------------------------------------------------------
// Fretboard rendering
// ------------------------------------------------------------------

/**
 * Builds a single string row DOM element.
 * @param {string} openNote - Open note name for this string
 * @param {number} octave - Octave for this string
 * @param {number} numFrets - Number of frets
 * @param {number} dataStringIndex - The data index of this string (index in tuning array)
 * @param {number} visualIndex - Visual row index (0 = top)
 * @param {number} totalStrings - Total number of strings
 * @param {boolean} isTopString - Whether this is the first visual string (for fret markers)
 * @returns {HTMLElement} The string row element
 */
function buildStringRow(openNote, octave, numFrets, dataStringIndex, visualIndex, totalStrings, isTopString) {
    var stringElement = document.createElement('div');
    stringElement.classList.add('string');
    stringElement.id = 'string-' + visualIndex;

    // Set dynamic string thickness via inline style on ::before
    var thickness = calculateStringThickness(visualIndex, totalStrings);
    stringElement.style.setProperty('--string-thickness', thickness + 'px');

    var chromaticIndex = getChromaticIndex(openNote);
    if (chromaticIndex === -1) chromaticIndex = 0; // fallback

    // Calculate fret width as percentage of total container
    var fretWidthPercent = 100 / (numFrets + 1);

    for (var fretNumber = 0; fretNumber <= numFrets; fretNumber++) {
        var noteIndex = (chromaticIndex + fretNumber) % 12;
        var noteName = NOTE_NAMES[noteIndex];

        // Create fret container — use percentage positioning to fill container width
        var fret = document.createElement('div');
        fret.classList.add('fret');
        fret.style.left = (fretNumber * fretWidthPercent) + '%';
        fret.style.width = fretWidthPercent + '%';

        // Add fret markers only on the top visual string
        if (isTopString) {
            if ([3, 5, 7, 9, 15, 17, 19, 21].indexOf(fretNumber) !== -1) {
                var marker = document.createElement('div');
                marker.classList.add('fret-marker', 'single-dot');
                fret.appendChild(marker);
            }
            if (fretNumber === 12 || fretNumber === 24) {
                var marker1 = document.createElement('div');
                marker1.classList.add('fret-marker', 'double-dot-top');
                fret.appendChild(marker1);
                var marker2 = document.createElement('div');
                marker2.classList.add('fret-marker', 'double-dot-bottom');
                fret.appendChild(marker2);
            }
        }

        // Create note cell
        var noteCell = document.createElement('div');
        noteCell.classList.add('note-cell-fret', NOTE_COLORS[noteName] || 'color-default');
        noteCell.textContent = noteName;
        noteCell.dataset.note = noteName;
        noteCell.dataset.fret = fretNumber;
        noteCell.dataset.string = dataStringIndex;
        noteCell.tabIndex = 0;

        // MIDI number for this cell (clamped to valid 0-127 range)
        var midiNumber = Math.max(0, Math.min(127, calculateMidi(octave, chromaticIndex, fretNumber)));
        noteCell.dataset.midi = midiNumber;

        // Pointer event handlers for audio playback
        (function(midi) {
            noteCell.addEventListener('pointerdown', function(ev) {
                ev.preventDefault();
                if (typeof window !== 'undefined' && window.AudioEngine && window.AudioEngine.playNote) {
                    // Re-press handling: stop existing note before starting new
                    if (window.AudioEngine.stopNote) {
                        window.AudioEngine.stopNote(midi);
                    }
                    window.AudioEngine.playNote(midi, undefined, { hold: true });
                }
            });

            var stopHandler = function(ev) {
                ev.preventDefault();
                if (typeof window !== 'undefined' && window.AudioEngine && window.AudioEngine.stopNote) {
                    window.AudioEngine.stopNote(midi);
                }
            };

            noteCell.addEventListener('pointerup', stopHandler);
            noteCell.addEventListener('pointercancel', stopHandler);
            noteCell.addEventListener('pointerleave', stopHandler);

            noteCell.addEventListener('click', function(ev) {
                ev.preventDefault();
            });
        })(midiNumber);

        // Open note (fret 0) gets special styling
        if (fretNumber === 0) {
            noteCell.textContent = openNote;
            noteCell.dataset.note = openNote;
            noteCell.classList.add('open-note');
        }

        fret.appendChild(noteCell);
        stringElement.appendChild(fret);
    }

    return stringElement;
}

/**
 * Applies an instrument profile: tears down existing fretboard and rebuilds.
 * @param {string} profileId - The profile ID to apply
 * @param {string[]|null} [tuningOverride] - Optional custom tuning array
 */
function applyInstrumentProfile(profileId, tuningOverride) {
    // Get profile from registry
    var profile = null;
    if (typeof InstrumentRegistry !== 'undefined' && InstrumentRegistry.getById) {
        profile = InstrumentRegistry.getById(profileId);
    }

    if (!profile) {
        // Fallback to default if profile not found
        if (typeof InstrumentRegistry !== 'undefined' && InstrumentRegistry.getById) {
            profile = InstrumentRegistry.getById(InstrumentRegistry.getDefaultId());
        }
        if (!profile) {
            // Ultimate fallback: hardcoded guitar profile
            profile = {
                id: 'guitarra-6',
                name: 'Guitarra 6 cordas',
                strings: 6,
                tuning: ['E', 'A', 'D', 'G', 'B', 'E'],
                octaves: [2, 2, 3, 3, 3, 4],
                frets: 24,
                fretless: false
            };
        }
    }

    var tuning = tuningOverride || profile.tuning;
    var octaves = profile.octaves;
    var numFrets = profile.frets;
    var numStrings = profile.strings;

    // Update module-level state
    _activeFretboardState = {
        profileId: profile.id,
        tuning: tuning.slice(),
        octaves: octaves.slice()
    };

    // Get fretboard container
    var fretboard = document.getElementById('fretboard');
    if (!fretboard) return;

    // Tear down existing content
    fretboard.innerHTML = '';

    // Calculate and set container dimensions
    var dims = calculateFretboardDimensions(numStrings, numFrets);
    // Use 100% width to fit within parent container (no horizontal scroll)
    fretboard.style.width = '100%';
    fretboard.style.height = dims.height + 'px';

    // Render strings in reverse order (highest pitch at top, lowest at bottom)
    // Tuning array is ordered lowest→highest, so we reverse for visual rendering
    for (var visualIndex = 0; visualIndex < numStrings; visualIndex++) {
        // Data index: map visual top (0) to last tuning element (highest pitch)
        var dataIndex = numStrings - 1 - visualIndex;
        var openNote = tuning[dataIndex];
        var octave = octaves[dataIndex];
        var isTopString = (visualIndex === 0);

        var stringRow = buildStringRow(
            openNote, octave, numFrets, dataIndex, visualIndex, numStrings, isTopString
        );
        fretboard.appendChild(stringRow);
    }

    // Reapply scale highlighting if a scale is active
    if (_lastScaleState.scaleNotes && _lastScaleState.scaleNotes.length > 0) {
        if (typeof highlightFretboardNotes === 'function') {
            highlightFretboardNotes(_lastScaleState.scaleNotes, _lastScaleState.tonic);
        }
    }
}

/**
 * Returns the currently active profile state.
 * @returns {{ profileId: string, tuning: string[], octaves: number[] }}
 */
function getActiveFretboardState() {
    return {
        profileId: _activeFretboardState.profileId,
        tuning: _activeFretboardState.tuning.slice(),
        octaves: _activeFretboardState.octaves.slice()
    };
}

/**
 * Rebuilds a single string row (used by custom tuning).
 * @param {number} stringIndex - Index in the tuning array (data index, not visual index)
 * @param {string} newNote - The new open note for this string
 */
function rebuildString(stringIndex, newNote) {
    var fretboard = document.getElementById('fretboard');
    if (!fretboard) return;

    var numStrings = _activeFretboardState.tuning.length;
    var numFrets = 24; // default

    // Get frets from profile
    if (typeof InstrumentRegistry !== 'undefined' && InstrumentRegistry.getById) {
        var profile = InstrumentRegistry.getById(_activeFretboardState.profileId);
        if (profile) {
            numFrets = profile.frets;
        }
    }

    // Update tuning state
    _activeFretboardState.tuning[stringIndex] = newNote;

    // Calculate visual index from data index
    var visualIndex = numStrings - 1 - stringIndex;

    // Get octave (preserved from original profile)
    var octave = _activeFretboardState.octaves[stringIndex];

    // Build new string row
    var isTopString = (visualIndex === 0);
    var newStringRow = buildStringRow(
        newNote, octave, numFrets, stringIndex, visualIndex, numStrings, isTopString
    );

    // Replace the existing string row at the visual position
    var existingRows = fretboard.querySelectorAll('.string');
    if (existingRows[visualIndex]) {
        fretboard.replaceChild(newStringRow, existingRows[visualIndex]);
    }

    // Reapply scale highlighting if a scale is active
    if (_lastScaleState.scaleNotes && _lastScaleState.scaleNotes.length > 0) {
        if (typeof highlightFretboardNotes === 'function') {
            highlightFretboardNotes(_lastScaleState.scaleNotes, _lastScaleState.tonic);
        }
    }
}

// ------------------------------------------------------------------
// Normalize and highlight (kept intact for compatibility)
// ------------------------------------------------------------------

/**
 * Normaliza uma nota (ex: "Db") para sua representação em sustenido (ex: "C#")
 * para que o destaque funcione corretamente com a variável global NOTE_NAMES.
 * @param {string} note - A nota de entrada.
 * @returns {string} - A nota normalizada para sustenido.
 */
function normalizeToSharp(note) {
    var index = NOTE_NAMES.indexOf(note);
    if (index !== -1) return note;

    var bemolToSharp = {
        "DB": "C#", "EB": "D#", "GB": "F#", "AB": "G#", "BB": "A#",
        "CB": "B", "FB": "E"
    };
    return bemolToSharp[note.toUpperCase()] || note;
}

/**
 * Destaca as notas no Fretboard que pertencem à escala calculada.
 * @param {string[]} scaleNotes - Array de strings contendo as notas da escala.
 * @param {string} tonicNote - A nota tônica da escala.
 */
function highlightFretboardNotes(scaleNotes, tonicNote) {
    // Store last scale state for persistence across rebuilds
    _lastScaleState = {
        scaleNotes: scaleNotes ? scaleNotes.slice() : null,
        tonic: tonicNote || null
    };

    // 1. Clear previous highlights
    var allNotes = document.querySelectorAll('.note-cell-fret');
    allNotes.forEach(function(note) {
        note.classList.remove('in-scale', 'tonic');
    });

    if (!scaleNotes || scaleNotes.length === 0) return;

    // 2. Normalize scale notes into a Set including enharmonics
    var scaleNotesSet = {};
    scaleNotes.forEach(function(note) {
        scaleNotesSet[note.toUpperCase()] = true;

        var noteIndex = getChromaticIndex(note);
        if (noteIndex !== -1) {
            scaleNotesSet[NOTE_NAMES[noteIndex].toUpperCase()] = true;
            if (typeof notasEnarmonicas !== 'undefined' && notasEnarmonicas[noteIndex]) {
                scaleNotesSet[notasEnarmonicas[noteIndex].toUpperCase()] = true;
            }
        }
    });

    // 3. Normalize tonic
    var normalizedTonic = tonicNote.toUpperCase();

    // 4. Highlight notes
    allNotes.forEach(function(note) {
        var noteName = note.textContent.toUpperCase();

        if (scaleNotesSet[noteName]) {
            note.classList.add('in-scale');

            if (noteName === normalizedTonic || normalizeToSharp(noteName) === normalizeToSharp(normalizedTonic)) {
                note.classList.add('tonic');
            }
        }
    });
}

// ------------------------------------------------------------------
// Entry point
// ------------------------------------------------------------------

/**
 * Initializes the fretboard. Entry point called on DOMContentLoaded.
 * Delegates to applyInstrumentProfile with the default instrument.
 * @param {string} containerId - The ID of the fretboard container element (kept for backward compatibility)
 */
function initializeFretboard(containerId) {
    var fretboard = document.getElementById(containerId || 'fretboard');
    if (!fretboard) return;

    var defaultId = 'guitarra-6';
    if (typeof InstrumentRegistry !== 'undefined' && InstrumentRegistry.getDefaultId) {
        defaultId = InstrumentRegistry.getDefaultId();
    }

    applyInstrumentProfile(defaultId);
}

// Inicia o desenho do braço quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    initializeFretboard('fretboard');
});

// ------------------------------------------------------------------
// Conditional module.exports for Vitest testability
// ------------------------------------------------------------------
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        applyInstrumentProfile: applyInstrumentProfile,
        getActiveFretboardState: getActiveFretboardState,
        rebuildString: rebuildString,
        calculateStringThickness: calculateStringThickness,
        calculateFretboardDimensions: calculateFretboardDimensions,
        getChromaticIndex: getChromaticIndex,
        getNoteName: getNoteName,
        calculateMidi: calculateMidi,
        highlightFretboardNotes: highlightFretboardNotes,
        normalizeToSharp: normalizeToSharp,
        NOTE_NAMES: NOTE_NAMES,
        NOTE_COLORS: NOTE_COLORS,
        initializeFretboard: initializeFretboard,
        buildStringRow: buildStringRow,
        // Expose state getters for testing
        _getLastScaleState: function() { return _lastScaleState; },
        _setLastScaleState: function(state) { _lastScaleState = state; }
    };
}
