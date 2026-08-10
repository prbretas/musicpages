/**
 * script-fretboard.js — Braço de Instrumento Multi-Instrumento
 *
 * Suporta múltiplos instrumentos via INSTRUMENT_PROFILES, afinação
 * personalizada (Custom_Tuning) e reprodução sonora ao clicar.
 *
 * Requirements: 4.1–4.5, 6.1–6.12
 */

// ─────────────────────────────────────────────────────────────
// Constantes compartilhadas com script-escalas.js
// ─────────────────────────────────────────────────────────────

const NOTE_NAMES_FB = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

const NOTE_COLORS = {
  'C'  : 'color-C',
  'C#' : 'color-Cs', 'Db': 'color-Cs',
  'D'  : 'color-D',
  'D#' : 'color-Ds', 'Eb': 'color-Ds',
  'E'  : 'color-E',
  'F'  : 'color-F',
  'F#' : 'color-Fs', 'Gb': 'color-Fs',
  'G'  : 'color-G',
  'G#' : 'color-Gs', 'Ab': 'color-Gs',
  'A'  : 'color-A',
  'A#' : 'color-As', 'Bb': 'color-As',
  'B'  : 'color-B',
};

// ─────────────────────────────────────────────────────────────
// Perfis de Instrumentos
// ─────────────────────────────────────────────────────────────

/**
 * @typedef {Object} Instrument_Profile
 * @property {string}   id
 * @property {string}   name
 * @property {number}   strings
 * @property {string[]} tuning   - notas abertas, grave → agudo
 * @property {number[]} octaves  - oitavas correspondentes
 * @property {number}   frets
 * @property {boolean}  fretless
 */
const INSTRUMENT_PROFILES = {
  guitar_6: {
    id: 'guitar_6', name: 'Guitarra 6 cordas',
    strings: 6, tuning: ['E','A','D','G','B','E'],
    octaves: [2,2,3,3,3,4], frets: 24, fretless: false,
  },
  guitar_7: {
    id: 'guitar_7', name: 'Guitarra 7 cordas',
    strings: 7, tuning: ['B','E','A','D','G','B','E'],
    octaves: [1,2,2,3,3,3,4], frets: 24, fretless: false,
  },
  guitar_8: {
    id: 'guitar_8', name: 'Guitarra 8 cordas',
    strings: 8, tuning: ['F#','B','E','A','D','G','B','E'],
    octaves: [1,1,2,2,3,3,3,4], frets: 24, fretless: false,
  },
  bass_4: {
    id: 'bass_4', name: 'Baixo 4 cordas',
    strings: 4, tuning: ['E','A','D','G'],
    octaves: [1,1,2,2], frets: 24, fretless: false,
  },
  bass_5: {
    id: 'bass_5', name: 'Baixo 5 cordas',
    strings: 5, tuning: ['B','E','A','D','G'],
    octaves: [0,1,1,2,2], frets: 24, fretless: false,
  },
  bass_6: {
    id: 'bass_6', name: 'Baixo 6 cordas',
    strings: 6, tuning: ['B','E','A','D','G','C'],
    octaves: [0,1,1,2,2,3], frets: 24, fretless: false,
  },
  ukulele: {
    id: 'ukulele', name: 'Ukulele',
    strings: 4, tuning: ['G','C','E','A'],
    octaves: [4,4,4,4], frets: 15, fretless: false,
  },
  violin: {
    id: 'violin', name: 'Violino',
    strings: 4, tuning: ['G','D','A','E'],
    octaves: [3,4,4,5], frets: 12, fretless: true,
  },
  cavaquinho: {
    id: 'cavaquinho', name: 'Cavaquinho',
    strings: 4, tuning: ['D','G','B','D'],
    octaves: [4,4,3,5], frets: 17, fretless: false,
  },
};

// ─────────────────────────────────────────────────────────────
// Estado atual
// ─────────────────────────────────────────────────────────────

let _currentProfile  = INSTRUMENT_PROFILES['guitar_6'];
let _currentTuning   = [..._currentProfile.tuning];
let _currentOctaves  = [..._currentProfile.octaves];

/** Última escala calculada (para reaplicar highlight ao trocar instrumento) */
let _lastScaleNotes = [];
let _lastTonic      = '';

