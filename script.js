// *** Lógica JavaScript e Estruturas de Dados ***

// Mapeamento das 12 notas (C, C#, D, D#, E, F, F#, G, G#, A, A#, B)
const notasCromaticas = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// Nomenclatura dos Graus
// Distância em semitons: 0 a 12
const nomenclaturaGrausIntervalos = [
    { grau: "T"  , nome: "Tônica"     , semitons:  0 },
    { grau: "2ªb", nome: "2ª Menor"   , semitons:  1 },
    { grau: "2ª" , nome: "2ª Maior"   , semitons:  2 },
    { grau: "3ªb", nome: "3ª Menor"   , semitons:  3 },
    { grau: "3ª" , nome: "3ª Maior"   , semitons:  4 },
    { grau: "4ª" , nome: "4ª Justa"   , semitons:  5 },
    { grau: "5ªb", nome: "5ª Diminuta", semitons:  6 }, // 4# / 5b
    { grau: "5ª" , nome: "5ª Justa"   , semitons:  7 },
    { grau: "6ªb", nome: "6ª Menor"   , semitons:  8 },
    { grau: "6ª" , nome: "6ª Maior"   , semitons:  9 },
    { grau: "7ªb", nome: "7ª Menor"   , semitons: 10 },
    { grau: "7ªM", nome: "7ª Maior"   , semitons: 11 },
    { grau: "8ª" , nome: "8ª"         , semitons: 12 }
    // O grau 8 (Oitava) é o Tônica + 12 semitons
];
let cScaleName = "Maior";

// Mapeamento dos Intervalos (em semitons) para as escalas
const estruturasEscalas = {
    // Estrutura: Quantidade de semitons entre as notas
    "maior": [2, 2, 1, 2, 2, 2, 1], // T-T-S-T-T-T-S

    // --- ESCALAS MENORES ---
    "menor_natural":   [2, 1, 2, 2, 1, 2, 2], // T-S-T-T-S-T-T
    "menor_harmonica": [2, 1, 2, 2, 1, 3, 1], // T-S-T-T-S-T+S-S
    "menor_melodica" : [2, 1, 2, 2, 2, 2, 1], // T-S-T-T-T-T-S 
    
    "diminuta_tom_e_semitom": [2, 1, 2, 1, 2, 1, 2, 1], 

    // --- MODOS GREGOS ---
    "jonico":    [2, 2, 1, 2, 2, 2, 1], 
    "dorico":    [2, 1, 2, 2, 2, 1, 2], 
    "frigio":    [1, 2, 2, 2, 1, 2, 2],
    "lidio":     [2, 2, 2, 1, 2, 2, 1],
    "mixolidio": [2, 2, 1, 2, 2, 1, 2],
    "eolio":     [2, 1, 2, 2, 1, 2, 2],
    "locrio":    [1, 2, 2, 1, 2, 2, 2],
    
    // Outras Escalas
    "pentatonica_maior": [2, 2, 3, 2, 3],
    "pentatonica_menor": [2, 2, 3, 2, 3], 
    "diminuta_tom_e_semitom": [2, 2, 3, 2, 3], 
    "diminuta_semitom_e_tom": [2, 2, 3, 2, 3],
    "tons_inteiros": [1,1,1,1,1,1,1,1,1,1,1,1]
};


// Definição das Qualidades de Acordes para o Campo Harmônico
const estruturasAcordes = {
    // Tétrades Comuns
    "Maj7": [4, 7, 11], 
    "m7": [3, 7, 10],   
    "7": [4, 7, 10],     
    "m7b5": [3, 6, 10],

    // NOVAS ESTRUTURAS (para Menor Harmônica)
    "mMaj7": [3, 7, 11],    // Menor com 7ª Maior
    "Maj7#5": [4, 8, 11],   // Maior com 5ª Aumentada e 7ª Maior
    "dim7": [3, 6, 9]       // Sétima Diminuta
};



