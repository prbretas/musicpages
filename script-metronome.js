// ************ Lógica do Metrônomo *****************************
let audioCtx = null; // Contexto de áudio da Web Audio API
let isPlaying = false; // Estado do metrônomo
let schedulerTimer = null; // Timer para o scheduler (substitui metronomeInterval)
let tempoBPM = 120; // BPM padrão
let beat = 0; // Contador de batidas (para acentuação, se implementado)

// ** VARIÁVEIS PARA PROGRAMAÇÃO DE ALTA PRECISÃO (SCHEDULING) **
let notesInQueue = []; // Armazena notas futuras (para sincronia visual)
let nextNoteTime = 0.0; // O tempo em que a próxima nota será tocada (em segundos)
const scheduleAheadTime = 0.1; // 100ms: Quanto tempo à frente programamos o áudio
const lookahead = 25.0; // 25ms: Intervalo de lookahead do setTimeout

/**
 * Programa um clique sonoro usando o Web Audio API.
 * @param {number} time - O tempo em segundos (relativo a audioCtx.currentTime) para tocar o som.
 */
function scheduleClick(time) {
    // 1. Cria e configura
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // Configuração do som
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, time);

    // 2. Envelopamento (Volume)
    gainNode.gain.setValueAtTime(1, time);
    // Reduz o volume rapidamente
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.03);

    // 3. Agenda o início e o fim
    osc.start(time);
    osc.stop(time + 0.05);

    // 4. Armazena para sincronização visual
    notesInQueue.push({ time: time, beat: beat });
    
    // Incrementa a batida (Assumindo 4/4)
    beat = (beat % 4) + 1;
}

/**
 * Calcula o tempo da próxima nota e a programa.
 */
function nextNote() {
    const secondsPerBeat = 60.0 / tempoBPM;
    nextNoteTime += secondsPerBeat;
    scheduleClick(nextNoteTime);
}

/**
 * Lógica principal de scheduling. Roda a cada `lookahead` milissegundos.
 */
function scheduler() {
    // Enquanto o tempo da próxima nota a tocar for menor que o tempo atual + tempo de lookahead
    while (nextNoteTime < audioCtx.currentTime + scheduleAheadTime) {
        nextNote();
    }
    // Reprograma o próprio scheduler
    schedulerTimer = setTimeout(scheduler, lookahead);
}

/**
 * Lógica para o indicador visual (Usando requestAnimationFrame para fluidez).
 */
function updateVisualIndicator() {
    const currentTime = audioCtx.currentTime;
    const indicator = document.getElementById('clickIndicator');
    
    // Remove notas que já passaram
    while (notesInQueue.length && notesInQueue[0].time < currentTime) {
        notesInQueue.shift();
    }
    
    // Se a próxima nota está dentro do intervalo de tolerância para ser percebida
    if (notesInQueue.length && notesInQueue[0].time < currentTime + 0.05) {
        indicator.classList.add('playing');
        // Remove a classe logo em seguida (simulando um flash rápido)
        setTimeout(() => {
            indicator.classList.remove('playing');
        }, 10);
    }

    // Continua a atualização visual
    if (isPlaying) {
        requestAnimationFrame(updateVisualIndicator);
    }
}

/**
 * Atualiza o display (BPM) e reinicia o metrônomo, se necessário.
 */
function updateMetronomeDisplay() {
 const display = document.getElementById('metronomeDisplay');
    const bpmInput = document.getElementById('bpmInput');
    
    // Valida o input
    let newBPM = parseInt(bpmInput.value, 10);
    if (newBPM < 20 || newBPM > 300 || isNaN(newBPM)) {
        newBPM = 120; // Padrão
        bpmInput.value = 120;
    }
    tempoBPM = newBPM;
    
    if (display) display.innerText = `${tempoBPM} BPM`;
    
    // Se o metrônomo estiver tocando, reinicia com o novo BPM
    if (isPlaying) {
        startStopButton()
        clearInterval(metronomeInterval);
        const intervalMs = 60000 / tempoBPM;
        metronomeInterval = setInterval(playClick, intervalMs);
    }
}

/**
 * Função que altera o BPM com base nos presets.
 * @param {number} bpm - O valor de BPM a ser definido.
 */
function setBPM(bpm) {
    // Garante que o BPM seja um número
    const novoBPM = parseInt(bpm, 10);
    if (isNaN(novoBPM)) return;

    tempoBPM = novoBPM;
    document.getElementById('bpmInput').value = novoBPM;
    
    // Se estiver tocando, interrompe o scheduling e reinicia
    if (isPlaying) {
        clearTimeout(schedulerTimer);
        
        if (audioCtx && audioCtx.state !== 'closed') {
            // Suspende e retoma o contexto para garantir a sincronia
            audioCtx.suspend().then(() => {
                audioCtx.resume().then(() => {
                    nextNoteTime = audioCtx.currentTime;
                    beat = 1;
                    scheduler();
                });
            });
        }
    }
    updateMetronomeDisplay();
}

/**
 * Inicia ou para o metrônomo.
 */
function startStopMetronome() {
    const bpmInput = document.getElementById('bpmInput');
    const startStopButton = document.getElementById('startStopButton');
    
    // Atualiza o valor do BPM e valida
    tempoBPM = parseInt(bpmInput.value, 10);
    if (tempoBPM < 20 || tempoBPM > 300 || isNaN(tempoBPM)) {
        alert("Por favor, insira um BPM entre 40 e 300.");
        bpmInput.value = 120;
        tempoBPM = 120;
        updateMetronomeDisplay();
        return;
    }

    if (!isPlaying) {
        // 1. INICIAR METRÔNOMO
        isPlaying = true;
        startStopButton.innerText = '■ Parar';
        startStopButton.style.backgroundColor = '#dc3545'; // Vermelho para Parar
        
        // Inicializa o AudioContext (só uma vez) ou retoma se estiver suspenso
        if (audioCtx === null) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } else if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        
        // Reseta o tempo e a batida para o início do scheduling
        nextNoteTime = audioCtx.currentTime;
        beat = 1;
        notesInQueue = []; 
        
        // Inicia o scheduling e o indicador visual
        scheduler();
        requestAnimationFrame(updateVisualIndicator);
        
    } else {
        // 2. PARAR METRÔNOMO
        isPlaying = false;
        startStopButton.innerText = '▶ Iniciar';
        startStopButton.style.backgroundColor = '#007bff'; // Azul para Iniciar
        
        // Para o scheduler
        clearTimeout(schedulerTimer);
        schedulerTimer = null;
        
        // Suspende o AudioContext (para liberar recursos)
        if (audioCtx && audioCtx.state !== 'closed') {
            audioCtx.suspend();
        }
    }
    updateMetronomeDisplay();
}

document.addEventListener("DOMContentLoaded", function () {
    updateMetronomeDisplay();
});