/**
 * Orientação do músico:
 * - 'right' = destro  → corda grave em cima, capotraste à esquerda (padrão)
 * - 'left'  = canhoto → corda grave em baixo, trastes espelhados (direita para esquerda)
 */
let _handedness = 'right';

// ─────────────────────────────────────────────────────────────
// Helpers MIDI
// ─────────────────────────────────────────────────────────────

/**
 * Converte nome de nota + oitava → número MIDI.
 * @param {string} noteName - ex: 'E', 'G#'
 * @param {number} octave
 * @returns {number}
 */
function noteNameToMidi(noteName, octave) {
  const idx = NOTE_NAMES_FB.indexOf(noteName);
  if (idx === -1) return 0;
  return (octave + 1) * 12 + idx;
}

// ─────────────────────────────────────────────────────────────
// Inicialização / Redesenho
// ─────────────────────────────────────────────────────────────

const DOT_FRETS    = [3,5,7,9,15,17,19,21];
const DOUBLE_FRETS = [12,24];

/**
 * Constrói o DOM do fretboard para o perfil fornecido.
 *
 * ORDEM DAS CORDAS (visualização padrão — destro):
 *   - Corda mais GRAVE no TOPO  (como o músico vê ao tocar)
 *   - Corda mais AGUDA embaixo
 *   - O perfil armazena tuning[] de grave → agudo, então renderizamos
 *     do índice 0 (grave) ao último (agudo), de cima para baixo.
 *     Isso já coincide com a visão do músico destro.
 *
 * CANHOTO (_handedness === 'left'):
 *   - As cordas ficam em ordem INVERSA verticalmente
 *     (grave embaixo, agudo em cima — espelho vertical)
 *   - Os trastes ficam espelhados horizontalmente via CSS (scaleX(-1))
 *
 * @param {string}            containerId
 * @param {Instrument_Profile} [profile]
 */
