/**
 * script-scale-shapes.js
 * Scale Shapes CAGED — módulo responsável por calcular e renderizar shapes
 * de escala no fretboard usando o método CAGED generalizado.
 *
 * Implementado como IIFE-style com variáveis/funções globais.
 * Compatível com navegadores sem build step (sem ES6 imports/exports).
 *
 * Requirements: 1.1-1.8, 2.1-2.5, 3.1-3.4, 4.1-4.6, 5.1-5.6
 */

(function() {
    'use strict';

    // ------------------------------------------------------------------
    // Constants
    // ------------------------------------------------------------------

    /**
     * Paleta de cores para shapes — pelo menos 12 cores distintas.
     * Cada entrada é um nome de classe CSS prefixado com "shape-".
     */
    var SHAPE_COLORS = [
        'shape-0',   // vermelho
        'shape-1',   // azul
        'shape-2',   // verde
        'shape-3',   // laranja
        'shape-4',   // roxo
        'shape-5',   // ciano
        'shape-6',   // magenta
        'shape-7',   // amarelo-escuro
        'shape-8',   // rosa
        'shape-9',   // verde-lima
        'shape-10',  // índigo
        'shape-11'   // marrom
    ];

    /**
     * Array cromático local (12 notas em sustenido).
     */
    var notasCromaticas = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    // ------------------------------------------------------------------
    // Pure Helper Functions
    // ------------------------------------------------------------------

    /**
     * Determina a faixa de trastes (start, end) para um shape dado seu root fret.
     * A faixa é de 4 a 5 trastes, centralizada/iniciando no root.
     * O shape cobre startFret até endFret (inclusive), com endFret - startFret <= 4.
     *
     * @param {number} rootFret - Fret raiz do shape (0-based)
     * @param {number} numFrets - Total de frets do instrumento
     * @returns {{ startFret: number, endFret: number }}
     */
    function computeShapeRange(rootFret, numFrets) {
        // Shape starts at rootFret and spans 4 additional frets (5 frets total: startFret to startFret+4)
        var startFret = rootFret;
        var endFret = startFret + 4;

        // Clamp endFret to the instrument's available frets
        if (endFret > numFrets) {
            endFret = numFrets;
            // Try to maintain 5-fret span by shifting startFret back
            startFret = Math.max(0, endFret - 4);
        }

        return { startFret: startFret, endFret: endFret };
    }

    /**
     * Calcula a posição (fret) da primeira ocorrência de uma nota em cada corda.
     * Retorna um array com um fret number por corda.
     *
     * @param {string} targetNote - Nota alvo (ex: 'G')
     * @param {string[]} tuning - Afinação (ex: ['E','A','D','G','B','E'])
     * @param {number} numFrets - Número de trastes
     * @returns {number[]} Fret de primeira ocorrência por corda (index = string index)
     */
    function findNotePositions(targetNote, tuning, numFrets) {
        var targetIndex = notasCromaticas.indexOf(targetNote);
        if (targetIndex === -1) {
            // Return -1 for all strings if note is invalid
            return tuning.map(function() { return -1; });
        }

        return tuning.map(function(openNote) {
            var openIndex = notasCromaticas.indexOf(openNote);
            if (openIndex === -1) return -1;

            // Calculate semitone distance from open note to target
            var distance = (targetIndex - openIndex + 12) % 12;
            // distance is the fret number (0 means the note is the open string itself)
            if (distance <= numFrets) {
                return distance;
            }
            return -1;
        });
    }

    /**
     * Retorna todas as notas da escala alcançáveis numa faixa de trastes para uma corda.
     *
     * @param {string} openNote - Nota aberta da corda
     * @param {number} startFret - Primeiro fret da faixa (inclusive)
     * @param {number} endFret - Último fret da faixa (inclusive)
     * @param {string[]} scaleNotes - Notas da escala (ex: ['C','D','E','F','G','A','B'])
     * @param {number} numFrets - Total de frets do instrumento
     * @returns {Array<{note: string, fret: number}>} Notas encontradas com note e fret
     */
    function getScaleNotesInRange(openNote, startFret, endFret, scaleNotes, numFrets) {
        var openIndex = notasCromaticas.indexOf(openNote);
        if (openIndex === -1) return [];

        var results = [];
        // Clamp range to instrument frets
        var effectiveEnd = Math.min(endFret, numFrets);
        var effectiveStart = Math.max(startFret, 0);

        for (var fret = effectiveStart; fret <= effectiveEnd; fret++) {
            var noteIndex = (openIndex + fret) % 12;
            var noteName = notasCromaticas[noteIndex];

            // Check if this note is in the scale
            if (scaleNotes.indexOf(noteName) !== -1) {
                results.push({ note: noteName, fret: fret });
            }
        }

        return results;
    }

    // ------------------------------------------------------------------
    // Main Shape Computation
    // ------------------------------------------------------------------

    /**
     * Calcula os shapes para uma escala no fretboard.
     * Função PURA — sem dependência de DOM.
     *
     * Para cada nota da escala (grau), encontra a posição raiz na corda mais grave,
     * calcula a faixa de trastes (4-5 frets), e coleta todas as notas da escala
     * naquela faixa para cada corda.
     *
     * @param {Object} params
     * @param {string[]} params.scaleNotes - Notas da escala (ex: ['C','D','E','F','G','A','B'])
     * @param {string} params.tonic - Nota tônica
     * @param {string[]} params.tuning - Afinação atual (ex: ['E','A','D','G','B','E'])
     * @param {number} params.numFrets - Número de trastes do instrumento
     * @returns {Shape[]} Array de shapes, um por grau da escala
     */
    function computeShapes(params) {
        var scaleNotes = params.scaleNotes;
        var tonic = params.tonic;
        var tuning = params.tuning;
        var numFrets = params.numFrets;

        if (!scaleNotes || scaleNotes.length === 0) {
            return [];
        }

        var shapes = [];

        for (var i = 0; i < scaleNotes.length; i++) {
            var rootNote = scaleNotes[i];

            // Find root position on the first string (lowest/most grave string)
            var positions = findNotePositions(rootNote, tuning, numFrets);
            var rootFret = positions[0]; // First string (most grave)

            // If root note is not found on the first string, skip (shouldn't happen with valid input)
            if (rootFret === -1) {
                continue;
            }

            // Compute the fret range for this shape
            var range = computeShapeRange(rootFret, numFrets);

            // Collect all scale notes in range for each string
            var notes = [];
            for (var s = 0; s < tuning.length; s++) {
                var stringNotes = getScaleNotesInRange(tuning[s], range.startFret, range.endFret, scaleNotes, numFrets);
                // Add string index to each note
                for (var n = 0; n < stringNotes.length; n++) {
                    notes.push({
                        note: stringNotes[n].note,
                        fret: stringNotes[n].fret,
                        string: s
                    });
                }
            }

            shapes.push({
                index: i,
                rootNote: rootNote,
                rootFret: rootFret,
                startFret: range.startFret,
                endFret: range.endFret,
                notes: notes
            });
        }

        return shapes;
    }

    // ------------------------------------------------------------------
    // ShapeOverlay Functions (DOM + pure)
    // ------------------------------------------------------------------

    /**
     * Retorna a classe CSS de cor para um dado índice de shape.
     * Função pura — usa módulo para wrapping quando o índice excede o tamanho da paleta.
     *
     * @param {number} shapeIndex - Índice do shape (0-based)
     * @returns {string} Nome da classe CSS (ex: 'shape-0', 'shape-1')
     */
    function getShapeColorClass(shapeIndex) {
        return SHAPE_COLORS[shapeIndex % SHAPE_COLORS.length];
    }

    /**
     * Aplica classes de shape nas note-cells do fretboard.
     * Não remove classes existentes (in-scale, color-X, tonic) — apenas adiciona.
     * Notas em overlap de 2 shapes adjacentes recebem ambas classes.
     *
     * @param {Shape[]} shapes - Array de shapes computados
     */
    function applyShapeOverlay(shapes) {
        if (!shapes || shapes.length === 0) return;

        for (var i = 0; i < shapes.length; i++) {
            var shape = shapes[i];
            var colorClass = getShapeColorClass(shape.index);

            for (var n = 0; n < shape.notes.length; n++) {
                var notePos = shape.notes[n];
                // Find the note-cell matching string and fret
                var cells = document.querySelectorAll(
                    '.note-cell-fret[data-string="' + notePos.string + '"][data-fret="' + notePos.fret + '"]'
                );
                for (var c = 0; c < cells.length; c++) {
                    cells[c].classList.add(colorClass);
                }
            }
        }
    }

    /**
     * Remove todas as classes que começam com "shape-" de todas note-cells do fretboard.
     */
    function clearShapeOverlay() {
        var cells = document.querySelectorAll('.note-cell-fret');
        for (var i = 0; i < cells.length; i++) {
            var classList = cells[i].classList;
            var toRemove = [];
            for (var j = 0; j < classList.length; j++) {
                if (classList[j].indexOf('shape-') === 0) {
                    toRemove.push(classList[j]);
                }
            }
            for (var k = 0; k < toRemove.length; k++) {
                classList.remove(toRemove[k]);
            }
        }
    }

    // ------------------------------------------------------------------
    // ShapeTogglePanel (UI de controle)
    // ------------------------------------------------------------------

    /**
     * Mapeamento de índice de shape → cor RGB para uso em background de botões.
     * Corresponde às cores definidas em style-fretboard.css para .shape-N.
     */
    var SHAPE_BUTTON_COLORS = [
        'rgb(220, 38, 38)',    // shape-0: red
        'rgb(37, 99, 235)',    // shape-1: blue
        'rgb(22, 163, 74)',    // shape-2: green
        'rgb(234, 88, 12)',    // shape-3: orange
        'rgb(147, 51, 234)',   // shape-4: purple
        'rgb(6, 182, 212)',    // shape-5: cyan
        'rgb(219, 39, 119)',   // shape-6: magenta
        'rgb(180, 160, 0)',    // shape-7: dark-yellow
        'rgb(236, 72, 153)',   // shape-8: pink
        'rgb(76, 175, 80)',    // shape-9: lime-green
        'rgb(63, 81, 181)',    // shape-10: indigo
        'rgb(141, 110, 99)'   // shape-11: brown
    ];

    /** @type {boolean[]} Estado interno dos toggles */
    var _toggleStates = [];

    /** @type {HTMLElement|null} Referência ao container do painel */
    var _togglePanelContainer = null;

    /**
     * Renderiza o painel de toggles acima do fretboard.
     * Se chamado novamente, limpa e reconstrói o painel (idempotente).
     *
     * @param {number} shapeCount - Número de shapes a renderizar
     * @param {Function} onToggle - Callback(shapeIndex, isActive) ao clicar
     */
    function renderTogglePanel(shapeCount, onToggle) {
        // Remove painel existente se houver
        if (_togglePanelContainer && _togglePanelContainer.parentNode) {
            _togglePanelContainer.parentNode.removeChild(_togglePanelContainer);
        }

        // Inicializa estados — todos ativos
        _toggleStates = [];
        for (var i = 0; i < shapeCount; i++) {
            _toggleStates.push(true);
        }

        // Cria container
        _togglePanelContainer = document.createElement('div');
        _togglePanelContainer.className = 'shape-toggle-panel';

        // Cria botões
        for (var j = 0; j < shapeCount; j++) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = String(j + 1); // 1-based label
            btn.setAttribute('data-shape-index', String(j));
            btn.style.backgroundColor = SHAPE_BUTTON_COLORS[j % SHAPE_BUTTON_COLORS.length];
            btn.style.color = '#fff';
            btn.style.border = 'none';
            btn.style.borderRadius = '4px';
            btn.style.padding = '6px 12px';
            btn.style.cursor = 'pointer';
            btn.style.fontWeight = 'bold';
            btn.style.fontSize = '14px';
            btn.style.minWidth = '32px';

            // Closure para capturar índice
            (function(index) {
                btn.addEventListener('click', function() {
                    _toggleStates[index] = !_toggleStates[index];
                    var isActive = _toggleStates[index];

                    // Atualizar visual do botão
                    if (isActive) {
                        this.style.backgroundColor = SHAPE_BUTTON_COLORS[index % SHAPE_BUTTON_COLORS.length];
                    } else {
                        this.style.backgroundColor = '#666';
                    }

                    // Chamar callback
                    if (typeof onToggle === 'function') {
                        onToggle(index, isActive);
                    }
                });
            })(j);

            _togglePanelContainer.appendChild(btn);
        }

        // Inserir acima do fretboard no DOM
        var fretboardContainer = document.getElementById('fretboardContainer');
        var fretboard = document.getElementById('fretboard');
        if (fretboardContainer && fretboard) {
            fretboardContainer.insertBefore(_togglePanelContainer, fretboard);
        } else if (fretboardContainer) {
            // Fallback: append ao container se fretboard element não encontrado
            fretboardContainer.appendChild(_togglePanelContainer);
        }
    }

    /**
     * Reseta todos os toggles para o estado ativo (visible).
     * Atualiza estados internos e visual dos botões.
     */
    function resetToggles() {
        for (var i = 0; i < _toggleStates.length; i++) {
            _toggleStates[i] = true;
        }

        // Atualizar visual dos botões
        if (_togglePanelContainer) {
            var buttons = _togglePanelContainer.querySelectorAll('button');
            for (var j = 0; j < buttons.length; j++) {
                var idx = parseInt(buttons[j].getAttribute('data-shape-index'), 10);
                buttons[j].style.backgroundColor = SHAPE_BUTTON_COLORS[idx % SHAPE_BUTTON_COLORS.length];
            }
        }
    }

    /**
     * Retorna o estado atual de todos os toggles.
     * @returns {boolean[]} Array de estados (true=ativo/visível, false=inativo/oculto)
     */
    function getToggleStates() {
        return _toggleStates.slice(); // retorna cópia para evitar mutação externa
    }

    // ------------------------------------------------------------------
    // Hover Interaction (Pure computation)
    // ------------------------------------------------------------------

    /**
     * Calcula o estado de opacidade para cada shape dado um shape em hover.
     * Função PURA — testável sem DOM.
     *
     * @param {number} hoveredShapeIndex - Índice do shape sob hover (-1 = nenhum)
     * @param {number} totalShapes - Total de shapes
     * @returns {number[]} Array de opacidades (1.0 ou 0.3) por shape index
     */
    function computeHoverOpacities(hoveredShapeIndex, totalShapes) {
        var opacities = [];
        for (var i = 0; i < totalShapes; i++) {
            if (hoveredShapeIndex === -1) {
                opacities.push(1.0);
            } else {
                opacities.push(i === hoveredShapeIndex ? 1.0 : 0.3);
            }
        }
        return opacities;
    }

    // ------------------------------------------------------------------
    // Hover Interaction (DOM event delegation)
    // ------------------------------------------------------------------

    /**
     * Configura event listeners de hover nas note-cells com shape via event delegation.
     * - mouseenter: destaca shape do hovered note, esmurece os demais
     * - mouseleave: restaura opacidade de todos quando pointer sai de shape cells
     * - Respeita toggles: shapes desabilitados não participam do hover
     *
     * Usa event delegation no elemento #fretboard para eficiência.
     *
     * @param {Shape[]} shapes - Array de shapes computados
     * @returns {{ destroy: Function }} Objeto com método destroy() para remover listeners
     */
    function setupHoverInteraction(shapes) {
        var fretboard = document.getElementById('fretboard');
        if (!fretboard || !shapes || shapes.length === 0) {
            return { destroy: function() {} };
        }

        var totalShapes = shapes.length;

        /**
         * Determina quais índices de shape uma note-cell possui, baseado em suas classes CSS.
         * @param {HTMLElement} cell
         * @returns {number[]} Array de shape indices presentes na cell
         */
        function getShapeIndicesFromCell(cell) {
            var indices = [];
            var classList = cell.classList;
            for (var i = 0; i < classList.length; i++) {
                var cls = classList[i];
                if (cls.indexOf('shape-') === 0) {
                    var idx = parseInt(cls.substring(6), 10);
                    if (!isNaN(idx)) {
                        indices.push(idx);
                    }
                }
            }
            return indices;
        }

        /**
         * Aplica opacidades a todas note-cells com shape, respeitando toggle states.
         * @param {number[]} opacities - Array de opacidades por shape index
         */
        function applyOpacities(opacities) {
            var toggleStates = getToggleStates();
            var cells = fretboard.querySelectorAll('.note-cell-fret');
            for (var i = 0; i < cells.length; i++) {
                var cellIndices = getShapeIndicesFromCell(cells[i]);
                if (cellIndices.length === 0) continue;

                // Find the first active (toggled on) shape index for this cell
                var applicableOpacity = null;
                for (var j = 0; j < cellIndices.length; j++) {
                    var shapeIdx = cellIndices[j];
                    // Only consider shapes that are toggled on
                    if (shapeIdx < toggleStates.length && toggleStates[shapeIdx]) {
                        // Use the highest opacity among active shapes for this cell
                        var op = opacities[shapeIdx];
                        if (applicableOpacity === null || op > applicableOpacity) {
                            applicableOpacity = op;
                        }
                    }
                }

                if (applicableOpacity !== null) {
                    cells[i].style.opacity = String(applicableOpacity);
                }
            }
        }

        /**
         * Restaura opacidade de todas note-cells a 1.0.
         */
        function restoreAllOpacities() {
            var cells = fretboard.querySelectorAll('.note-cell-fret');
            for (var i = 0; i < cells.length; i++) {
                cells[i].style.opacity = '';
            }
        }

        /**
         * Handler para mouseover (delegado no fretboard).
         * Detecta se o target (ou ancestor) é uma note-cell com shape.
         */
        function handleMouseOver(event) {
            // Find the note-cell-fret element (target or closest ancestor within fretboard)
            var target = event.target;
            var cell = null;
            while (target && target !== fretboard) {
                if (target.classList && target.classList.contains('note-cell-fret')) {
                    cell = target;
                    break;
                }
                target = target.parentNode;
            }

            if (!cell) return;

            var shapeIndices = getShapeIndicesFromCell(cell);
            if (shapeIndices.length === 0) return;

            // Check toggle states — only consider active shapes
            var toggleStates = getToggleStates();
            var activeShapeIndex = -1;
            for (var i = 0; i < shapeIndices.length; i++) {
                var idx = shapeIndices[i];
                if (idx < toggleStates.length && toggleStates[idx]) {
                    activeShapeIndex = idx;
                    break; // Use the first active shape (lowest index)
                }
            }

            // If no active shape found on this cell, ignore hover
            if (activeShapeIndex === -1) return;

            var opacities = computeHoverOpacities(activeShapeIndex, totalShapes);
            applyOpacities(opacities);
        }

        /**
         * Handler para mouseout (delegado no fretboard).
         * Restaura opacidade quando pointer sai de shape cells.
         */
        function handleMouseOut(event) {
            // Check if the relatedTarget (where pointer is going) is still within a shape cell
            var relatedTarget = event.relatedTarget;
            var stillInShapeCell = false;

            // Walk up the relatedTarget to see if it's within a note-cell-fret with a shape
            var node = relatedTarget;
            while (node && node !== fretboard && node !== document) {
                if (node.classList && node.classList.contains('note-cell-fret')) {
                    var indices = getShapeIndicesFromCell(node);
                    if (indices.length > 0) {
                        // Check if any of these shapes are toggled on
                        var toggleStates = getToggleStates();
                        for (var i = 0; i < indices.length; i++) {
                            if (indices[i] < toggleStates.length && toggleStates[indices[i]]) {
                                stillInShapeCell = true;
                                break;
                            }
                        }
                    }
                    break;
                }
                node = node.parentNode;
            }

            if (!stillInShapeCell) {
                restoreAllOpacities();
            }
        }

        // Attach delegated event listeners
        fretboard.addEventListener('mouseover', handleMouseOver);
        fretboard.addEventListener('mouseout', handleMouseOut);

        return {
            destroy: function() {
                fretboard.removeEventListener('mouseover', handleMouseOver);
                fretboard.removeEventListener('mouseout', handleMouseOut);
                restoreAllOpacities();
            }
        };
    }

    // ------------------------------------------------------------------
    // Main Orchestration — scale-changed listener
    // ------------------------------------------------------------------

    /** @type {{ destroy: Function }|null} Referência ao hover interaction atual para cleanup */
    var _currentHoverInteraction = null;

    /** @type {Shape[]} Shapes computados atualmente ativos */
    var _currentShapes = [];

    /**
     * Toggle callback para o ShapeTogglePanel.
     * Quando um shape é toggled off, oculta suas notas (visibility hidden).
     * Quando toggled on, restaura visibilidade.
     *
     * @param {number} shapeIndex - Índice do shape toggled
     * @param {boolean} isActive - true = visível, false = oculto
     */
    function handleShapeToggle(shapeIndex, isActive) {
        if (!_currentShapes || !_currentShapes[shapeIndex]) return;

        var shape = _currentShapes[shapeIndex];
        var colorClass = getShapeColorClass(shape.index);

        // Find all note-cells belonging to this shape and toggle visibility
        var cells = document.querySelectorAll('.note-cell-fret.' + colorClass);
        for (var i = 0; i < cells.length; i++) {
            if (isActive) {
                cells[i].style.visibility = '';
            } else {
                cells[i].style.visibility = 'hidden';
            }
        }
    }

    /**
     * Handler principal para o evento scale-changed.
     * Orquestra o fluxo completo: compute → clear → apply → render → hover.
     *
     * @param {CustomEvent} event - Evento scale-changed com detail { notes, tonica, tipoEscala, tonicaIndex }
     */
    function handleScaleChanged(event) {
        var detail = event.detail || {};
        var notes = detail.notes || [];
        var tonica = detail.tonica || '';

        // Destroy previous hover interaction if any
        if (_currentHoverInteraction && typeof _currentHoverInteraction.destroy === 'function') {
            _currentHoverInteraction.destroy();
            _currentHoverInteraction = null;
        }

        // When notes is empty: clear overlay + reset toggles and stop
        if (!notes || notes.length === 0) {
            clearShapeOverlay();
            resetToggles();
            _currentShapes = [];
            return;
        }

        // Get tuning from getActiveFretboardState() or use default
        var tuning = ['E', 'A', 'D', 'G', 'B', 'E'];
        if (typeof getActiveFretboardState === 'function') {
            var state = getActiveFretboardState();
            if (state && state.tuning && state.tuning.length > 0) {
                tuning = state.tuning;
            }
        }

        var numFrets = 24; // Default number of frets

        // Compute shapes
        var shapes = computeShapes({
            scaleNotes: notes,
            tonic: tonica,
            tuning: tuning,
            numFrets: numFrets
        });

        // Clear previous overlay
        clearShapeOverlay();

        // Store current shapes for toggle callback
        _currentShapes = shapes;

        if (shapes.length > 0) {
            // Apply shape overlay colors
            applyShapeOverlay(shapes);

            // Render toggle panel with callback
            renderTogglePanel(shapes.length, handleShapeToggle);

            // Setup hover interaction
            _currentHoverInteraction = setupHoverInteraction(shapes);
        }
    }

    // Register the scale-changed event listener
    document.addEventListener('scale-changed', handleScaleChanged);

    // ------------------------------------------------------------------
    // Expose internals via window for browser usage
    // ------------------------------------------------------------------

    window._ScaleShapesInternals = {
        SHAPE_COLORS: SHAPE_COLORS,
        SHAPE_BUTTON_COLORS: SHAPE_BUTTON_COLORS,
        notasCromaticas: notasCromaticas,
        computeShapeRange: computeShapeRange,
        findNotePositions: findNotePositions,
        getScaleNotesInRange: getScaleNotesInRange,
        computeShapes: computeShapes,
        getShapeColorClass: getShapeColorClass,
        applyShapeOverlay: applyShapeOverlay,
        clearShapeOverlay: clearShapeOverlay,
        renderTogglePanel: renderTogglePanel,
        resetToggles: resetToggles,
        getToggleStates: getToggleStates,
        computeHoverOpacities: computeHoverOpacities,
        setupHoverInteraction: setupHoverInteraction,
        handleScaleChanged: handleScaleChanged,
        handleShapeToggle: handleShapeToggle
    };

    // ------------------------------------------------------------------
    // Conditional module.exports for Vitest testability
    // ------------------------------------------------------------------

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            SHAPE_COLORS: SHAPE_COLORS,
            SHAPE_BUTTON_COLORS: SHAPE_BUTTON_COLORS,
            notasCromaticas: notasCromaticas,
            computeShapeRange: computeShapeRange,
            findNotePositions: findNotePositions,
            getScaleNotesInRange: getScaleNotesInRange,
            computeShapes: computeShapes,
            getShapeColorClass: getShapeColorClass,
            applyShapeOverlay: applyShapeOverlay,
            clearShapeOverlay: clearShapeOverlay,
            renderTogglePanel: renderTogglePanel,
            resetToggles: resetToggles,
            getToggleStates: getToggleStates,
            computeHoverOpacities: computeHoverOpacities,
            setupHoverInteraction: setupHoverInteraction,
            handleScaleChanged: handleScaleChanged,
            handleShapeToggle: handleShapeToggle
        };
    }

})();
