/**
 * script-chord-expander.js
 * Expande a LocalChordDB com voicings adicionais gerados programaticamente.
 * Adiciona open positions, barre shapes em múltiplas casas, e inversões.
 * 
 * K-001 enhancement: UI de miniaturas clicáveis estilo CifraClub.
 */

/* global window, document */

var ChordExpander = (function () {
  'use strict';

  // ------------------------------------------------------------------
  // Geradores de patterns
  // ------------------------------------------------------------------

  /**
   * Calcula a posição absoluta de uma nota (root + semitons)
   */
  function getAbsoluteNote(root, semitones) {
    var chromatic = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    var flatToSharp = { 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#', 'Cb': 'B', 'Fb': 'E' };
    
    var normalizedRoot = flatToSharp[root] || root;
    var rootIdx = chromatic.indexOf(normalizedRoot);
    if (rootIdx === -1) return null;
    
    var targetIdx = (rootIdx + semitones) % 12;
    return chromatic[targetIdx];
  }

  /**
   * Converte shape de um root/base para outro (transposição de barre shapes)
   */
  function transposeShape(shape, fromRoot, toRoot) {
    var chromatic = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    var flatToSharp = { 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#' };
    
    var fromNorm = flatToSharp[fromRoot] || fromRoot;
    var toNorm = flatToSharp[toRoot] || toRoot;
    
    var fromIdx = chromatic.indexOf(fromNorm);
    var toIdx = chromatic.indexOf(toNorm);
    var delta = (toIdx - fromIdx + 12) % 12;

    // Transpor cada casa do shape
    var newFrets = shape.frets.map(function (fret) {
      if (fret === -1) return -1; // corda morta
      if (fret === 0) return 0;   // corda solta
      return fret + delta;
    });

    // Ajustar startFret (mínimo 1)
    var newStartFret = shape.startFret;
    if (newStartFret > 1) {
      newStartFret = Math.max(1, shape.startFret + delta);
    }

    // Recalcular barre se existir
    var newBarre = null;
    if (shape.barre) {
      // Barre se move junto com as notas
      newBarre = {
        fret: shape.barre.fret + delta,
        fromString: shape.barre.fromString,
        toString: shape.barre.toString
      };
    }

    return {
      chordName: toRoot + shape.chordName.slice(fromRoot.length),
      frets: newFrets,
      fingers: shape.fingers,
      startFret: newStartFret,
      barre: newBarre,
      source: 'expanded'
    };
  }

  /**
   * Gera barre shapes em múltiplas posições para um acorde base
   */
  function generateBarreVariants(baseShape, baseRoot, targetRoots) {
    var variants = [];
    
    targetRoots.forEach(function (root) {
      if (root === baseRoot) return; // já existe
      var transposed = transposeShape(baseShape, baseRoot, root);
      if (transposed) variants.push(transposed);
    });
    
    return variants;
  }

  // ------------------------------------------------------------------
  // Shapes base para transposição (open positions)
  // ------------------------------------------------------------------

  var baseOpenShapes = {
    // Major open
    'C': { chordName: 'C', frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0], startFret: 1, barre: null },
    'A': { chordName: 'A', frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0], startFret: 1, barre: null },
    'G': { chordName: 'G', frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3], startFret: 1, barre: null },
    'E': { chordName: 'E', frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0], startFret: 1, barre: null },
    'D': { chordName: 'D', frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2], startFret: 1, barre: null },
    
    // Minor open
    'Am': { chordName: 'Am', frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0], startFret: 1, barre: null },
    'Em': { chordName: 'Em', frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0], startFret: 1, barre: null },
    'Dm': { chordName: 'Dm', frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1], startFret: 1, barre: null },
    
    // 7th open
    'G7': { chordName: 'G7', frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1], startFret: 1, barre: null },
    'D7': { chordName: 'D7', frets: [-1, -1, 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3], startFret: 1, barre: null },
    'A7': { chordName: 'A7', frets: [-1, 0, 2, 0, 2, 0], fingers: [0, 0, 1, 0, 2, 0], startFret: 1, barre: null },
    'E7': { chordName: 'E7', frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0], startFret: 1, barre: null },
    'C7': { chordName: 'C7', frets: [-1, 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0], startFret: 1, barre: null },
    
    // Maj7 open
    'Cmaj7': { chordName: 'Cmaj7', frets: [-1, 3, 2, 0, 0, 0], fingers: [0, 3, 2, 0, 0, 0], startFret: 1, barre: null },
    'Am7': { chordName: 'Am7', frets: [-1, 0, 2, 0, 1, 0], fingers: [0, 0, 2, 0, 1, 0], startFret: 1, barre: null },
    
    // m7 open
    'Dm7': { chordName: 'Dm7', frets: [-1, -1, 0, 2, 1, 1], fingers: [0, 0, 0, 2, 1, 1], startFret: 1, barre: null },
    'Em7': { chordName: 'Em7', frets: [0, 2, 2, 0, 3, 0], fingers: [0, 2, 3, 0, 4, 0], startFret: 1, barre: null },
    
    // Suspended
    'Dsus4': { chordName: 'Dsus4', frets: [-1, -1, 0, 2, 3, 3], fingers: [0, 0, 0, 1, 3, 4], startFret: 1, barre: null },
    'Esus4': { chordName: 'Esus4', frets: [0, 2, 2, 2, 0, 0], fingers: [0, 1, 2, 3, 0, 0], startFret: 1, barre: null },
    
    // 9th chords (treated as 7 for simplicity)
    'D9': { chordName: 'D9', frets: [-1, -1, 0, 2, 1, 0], fingers: [0, 0, 0, 2, 1, 0], startFret: 1, barre: null },
    
    // Diminished
    'Adim': { chordName: 'Adim', frets: [-1, 0, 1, 2, 1, -1], fingers: [0, 0, 1, 3, 2, 0], startFret: 1, barre: null },
    'Edim': { chordName: 'Edim', frets: [0, 1, 2, 0, 0, -1], fingers: [0, 1, 2, 0, 0, 0], startFret: 1, barre: null },
    
    // m7b5 (half-diminished)
    'Am7b5': { chordName: 'Am7b5', frets: [-1, 0, 1, 0, 1, -1], fingers: [0, 0, 1, 0, 2, 0], startFret: 1, barre: null }
  };

  // ------------------------------------------------------------------
  // Inversões de acordes (shape movido, mesmo acorde)
  // ------------------------------------------------------------------

  var inversions = {
    'C': [
      // C no meio (X32010) - shape "A" movido com nota C no baixo
      { chordName: 'C', frets: [ -1, 3, 2, 0, 1, 0 ], fingers: [0, 3, 2, 0, 1, 0], startFret: 1, barre: null },
      // C/G (X32013) - inversão G no baixo
      { chordName: 'C', frets: [3, 3, 2, 0, 1, 0], fingers: [4, 3, 2, 0, 1, 0], startFret: 1, barre: null },
      // C/E (022010) - inversão E no baixo
      { chordName: 'C', frets: [0, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0], startFret: 1, barre: null },
      // C/B (X22010) - shape "D" com C no baixo
      { chordName: 'C', frets: [2, 3, 2, 0, 1, 0], fingers: [1, 3, 2, 0, 1, 0], startFret: 1, barre: null }
    ],
    'G': [
      // G/B (X20003) - inversão B
      { chordName: 'G', frets: [2, 2, 0, 0, 0, 3], fingers: [1, 1, 0, 0, 0, 4], startFret: 1, barre: null },
      // G/D (XX0003) - D no baixo
      { chordName: 'G', frets: [-1, -1, -1, 0, 0, 3], fingers: [0, 0, 0, 0, 0, 3], startFret: 1, barre: null }
    ],
    'Am': [
      // Am/G (302010) - G no baixo
      { chordName: 'Am', frets: [3, 0, 2, 2, 1, 0], fingers: [3, 0, 2, 4, 1, 0], startFret: 1, barre: null },
      // Am/C (X30010) - shape C com Am
      { chordName: 'Am', frets: [3, 0, 2, 2, 1, 0], fingers: [3, 0, 2, 4, 1, 0], startFret: 1, barre: null }
    ],
    'D': [
      // D/F# (200212) - F# no baixo (forma de Em)
      { chordName: 'D', frets: [2, 0, 0, 2, 3, 2], fingers: [1, 0, 0, 2, 4, 3], startFret: 1, barre: null },
      // D/A (X00232) - A no baixo
      { chordName: 'D', frets: [-1, 0, 0, 2, 3, 2], fingers: [0, 0, 0, 2, 4, 3], startFret: 1, barre: null }
    ]
  };

  // ------------------------------------------------------------------
  // Expansão da LocalChordDB
  // ------------------------------------------------------------------

  /**
   * Expande a base de dados com voicings adicionais
   */
  function expandChordData(originalData) {
    var allRoots = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
    // Copiar dados originais
    var expanded = {};
    
    // Primeiro, copiar todos os dados originais
    Object.keys(originalData).forEach(function (key) {
      expanded[key] = originalData[key].slice();
    });
    
    // Para cada shape base, gerar variantes em todos os roots
    Object.keys(baseOpenShapes).forEach(function (baseRoot) {
      var baseShape = baseOpenShapes[baseRoot];
      
      // Gerar barre shapes transpostos (forma aberta → barre em várias posições)
      var barrePositions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      
      allRoots.forEach(function (root) {
        var normalizedRoot = root;
        // Determinar qualidade do acorde base
        var quality = baseShape.chordName.slice(baseRoot.length);
        var targetKey = root + quality;
        
        if (!expanded[targetKey]) {
          expanded[targetKey] = [];
        }
        
        // Gerar barre shape na casa correspondente
        var transposed = transposeShape(baseShape, baseRoot, root);
        if (transposed) {
          // Verificar se já existe shape similar
          var exists = expanded[targetKey].some(function (s) {
            return s.startFret === transposed.startFret;
          });
          
          if (!exists) {
            expanded[targetKey].push(transposed);
          }
        }
      });
    });
    
    // Adicionar inversões conhecidas
    Object.keys(inversions).forEach(function (chord) {
      inversions[chord].forEach(function (inv) {
        if (expanded[chord]) {
          // Verificar se já existe
          var exists = expanded[chord].some(function (s) {
            return JSON.stringify(s.frets) === JSON.stringify(inv.frets);
          });
          if (!exists) {
            expanded[chord].push(inv);
          }
        }
      });
    });
    
    // Para cada acorde, adicionar barre shapes em posições diferentes
    Object.keys(expanded).forEach(function (chord) {
      var shapes = expanded[chord];
      var quality = chord.slice(1); // Remove root
      var root = chord[0] + (chord[1] === '#' || chord[1] === 'b' ? chord[1] : '');
      
      // Shape padrão de E transposto (se qualidade for m, usar Em como base)
      var baseChord = (quality.indexOf('m') === 0) ? 'Em' : 'E';
      if (baseOpenShapes[baseChord]) {
        // Gerar barre shapes em casas 2-12
        var barreChords = quality.indexOf('m') === 0 
          ? ['Em', 'Am', 'Dm', 'Bm']
          : ['E', 'A', 'D', 'G', 'C'];
        
        barreChords.forEach(function (base, idx) {
          if (baseOpenShapes[base]) {
            var transposed = transposeShape(baseOpenShapes[base], base, root + quality);
            if (transposed && transposed.startFret > 1) {
              var exists = shapes.some(function (s) {
                return s.startFret === transposed.startFret;
              });
              if (!exists) {
                shapes.push(transposed);
              }
            }
          }
        });
      }
    });
    
    // Ordenar shapes por startFret (open primeiro)
    Object.keys(expanded).forEach(function (key) {
      expanded[key].sort(function (a, b) {
        // Open positions primeiro (startFret === 1 com muitas casas 0)
        var aIsOpen = a.frets.filter(function (f) { return f === 0; }).length;
        var bIsOpen = b.frets.filter(function (f) { return f === 0; }).length;
        
        if (aIsOpen !== bIsOpen) return bIsOpen - aIsOpen;
        return a.startFret - b.startFret;
      });
    });
    
    return expanded;
  }

  // ------------------------------------------------------------------
  // UI de Miniaturas (CifraClub-style)
  // ------------------------------------------------------------------

  /**
   * Cria grade de miniaturas clicáveis para seleção de voicing
   */
  function createShapeGrid(chordName, shapes, activeIndex, onSelect) {
    var grid = document.createElement('div');
    grid.className = 'chord-shape-grid';
    
    shapes.forEach(function (shape, index) {
      var item = document.createElement('div');
      item.className = 'chord-shape-item' + (index === activeIndex ? ' chord-shape-item--active' : '');
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      item.setAttribute('aria-label', 'Posição ' + (index + 1) + ' de ' + shapes.length);
      item.setAttribute('aria-pressed', index === activeIndex.toString());
      
      // Mini SVG
      var miniSvg = SVGRenderer.renderDiagram(shape, {
        numStrings: 6,
        isDark: document.body.classList.contains('dark'),
        diagramWidth: 50,
        diagramHeight: 65,
        fretsToShow: 4
      });
      item.appendChild(miniSvg);
      
      // Label
      var label = document.createElement('span');
      label.className = 'chord-shape-label';
      label.textContent = shape.startFret === 1 && shape.frets.filter(function (f) { return f === 0; }).length > 0 
        ? 'Aberto' 
        : shape.startFret;
      item.appendChild(label);
      
      // Events
      item.addEventListener('click', function () {
        onSelect(index);
      });
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(index);
        }
      });
      
      grid.appendChild(item);
    });
    
    return grid;
  }

  // ------------------------------------------------------------------
  // Integração com ChordVisualizer
  // ------------------------------------------------------------------

  /**
   * Substitui a getChordShapes original para incluir shapes expandidos
   */
  function patchLocalChordDB() {
    if (typeof LocalChordDB === 'undefined') return;
    
    var originalGetChordShapes = LocalChordDB.getChordShapes;
    var expandedData = null; // Lazy load
    
    LocalChordDB.getChordShapes = function (chordName, tuning) {
      // Primeiro tentar API (comportamento original)
      if (typeof UberchordClient !== 'undefined') {
        // Não podemos retornar Promise aqui, então deixamos o fluxo original
        // Esta função só é chamada como fallback
      }
      
      // Usar dados expandidos
      if (!expandedData && typeof chordData !== 'undefined') {
        expandedData = expandChordData(chordData);
      }
      
      if (expandedData) {
        var normalized = normalizeChordName(chordName);
        var shapes = expandedData[normalized];
        if (shapes) return shapes.slice();
      }
      
      return originalGetChordShapes.call(LocalChordDB, chordName, tuning);
    };
  }

  // ------------------------------------------------------------------
  // Inicialização
  // ------------------------------------------------------------------

  function init() {
    // Patch LocalChordDB quando disponível
    if (typeof LocalChordDB !== 'undefined') {
      patchLocalChordDB();
    } else {
      // Tentar novamente quando o DOM estiver pronto
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
          setTimeout(patchLocalChordDB, 100);
        });
      } else {
        setTimeout(patchLocalChordDB, 100);
      }
    }
  }

  // Auto-init
  init();

  // ------------------------------------------------------------------
  // API Público
  // ------------------------------------------------------------------

  return {
    init: init,
    expandChordData: expandChordData,
    createShapeGrid: createShapeGrid,
    transposeShape: transposeShape,
    generateBarreVariants: generateBarreVariants
  };

}());

// Export para teste
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChordExpander;
}