function initializeFretboard(containerId, profile) {
  profile = profile || _currentProfile;
  _currentProfile = profile;
  _currentTuning  = [...profile.tuning];
  _currentOctaves = [...profile.octaves];

  const fretboard = document.getElementById(containerId);
  if (!fretboard) return;
  fretboard.innerHTML = '';

  const fretWidth   = 40;
  const stringCount = profile.strings;
  fretboard.style.width  = `${(profile.frets + 1) * fretWidth}px`;
  fretboard.style.height = `${stringCount * 50}px`;

  // Aplica / remove classe de canhoto no container para espelhar via CSS
  const container = document.getElementById('fretboardContainer') || fretboard.parentElement;
  if (container) {
    container.classList.toggle('lefty', _handedness === 'left');
  }

  /*
   * Ordem de renderização das cordas:
   *
   * A visualização padrão do braço de violão mostra a corda mais aguda no topo
   * e a mais grave embaixo. A orientação canhota apenas espelha os trastes
   * horizontalmente via CSS, mantendo a mesma ordem vertical.
   */
  const renderOrder = Array.from({ length: stringCount }, (_, i) => stringCount - 1 - i);

  renderOrder.forEach((stringIndex, renderPos) => {
    const openNote    = _currentTuning[stringIndex];
    const openOctave  = _currentOctaves[stringIndex];
    const openNoteIdx = NOTE_NAMES_FB.indexOf(openNote);

    const stringEl = document.createElement('div');
    stringEl.classList.add('string');
    stringEl.id = `string-${stringIndex}`;

    // Espessura visual da corda: grave = mais grossa (linha mais larga)
    // Quanto menor o stringIndex (mais grave), mais grossa a corda.
    const thickness = Math.max(1, Math.round(1 + (stringCount - 1 - stringIndex) * 0.6));
    stringEl.style.setProperty('--string-thickness', `${thickness}px`);

    for (let fretNumber = 0; fretNumber <= profile.frets; fretNumber++) {
      const noteIndex = (openNoteIdx + fretNumber) % 12;
      const noteName  = NOTE_NAMES_FB[noteIndex];
      const openMidi  = noteNameToMidi(openNote, openOctave);
      const cellMidi  = openMidi + fretNumber;

      const fretEl = document.createElement('div');
      fretEl.classList.add('fret');
      if (profile.fretless) fretEl.classList.add('fretless');
      fretEl.style.left  = `${fretNumber * fretWidth}px`;
      fretEl.style.width = `${fretWidth}px`;

      // Marcadores de traste visíveis apenas na 1ª linha renderizada (topo)
      if (renderPos === 0) {
        if (DOT_FRETS.includes(fretNumber) && fretNumber <= profile.frets) {
          const m = document.createElement('div');
          m.classList.add('fret-marker', 'single-dot');
          fretEl.appendChild(m);
        }
        if (DOUBLE_FRETS.includes(fretNumber) && fretNumber <= profile.frets) {
          ['double-dot-top','double-dot-bottom'].forEach(cls => {
            const m = document.createElement('div');
            m.classList.add('fret-marker', cls);
            fretEl.appendChild(m);
          });
        }
      }

      // Célula de nota
      const noteCell = document.createElement('div');
      noteCell.classList.add('note-cell-fret', NOTE_COLORS[noteName] || 'color-default');
      noteCell.dataset.note   = noteName;
      noteCell.dataset.midi   = cellMidi;
      noteCell.dataset.fret   = fretNumber;
      noteCell.dataset.string = stringIndex;

      if (fretNumber === 0) {
        noteCell.textContent = openNote;
        noteCell.dataset.note = openNote;
        noteCell.classList.add('open-note');
      } else {
        noteCell.textContent = noteName;
      }

      // Som ao clicar / sustentar
      noteCell.addEventListener('pointerdown', function (event) {
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        event.preventDefault();
        this.setPointerCapture(event.pointerId);
        playFretNote(parseInt(this.dataset.midi, 10), this);
      });

      noteCell.addEventListener('pointerup', function (event) {
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        this.releasePointerCapture(event.pointerId);
        stopFretNote(parseInt(this.dataset.midi, 10), this);
      });

      noteCell.addEventListener('pointercancel', function () {
        stopFretNote(parseInt(this.dataset.midi, 10), this);
      });

      fretEl.appendChild(noteCell);
      stringEl.appendChild(fretEl);
    }

    fretboard.appendChild(stringEl);
  });

  // Reaplicar destaques se houver escala ativa
  if (_lastScaleNotes.length > 0) {
    highlightFretboardNotes(_lastScaleNotes, _lastTonic);
  }

  // Atualizar seletor de instrumento
  const sel = document.getElementById('instrumentSelect');
  if (sel) sel.value = profile.id;
}

// ─────────────────────────────────────────────────────────────
// Som ao clicar
// ─────────────────────────────────────────────────────────────

/**
 * Toca a nota da casa clicada e aplica feedback visual.
 * @param {number}      midiNote
 * @param {HTMLElement} el
 */
let _activeFretNoteCell = null;

function playFretNote(midiNote, el) {
  if (typeof AudioEngine !== 'undefined' && AudioEngine.isSupported()) {
    AudioEngine.playNote(midiNote, null, { hold: true }).catch(() => {});
  }
  if (el) {
    el.classList.add('pressed');
    _activeFretNoteCell = el;
  }
}

function stopFretNote(midiNote, el) {
  if (typeof AudioEngine !== 'undefined' && AudioEngine.isSupported()) {
    AudioEngine.stopNote(midiNote);
  }
  if (el) {
    el.classList.remove('pressed');
    if (_activeFretNoteCell === el) {
      _activeFretNoteCell = null;
    }
  }
}

document.addEventListener('pointerup', function () {
  if (_activeFretNoteCell) {
    const midi = parseInt(_activeFretNoteCell.dataset.midi, 10);
    stopFretNote(midi, _activeFretNoteCell);
  }
});

// ─────────────────────────────────────────────────────────────
// Multi-instrumento — seletor
// ─────────────────────────────────────────────────────────────

/**
 * Chamado pelo <select id="instrumentSelect"> no HTML.
 */
function onInstrumentChange() {
  const sel = document.getElementById('instrumentSelect');
  if (!sel) return;
  const profile = INSTRUMENT_PROFILES[sel.value];
  if (!profile) return;

  // Limpa Custom_Tuning ao trocar de instrumento
  document.querySelectorAll('.custom-tuning-input').forEach(inp => inp.value = '');
  _isCustomized = false;

  initializeFretboard('fretboard', profile);
  updateCustomTuningUI();
}

