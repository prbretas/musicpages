// script-fretboard.js

// Afinação Padrão (6 Cordas, EADGBE) - A corda 6 é a mais grossa (topo da imagem)
const TUNING = ["E", "B", "G", "D", "A", "E"];
const NUMBER_OF_FRETS = 24; // De 0 a 24
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
// Incluindo bemóis para que o mapeamento de cor funcione se a escala retornar bemol
const NOTE_COLORS = {
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

/**
 * Mapeia o braço do instrumento (Fretboard) e o desenha no HTML.
 * @param {string} containerId - O ID do elemento onde o braço será desenhado.
 */
function initializeFretboard(containerId) {
    const fretboard = document.getElementById(containerId);
    if (!fretboard) return;

    // 1. Cria as Cordas e Mapeia as Notas
    TUNING.forEach((openNote, stringIndex) => {
        const stringElement = document.createElement('div');
        stringElement.classList.add('string');
        stringElement.id = `string-${stringIndex}`;

        const openNoteIndex = NOTE_NAMES.indexOf(openNote);
        const fretWidth = 40; // Largura base da casa (simplificação visual)

        for (let fretNumber = 0; fretNumber <= NUMBER_OF_FRETS; fretNumber++) {
            // Calcula o índice da nota na matriz NOTE_NAMES
            const noteIndex = (openNoteIndex + fretNumber) % 12;
            const noteName = NOTE_NAMES[noteIndex]; // Nome em sustenido por padrão para mapeamento
            
            // Determina a posição X: centro da nota fica no centro da casa
            let posX = (fretNumber * fretWidth) + (fretWidth / 2);
            
            // Cria o elemento do traste (para layout)
            const fret = document.createElement('div');
            fret.classList.add('fret');


    
            fret.style.left = `${fretNumber * fretWidth}px`;
            fret.style.width = `${fretWidth}px`;

            // Adiciona marcadores de traste (dots) à primeira corda visualmente (fretboardContainer)
            if (stringIndex === 0) {
                 if ([3, 5, 7, 9, 15, 17, 19, 21].includes(fretNumber)) {
                    const marker = document.createElement('div');
                    marker.classList.add('fret-marker', 'single-dot');
                    fret.appendChild(marker);
                }
                if (fretNumber === 12 || fretNumber === 24) {
                    const marker1 = document.createElement('div');
                    marker1.classList.add('fret-marker', 'double-dot-top');
                    fret.appendChild(marker1);
                    const marker2 = document.createElement('div');
                    marker2.classList.add('fret-marker', 'double-dot-bottom');
                    fret.appendChild(marker2);
                }
            }


            // Cria o elemento da nota
            const noteCell = document.createElement('div');
            // Mapeia a cor pela nota em sustenido para consistência visual
            noteCell.classList.add('note-cell-fret', NOTE_COLORS[noteName] || 'color-default');
            noteCell.textContent = noteName; 
            noteCell.dataset.note = noteName; // Guarda a nota em sustenido
            noteCell.dataset.fret = fretNumber;
            noteCell.dataset.string = stringIndex;
            
            // Adiciona a célula da nota ao traste (o que é mais fácil de posicionar)
            // Posicionamento centralizado pelo CSS, aqui apenas garantimos a posição correta do traste
            
            // Nota aberta (Casa 0) - Tem um tratamento visual especial
            if (fretNumber === 0) {
                noteCell.textContent = openNote;
                noteCell.dataset.note = openNote;
                noteCell.classList.add('open-note');
            } 
            
            fret.appendChild(noteCell);
            stringElement.appendChild(fret);
        }
        fretboard.appendChild(stringElement);
    });
    
    // Ajuste o width do #fretboard para acomodar 24 casas (25 trastes de 40px)
    fretboard.style.width = `${(NUMBER_OF_FRETS + 1) * fretWidth}px`;
}

/**
 * Normaliza uma nota (ex: "Db") para sua representação em sustenido (ex: "C#")
 * para que o destaque funcione corretamente com a variável global NOTE_NAMES.
 * @param {string} note - A nota de entrada.
 * @returns {string} - A nota normalizada para sustenido.
 */
function normalizeToSharp(note) {
    const index = NOTE_NAMES.indexOf(note);
    if (index !== -1) return note; // Já está em sustenido ou é natural
    
    // Mapeamento inverso para sustenido
    const bemolToSharp = {
        "DB": "C#", "EB": "D#", "GB": "F#", "AB": "G#", "BB": "A#", 
        "CB": "B", "FB": "E"
    };
    return bemolToSharp[note.toUpperCase()] || note;
}


/**
 * Destaca as notas no Fretboard que pertencem à escala calculada.
 * @param {string[]} scaleNotes - Array de strings contendo as notas da escala (ex: ["G", "A", "B", "C", "D", "E", "F#"]).
 * @param {string} tonicNote - A nota tônica da escala (ex: "G").
 */
function highlightFretboardNotes(scaleNotes, tonicNote) {
    // 1. Limpar destaques anteriores
    const allNotes = document.querySelectorAll('.note-cell-fret');
    allNotes.forEach(note => {
        note.classList.remove('in-scale', 'tonic');
    });

    if (!scaleNotes || scaleNotes.length === 0) return;

    // 2. Normalizar as notas da escala para um Set, incluindo sustenidos e bemóis
    const scaleNotesSet = new Set();
    scaleNotes.forEach(note => {
        // Adiciona a nota original (para capturar Db, Eb, etc.)
        scaleNotesSet.add(note.toUpperCase());
        
        // Adiciona a versão em sustenido/bemol (enarmônica)
        const noteIndex = getChromaticIndex(note);
        if (noteIndex !== -1) {
            // Adiciona a versão em sustenido
            scaleNotesSet.add(NOTE_NAMES[noteIndex].toUpperCase());
            // Adiciona a versão em bemol (se existir)
            if (notasEnarmonicas[noteIndex]) {
                 scaleNotesSet.add(notasEnarmonicas[noteIndex].toUpperCase());
            }
        }
    });

    // 3. Normaliza a tônica
    const normalizedTonic = tonicNote.toUpperCase();
    
    // 4. Destacar as notas no braço
    allNotes.forEach(note => {
        const noteName = note.textContent.toUpperCase();
        
        // Verifica se a nota (em sustenido ou bemol) faz parte do set de notas da escala
        if (scaleNotesSet.has(noteName)) {
            note.classList.add('in-scale');
            
            // Verifica se é a tônica
            if (noteName === normalizedTonic || normalizeToSharp(noteName) === normalizeToSharp(normalizedTonic)) {
                note.classList.add('tonic');
            }
        }
    });
}

// Inicia o desenho do braço quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    initializeFretboard('fretboard');
});