const campoHarmonicoMaior = [
    { grau: "I", qualidade: "Maj7" },
    { grau: "ii", qualidade: "m7" },
    { grau: "iii", qualidade: "m7" },
    { grau: "IV", qualidade: "Maj7" },
    { grau: "V", qualidade: "7" },
    { grau: "vi", qualidade: "m7" },
    { grau: "viiº", qualidade: "m7b5" }
];

const campoHarmonicoMenorNatural = [
    { grau: "i", qualidade: "m7" },
    { grau: "iiº", qualidade: "m7b5" }, // ou "dim" se for tríade
    { grau: "III", qualidade: "Maj7" },
    { grau: "iv", qualidade: "m7" },
    { grau: "v", qualidade: "m7" },
    { grau: "VI", qualidade: "Maj7" },
    { grau: "VII", qualidade: "7" }
];

// Campo Harmônico Menor Harmônica
// i - iiº - III+ - iv - V - VI - viiº
const campoHarmonicoMenorHarmonica = [
    { grau: "i", qualidade: "mMaj7" }, // Exceção: m com 7ª Maior
    { grau: "iiº", qualidade: "m7b5" },
    { grau: "III+", qualidade: "Maj7#5" }, // Exceção: Aumentado com 7ª Maior
    { grau: "iv", qualidade: "m7" },
    { grau: "V", qualidade: "7" }, // V Dominante
    { grau: "VI", qualidade: "Maj7" },
    { grau: "viiº", qualidade: "dim7" } // Exceção: Sétima Diminuta
];

// Menor Melódica Ascendente (i-ii-III+-IV-V-viº-viiº)
const campoHarmonicoMenorMelodica = [
    { grau: "i", qualidade: "mMaj7" },
    { grau: "ii", qualidade: "m7" },
    { grau: "III+", qualidade: "Maj7#5" },
    { grau: "IV", qualidade: "7" },
    { grau: "V", qualidade: "7" },
    { grau: "viº", qualidade: "m7b5" },
    { grau: "viiº", qualidade: "m7b5" }
];

// Dórico (i-ii-III-IV-v-viº-VII)
const campoHarmonicoDorico = [
    { grau: "i", qualidade: "m7" },
    { grau: "ii", qualidade: "m7" },
    { grau: "III", qualidade: "Maj7" },
    { grau: "IV", qualidade: "7" },
    { grau: "v", qualidade: "m7" },
    { grau: "viº", qualidade: "m7b5" },
    { grau: "VII", qualidade: "Maj7" }
];

// Frígio (i-II-III-iv-vº-VI-vii)
const campoHarmonicoFrigio = [
    { grau: "i", qualidade: "m7" },
    { grau: "II", qualidade: "Maj7" },
    { grau: "III", qualidade: "7" },
    { grau: "iv", qualidade: "m7b5" },
    { grau: "vº", qualidade: "m7b5" },
    { grau: "VI", qualidade: "Maj7" },
    { grau: "vii", qualidade: "m7" }
];

// Lídio (I-II-III-ivº-V-vi-vii)
const campoHarmonicoLidio = [
    { grau: "I", qualidade: "Maj7" },
    { grau: "II", qualidade: "7" },
    { grau: "III", qualidade: "m7" },
    { grau: "ivº", qualidade: "m7b5" },
    { grau: "V", qualidade: "Maj7" },
    { grau: "vi", qualidade: "m7" },
    { grau: "vii", qualidade: "m7" }
];

// Mixolídio (I-ii-iiiº-IV-v-VI-vii)
const campoHarmonicoMixolidio = [
    { grau: "I", qualidade: "7" },
    { grau: "ii", qualidade: "m7" },
    { grau: "iiiº", qualidade: "m7b5" },
    { grau: "IV", qualidade: "Maj7" },
    { grau: "v", qualidade: "m7" },
    { grau: "VI", qualidade: "m7" },
    { grau: "vii", qualidade: "Maj7" }
];