// ─────────────────────────────────────────────────────────────
// Orientação destro / canhoto
// ─────────────────────────────────────────────────────────────

/**
 * Alterna entre visualização destro e canhoto.
 * Chamado pelo toggle no HTML.
 * @param {boolean} isLefty
 */
function setHandedness(isLefty) {
  _handedness = isLefty ? 'left' : 'right';
  // Persiste preferência
  try { localStorage.setItem('musicpages-handedness', _handedness); } catch(e) {}
  initializeFretboard('fretboard', _currentProfile);
  updateCustomTuningUI();
}

// ─────────────────────────────────────────────────────────────
// Custom Tuning
// ─────────────────────────────────────────────────────────────

let _isCustomized = false;

/**
 * Reconstrói os inputs de afinação customizada no painel.
 * Exibe as cordas na mesma ordem visual do fretboard.
 */
function updateCustomTuningUI() {
  const panel = document.getElementById('customTuningPanel');
  if (!panel) return;
  panel.innerHTML = '';

  const count = _currentProfile.strings;

  // Mesma renderOrder do fretboard
  const renderOrder = Array.from({ length: count }, (_, i) => count - 1 - i);

  renderOrder.forEach((stringIndex, renderPos) => {
    const label = document.createElement('label');
    label.htmlFor   = `tuning-string-${stringIndex}`;
    // Exibe número da corda de 1 a N na ordem visual do braço
    label.textContent = `Corda ${renderPos + 1}:`;
    label.className  = 'tuning-label';

    const input = document.createElement('input');
    input.type     = 'text';
    input.id       = `tuning-string-${stringIndex}`;
    input.value    = _currentTuning[stringIndex];
    input.maxLength = 2;
    input.className = 'custom-tuning-input';
    input.setAttribute('aria-label', `Nota da corda ${stringIndex + 1}`);
    input.dataset.stringIndex = stringIndex;

    input.addEventListener('input', function () {
      onCustomTuningChange(parseInt(this.dataset.stringIndex, 10), this);
    });

    const row = document.createElement('div');
    row.className = 'tuning-row';
    row.appendChild(label);
    row.appendChild(input);
    panel.appendChild(row);
  });
}

/**
 * Atualiza a afinação de uma corda específica em tempo real.
 * @param {number}      stringIndex
 * @param {HTMLElement} inputEl
 */
function onCustomTuningChange(stringIndex, inputEl) {
  const raw  = inputEl.value.trim();
  const note = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();

  // Validação via getChromaticIndex (de script-escalas.js)
  if (typeof getChromaticIndex === 'function' && getChromaticIndex(note) === -1) {
    inputEl.classList.add('invalid');
    return;
  }
  inputEl.classList.remove('invalid');

  _currentTuning[stringIndex] = note;
  _isCustomized = true;

  // Reconstrói apenas a corda alterada
  rebuildString(stringIndex);
  highlightFretboardNotes(_lastScaleNotes, _lastTonic);
}

/**
 * Reconstrói uma corda específica no DOM sem redesenhar o fretboard inteiro.
 * @param {number} stringIndex
 */
