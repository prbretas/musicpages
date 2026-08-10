/**
 * script-instrument-selector.js
 * InstrumentSelector — módulo responsável por renderizar o dropdown de seleção
 * de instrumento dentro do container do fretboard.
 *
 * Implementado como IIFE que expõe um objeto global `InstrumentSelector` em `window`.
 * Compatível com navegadores sem build step (sem ES6 imports/exports).
 *
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */

/* global window, document, InstrumentRegistry, applyInstrumentProfile, initializeCustomTuningPanel */

var InstrumentSelector = (function () {
  'use strict';

  // ------------------------------------------------------------------
  // Initialization
  // ------------------------------------------------------------------

  /**
   * Creates and inserts a labeled <select> element inside #fretboardContainer,
   * before the #fretboard div. Populates options from InstrumentRegistry.getAll()
   * and sets default selection to InstrumentRegistry.getDefaultId().
   *
   * On change, calls applyInstrumentProfile(selectedId) and updates
   * CustomTuningPanel if available.
   */
  function initializeInstrumentSelector() {
    var container = document.getElementById('fretboardContainer');
    if (!container) return;

    // Avoid duplicate initialization
    if (document.getElementById('instrumentSelect')) return;

    // Create wrapper div for selector controls
    var wrapper = document.createElement('div');
    wrapper.className = 'instrument-selector-wrapper';

    // Create accessible label
    var label = document.createElement('label');
    label.setAttribute('for', 'instrumentSelect');
    label.textContent = 'Instrumento:';

    // Create select element
    var select = document.createElement('select');
    select.id = 'instrumentSelect';
    select.setAttribute('name', 'instrumentSelect');

    // Populate options from registry
    var profiles = [];
    if (typeof InstrumentRegistry !== 'undefined' && InstrumentRegistry.getAll) {
      profiles = InstrumentRegistry.getAll();
    }

    var defaultId = 'guitarra-6';
    if (typeof InstrumentRegistry !== 'undefined' && InstrumentRegistry.getDefaultId) {
      defaultId = InstrumentRegistry.getDefaultId();
    }

    for (var i = 0; i < profiles.length; i++) {
      var option = document.createElement('option');
      option.value = profiles[i].id;
      option.textContent = profiles[i].name;

      if (profiles[i].id === defaultId) {
        option.selected = true;
      }

      select.appendChild(option);
    }

    // On change handler
    select.addEventListener('change', function () {
      var selectedId = select.value;

      // Apply the new instrument profile
      if (typeof applyInstrumentProfile === 'function') {
        applyInstrumentProfile(selectedId);
      }

      // Update CustomTuningPanel if it exists
      if (typeof initializeCustomTuningPanel === 'function') {
        var profile = null;
        if (typeof InstrumentRegistry !== 'undefined' && InstrumentRegistry.getById) {
          profile = InstrumentRegistry.getById(selectedId);
        }
        if (profile) {
          initializeCustomTuningPanel(profile);
        }
      }
    });

    // Assemble DOM: label + select inside wrapper
    wrapper.appendChild(label);
    wrapper.appendChild(select);

    // Insert wrapper BEFORE the #fretboard div inside #fretboardContainer
    var fretboard = document.getElementById('fretboard');
    if (fretboard) {
      container.insertBefore(wrapper, fretboard);
    } else {
      container.appendChild(wrapper);
    }
  }

  // ------------------------------------------------------------------
  // Public API
  // ------------------------------------------------------------------

  return {
    initializeInstrumentSelector: initializeInstrumentSelector
  };

}());

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function () {
  InstrumentSelector.initializeInstrumentSelector();
});

// Expose on global window scope
if (typeof window !== 'undefined') {
  window.InstrumentSelector = InstrumentSelector;
}

// Conditional module.exports for Vitest testability
if (typeof module !== 'undefined' && module.exports) {
  module.exports = InstrumentSelector;
}
