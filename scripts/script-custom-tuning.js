/**
 * script-custom-tuning.js
 * CustomTuningPanel — módulo responsável por renderizar inputs de afinação
 * customizada por corda e permitir override da afinação padrão do instrumento.
 *
 * Implementado como IIFE que expõe um objeto global `CustomTuningPanel` em `window`.
 * Compatível com navegadores sem build step (sem ES6 imports/exports).
 *
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 6.1, 6.2, 6.3
 */

/* global window, document, InstrumentRegistry, applyInstrumentProfile, rebuildString, highlightFretboardNotes, _activeFretboardState, _lastScaleState */

var CustomTuningPanel = (function () {
  'use strict';

  // ------------------------------------------------------------------
  // Validation
  // ------------------------------------------------------------------

  /**
   * Validates a note name string.
   * Accepts: one letter A-G (case-insensitive) optionally followed by # or b.
   * Max length 2.
   * @param {string} str - The input string to validate
   * @returns {boolean} True if valid note name
   */
  function isValidNoteName(str) {
    if (typeof str !== 'string') return false;
    return /^[A-Ga-g][#b]?$/.test(str);
  }

  /**
   * Normalizes a note name to uppercase first letter.
   * e.g., "eb" → "Eb", "c#" → "C#", "a" → "A"
   * @param {string} note - The note name to normalize
   * @returns {string} Normalized note name
   */
  function normalizeNoteName(note) {
    if (!note || note.length === 0) return note;
    return note.charAt(0).toUpperCase() + note.slice(1);
  }

  // ------------------------------------------------------------------
  // Panel rendering
  // ------------------------------------------------------------------

  /**
   * Initializes (or re-initializes) the custom tuning panel with inputs
   * for each string of the given profile.
   * Inputs are ordered visually: highest pitch first (reversed tuning array).
   * @param {Object} profile - The instrument profile object
   */
  function initializeCustomTuningPanel(profile) {
    if (!profile) return;

    var container = document.getElementById('fretboardContainer');
    if (!container) return;

    // Remove existing panel if present
    var existingPanel = document.getElementById('customTuningPanel');
    if (existingPanel) {
      existingPanel.parentNode.removeChild(existingPanel);
    }

    // Create wrapper div
    var panel = document.createElement('div');
    panel.id = 'customTuningPanel';

    // Create inputs in visual order (highest pitch first = reversed tuning array)
    var tuning = profile.tuning;
    var numStrings = profile.strings;

    for (var visualIndex = 0; visualIndex < numStrings; visualIndex++) {
      // Data index: visual 0 (highest pitch) → last element in tuning array
      var dataIndex = numStrings - 1 - visualIndex;

      var inputWrapper = document.createElement('div');
      inputWrapper.className = 'tuning-input-wrapper';

      // Label with string number (1ª = highest pitch, visually first)
      var label = document.createElement('label');
      label.textContent = (visualIndex + 1) + '\u00AA';
      label.className = 'tuning-input-label';

      // Input field
      var input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 2;
      input.className = 'tuning-input';
      input.setAttribute('data-string-index', dataIndex);
      input.value = tuning[dataIndex];
      input.setAttribute('aria-label', 'Afinação da corda ' + (visualIndex + 1));

      // Store previous valid value for revert on empty blur
      input.setAttribute('data-prev-value', tuning[dataIndex]);

      // Attach event handlers
      attachInputHandlers(input);

      inputWrapper.appendChild(label);
      inputWrapper.appendChild(input);
      panel.appendChild(inputWrapper);
    }

    // Create reset button (always visible)
    var resetBtn = document.createElement('button');
    resetBtn.id = 'resetTuningBtn';
    resetBtn.type = 'button';
    resetBtn.textContent = '\u21BA Padr\u00E3o';
    resetBtn.className = 'reset-tuning-btn';
    resetBtn.addEventListener('click', function () {
      resetTuningToDefault();
    });
    panel.appendChild(resetBtn);

    // Insert panel inside #fretboardContainer, before #fretboard
    var fretboard = document.getElementById('fretboard');
    if (fretboard) {
      container.insertBefore(panel, fretboard);
    } else {
      container.appendChild(panel);
    }
  }

  /**
   * Attaches keydown (Enter) and blur event handlers to a tuning input.
   * @param {HTMLInputElement} input
   */
  function attachInputHandlers(input) {
    // On Enter key: commit value
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitInput(input);
      }
    });

    // On blur: commit value or revert if empty
    input.addEventListener('blur', function () {
      commitInput(input);
    });
  }

  /**
   * Commits the current input value: validates, normalizes, and triggers rebuild.
   * @param {HTMLInputElement} input
   */
  function commitInput(input) {
    var value = input.value.trim();
    var dataIndex = parseInt(input.getAttribute('data-string-index'), 10);
    var prevValue = input.getAttribute('data-prev-value');

    // Empty on blur: revert to previous valid value
    if (value === '') {
      input.value = prevValue;
      clearError(input);
      return;
    }

    // Validate
    if (!isValidNoteName(value)) {
      showError(input);
      return;
    }

    // Valid: normalize and commit
    var normalized = normalizeNoteName(value);
    input.value = normalized;
    input.setAttribute('data-prev-value', normalized);
    clearError(input);

    // Rebuild the affected string (octave is preserved from profile)
    if (typeof rebuildString === 'function') {
      rebuildString(dataIndex, normalized);
    }

    // Reapply scale highlighting if active
    if (typeof _lastScaleState !== 'undefined' && _lastScaleState &&
        _lastScaleState.scaleNotes && _lastScaleState.scaleNotes.length > 0) {
      if (typeof highlightFretboardNotes === 'function') {
        highlightFretboardNotes(_lastScaleState.scaleNotes, _lastScaleState.tonic);
      }
    }
  }

  /**
   * Shows error state on an input: red border and tooltip.
   * @param {HTMLInputElement} input
   */
  function showError(input) {
    input.classList.add('tuning-input-error');
    input.title = 'Nota inv\u00E1lida';
  }

  /**
   * Clears error state from an input.
   * @param {HTMLInputElement} input
   */
  function clearError(input) {
    input.classList.remove('tuning-input-error');
    input.title = '';
  }

  // ------------------------------------------------------------------
  // Reset
  // ------------------------------------------------------------------

  /**
   * Resets all tuning inputs to the current profile's default tuning
   * and rebuilds the full fretboard.
   */
  function resetTuningToDefault() {
    var profileId = 'guitarra-6';

    // Get current profile ID from active state
    if (typeof _activeFretboardState !== 'undefined' && _activeFretboardState) {
      profileId = _activeFretboardState.profileId;
    }

    // Apply the instrument profile with defaults (no tuning override)
    if (typeof applyInstrumentProfile === 'function') {
      applyInstrumentProfile(profileId);
    }

    // Re-initialize the panel with the default profile
    var profile = null;
    if (typeof InstrumentRegistry !== 'undefined' && InstrumentRegistry.getById) {
      profile = InstrumentRegistry.getById(profileId);
    }

    if (profile) {
      initializeCustomTuningPanel(profile);
    }
  }

  // ------------------------------------------------------------------
  // Public API
  // ------------------------------------------------------------------

  return {
    initializeCustomTuningPanel: initializeCustomTuningPanel,
    resetTuningToDefault: resetTuningToDefault,
    isValidNoteName: isValidNoteName,
    normalizeNoteName: normalizeNoteName
  };

}());

// ------------------------------------------------------------------
// Entry point: initialize on DOMContentLoaded
// ------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function () {
  var profile = null;
  if (typeof InstrumentRegistry !== 'undefined' && InstrumentRegistry.getById && InstrumentRegistry.getDefaultId) {
    profile = InstrumentRegistry.getById(InstrumentRegistry.getDefaultId());
  }
  if (profile) {
    CustomTuningPanel.initializeCustomTuningPanel(profile);
  }
});

// Expose on global window scope
if (typeof window !== 'undefined') {
  window.CustomTuningPanel = CustomTuningPanel;
  // Expose initializeCustomTuningPanel as a global for inter-module calls
  window.initializeCustomTuningPanel = function (profile) {
    CustomTuningPanel.initializeCustomTuningPanel(profile);
  };
}

// ------------------------------------------------------------------
// Conditional module.exports for Vitest testability
// ------------------------------------------------------------------
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initializeCustomTuningPanel: CustomTuningPanel.initializeCustomTuningPanel,
    resetTuningToDefault: CustomTuningPanel.resetTuningToDefault,
    isValidNoteName: CustomTuningPanel.isValidNoteName,
    normalizeNoteName: CustomTuningPanel.normalizeNoteName
  };
}
