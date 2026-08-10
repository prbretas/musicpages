/**
 * script-audio-engine.js
 * AudioEngine singleton — módulo central de síntese de áudio da aplicação MusicPages.
 *
 * Implementado como IIFE que expõe um objeto global `AudioEngine` em `window`.
 * Compatível com navegadores sem build step (sem ES6 imports/exports).
 *
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

/* global window */

/**
 * Calcula a frequência em Hz de uma nota MIDI.
 * Fórmula: 440 * 2^((midiNote - 69) / 12)   (A4 = MIDI 69 = 440 Hz)
 *
 * @param {number} midiNote - Número MIDI da nota [0-127]
 * @returns {number} Frequência em Hz
 */
function midiToFrequency(midiNote) {
  return 440 * Math.pow(2, (midiNote - 69) / 12);
}

/**
 * Parâmetros ADSR padrão aplicados a cada nota tocada pelo AudioEngine.
 * attack  : tempo de subida até amplitude máxima (segundos)
 * decay   : tempo de queda até o nível de sustain (segundos)
 * sustain : nível de amplitude durante a fase de sustain [0.0 – 1.0]
 * release : tempo de queda de sustain até silêncio (segundos)
 */
var DEFAULT_ADSR = {
  attack:  0.008,
  decay:   0.08,
  sustain: 0.7,
  release: 0.25
};

var AudioEngine = (function () {
  'use strict';

  // ------------------------------------------------------------------
  // Estado privado
  // ------------------------------------------------------------------

  /** Singleton do AudioContext; null até a primeira chamada de getAudioContext() */
  var _ctx = null;

  /** Timbre global (tipo de onda do OscillatorNode) */
  var _timbre = 'sine';

  /** Notas atualmente sustentadas via stopNote */
  var _activeNotes = {};

  // ------------------------------------------------------------------
  // API pública
  // ------------------------------------------------------------------

  /**
   * Verifica se a Web Audio API está disponível no navegador atual.
   *
   * @returns {boolean} true se AudioContext (ou webkitAudioContext) existir
   */
  function isSupported() {
    return !!(
      (typeof window !== 'undefined') &&
      (window.AudioContext || window.webkitAudioContext)
    );
  }

  /**
   * Retorna o AudioContext singleton, criando-o na primeira chamada.
   * Todas as chamadas subsequentes reutilizam o mesmo contexto.
   *
   * @returns {AudioContext|null} O AudioContext compartilhado, ou null se não suportado
   */
  function getAudioContext() {
    if (!isSupported()) {
      return null;
    }
    if (!_ctx) {
      var AudioContextClass = window.AudioContext || window.webkitAudioContext;
      _ctx = new AudioContextClass();
    }
    return _ctx;
  }

  /**
   * Retoma o AudioContext se estiver suspenso (política de autoplay dos navegadores).
   * Deve ser chamado em resposta direta a um evento de interação do usuário.
   *
   * @returns {Promise<void>} Promise que resolve quando o contexto está rodando
   */
  function resumeIfSuspended() {
    var ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      return ctx.resume();
    }
    return Promise.resolve();
  }

  /**
   * Retorna o timbre atualmente selecionado.
   *
   * @returns {string} Um dos valores: 'sine' | 'square' | 'sawtooth' | 'triangle'
   */
  function getTimbre() {
    return _timbre;
  }

  /**
   * Define o timbre global para todos os OscillatorNodes criados subsequentemente.
   * A seleção se aplica ao Virtual_Keyboard e ao Fretboard simultaneamente.
   *
   * @param {string} type - Tipo de onda: 'sine' | 'square' | 'sawtooth' | 'triangle'
   */
  function setTimbre(type) {
    var valid = ['sine', 'square', 'sawtooth', 'triangle'];
    if (valid.indexOf(type) !== -1) {
      _timbre = type;
    }
  }

  /**
   * Sintetiza e reproduz uma nota usando OscillatorNode + GainNode + envelope ADSR.
   * Os nós são criados e descartados automaticamente após a fase de release.
   *
   * @param {number} midiNote - Número MIDI da nota [0-127]
   * @param {string} [timbre]  - Tipo de onda (usa getTimbre() se omitido)
   * @param {object} [adsr]    - Parâmetros ADSR { attack, decay, sustain, release }
   *                            (usa DEFAULT_ADSR para valores omitidos)
   * @returns {Promise<void>}
   */
  function playNote(midiNote, timbre, adsr) {
    return resumeIfSuspended().then(function () {
      var ctx = getAudioContext();
      if (!ctx) {
        return;
      }

      var now = ctx.currentTime;
      var freq = midiToFrequency(midiNote);

      // Parâmetros ADSR (merge com defaults)
      var attack  = (adsr && adsr.attack  != null) ? adsr.attack  : DEFAULT_ADSR.attack;
      var decay   = (adsr && adsr.decay   != null) ? adsr.decay   : DEFAULT_ADSR.decay;
      var sustain = (adsr && adsr.sustain != null) ? adsr.sustain : DEFAULT_ADSR.sustain;
      var release = (adsr && adsr.release != null) ? adsr.release : DEFAULT_ADSR.release;
      var hold    = adsr && adsr.hold === true;

      if (_activeNotes[midiNote]) {
        stopNote(midiNote);
      }

      var osc  = ctx.createOscillator();
      var gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = timbre || getTimbre();
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(1.0, now + attack);
      gain.gain.linearRampToValueAtTime(sustain, now + attack + decay);
      gain.gain.setValueAtTime(sustain, now + attack + decay);

      osc.start(now);

      if (hold) {
        _activeNotes[midiNote] = {
          osc: osc,
          gain: gain,
          release: release
        };
        return;
      }

      gain.gain.linearRampToValueAtTime(0.001, now + attack + decay + release);
      var stopTime = now + attack + decay + release + 0.05;
      osc.stop(stopTime);
    });
  }

  function stopNote(midiNote) {
    var ctx = getAudioContext();
    if (!ctx || !_activeNotes[midiNote]) {
      return;
    }

    var active = _activeNotes[midiNote];
    var now = ctx.currentTime;
    active.gain.gain.cancelScheduledValues(now);
    active.gain.gain.setValueAtTime(active.gain.gain.value || 0.001, now);
    active.gain.gain.linearRampToValueAtTime(0.001, now + active.release);
    active.osc.stop(now + active.release + 0.05);
    delete _activeNotes[midiNote];
  }

  // ------------------------------------------------------------------
  // Retorno da API pública
  // ------------------------------------------------------------------

  return {
    isSupported:        isSupported,
    getAudioContext:    getAudioContext,
    resumeIfSuspended:  resumeIfSuspended,
    getTimbre:          getTimbre,
    setTimbre:          setTimbre,
    playNote:           playNote,
    stopNote:           stopNote
  };

}());

// Expor no escopo global do navegador
if (typeof window !== 'undefined') {
  window.AudioEngine = AudioEngine;
}

// Export condicional para testabilidade com Node.js / Vitest
if (typeof module !== 'undefined') {
  module.exports = { AudioEngine: AudioEngine, midiToFrequency: midiToFrequency };
}
