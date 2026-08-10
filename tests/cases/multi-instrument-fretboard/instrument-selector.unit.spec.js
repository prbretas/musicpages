/**
 * Unit tests for InstrumentSelector
 * Validates: Requirements 2.1, 2.3, 2.4
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import InstrumentRegistry from '../../../scripts/script-instrument-registry.js';
import InstrumentSelector from '../../../scripts/script-instrument-selector.js';

// Set up InstrumentRegistry as a global so the selector module can find it
globalThis.InstrumentRegistry = InstrumentRegistry;

describe('InstrumentSelector', () => {
  let applyInstrumentProfileMock;
  let initializeCustomTuningPanelMock;

  beforeEach(() => {
    // Set up DOM
    document.body.innerHTML = '<div id="fretboardContainer"><div id="fretboard"></div></div>';

    // Mock applyInstrumentProfile as a global function
    applyInstrumentProfileMock = vi.fn();
    globalThis.applyInstrumentProfile = applyInstrumentProfileMock;

    // Mock initializeCustomTuningPanel as a global function
    initializeCustomTuningPanelMock = vi.fn();
    globalThis.initializeCustomTuningPanel = initializeCustomTuningPanelMock;
  });

  it('renders selector inside #fretboardContainer with an accessible label', () => {
    InstrumentSelector.initializeInstrumentSelector();

    const container = document.getElementById('fretboardContainer');
    const select = container.querySelector('#instrumentSelect');
    const label = container.querySelector('label[for="instrumentSelect"]');

    expect(select).not.toBeNull();
    expect(label).not.toBeNull();
    expect(label.textContent).toBe('Instrumento:');
    // Label's `for` attribute matches select's id for accessibility
    expect(label.getAttribute('for')).toBe(select.id);
  });

  it('default selection is guitarra-6', () => {
    InstrumentSelector.initializeInstrumentSelector();

    const select = document.getElementById('instrumentSelect');
    expect(select.value).toBe('guitarra-6');
  });

  it('changing selector triggers fretboard rebuild with new profile', () => {
    InstrumentSelector.initializeInstrumentSelector();

    const select = document.getElementById('instrumentSelect');

    // Change to 'ukulele'
    select.value = 'ukulele';
    select.dispatchEvent(new Event('change'));

    expect(applyInstrumentProfileMock).toHaveBeenCalledWith('ukulele');
  });
});