function rebuildString(stringIndex) {
  const stringEl = document.getElementById(`string-${stringIndex}`);
  if (!stringEl) {
    initializeFretboard('fretboard', _currentProfile);
    return;
  }

  const openNote   = _currentTuning[stringIndex];
  const openOctave = _currentOctaves[stringIndex];
  const openNoteIdx = NOTE_NAMES_FB.indexOf(openNote);
  const fretWidth   = 40;

  // Limpa casas antigas mas mantém o elemento da corda
  stringEl.innerHTML = '';

  for (let fretNumber = 0; fretNumber <= _currentProfile.frets; fretNumber++) {
    const noteIndex = (openNoteIdx + fretNumber) % 12;
    const noteName  = NOTE_NAMES_FB[noteIndex];
    const openMidi  = noteNameToMidi(openNote, openOctave);
    const cellMidi  = openMidi + fretNumber;

    const fretEl = document.createElement('div');
    fretEl.classList.add('fret');
    fretEl.style.left  = `${fretNumber * fretWidth}px`;
    fretEl.style.width = `${fretWidth}px`;

    const noteCell = document.createElement('div');
    noteCell.classList.add('note-cell-fret', NOTE_COLORS[noteName] || 'color-default');
    noteCell.dataset.note   = noteName;
    noteCell.dataset.midi   = cellMidi;
    noteCell.dataset.fret   = fretNumber;
    noteCell.dataset.string = stringIndex;

    if (fretNumber === 0) {
      noteCell.textContent = openNote;
      noteCell.classList.add('open-note');
    } else {
      noteCell.textContent = noteName;
    }

    noteCell.addEventListener('click', function () {
      playFretNote(parseInt(this.dataset.midi, 10), this);
    });

    fretEl.appendChild(noteCell);
    stringEl.appendChild(fretEl);
  }
}

/**
 * Restaura a afinação padrão do perfil atual.
 */
function resetTuning() {
  _currentTuning  = [..._currentProfile.tuning];
  _currentOctaves = [..._currentProfile.octaves];
  _isCustomized   = false;

  initializeFretboard('fretboard', _currentProfile);
  updateCustomTuningUI();
}

// ─────────────────────────────────────────────────────────────
// Highlight de notas da escala
// ─────────────────────────────────────────────────────────────

function normalizeToSharp(note) {
  const idx = NOTE_NAMES_FB.indexOf(note);
  if (idx !== -1) return note;
  const map = { 'DB':'C#','EB':'D#','GB':'F#','AB':'G#','BB':'A#','CB':'B','FB':'E' };
  return map[note.toUpperCase()] || note;
}

/**
 * Destaca as notas no fretboard que pertencem à escala calculada.
 * @param {string[]} scaleNotes
 * @param {string}   tonicNote
 */
function highlightFretboardNotes(scaleNotes, tonicNote) {
  // Persiste para reaplicar ao trocar instrumento/afinação
  _lastScaleNotes = scaleNotes || [];
  _lastTonic      = tonicNote  || '';

  // Limpa destaques anteriores
  document.querySelectorAll('.note-cell-fret').forEach(el => {
    el.classList.remove('in-scale', 'tonic');
  });

  if (!scaleNotes || scaleNotes.length === 0) return;

  // Constrói set de índices cromáticos da escala
  const scaleNotesSet = new Set();
  scaleNotes.forEach(note => {
    scaleNotesSet.add(note.toUpperCase());
    if (typeof getChromaticIndex === 'function') {
      const noteIdx = getChromaticIndex(note);
      if (noteIdx !== -1) {
        scaleNotesSet.add(NOTE_NAMES_FB[noteIdx].toUpperCase());
        if (typeof notasEnarmonicas !== 'undefined' && notasEnarmonicas[noteIdx]) {
          scaleNotesSet.add(notasEnarmonicas[noteIdx].toUpperCase());
        }
      }
    }
  });

  const normalizedTonic = tonicNote.toUpperCase();

  document.querySelectorAll('.note-cell-fret').forEach(el => {
    const name = el.textContent.trim().toUpperCase();
    if (scaleNotesSet.has(name)) {
      el.classList.add('in-scale');
      if (name === normalizedTonic ||
          normalizeToSharp(name) === normalizeToSharp(normalizedTonic)) {
        el.classList.add('tonic');
      }
    }
  });
}

// ─────────────────────────────────────────────────────────────
// Init
// ─────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Restaura preferência de orientação salva
  try {
    const saved = localStorage.getItem('musicpages-handedness');
    if (saved === 'left' || saved === 'right') {
      _handedness = saved;
      const toggle = document.getElementById('leftyToggle');
      if (toggle) toggle.checked = (saved === 'left');
    }
  } catch(e) {}

  initializeFretboard('fretboard');
  updateCustomTuningUI();
});

// Export condicional para testes
if (typeof module !== 'undefined') {
  module.exports = {
    INSTRUMENT_PROFILES,
    noteNameToMidi,
    initializeFretboard,
    highlightFretboardNotes,
    normalizeToSharp,
    NOTE_COLORS,
  };
}