// Lócrio (iº-II-iii-iv-V-VI-vii)
const campoHarmonicoLocrio = [
    { grau: "iº", qualidade: "m7b5" },
    { grau: "II", qualidade: "Maj7" },
    { grau: "iii", qualidade: "m7" },
    { grau: "iv", qualidade: "m7" },
    { grau: "V", qualidade: "Maj7" },
    { grau: "VI", qualidade: "7" },
    { grau: "vii", qualidade: "m7" }
];




// ---------------- FUNÇÕES DE CÁLCULO MUSICAL --------------

/**
 * Função auxiliar para calcular as notas de um acorde.
 */
function calcularAcorde(tonicaIndex, estrutura) {
    let acorde = [notasCromaticas[tonicaIndex]]; 
    estrutura.forEach(intervalo => {
        const notaIndex = (tonicaIndex + intervalo) % 12;
        acorde.push(notasCromaticas[notaIndex]);
    });
    return acorde;
}

// Função auxiliar
const formatarNome = (chave) => {
    return chave.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

function gerarCampoHarmonico(tonicaIndex, tipoEscala) {
    let output = "";
    let estruturaCH; // Estrutura de acordes (Grau + Qualidade)
    let escalaEstrutura; // Estrutura de semitons da escala (para avançar o índice)
 

    // 1. Seleciona a estrutura de CH e a estrutura de intervalos
    switch(tipoEscala) {
        case 'maior':
        case 'jonico':
            estruturaCH = campoHarmonicoMaior;
            escalaEstrutura = estruturasEscalas['maior'];
            cScaleName = "Maior (Jônio)";
            break;
        case 'menor_natural':
        case 'eolio':
            estruturaCH = campoHarmonicoMenorNatural;
            escalaEstrutura = estruturasEscalas['menor_natural'];
            cScaleName = "Menor (Eólio)";
            break;
        case 'menor_harmonica':
            estruturaCH = campoHarmonicoMenorHarmonica;
            escalaEstrutura = estruturasEscalas['menor_harmonica'];
            cScaleName = "Menor Harmônica";
            break;
        case 'menor_melodica':
            estruturaCH = campoHarmonicoMenorMelodica;
            escalaEstrutura = estruturasEscalas['menor_melodica'];
            cScaleName = "Menor Melódica";
            break;
        case 'dorico':
            estruturaCH = campoHarmonicoDorico;
            escalaEstrutura = estruturasEscalas['dorico'];
            cScaleName = "Dórico";
            break;
        case 'frigio':
            estruturaCH = campoHarmonicoFrigio;
            escalaEstrutura = estruturasEscalas['frigio'];
            cScaleName = "Frígio";
            break;
        case 'lidio':
            estruturaCH = campoHarmonicoLidio;
            escalaEstrutura = estruturasEscalas['lidio'];
            cScaleName = "Lídio";
            break;
        case 'mixolidio':
            estruturaCH = campoHarmonicoMixolidio;
            escalaEstrutura = estruturasEscalas['mixolidio'];
            cScaleName = "Mixolidio";
            break;
        case 'locrio':
            estruturaCH = campoHarmonicoLocrio;
            escalaEstrutura = estruturasEscalas['locrio'];
             cScaleName = "Lócrio";
            break;
        case 'pentatonica_maior':
            // Escalas não-heptatônicas normalmente não têm um Campo Harmônico definido da mesma forma.
            output += `* Escala Pentatônica: Não possui Campo Harmônico Diatônico.`;
            return output;
        default:
            // Trata as escalas que ainda não possuem CH (ex: diminuta, outras pentatônicas)
            output += `* Campo Harmônico em desenvolvimento para a escala: ${formatarNome(tipoEscala)}.`;
            return output;
    }
        
    let currentIndex = tonicaIndex;

    for (let i = 0; i < estruturaCH.length; i++) {
        const grau = estruturaCH[i];
        
        // Assegura que o acorde é buscado corretamente (ex: Maj7#5 vira Maj7)
        const qualidadeChave = grau.qualidade.replace('º', 'm7b5').replace('+', '').replace('#5', '');

        // Pega a estrutura de semitons do acorde (Ex: [4, 7, 11] para Maj7)
        const qualidadeAcorde = estruturasAcordes[qualidadeChave];
        
        if (!qualidadeAcorde) {
             output += `${grau.grau} - ${notasCromaticas[currentIndex]}${grau.qualidade} (Estrutura de acorde desconhecida - Verifique estruturasAcordes)\n`;
             
        } else {
            const notasDoAcorde = calcularAcorde(currentIndex, qualidadeAcorde);
            
            // Formata a Saída: Grau - Acorde (Notas)
            output += `${grau.grau} - ${notasCromaticas[currentIndex]}${grau.qualidade} (${notasDoAcorde.join(', ')})\n`;
        }

        // Avançar para o próximo grau (usando o intervalo DA ESCALA)
        if (i < escalaEstrutura.length) {
            currentIndex = (currentIndex + escalaEstrutura[i]) % 12;
        }
    }
    
    return output;
}

/**
 * Cria a Tabela de Intervalos Dinâmica e aplica destaque.
 * @param {number} tonicaIndex - Índice da nota base.
 * @param {Array<string>} escalaNotas - Array das notas que compõem a escala (para destaque).
 */
function gerarTabelaDeIntervalos(tonicaIndex, escalaNotas) {
    let html = `<table class="interval-table">`;
    
    // LINHA 1: Notas Musicais (Cromáticas a partir da Tônica)
    html += `<thead><tr><th colspan="13" class="table-title">Tabela de Intervalos: ${notasCromaticas[tonicaIndex]}</th></tr></thead>`;
    html += `<tbody><tr>`;
    
    for (let i = 0; i <= 12; i++) {
        const notaIndex = (tonicaIndex + i) % 12;
        const nota = notasCromaticas[notaIndex];
        
        // Lógica de Destaque: Verifica se a nota faz parte do array escalaNotas
        let classeDestaque = '';
        if (escalaNotas.includes(nota)) {
            // Nota C# pode ser Db, então precisamos ser rigorosos. 
            // Como estamos usando apenas notação com # (sustenido), o includes() é suficiente por enquanto.
            classeDestaque = 'note-in-scale';
        }
        
        // A Tônica (i=0 e i=12) recebe um tratamento especial no CSS, mas o highlight 'note-in-scale' deve ser aplicado.
        html += `<td class="note-cell ${classeDestaque}">${nota}</td>`;
    }
    html += `</tr>`;

    // LINHA 2: Semitons (0, 0.5, 1, 1.5, ...)
    html += `<tr>`;
    for (let i = 0; i <= 12; i++) {
        const classeDestaque = escalaNotas.includes(notasCromaticas[(tonicaIndex + i) % 12]) ? 'note-in-scale' : '';
        html += `<td class="semitone-cell ${classeDestaque}">${i * 0.5}</td>`; 
    }
    html += `</tr>`;

    // LINHA 3: Nomenclatura do Grau (T, 2b, 2, 3b, ...)
    html += `<tr>`;
    for (let i = 0; i <= 12; i++) {
        let grauNome;
        if (i === 12) {
            grauNome = "8ª"; // Oitava
        } else {
            grauNome = nomenclaturaGrausIntervalos[i].grau;
        }
        const classeDestaque = escalaNotas.includes(notasCromaticas[(tonicaIndex + i) % 12]) ? 'note-in-scale' : '';
        html += `<td class="degree-cell ${classeDestaque}">${grauNome}</td>`;
    }
    html += `</tr>`;

        // LINHA 4: Numerações(0,1,2,3,.)
    html += `<tr>`;
    for (let i = 0; i <= 12; i++) {
        let grauNome;
        if (i === 12) {
            grauNome = "12"; // Oitava
        } else {
            grauNome = [i];
        }
        const classeDestaque = escalaNotas.includes(notasCromaticas[(tonicaIndex + i) % 12]) ? 'note-in-scale' : '';
        html += `<td class="degree-cell ${classeDestaque}">${grauNome}</td>`;
    }
    html += `</tr>`;


        
   html += ` </tbody></table>`;

    

    document.getElementById('tabelaIntervalosResultado').innerHTML = html;
}

// --- FUNÇÃO PRINCIPAL ---

function calcularEscala() {
    
    const tonicaInput = document.getElementById('tonica').value.trim().toUpperCase();
    const tipoEscala = document.getElementById('tipoEscala').value;
    const escalaEstrutura = estruturasEscalas[tipoEscala];    
    let cH2TabInterv = document.getElementById('cH2TabInterv');
    let cTomName = tonicaInput;

    cH2TabInterv.innerText = "📊 Tabela de Intervalos - " + cTomName + " "+ cScaleName;

    
    if (!tonicaInput || !escalaEstrutura) {
        alert("Por favor, insira uma Tônica válida e selecione um Tipo de Escala.");
        return;
    }

    // Tentar encontrar o índice da tônica
    let tonicaIndex = notasCromaticas.indexOf(tonicaInput);
    if (tonicaIndex === -1) {
        alert("Tônica não reconhecida. Use Sustenidos (#) ou a notação padrão (C, D, E, F, G, A, B).");
        return;
    }

    // ******* CORREÇÃO E GERAÇÃO DA ESCALA ********
    
    let escalaNotas = []; // Declarando a variável
    let escalaOutput = ""; // Declarando a variável
    let currentIndex = tonicaIndex; // Declarando a variável
    
    // 1. Geração da Escala e da Nomenclatura
    escalaNotas.push(tonicaInput); 
    escalaOutput += `1 - ${tonicaInput} - Tônica\n`;

    let grau = 2; // Declarando a variável
    let distanciaAcumulada = 0; // Para calcular a distância total em semitons

    for (let i = 0; i < escalaEstrutura.length; i++) {
        const intervalo = escalaEstrutura[i];
        distanciaAcumulada += intervalo;
        
        currentIndex = (currentIndex + intervalo) % 12; 
        const nota = notasCromaticas[currentIndex];
        escalaNotas.push(nota);
        
        // Busca o nome do grau pela distância acumulada em semitons (0 a 11)
        const nomeDoGrau = nomenclaturaGrausIntervalos[distanciaAcumulada % 12].nome;
        
        // Formato de saída: Número do Grau - Nota - Nomenclatura
        escalaOutput += `${grau} - ${nota} - ${nomeDoGrau}\n`;
        grau++;
    }

    document.getElementById('escalaResultado').innerText = escalaOutput;

    // 2. Geração do Campo Harmônico
    const campoHarmonicoResult = gerarCampoHarmonico(tonicaIndex, tipoEscala);
    document.getElementById('campoHarmonicoResultado').innerText = campoHarmonicoResult;

    // 3. Geração da Tabela de Intervalos
    gerarTabelaDeIntervalos(tonicaIndex, escalaNotas);
    
    gerarTecladoVirtual(tonicaInput, escalaNotas);
}

window.onload = function() {
    document.getElementById('tonica').value = 'C';
    document.getElementById('tipoEscala').value = 'maior';

    calcularEscala(); // Calcula a escala, campo harmônico e tabela de intervalos
    
    // NOVO: Chama a função para gerar a tabela geral
    gerarTabelaGeralEscalas(); 

};

/**
 * NOVO: Gera uma tabela com o nome e a estrutura de todas as escalas cadastradas.
 */
function gerarTabelaGeralEscalas() {
    // Acessa o objeto que já temos com as estruturas de semitons
    const estruturas = estruturasEscalas;
    let html = `<table class="general-scale-table">`;
    
    // Cabeçalho da Tabela
    html += `<thead><tr>`;
    html += `<th>Escala / Modo</th>`;
    html += `<th colspan="8">Estrutura (Intervalos em Semitons)</th>`;
    html += `</tr></thead><tbody>`;

    // Função auxiliar para formatar os nomes (Ex: "menor_natural" -> "Menor Natural")
    const formatarNome = (chave) => {
        return chave.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    // Iterar sobre cada escala/modo no objeto
    for (const escala in estruturas) {
        if (estruturas.hasOwnProperty(escala)) {
            const estrutura = estruturas[escala];
            
            html += `<tr>`;
            // Coluna 1: Nome da Escala
            html += `<td class="scale-name-cell">${formatarNome(escala)}</td>`;
            
            // Colunas 2-8: Os intervalos (T, T, S, T, T, T, S...)
            // O loop precisa ter 7 ou 8 colunas para escalas de 7 ou 8 notas.
            for (let i = 0; i < 8; i++) {
                let intervalo = estrutura[i] !== undefined ? estrutura[i] : '—'; // '—' se for menor que 8 notas
                
                // Aplica formatação de Tom/Semitom se o valor for 1 ou 2
                let intervaloFormatado;
                if (intervalo === 1) {
                    intervaloFormatado = 'Semitom'; // Semitom
                } else if (intervalo === 2) {
                    intervaloFormatado = 'Tom'; // Tom
                } else if (intervalo === 3) {
                    intervaloFormatado = 'Tom + Semitom'; // Tom e Semitom (Tom e Meio)
                } else {
                    intervaloFormatado = intervalo;
                }
                
                html += `<td class="interval-value-cell">${intervaloFormatado}</td>`;
            }
            html += `</tr>`;
        }
    }

    html += `</tbody></table>`;
    document.getElementById('tabelaGeralEscalasResultado').innerHTML = html;
}




/**
 * NOVO: Gera a visualização do teclado virtual (1 Oitava) centrado na tônica.
 * @param {string} tonicaInput - A tônica selecionada (Ex: 'C').
 * @param {Array<string>} escalaNotas - Array das notas da escala.
 */
function gerarTecladoVirtual(tonicaInput, escalaNotas) {
    const container = document.getElementById('tecladoVirtualContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    // --- Configuração do Teclado (2 Oitavas Completas como BASE) ---
    // Usamos 2 oitavas para ter margem de deslocamento e garantir a centralização
    const tecladoCompleto = [
        "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
        "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"
    ];
    
    const tipoTeclas = {
        "C": "branca", "D": "branca", "E": "branca", "F": "branca", "G": "branca", "A": "branca", "B": "branca",
        "C#": "preta", "D#": "preta", "F#": "preta", "G#": "preta", "A#": "preta"
    };

    let tonicaIndex = notasCromaticas.indexOf(tonicaInput);
    
    let htmlTeclasBrancas = '';
    let htmlTeclasPretas = '';
    let offsetX = 0; // Posição horizontal acumulada para as teclas brancas
    let visualNotes = []; // Array que armazena as 13 notas brancas (C até C) e suas 10 pretas

    // 1. Determinação da Posição da Tônica na Sequência Branca
    let posicaoBrancaTonica = 0;
    for (let i = 0; i < 7; i++) {
        if (notasCromaticas[(tonicaIndex + 12 - i) % 12] === tonicaInput) {
            posicaoBrancaTonica = i; // Posição da tônica na sequência de 7 notas brancas
            break;
        }
    }

    // 2. Determinação do Ponto de Início (Start Index)
    // O teclado precisa exibir 1 oitava (13 teclas brancas). 
    // Para centralizar, o ponto de início (C inicial da oitava) deve ser ajustado.
    // Vamos garantir que a faixa exibida (13 teclas brancas) contenha a tônica no meio.
    
    // A nota C (índice 0) é o ponto de partida do teclado cromático. 
    // Vamos começar o rendering 5 notas antes do C na sequência total de 24 notas cromáticas.
    const startIndex = 5; // Posição cromática na 1ª oitava.
    
    // Vamos renderizar uma faixa de 18 notas brancas e 15 pretas para garantir que a tônica esteja sempre visível e centralizada.
    const notasParaRenderizar = 24; 
    let startChromaticIndex = 0; // Começamos no C (índice 0)
    let currentChromaticIndex = startChromaticIndex;

    // 3. Renderização de uma faixa de 13 teclas brancas + pretas
    let numBrancasRenderizadas = 0;
    
    for (let i = 0; i < notasParaRenderizar; i++) {
        const notaCromatica = tecladoCompleto[currentChromaticIndex % 24];
        const tipo = tipoTeclas[notaCromatica];
        const isNotaNaEscala = escalaNotas.includes(notaCromatica);
        
        // Define o destaque
        let classeDestaque = '';
        if (isNotaNaEscala) {
            classeDestaque = tipo === 'branca' ? 'destaque-branca' : 'destaque-preta';
        }

        // Define a nota a ser exibida (sem bemóis, como solicitado)
        let notaExibida = tipo === 'preta' ? notaCromatica.replace('#', '♯') : notaCromatica;


        if (tipo === 'branca') {
            if (numBrancasRenderizadas >= 13) {
                 // Paramos na 13ª tecla branca (C da segunda oitava)
                 break;
            }
            // Teclas Brancas (Renderizadas sequencialmente)
            htmlTeclasBrancas += `<div 
                class="tecla branca ${classeDestaque}" 
                style="left: ${offsetX}px; z-index: 1;"
            >
                ${notaExibida}
            </div>`;
            offsetX += 40; // Largura da tecla branca
            numBrancasRenderizadas++;
        } else if (tipo === 'preta') {
            // Teclas Pretas (Posicionamento absoluto baseado na tecla branca anterior)
            const leftPosition = offsetX - 20; 

            htmlTeclasPretas += `<div 
                class="tecla preta ${classeDestaque}" 
                style="left: ${leftPosition}px; z-index: 2;"
            >
                ${notaExibida}
            </div>`;
        }
        
        currentChromaticIndex++;
    }

    // 4. Centralização do Teclado na Tônica (tonicaInput)
    
    // Largura total da faixa renderizada
    const faixaRenderizadaLargura = offsetX; 
    
    // Calcular a posição X da Tônica (tonicaInput) na faixa renderizada
    let xPosicaoTonica = -1;
    let currentX = 0;
    for (let i = 0; i < tecladoCompleto.length; i++) {
        const nota = tecladoCompleto[i];
        const tipo = tipoTeclas[nota];
        
        if (nota === tonicaInput) {
             xPosicaoTonica = currentX;
             break; 
        }
        
        // Simula o deslocamento para achar a posição da tônica
        if (tipo === 'branca') {
            currentX += 40; 
        }
    }
    
    // Se a tônica for preta, a posição X é a da tecla branca anterior + 20px (metade)
    if (tonicaInput.includes('#')) {
         // Ex: C# -> tônica é C (40px) + 20px
         // Vamos usar uma aproximação visual
         xPosicaoTonica += 20;
    }

    // Ponto Central da Tela de Exibição (aproximadamente 300px)
    const centroVisual = 280; // Metade da largura esperada do container pai

    // Deslocamento necessário para trazer a Tônica para o centro
    // O valor 'xPosicaoTonica' deve ser alinhado com 'centroVisual'
    let translateOffset = centroVisual - xPosicaoTonica;
    
    // O deslocamento máximo e mínimo devem ser limitados para não tirar a oitava da tela
    
    // Cria o wrapper interno que será transladado (movido horizontalmente)
    const innerWrapper = document.createElement('div');
    innerWrapper.style.position = 'relative';
    innerWrapper.style.width = `${faixaRenderizadaLargura}px`;
    innerWrapper.style.transform = `translateX(${translateOffset}px)`;
    innerWrapper.innerHTML = htmlTeclasBrancas + htmlTeclasPretas;

    container.innerHTML = '';
    container.appendChild(innerWrapper);
}