/**
 * script-instrument-registry.js
 * InstrumentRegistry — catálogo de perfis de instrumentos de corda para o fretboard.
 *
 * Implementado como IIFE que expõe um objeto global `InstrumentRegistry` em `window`.
 * Compatível com navegadores sem build step (sem ES6 imports/exports).
 *
 * Requirements: 1.1, 1.2, 1.3
 */

/* global window */

var InstrumentRegistry = (function () {
  'use strict';

  // ------------------------------------------------------------------
  // Dados dos perfis de instrumentos
  // ------------------------------------------------------------------

  var profiles = [
    {
      id: 'guitarra-6',
      name: 'Guitarra 6 cordas',
      strings: 6,
      tuning: ['E', 'A', 'D', 'G', 'B', 'E'],
      octaves: [2, 2, 3, 3, 3, 4],
      frets: 24,
      fretless: false
    },
    {
      id: 'guitarra-7',
      name: 'Guitarra 7 cordas',
      strings: 7,
      tuning: ['B', 'E', 'A', 'D', 'G', 'B', 'E'],
      octaves: [1, 2, 2, 3, 3, 3, 4],
      frets: 24,
      fretless: false
    },
    {
      id: 'viola-10',
      name: 'Viola 10 cordas',
      strings: 10,
      tuning: ['A', 'A', 'D', 'D', 'G', 'G', 'B', 'B', 'E', 'E'],
      octaves: [2, 3, 3, 4, 3, 4, 3, 3, 4, 4],
      frets: 22,
      fretless: false
    },
    {
      id: 'violao-12',
      name: 'Violão 12 cordas',
      strings: 12,
      tuning: ['E', 'E', 'A', 'A', 'D', 'D', 'G', 'G', 'B', 'B', 'E', 'E'],
      octaves: [2, 3, 2, 3, 3, 4, 3, 4, 3, 3, 4, 4],
      frets: 20,
      fretless: false
    },
    {
      id: 'ukulele',
      name: 'Ukulele',
      strings: 4,
      tuning: ['G', 'C', 'E', 'A'],
      octaves: [4, 4, 4, 4],
      frets: 15,
      fretless: false
    },
    {
      id: 'baixo-4',
      name: 'Baixo 4 cordas',
      strings: 4,
      tuning: ['E', 'A', 'D', 'G'],
      octaves: [1, 1, 2, 2],
      frets: 24,
      fretless: false
    },
    {
      id: 'violao-7',
      name: 'Violão 7 cordas',
      strings: 7,
      tuning: ['B', 'E', 'A', 'D', 'G', 'B', 'E'],
      octaves: [1, 2, 2, 3, 3, 3, 4],
      frets: 19,
      fretless: false
    }
  ];

  /** ID do perfil padrão carregado na inicialização */
  var defaultId = 'guitarra-6';

  // ------------------------------------------------------------------
  // API pública
  // ------------------------------------------------------------------

  /**
   * Retorna uma cópia de todos os perfis registrados, na ordem do registro.
   * @returns {InstrumentProfile[]}
   */
  function getAll() {
    return profiles.slice();
  }

  /**
   * Busca um perfil pelo seu identificador único.
   * @param {string} id - Identificador do instrumento (ex: 'guitarra-6')
   * @returns {InstrumentProfile|null} O perfil encontrado ou null se não existir
   */
  function getById(id) {
    for (var i = 0; i < profiles.length; i++) {
      if (profiles[i].id === id) {
        return profiles[i];
      }
    }
    return null;
  }

  /**
   * Retorna o ID do perfil padrão (carregado na inicialização da página).
   * @returns {string}
   */
  function getDefaultId() {
    return defaultId;
  }

  // ------------------------------------------------------------------
  // Retorno da API pública
  // ------------------------------------------------------------------

  return {
    getAll: getAll,
    getById: getById,
    getDefaultId: getDefaultId
  };

}());

// Expor no escopo global do navegador
if (typeof window !== 'undefined') {
  window.InstrumentRegistry = InstrumentRegistry;
}

// Export condicional para testabilidade com Node.js / Vitest
if (typeof module !== 'undefined' && module.exports) {
  module.exports = InstrumentRegistry;
}
