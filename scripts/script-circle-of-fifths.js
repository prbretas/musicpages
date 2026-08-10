/**
 * script-circle-of-fifths.js
 * CircleOfFifths — módulo interativo que renderiza o Ciclo de Quintas em SVG.
 *
 * Implementado como IIFE que expõe um objeto global `CircleOfFifths` em `window`.
 * Compatível com navegadores sem build step (sem ES6 imports/exports).
 *
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */

/* global window, document, AudioEngine */

var CircleOfFifths = (function () {
  'use strict';

  // ------------------------------------------------------------------
  // Dados puros
  // ------------------------------------------------------------------

  /** Tonalidades maiores em ordem de quintas */
  var MAJOR_KEYS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#/Gb', 'Db', 'Ab', 'Eb', 'Bb', 'F'];

  /** Tonalidades menores relativas em ordem de quintas */
  var MINOR_KEYS = ['Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m/Ebm', 'Bbm', 'Fm', 'Cm', 'Gm', 'Dm'];

  /** Mapa de assinaturas de tonalidade: count positivo = sustenidos, negativo = bemóis */
  var KEY_SIGNATURES = {
    'C':      { count: 0, type: 'none',   notes: [] },
    'G':      { count: 1, type: 'sharps', notes: ['F#'] },
    'D':      { count: 2, type: 'sharps', notes: ['F#', 'C#'] },
    'A':      { count: 3, type: 'sharps', notes: ['F#', 'C#', 'G#'] },
    'E':      { count: 4, type: 'sharps', notes: ['F#', 'C#', 'G#', 'D#'] },
    'B':      { count: 5, type: 'sharps', notes: ['F#', 'C#', 'G#', 'D#', 'A#'] },
    'F#/Gb':  { count: 6, type: 'sharps', notes: ['F#', 'C#', 'G#', 'D#', 'A#', 'E#'] },
    'Db':     { count: 5, type: 'flats',  notes: ['Bb', 'Eb', 'Ab', 'Db', 'Gb'] },
    'Ab':     { count: 4, type: 'flats',  notes: ['Bb', 'Eb', 'Ab', 'Db'] },
    'Eb':     { count: 3, type: 'flats',  notes: ['Bb', 'Eb', 'Ab'] },
    'Bb':     { count: 2, type: 'flats',  notes: ['Bb', 'Eb'] },
    'F':      { count: 1, type: 'flats',  notes: ['Bb'] },
    'Am':     { count: 0, type: 'none',   notes: [] },
    'Em':     { count: 1, type: 'sharps', notes: ['F#'] },
    'Bm':     { count: 2, type: 'sharps', notes: ['F#', 'C#'] },
    'F#m':    { count: 3, type: 'sharps', notes: ['F#', 'C#', 'G#'] },
    'C#m':    { count: 4, type: 'sharps', notes: ['F#', 'C#', 'G#', 'D#'] },
    'G#m':    { count: 5, type: 'sharps', notes: ['F#', 'C#', 'G#', 'D#', 'A#'] },
    'D#m/Ebm':{ count: 6, type: 'sharps', notes: ['F#', 'C#', 'G#', 'D#', 'A#', 'E#'] },
    'Bbm':    { count: 5, type: 'flats',  notes: ['Bb', 'Eb', 'Ab', 'Db', 'Gb'] },
    'Fm':     { count: 4, type: 'flats',  notes: ['Bb', 'Eb', 'Ab', 'Db'] },
    'Cm':     { count: 3, type: 'flats',  notes: ['Bb', 'Eb', 'Ab'] },
    'Gm':     { count: 2, type: 'flats',  notes: ['Bb', 'Eb'] },
    'Dm':     { count: 1, type: 'flats',  notes: ['Bb'] }
  };

  /** Mapa de nome de nota para MIDI (oitava 4) para reprodução sonora */
  var NOTE_TO_MIDI = {
    'C': 60, 'C#': 61, 'Db': 61, 'D': 62, 'D#': 63, 'Eb': 63,
    'E': 64, 'F': 65, 'F#': 66, 'Gb': 66, 'G': 67, 'G#': 68,
    'Ab': 68, 'A': 69, 'A#': 70, 'Bb': 70, 'B': 71, 'Cb': 71
  };

  // ------------------------------------------------------------------
  // Estado interno
  // ------------------------------------------------------------------

  var _selectedKey = null;
  var _svgElement = null;
  var _infoElement = null;

  // ------------------------------------------------------------------
  // Funções puras (testáveis)
  // ------------------------------------------------------------------

  /**
   * Calcula o ângulo inicial e final de um segmento em uma divisão circular uniforme.
   * Começa do topo (-90°) e segue no sentido horário.
   *
   * @param {number} index - Índice do segmento (0-based)
   * @param {number} total - Número total de segmentos
   * @returns {{ startAngle: number, endAngle: number }} Ângulos em graus
   */
  function getSegmentAngle(index, total) {
    var segmentSize = 360 / total;
    var startAngle = -90 + (index * segmentSize);
    var endAngle = startAngle + segmentSize;
    return { startAngle: startAngle, endAngle: endAngle };
  }

  /**
   * Retorna informações da armadura de clave para uma tonalidade.
   *
   * @param {string} keyName - Nome da tonalidade (ex: 'G', 'Am', 'F#/Gb')
   * @returns {{ count: number, type: string, notes: string[] }|null}
   */
  function getKeySignatureInfo(keyName) {
    var info = KEY_SIGNATURES[keyName];
    if (!info) return null;
    return { count: info.count, type: info.type, notes: info.notes.slice() };
  }

  /**
   * Retorna a tonalidade menor relativa de uma tonalidade maior.
   *
   * @param {string} majorKey - Nome da tonalidade maior
   * @returns {string|null} Nome da tonalidade menor relativa
   */
  function getRelativeMinor(majorKey) {
    var idx = MAJOR_KEYS.indexOf(majorKey);
    if (idx === -1) return null;
    return MINOR_KEYS[idx];
  }

  /**
   * Verifica se uma posição no ciclo de quintas é uma posição enarmônica.
   * Posições 5, 6 e 7 (B/Cb, F#/Gb, Db/C#) são enarmônicas.
   *
   * @param {number} index - Índice na ordem de quintas (0-based)
   * @returns {boolean}
   */
  function isEnharmonicPosition(index) {
    return index === 5 || index === 6 || index === 7;
  }

  // ------------------------------------------------------------------
  // Funções auxiliares de SVG
  // ------------------------------------------------------------------

  /**
   * Converte graus para radianos.
   */
  function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Calcula ponto (x, y) em um arco dado centro, raio e ângulo.
   */
  function polarToCartesian(cx, cy, radius, angleDeg) {
    var rad = degreesToRadians(angleDeg);
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad)
    };
  }

  /**
   * Gera o path SVG para um segmento de anel (arco entre dois raios).
   */
  function describeArcSegment(cx, cy, outerRadius, innerRadius, startAngle, endAngle) {
    var outerStart = polarToCartesian(cx, cy, outerRadius, startAngle);
    var outerEnd = polarToCartesian(cx, cy, outerRadius, endAngle);
    var innerStart = polarToCartesian(cx, cy, innerRadius, startAngle);
    var innerEnd = polarToCartesian(cx, cy, innerRadius, endAngle);

    var largeArc = (endAngle - startAngle) > 180 ? 1 : 0;

    var d = [
      'M', outerStart.x, outerStart.y,
      'A', outerRadius, outerRadius, 0, largeArc, 1, outerEnd.x, outerEnd.y,
      'L', innerEnd.x, innerEnd.y,
      'A', innerRadius, innerRadius, 0, largeArc, 0, innerStart.x, innerStart.y,
      'Z'
    ].join(' ');

    return d;
  }

  /**
   * Cria um elemento SVG com namespace correto.
   */
  function createSvgElement(tag) {
    return document.createElementNS('http://www.w3.org/2000/svg', tag);
  }

  /**
   * Extrai o nome base da nota (sem sufixo 'm') para lookup MIDI.
   */
  function getTonicFromKey(keyName) {
    // Remove 'm' suffix for minor keys
    var name = keyName.replace(/m$/, '');
    // Handle enharmonic: take first name before '/'
    if (name.indexOf('/') !== -1) {
      name = name.split('/')[0];
    }
    return name;
  }

  // ------------------------------------------------------------------
  // Funções DOM / Renderização
  // ------------------------------------------------------------------

  /**
   * Inicializa o Circle of Fifths em um container HTML.
   *
   * @param {string} containerId - ID do elemento container
   */
  function init(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    // Criar título
    var title = document.createElement('h2');
    title.textContent = 'Ciclo de Quintas';
    title.className = 'section-title';
    container.appendChild(title);

    // Criar wrapper para SVG e info
    var wrapper = document.createElement('div');
    wrapper.className = 'circle-of-fifths-wrapper';
    container.appendChild(wrapper);

    // Dimensões do SVG
    var size = 450;
    var cx = size / 2;
    var cy = size / 2;
    var outerRadius = 200;
    var outerInnerRadius = 145;
    var innerRadius = 140;
    var innerInnerRadius = 90;

    // Criar SVG
    var svg = createSvgElement('svg');
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Ciclo de Quintas interativo');
    svg.classList.add('circle-of-fifths-svg');

    // Título SVG para acessibilidade
    var svgTitle = createSvgElement('title');
    svgTitle.textContent = 'Ciclo de Quintas - Diagrama interativo mostrando relações entre tonalidades';
    svg.appendChild(svgTitle);

    // Grupo para anel externo (maiores)
    var outerGroup = createSvgElement('g');
    outerGroup.setAttribute('class', 'cof-outer-ring');

    // Grupo para anel interno (menores)
    var innerGroup = createSvgElement('g');
    innerGroup.setAttribute('class', 'cof-inner-ring');

    // Grupo para textos
    var textGroup = createSvgElement('g');
    textGroup.setAttribute('class', 'cof-labels');

    var total = 12;

    // Renderizar segmentos do anel externo (major keys)
    for (var i = 0; i < total; i++) {
      var angles = getSegmentAngle(i, total);
      var path = createSvgElement('path');
      path.setAttribute('d', describeArcSegment(cx, cy, outerRadius, outerInnerRadius, angles.startAngle, angles.endAngle));
      path.setAttribute('class', 'cof-segment cof-major-segment' + (isEnharmonicPosition(i) ? ' cof-enharmonic' : ''));
      path.setAttribute('data-key', MAJOR_KEYS[i]);
      path.setAttribute('data-index', i);
      path.setAttribute('data-is-major', 'true');
      path.addEventListener('click', createClickHandler(MAJOR_KEYS[i], true));
      outerGroup.appendChild(path);

      // Label para tonalidade maior
      var midAngle = (angles.startAngle + angles.endAngle) / 2;
      var labelRadius = (outerRadius + outerInnerRadius) / 2;
      var labelPos = polarToCartesian(cx, cy, labelRadius, midAngle);
      var label = createSvgElement('text');
      label.setAttribute('x', labelPos.x);
      label.setAttribute('y', labelPos.y);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('dominant-baseline', 'central');
      label.setAttribute('class', 'cof-label cof-major-label');
      label.textContent = MAJOR_KEYS[i];
      textGroup.appendChild(label);
    }

    // Renderizar segmentos do anel interno (minor keys)
    for (var j = 0; j < total; j++) {
      var anglesMinor = getSegmentAngle(j, total);
      var pathMinor = createSvgElement('path');
      pathMinor.setAttribute('d', describeArcSegment(cx, cy, innerRadius, innerInnerRadius, anglesMinor.startAngle, anglesMinor.endAngle));
      pathMinor.setAttribute('class', 'cof-segment cof-minor-segment' + (isEnharmonicPosition(j) ? ' cof-enharmonic' : ''));
      pathMinor.setAttribute('data-key', MINOR_KEYS[j]);
      pathMinor.setAttribute('data-index', j);
      pathMinor.setAttribute('data-is-major', 'false');
      pathMinor.addEventListener('click', createClickHandler(MINOR_KEYS[j], false));
      innerGroup.appendChild(pathMinor);

      // Label para tonalidade menor
      var midAngleMinor = (anglesMinor.startAngle + anglesMinor.endAngle) / 2;
      var labelRadiusMinor = (innerRadius + innerInnerRadius) / 2;
      var labelPosMinor = polarToCartesian(cx, cy, labelRadiusMinor, midAngleMinor);
      var labelMinor = createSvgElement('text');
      labelMinor.setAttribute('x', labelPosMinor.x);
      labelMinor.setAttribute('y', labelPosMinor.y);
      labelMinor.setAttribute('text-anchor', 'middle');
      labelMinor.setAttribute('dominant-baseline', 'central');
      labelMinor.setAttribute('class', 'cof-label cof-minor-label');
      labelMinor.textContent = MINOR_KEYS[j];
      textGroup.appendChild(labelMinor);
    }

    // Círculo central decorativo
    var centerCircle = createSvgElement('circle');
    centerCircle.setAttribute('cx', cx);
    centerCircle.setAttribute('cy', cy);
    centerCircle.setAttribute('r', innerInnerRadius - 5);
    centerCircle.setAttribute('class', 'cof-center-circle');
    innerGroup.appendChild(centerCircle);

    svg.appendChild(outerGroup);
    svg.appendChild(innerGroup);
    svg.appendChild(textGroup);

    wrapper.appendChild(svg);
    _svgElement = svg;

    // Área de informações de armadura de clave
    var infoDiv = document.createElement('div');
    infoDiv.className = 'cof-key-info';
    infoDiv.innerHTML = '<p class="cof-info-placeholder">Clique em uma tonalidade para ver sua armadura de clave.</p>';
    wrapper.appendChild(infoDiv);
    _infoElement = infoDiv;

    // Legenda de enarmônicos na parte inferior
    var legend = document.createElement('div');
    legend.className = 'cof-enharmonic-legend';
    legend.innerHTML = '<span class="cof-legend-title">Enarmônicos:</span> ' +
      '<span class="cof-legend-item">F#/Gb</span> · ' +
      '<span class="cof-legend-item">C#/Db</span> · ' +
      '<span class="cof-legend-item">Cb/B</span>';
    wrapper.appendChild(legend);
  }

  /**
   * Cria um handler de click para um segmento de tonalidade.
   */
  function createClickHandler(keyName, isMajor) {
    return function () {
      handleSegmentClick(keyName, isMajor);
    };
  }

  /**
   * Trata o clique em um segmento de tonalidade.
   * Destaca o segmento, mostra info da armadura e toca a nota tônica.
   *
   * @param {string} keyName - Nome da tonalidade clicada
   * @param {boolean} isMajor - Se é uma tonalidade maior
   */
  function handleSegmentClick(keyName, isMajor) {
    // Remover destaque anterior
    if (_svgElement) {
      var highlighted = _svgElement.querySelectorAll('.cof-segment-active');
      for (var i = 0; i < highlighted.length; i++) {
        highlighted[i].classList.remove('cof-segment-active');
      }

      // Destacar segmento clicado
      var selector = '.cof-segment[data-key="' + keyName + '"]';
      var segment = _svgElement.querySelector(selector);
      if (segment) {
        segment.classList.add('cof-segment-active');
      }
    }

    // Mostrar informações da armadura de clave
    var info = getKeySignatureInfo(keyName);
    if (_infoElement && info) {
      var typeLabel = info.type === 'sharps' ? 'sustenido(s)' :
                     info.type === 'flats' ? 'bemol(is)' : 'nenhuma alteração';
      var notesStr = info.notes.length > 0 ? info.notes.join(', ') : '—';
      _infoElement.innerHTML =
        '<p class="cof-info-key"><strong>' + keyName + (isMajor ? ' Maior' : ' Menor') + '</strong></p>' +
        '<p class="cof-info-sig">' + info.count + ' ' + typeLabel + '</p>' +
        '<p class="cof-info-notes">Notas alteradas: ' + notesStr + '</p>';
    }

    // Tocar a nota tônica
    _selectedKey = keyName;
    var tonic = getTonicFromKey(keyName);
    var midi = NOTE_TO_MIDI[tonic];
    if (midi !== undefined && typeof AudioEngine !== 'undefined' && AudioEngine.playNote) {
      AudioEngine.playNote(midi);
    }
  }

  // ------------------------------------------------------------------
  // Retorno da API pública
  // ------------------------------------------------------------------

  return {
    init: init,
    handleSegmentClick: handleSegmentClick,
    getSegmentAngle: getSegmentAngle,
    getKeySignatureInfo: getKeySignatureInfo,
    getRelativeMinor: getRelativeMinor,
    isEnharmonicPosition: isEnharmonicPosition,
    MAJOR_KEYS: MAJOR_KEYS,
    MINOR_KEYS: MINOR_KEYS,
    KEY_SIGNATURES: KEY_SIGNATURES
  };

}());

// Expor no escopo global do navegador
if (typeof window !== 'undefined') {
  window.CircleOfFifths = CircleOfFifths;
}

// Export condicional para testabilidade com Node.js / Vitest
if (typeof module !== 'undefined') {
  module.exports = { CircleOfFifths: CircleOfFifths };
}
