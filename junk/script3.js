// TESTE PARA VALIDAÇÃO DE ACESSO DE USUARIOS
let aArrUsers = [];
let cUserId = "prbretas";
let cUserIdInput = document.getElementById("");

// Encode64 the String - cUserId
let encodedString = btoa(cUserId);
//console.log(encodedString);

// Decode the String
let decodedString = atob(encodedString);
//console.log(decodedString);
aArrUsers[0] = [cUserId, encodedString];
//console.log(aArrUsers);

// *** Lógica JavaScript e Estruturas de Dados ***

// Mapeamento das 12 notas (Sempre em Sustenido por padrão)
const notasCromaticas = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

// Mapeamento de notas enarmônicas (Sustenido -> Bemol)
const notasEnarmonicas = {
  1: "Db", // C#
  3: "Eb", // D#
  6: "Gb", // F#
  8: "Ab", // G#
  10: "Bb", // A#
};

// NOVO: Mapeamento Invertido para lidar com input de tônica em bemol (Ex: 'Eb')
const notasEnarmonicasInvertido = {
  "Db": 1, 
  "Eb": 3, 
  "Gb": 6, 
  "Ab": 8, 
  "Bb": 10,
};

// Nomenclatura dos Graus
// Distância em semitons: 0 a 12
const nomenclaturaGrausIntervalos = [
  { grau: "T", nome: "Tônica", semitons: 0 },
  { grau: "2ªb", nome: "2ª Menor", semitons: 1 },
  { grau: "2ª", nome: "2ª Maior", semitons: 2 },
  { grau: "3ªb", nome: "3ª Menor", semitons: 3 },
  { grau: "3ª", nome: "3ª Maior", semitons: 4 },
  { grau: "4ª", nome: "4ª Justa", semitons: 5 },
  { grau: "5ªb", nome: "5ª Diminuta", semitons: 6 }, // 4# / 5b
  { grau: "5ª", nome: "5ª Justa", semitons: 7 },
  { grau: "6ªb", nome: "6ª Menor", semitons: 8 }, //5# / 6m
  { grau: "6ª", nome: "6ª Maior", semitons: 9 },
  { grau: "7ªb", nome: "7ª Menor", semitons: 10 },
  { grau: "7ªM", nome: "7ª Maior", semitons: 11 },
  { grau: "8ª", nome: "8ª", semitons: 12 },
  // O grau 8 (Oitava) é o Tônica + 12 semitons
];

let cScaleName = "Maior";

// Mapeamento dos Intervalos (em semitons) para as escalas
const estruturasEscalas = {
  // Estrutura: Quantidade de semitons entre as notas
  maior: [2, 2, 1, 2, 2, 2, 1], // T-T-S-T-T-T-S

  // --- ESCALAS MENORES ---
  menor_natural: [2, 1, 2, 2, 1, 2, 2], // T-S-T-T-S-T-T
  menor_harmonica: [2, 1, 2, 2, 1, 3, 1], // T-S-T-T-S-T+S-S
  menor_melodica: [2, 1, 2, 2, 2, 2, 1], // T-S-T-T-T-T-S

  // --- MODOS GREGOS ---
  jonico: [2, 2, 1, 2, 2, 2, 1],
  dorico: [2, 1, 2, 2, 2, 1, 2],
  frigio: [1, 2, 2, 2, 1, 2, 2],
  lidio: [2, 2, 2, 1, 2, 2, 1],
  mixolidio: [2, 2, 1, 2, 2, 1, 2],
  eolio: [2, 1, 2, 2, 1, 2, 2],
  locrio: [1, 2, 2, 1, 2, 2, 2],

  // Outras Escalas
  pentatonica_maior: [2, 2, 3, 2, 3],
  pentatonica_menor: [3, 2, 2, 3, 2], //fórmula T-3b-4-5-7b
  diminuta_tom_e_semitom: [2, 1, 2, 1, 2, 1, 2, 1],
  diminuta_semitom_e_tom: [1, 2, 1, 2, 1, 2, 1, 2],
  cromatica: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  tons_inteiros: [2, 2, 2, 2, 2, 2],
};

// Definição das Qualidades de Acordes para o Campo Harmônico
const estruturasAcordes = {
  // Tríades Comuns (Para Pentatônicas e outras aplicações)
  Maj: [4, 7], // Tríade Maior (T-3M-5J)
  m: [3, 7], // Tríade Menor (T-3m-5J)
  // Tétrades Comuns
  Maj7: [4, 7, 11],
  m7: [3, 7, 10],
  7: [4, 7, 10],
  m7b5: [3, 6, 10],

  // NOVAS ESTRUTURAS (para Menor Harmônica)
  mMaj7: [3, 7, 11], // Menor com 7ª Maior
  "Maj7#5": [4, 8, 11], // Maior com 5ª Aumentada e 7ª Maior
  dim7: [3, 6, 9], // Sétima Diminuta

  // NOVOS ACORDES PARA ESCALAS SIMÉTRICAS: //
  "7#5": [4, 8, 10], // Dominante com 5ª Aumentada (para Tons Inteiros)
  "7b9": [4, 7, 10, 1], // Dominante com 9ª Menor (para Diminuta Semitom/Tom)
};

const campoHarmonicoMaior = [
  { grau: "I", qualidade: "Maj7" },
  { grau: "ii", qualidade: "m7" },
  { grau: "iii", qualidade: "m7" },
  { grau: "IV", qualidade: "Maj7" },
  { grau: "V", qualidade: "7" },
  { grau: "vi", qualidade: "m7" },
  { grau: "viiº", qualidade: "m7b5" },
];

const campoHarmonicoMenorNatural = [
  { grau: "i", qualidade: "m7" },
  { grau: "iiº", qualidade: "m7b5" }, // ou "dim" se for tríade
  { grau: "III", qualidade: "Maj7" },
  { grau: "iv", qualidade: "m7" },
  { grau: "v", qualidade: "m7" },
  { grau: "VI", qualidade: "Maj7" },
  { grau: "VII", qualidade: "7" },
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
  { grau: "viiº", qualidade: "dim7" }, // Exceção: Sétima Diminuta
];

// Menor Melódica Ascendente (i-ii-III+-IV-V-viº-viiº)
const campoHarmonicoMenorMelodica = [
  { grau: "i", qualidade: "mMaj7" },
  { grau: "ii", qualidade: "m7" },
  { grau: "III+", qualidade: "Maj7#5" },
  { grau: "IV", qualidade: "7" },
  { grau: "V", qualidade: "7" },
  { grau: "viº", qualidade: "m7b5" },
  { grau: "viiº", qualidade: "m7b5" },
];

// Dórico (i-ii-III-IV-v-viº-VII)
const campoHarmonicoDorico = [
  { grau: "i", qualidade: "m7" },
  { grau: "ii", qualidade: "m7" },
  { grau: "III", qualidade: "Maj7" },
  { grau: "IV", qualidade: "7" },
  { grau: "v", qualidade: "m7" },
  { grau: "viº", qualidade: "m7b5" },
  { grau: "VII", qualidade: "Maj7" },
];

// Frígio (i-II-III-iv-vº-VI-vii)
const campoHarmonicoFrigio = [
  { grau: "i", qualidade: "m7" },
  { grau: "II", qualidade: "Maj7" },
  { grau: "III", qualidade: "7" },
  { grau: "iv", qualidade: "m7b5" },
  { grau: "vº", qualidade: "m7b5" },
  { grau: "VI", qualidade: "Maj7" },
  { grau: "vii", qualidade: "m7" },
];

// Lídio (I-II-III-ivº-V-vi-vii)
const campoHarmonicoLidio = [
  { grau: "I", qualidade: "Maj7" },
  { grau: "II", qualidade: "7" },
  { grau: "III", qualidade: "m7" },
  { grau: "ivº", qualidade: "m7b5" },
  { grau: "V", qualidade: "Maj7" },
  { grau: "vi", qualidade: "m7" },
  { grau: "vii", qualidade: "m7" },
];

// Mixolídio (I-ii-iiiº-IV-v-VI-vii)
const campoHarmonicoMixolidio = [
  { grau: "I", qualidade: "7" },
  { grau: "ii", qualidade: "m7" },
  { grau: "iiiº", qualidade: "m7b5" },
  { grau: "IV", qualidade: "Maj7" },
  { grau: "v", qualidade: "m7" },
  { grau: "vi", qualidade: "m7" },
  { grau: "vii", qualidade: "Maj7" },
];

// Lócrio (iº-II-iii-iv-V-VI-vii)
const campoHarmonicoLocrio = [
  { grau: "iº", qualidade: "m7b5" },
  { grau: "II", qualidade: "Maj7" },
  { grau: "iii", qualidade: "m7" },
  { grau: "iv", qualidade: "m7" },
  { grau: "V", qualidade: "Maj7" },
  { grau: "VI", qualidade: "7" },
  { grau: "vii", qualidade: "m7" },
];

// Escala Pentatônica Maior (T - 2M - 3M - 5J - 6M)
const campoHarmonicoPentaMaior = [
  { grau: "I", qualidade: "Maj" }, // Tônica (I)
  { grau: "II", qualidade: "m" }, // 2ª (geralmente usada como substituto de ii ou IV)
  { grau: "III", qualidade: "m" }, // 3ª (Tríade gerada sobre o III é menor)
  { grau: "V", qualidade: "Maj" }, // 5ª (V)
  { grau: "VI", qualidade: "m" }, // 6ª (Relativa Menor, vi)
];

// Escala Pentatônica Menor (T - 3m - 4J - 5J - 7m)
const campoHarmonicoPentaMenor = [
  { grau: "I", qualidade: "m" }, // Tônica (i)
  { grau: "III", qualidade: "Maj" }, // 3ª menor (III relativo)
  { grau: "IV", qualidade: "m" }, // 4ª (iv)
  { grau: "V", qualidade: "m" }, // 5ª (v, embora a nota seja parte da harmonia)
  { grau: "VII", qualidade: "Maj" }, // 7ª menor (VII relativo)
];

// Escala Diminuta Tom-Semitom (Oito notas)
// T - 2M - 3m - 4J - 5b - 6m - 7m - 7M
const campoHarmonicoDiminutaTomSemitom = [
  { grau: "I", qualidade: "dim7" }, // Tônica Diminuta (funcionalidade mais comum)
  { grau: "II", qualidade: "7" }, // 2ª Maior Dominante (Ex: Cdim7 e D7)
  { grau: "III", qualidade: "dim7" }, // Repetição da Qualidade Diminuta
  { grau: "IV", qualidade: "7" }, // Dominante
  { grau: "V", qualidade: "dim7" }, // Repetição da Qualidade Diminuta
  { grau: "VI", qualidade: "7" }, // Dominante
  { grau: "VII", qualidade: "dim7" }, // Repetição da Qualidade Diminuta
  { grau: "VIII", qualidade: "7" }, // Oitavo grau Dominante
];

// Escala Diminuta Semitom-Tom (Oito notas)
// T - 2b - 3m - 3M - 5b - 5J - 6M - 7b
const campoHarmonicoDiminutaSemitomTom = [
  { grau: "I", qualidade: "7b9" }, // Tônica Dominante com 9ª menor (acorde característico)
  { grau: "II", qualidade: "dim7" }, // Acorde Diminuto
  { grau: "III", qualidade: "7b9" }, // Repetição (Funcionalidade Dominante)
  { grau: "IV", qualidade: "dim7" }, // Repetição Diminuta
  { grau: "V", qualidade: "7b9" }, // Repetição Dominante
  { grau: "VI", qualidade: "dim7" }, // Repetição Diminuta
  { grau: "VII", qualidade: "7b9" }, // Repetição Dominante
  { grau: "VIII", qualidade: "dim7" }, // Repetição Diminuta
];

// Escala de Tons Inteiros (Seis notas)
// T - 2M - 3M - 4# - 6m - 7b
const campoHarmonicoTonsInteiros = [
  { grau: "I", qualidade: "7#5" },
  { grau: "II", qualidade: "7#5" },
  { grau: "III", qualidade: "7#5" },
  { grau: "IV", qualidade: "7#5" },
  { grau: "V", qualidade: "7#5" },
  { grau: "VI", qualidade: "7#5" },
];

// Escala Cromática (Doze notas)
// Usamos o acorde 7 (Dominante) como uma escolha harmônica comum na condução cromática.
const campoHarmonicoCromatico = [
  { grau: "I", qualidade: "7" },
  { grau: "IIb", qualidade: "7" },
  { grau: "II", qualidade: "7" },
  { grau: "IIIb", qualidade: "7" },
  { grau: "III", qualidade: "7" },
  { grau: "IV", qualidade: "7" },
  { grau: "Vb", qualidade: "7" },
  { grau: "V", qualidade: "7" },
  { grau: "VIb", qualidade: "7" },
  { grau: "VI", qualidade: "7" },
  { grau: "VIIb", qualidade: "7" },
  { grau: "VII", qualidade: "7" },
];

// CORES DAS NOTAS (Para visualização no braço)
const CORES_NOTAS = {
    0: "#007bff",   // C (Azul)
    1: "#00bfff",   // C# (Azul Claro)
    2: "#28a745",   // D (Verde)
    3: "#32cd32",   // D# (Verde Lima)
    4: "#ffc107",   // E (Amarelo)
    5: "#ff8c00",   // F (Laranja)
    6: "#dc3545",   // F# (Vermelho)
    7: "#8a2be2",   // G (Roxo)
    8: "#9370db",   // G# (Roxo Claro)
    9: "#ff69b4",   // A (Rosa)
    10: "#ff1493",  // A# (Rosa Choque)
    11: "#00ced1"   // B (Turquesa)
};

// ---------------- FUNÇÕES AUXILIARES DE AFINAÇÃO (NOVAS) --------------

// Afinação padrão da guitarra: E, A, D, G, B, E (Cordas 6 a 1)
const AFINACAO_NOMES = ["E", "A", "D", "G", "B", "E"];

/**
 * Mapeia o nome da nota (C, C#, Db) para seu índice cromático (0-11).
 * @param {string} nome - Nome da nota.
 * @returns {number} Índice cromático.
 */
function getChromaticIndex(nome) {
    let index = notasCromaticas.indexOf(nome);
    if (index === -1) {
        // Tenta encontrar o índice da nota na versão bemol (se for Db, Eb, etc.)
        index = notasEnarmonicasInvertido[nome];
    }
    return index !== undefined ? index : -1;
}


/**
 * NOVO: Gera os inputs de afinação dinâmicos no HTML.
 */
function gerarControlesAfinacao() {
    const container = document.getElementById('afinacãoControles');
    let html = '';

    // Cordas 6 (E Grave) a 1 (E Aguda)
    for (let i = 0; i < AFINACAO_NOMES.length; i++) {
        const cordaNum = 6 - i; // Numeração de 6 a 1
        const nomeNota = AFINACAO_NOMES[i];

        html += `
            <div class="corda-input-group">
                <label for="corda${cordaNum}Input">Corda ${cordaNum}</label>
                <input 
                    type="text" 
                    id="corda${cordaNum}Input" 
                    value="${nomeNota}" 
                    maxlength="2"
                    onchange="validarEAtualizarAfinacao(${cordaNum})"
                />
            </div>
        `;
    }
    if (container) container.innerHTML = html;
}

/**
 * NOVO: Valida o input de afinação e recalcula o braço se for válido.
 */
function validarEAtualizarAfinacao(cordaNum) {
    const input = document.getElementById(`corda${cordaNum}Input`);
    if (!input) return;
    
    let nota = input.value.trim().toUpperCase();

    // Normalização (Ex: 'DB' para 'Db', 'C#' para 'C#')
    if (nota.length > 1 && (nota.endsWith('B') || nota.endsWith('#'))) {
        // Garante que apenas a primeira letra seja maiúscula, e o #/b em minúsculo
        nota = nota.charAt(0) + nota.slice(1).toLowerCase();
        // Corrige casos como 'eb' para 'Eb'
        if (nota.length === 2 && nota.endsWith('b')) {
             nota = nota.charAt(0).toUpperCase() + 'b';
        } else if (nota.length === 2 && nota.endsWith('#')) {
             nota = nota.charAt(0).toUpperCase() + '#';
        }
    } else {
        nota = nota.charAt(0).toUpperCase(); // Garante 'E' para 'e'
    }

    // Verifica se a nota é válida
    if (getChromaticIndex(nota) === -1) {
        alert(`Nota "${nota}" inválida para a corda ${cordaNum}. Use C, C#, Db, D, etc.`);
        // Reverte para o valor padrão da corda
        input.value = AFINACAO_NOMES[6 - cordaNum]; 
        return;
    }

    input.value = nota; // Garante que o input é formatado (Ex: 'c#' -> 'C#')
    calcularEscala(); // Recalcula tudo com a nova afinação
}

/**
 * NOVO: Lê os inputs e retorna a estrutura de afinação (Substitui AFINACAO_PADRAO).
 * @returns {Array<Object>} Lista de objetos de afinação (6 cordas, 6 a 1).
 */
function getAfinaçãoAtual() {
    const afinacao = [];
    // Itera das cordas 6 a 1
    for (let i = 6; i >= 1; i--) {
        const input = document.getElementById(`corda${i}Input`);
        // Se o input não existe, usa o AFINACAO_NOMES
        let nome = input ? input.value : AFINACAO_NOMES[6 - i];
        
        let indice = getChromaticIndex(nome);
        
        afinacao.push({ 
            nome: nome, 
            indice: indice, 
            cordaNum: i // 6, 5, 4, 3, 2, 1
        });
    }
    // Retorna a afinação na ordem: Corda 6 -> Corda 1
    return afinacao; 
}


// ---------------- FUNÇÕES DE CÁLCULO MUSICAL (MANTIDAS) --------------

/**
 * NOVO: Determina o nome correto da nota (Sustenido ou Bemol) baseado na preferência da escala (useFlats).
 * @param {number} absoluteIndex - Índice cromático da nota (0-11).
 * @param {boolean} useFlats - Se for true, prefere a notação em bemol (Db, Eb, Gb, Ab, Bb).
 * @returns {string} O nome correto da nota.
 */
function getCorrectedNoteName(absoluteIndex, useFlats) {
    let nota = notasCromaticas[absoluteIndex]; 

    // Se a preferência for por Bemol e a nota tiver uma representação em bemol, usa.
    if (useFlats && notasEnarmonicas[absoluteIndex]) {
        nota = notasEnarmonicas[absoluteIndex];
    }
    // Para notas naturais e sustenidos não-enarmônicos, usa o notasCromaticas.
    return nota;
}


/**
 * Função auxiliar para calcular as notas de um acorde.
 */
function calcularAcorde(tonicaIndex, estrutura) {
  let acorde = [notasCromaticas[tonicaIndex]];
  estrutura.forEach((intervalo) => {
    const notaIndex = (tonicaIndex + intervalo) % 12;
    acorde.push(notasCromaticas[notaIndex]);
  });
  return acorde;
}

// Função auxiliar
const formatarNome = (chave) => {
  return chave
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

function gerarCampoHarmonico(tonicaIndex, tipoEscala) {
  let output = "";
  let estruturaCH; // Estrutura de acordes (Grau + Qualidade)
  let escalaEstrutura; // Estrutura de semitons da escala (para avançar o índice)

  // 1. Seleciona a estrutura de CH e a estrutura de intervalos
  switch (tipoEscala) {
    case "maior":
    case "jonico":
      estruturaCH = campoHarmonicoMaior;
      escalaEstrutura = estruturasEscalas["maior"];
      cScaleName = "Maior (Jônio)";
      break;
    case "menor_natural":
    case "eolio":
      estruturaCH = campoHarmonicoMenorNatural;
      escalaEstrutura = estruturasEscalas["menor_natural"];
      cScaleName = "Menor (Eólio)";
      break;
    case "menor_harmonica":
      estruturaCH = campoHarmonicoMenorHarmonica;
      escalaEstrutura = estruturasEscalas["menor_harmonica"];
      cScaleName = "Menor Harmônica";
      break;
    case "menor_melodica":
      estruturaCH = campoHarmonicoMenorMelodica;
      escalaEstrutura = estruturasEscalas["menor_melodica"];
      cScaleName = "Menor Melódica";
      break;
    case "dorico":
      estruturaCH = campoHarmonicoDorico;
      escalaEstrutura = estruturasEscalas["dorico"];
      cScaleName = "Dórico";
      break;
    case "frigio":
      estruturaCH = campoHarmonicoFrigio;
      escalaEstrutura = estruturasEscalas["frigio"];
      cScaleName = "Frígio";
      break;
    case "lidio":
      estruturaCH = campoHarmonicoLidio;
      escalaEstrutura = estruturasEscalas["lidio"];
      cScaleName = "Lídio";
      break;
    case "mixolidio":
      estruturaCH = campoHarmonicoMixolidio;
      escalaEstrutura = estruturasEscalas["mixolidio"];
      cScaleName = "Mixolídio";
      break;
    case "locrio":
      estruturaCH = campoHarmonicoLocrio;
      escalaEstrutura = estruturasEscalas["locrio"];
      cScaleName = "Lócrio";
      break;
    case "pentatonica_maior":
      estruturaCH = campoHarmonicoPentaMaior; 
      escalaEstrutura = estruturasEscalas["pentatonica_maior"];
      cScaleName = "Pentatônica Maior";
      break;
    case "pentatonica_menor":
      estruturaCH = campoHarmonicoPentaMenor; 
      escalaEstrutura = estruturasEscalas["pentatonica_menor"];
      cScaleName = "Pentatônica Menor";
      break;
    case 'diminuta_tom_e_semitom':
      estruturaCH = campoHarmonicoDiminutaTomSemitom;
      escalaEstrutura = estruturasEscalas['diminuta_tom_e_semitom'];
      cScaleName = "Diminuta Tom/Semitom";
      break;
    case 'diminuta_semitom_e_tom':
      estruturaCH = campoHarmonicoDiminutaSemitomTom;
      escalaEstrutura = estruturasEscalas['diminuta_semitom_e_tom'];
      cScaleName = "Diminuta Semitom/Tom";
      break;
    case 'tons_inteiros':
      estruturaCH = campoHarmonicoTonsInteiros;
      escalaEstrutura = estruturasEscalas['tons_inteiros'];
      cScaleName = "Tons Inteiros";
      break;
    case 'cromatica':
      estruturaCH = campoHarmonicoCromatico;
      escalaEstrutura = estruturasEscalas['cromatica'];
      cScaleName = "Cromática";
      break;
    default:
      output += `* Campo Harmônico em desenvolvimento para a escala: ${formatarNome(
        tipoEscala
      )}.`;
      return output;
  }

  let currentIndex = tonicaIndex;

  for (let i = 0; i < estruturaCH.length; i++) {
    const grau = estruturaCH[i];

    // Assegura que o acorde é buscado corretamente (ex: Maj7#5 vira Maj7)
    const qualidadeChave = grau.qualidade
      .replace("º", "m7b5")
      .replace("+", "")
      .replace("#5", "");

    // Pega a estrutura de semitons do acorde (Ex: [4, 7, 11] para Maj7)
    const qualidadeAcorde = estruturasAcordes[qualidadeChave];

    if (!qualidadeAcorde) {
      output += `${grau.grau} - ${notasCromaticas[currentIndex]}${grau.qualidade} (Estrutura de acorde desconhecida - Verifique estruturasAcordes)\n`;
    } else {
      const notasDoAcorde = calcularAcorde(currentIndex, qualidadeAcorde);

      // Formata a Saída: Grau - Acorde (Notas)
      output += `${grau.grau} - ${notasCromaticas[currentIndex]}${
        grau.qualidade
      } (${notasDoAcorde.join(", ")})\n`;
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
 * @param {boolean} prefereBemol - Se for true, usa nomenclatura em bemol na linha 1.
 */
function gerarTabelaDeIntervalos(tonicaIndex, escalaNotas, prefereBemol) {
  let html = `<table class="interval-table">`;

  // CORREÇÃO: Usa o novo parâmetro e a nova função auxiliar para definir a nomenclatura
  const notasParaTabela = [];
  for (let i = 0; i <= 12; i++) {
    const absoluteIndex = (tonicaIndex + i) % 12;
    let nota = getCorrectedNoteName(absoluteIndex, prefereBemol);
    
    // A tônica (i=0) e a oitava (i=12) devem usar o nome corrigido da própria tônica.
    if (i === 0 || i === 12) {
      nota = getCorrectedNoteName(tonicaIndex, prefereBemol); 
    }
    
    notasParaTabela.push(nota);
  }


  // CRIA UM ARRAY AUXILIAR para todas as representações possíveis da escala (ex: F# e Gb)
  let escalaNotasEnarmonicas = [...escalaNotas];
  
  // Adiciona as enarmonias das notas da escala para o destaque funcionar corretamente
  escalaNotas.forEach(nota => {
    // 1. Tenta encontrar a versão bemol
    const indexSustenido = notasCromaticas.indexOf(nota);
    if (indexSustenido !== -1 && notasEnarmonicas[indexSustenido]) {
      // Adiciona a versão bemol (se a nota da escala for sustenido)
      escalaNotasEnarmonicas.push(notasEnarmonicas[indexSustenido]);
    }
    
    // 2. Tenta encontrar a versão sustenido
    const indexBemol = notasEnarmonicasInvertido[nota];
    if (indexBemol !== undefined && notasCromaticas[indexBemol]) {
      // Adiciona a versão sustenido (se a nota da escala for bemol)
      escalaNotasEnarmonicas.push(notasCromaticas[indexBemol]);
    }
  });


  // LINHA 1: Notas Musicais (Cromáticas a partir da Tônica)
  html += `<thead><tr><th colspan="13" class="table-title">Tabela de Intervalos: ${getCorrectedNoteName(tonicaIndex, prefereBemol)+ " "+ cScaleName}</th></tr></thead>`;
  html += `<tbody><tr>`;

  for (let i = 0; i <= 12; i++) {
    // Para o destaque, precisamos do nome da nota que está sendo renderizada (notaDaTabela)
    const notaDaTabela = notasParaTabela[i]; 

    // Lógica de Destaque CORRIGIDA: Usa o array de notas enarmônicas (que contem as duas versões)
    let classeDestaque = "";
    if (escalaNotasEnarmonicas.includes(notaDaTabela)) {
      classeDestaque = "note-in-scale";
    }

    // A Tônica (i=0 e i=12)
    html += `<td class="note-cell ${classeDestaque}">${notaDaTabela}</td>`;
  }
  html += `</tr>`;

  
  // LINHA 2: Nomenclatura do Grau (T, 2b, 2, 3b, ...)
  html += `<tr>`;
  for (let i = 0; i <= 12; i++) {
    let grauNome;
    if (i === 12) {
      grauNome = "8ª"; // Oitava
    } else {
      grauNome = nomenclaturaGrausIntervalos[i].grau;
    }
    
    const notaDaTabela = notasParaTabela[i]; 
    // Lógica de Destaque
    const classeDestaque = (escalaNotasEnarmonicas.includes(notaDaTabela)) ? "note-in-scale" : ""; 
    // A classe do grau é 'degree-cell', mas o destaque deve ser aplicado.
    html += `<td class="degree-cell ${classeDestaque}">${grauNome}</td>`;
  }
  html += `</tr>`;

  // LINHA 3: Semitons (0, 1, 2, 3, ...)
  html += `<tr>`;
  for (let i = 0; i <= 12; i++) {
    const notaDaTabela = notasParaTabela[i];
    // Lógica de Destaque
    const classeDestaque = (escalaNotasEnarmonicas.includes(notaDaTabela)) ? "note-in-scale" : ""; 
    // CORREÇÃO: O valor correto para Semitons é 'i'
    html += `<td class="semitone-cell ${classeDestaque}">${i}</td>`;
  }
  html += `</tr>`;

  // LINHA 4: Numerações (0, 1, 2, 3, ...) - Mantida para consistência com o script original
  html += `<tr>`;
  for (let i = 0; i <= 12; i++) {
    let grauNumero;
    if (i === 12) {
      grauNumero = "12"; // 12 semitons
    } else {
      grauNumero = i;
    }
    const notaDaTabela = notasParaTabela[i];
    // Lógica de Destaque: Aplica a classe apenas na célula com a nota destacada
    const classeDestaque = (escalaNotasEnarmonicas.includes(notaDaTabela)) ? "note-in-scale" : ""; 
    // Aplica a nova classe 'semitones-number-cell' para a estilização específica
    html += `<td class="semitones-number-cell ${classeDestaque}">${grauNumero}</td>`;
  }
  html += `</tr>`;
  html += ` </tbody></table>`;
  if (document.getElementById("tabelaIntervalosResultado")) {
      document.getElementById("tabelaIntervalosResultado").innerHTML = html;
  }
}

// ---------------- FUNÇÃO DE GERAÇÃO DO BRAÇO (REESCRITA) --------------

/**
 * REESCRITO: Gera a visualização do braço do instrumento (12 trastes, afinação dinâmica, destaque).
 */
function gerarBracoInstrumento(tonicaCorreta, escalaNotas, nomeEscala, prefereBemol) {
    const container = document.getElementById('bracoInstrumentoContainer');
    const nomeEscalaElement = document.getElementById('nomeEscalaBraco');

    if (!container || !escalaNotas || escalaNotas.length === 0) {
        if (container) container.innerHTML = 'Aguardando cálculo...';
        if (nomeEscalaElement) nomeEscalaElement.innerText = 'N/A';
        return;
    }
    
    // 1. Obtém a afinação atual a partir dos inputs
    const afinacaoAtual = getAfinaçãoAtual();
    if (afinacaoAtual.some(c => c.indice === -1)) {
        container.innerHTML = '⚠️ Erro: Uma nota de afinação é inválida. Corrija nos inputs.';
        return;
    }

    // 2. Atualiza o nome da escala no parágrafo
    if (nomeEscalaElement) nomeEscalaElement.innerText = `${tonicaCorreta} ${nomeEscala}`;

    // 3. Cria a estrutura base do braço
    let bracoHTML = '<div class="braco-row">';

    // Adiciona as 6 linhas que representam as cordas (visuais)
    for(let i = 1; i <= 6; i++) {
        bracoHTML += `<div class="corda-linha corda-${i}"></div>`;
    }

    const numTrastes = 12; // GARANTIDO: 12 trastes

    // 4. Itera sobre os trastes (colunas)
    for (let traste = 0; traste <= numTrastes; traste++) {
        let trasteHTML = `<div class="traste traste-${traste}">`;
        
        // Marcadores de posição (dots) - Somente a partir do primeiro traste
        if (traste === 3 || traste === 5 || traste === 7 || traste === 9) {
            trasteHTML += `<div class="marcador"></div>`;
        }
        if (traste === 12) {
             // 12º traste (duplo)
            trasteHTML += `<div class="marcador"></div><div class="marcador"></div>`;
        }
        
        // 5. Itera sobre as cordas (linhas) - afinacaoAtual já está em ordem Corda 6 -> 1
        for (let cordaIndex = 0; cordaIndex < afinacaoAtual.length; cordaIndex++) {
            const cordaBase = afinacaoAtual[cordaIndex];
            
            // Calcula o índice cromático da nota no traste atual
            const indiceCromaticoNota = (cordaBase.indice + traste) % 12;

            // Busca o nome enarmônico correto
            const nomeNotaDisplay = getCorrectedNoteName(indiceCromaticoNota, prefereBemol);

            // --- Lógica de Destaque da Escala (Com correção Enarmônica) ---
            let pertenceAEscala = escalaNotas.includes(nomeNotaDisplay);

            if (!pertenceAEscala) {
                // Tenta a enarmonia oposta para o destaque
                const oposto = getCorrectedNoteName(indiceCromaticoNota, !prefereBemol);
                // Verifica se a nota oposta está na escala
                pertenceAEscala = escalaNotas.includes(oposto);
            }

            // Destaque da Tônica
            // A tônica é a nota correta que inicia a escala.
            const isTonica = pertenceAEscala && (nomeNotaDisplay === tonicaCorreta || getChromaticIndex(nomeNotaDisplay) === getChromaticIndex(tonicaCorreta));
            
            // Destaque da Corda Solta (Notas de Afinação)
            // A corda solta (traste 0) deve ser destacada se pertencer à escala.
            const isCordaSolta = traste === 0 && pertenceAEscala; 

            let classeEspecial = '';
            if (isTonica) classeEspecial += 'tonica';
            if (isCordaSolta) classeEspecial += ' corda-solta'; 

            // Pega a cor dinâmica
            const corNota = CORES_NOTAS[indiceCromaticoNota];

            // Renderiza o ponto da nota
            let pontoHTML = `<div 
                class="nota-ponto ${classeEspecial.trim()}"
                style="background-color: ${pertenceAEscala ? corNota : 'transparent'};
                       color: ${pertenceAEscala ? '#FFF' : 'transparent'};
                       /* Borda para Tônica e Corda Solta - PRIORIDADE para TÔNICA */
                       border: ${isTonica ? '3px solid #000' : (isCordaSolta ? '2px solid #ffc107' : (pertenceAEscala ? '1px solid #333' : 'none'))};
                       box-shadow: ${pertenceAEscala ? '0 0 5px rgba(0, 0, 0, 0.7)' : 'none'};
                       "
                title="${nomeNotaDisplay} (${cordaBase.nome} + ${traste} traste)"
            >
                ${pertenceAEscala ? nomeNotaDisplay.replace('#', 's').replace('b', 'b') : ''}
            </div>`;

            // A célula é posicionada dentro do traste para cada corda
            trasteHTML += `<div class="nota-celula nota-corda-${6 - cordaIndex}">
                ${pontoHTML}
            </div>`;
        }

        trasteHTML += '</div>';
        bracoHTML += trasteHTML;
    }

    bracoHTML += '</div>';
    container.innerHTML = bracoHTML;
}


// ---------------- FUNÇÃO PRINCIPAL (MANTIDA/CORRIGIDA) --------------

function calcularEscala() {
  const tonicaInput = document.getElementById("tonica").value.trim().toUpperCase();
  const tipoEscala = document.getElementById("tipoEscala").value;
  const escalaEstrutura = estruturasEscalas[tipoEscala];
  let cH2TabInterv = document.getElementById("cH2TabInterv");
  let cTomName = tonicaInput;
  let tonicaIndex = -1;
  let prefereBemolParaTodaEscala = false;

  // 1. Lógica para aceitar input em bemol e determinar a preferência de notação
  tonicaIndex = notasCromaticas.indexOf(tonicaInput);
  if (tonicaIndex === -1) {
    const indexBemol = notasEnarmonicasInvertido[tonicaInput];
    if (indexBemol !== undefined) {
      tonicaIndex = indexBemol;
      prefereBemolParaTodaEscala = true; 
    } else {
      alert(
        "Tônica não reconhecida. Use Sustenidos (#), Bemóis (b) ou a notação padrão (C, D, E, F, G, A, B)."
      );
      return;
    }
  } else {
    // Regra heurística para preferir bemóis
    const sharpTonicIndices = [0, 7, 2, 9, 4, 11]; // C, G, D, A, E, B
    if (!sharpTonicIndices.includes(tonicaIndex) && tonicaIndex !== 6) { 
      prefereBemolParaTodaEscala = true;
    }
    // Se o usuário explicitamente usou um bemol no input (e.g., 'DB' -> Db), a preferência é bemol.
    if (tonicaInput.endsWith('B')) prefereBemolParaTodaEscala = true;
    // Se digitou F (índice 5), prefere bemol (Bb)
    if (tonicaIndex === 5) prefereBemolParaTodaEscala = true;
  }
  
  // Define a tônica correta para exibição (C, C#, Db, etc.)
  const tonicaCorreta = getCorrectedNoteName(tonicaIndex, prefereBemolParaTodaEscala);

  // 2. Cálculo da Escala de Notas
  let escalaNotas = [tonicaCorreta];
  let currentIndex = tonicaIndex;

  if (!escalaEstrutura) {
    document.getElementById("escalaResultado").innerText = `Estrutura da escala "${formatarNome(tipoEscala)}" não encontrada.`;
    document.getElementById("campoHarmonicoResultado").innerText = "";
    document.getElementById("tabelaIntervalosResultado").innerHTML = "";
    document.getElementById("bracoInstrumentoContainer").innerHTML = "";
    return;
  }

  for (let i = 0; i < escalaEstrutura.length - 1; i++) {
    currentIndex = (currentIndex + escalaEstrutura[i]) % 12;
    // Usa a nomenclatura preferencial para as notas da escala
    escalaNotas.push(getCorrectedNoteName(currentIndex, prefereBemolParaTodaEscala));
  }

  // 3. Geração dos Resultados
  
  // Notas da Escala
  document.getElementById("escalaResultado").innerText = escalaNotas.join(", ");
  
  // Campo Harmônico
  const campoHarmonico = gerarCampoHarmonico(tonicaIndex, tipoEscala);
  document.getElementById("campoHarmonicoResultado").innerText = campoHarmonico;

  // Tabela de Intervalos
  if (cH2TabInterv) cH2TabInterv.innerText = `📊 Tabela de Intervalos: ${tonicaCorreta} ${cScaleName}`;
  gerarTabelaDeIntervalos(tonicaIndex, escalaNotas, prefereBemolParaTodaEscala);

  // NOVO: Braço do Instrumento
  gerarBracoInstrumento(tonicaCorreta, escalaNotas, cScaleName, prefereBemolParaTodaEscala);
}

// ---------------- FUNÇÕES DE GERAÇÃO DE TABELA GERAL (MANTIDAS) --------------

function gerarTabelaGeralEscalas() {
  const container = document.getElementById("tabelaGeralEscalasResultado");
  let html = `
        <table class="general-scale-table">
            <thead>
                <tr>
                    <th>Escala</th>
                    <th>Estrutura (Semitons)</th>
                    <th>Graus</th>
                </tr>
            </thead>
            <tbody>
    `;

  for (const chave in estruturasEscalas) {
    const estrutura = estruturasEscalas[chave];
    const nomeFormatado = formatarNome(chave);
    let graus = [];
    let semitonsAcumulados = 0;

    // Geração dos graus (T, 2m, 2M, 3m, 3M, 4J, etc.)
    graus.push("T"); // Tônica
    estrutura.forEach((semitons) => {
      semitonsAcumulados = (semitonsAcumulados + semitons) % 12;
      // Encontra a nomenclatura do grau correspondente (ignora oitavas)
      const grauObj = nomenclaturaGrausIntervalos.find(
        (g) => g.semitons === semitonsAcumulados
      );
      if (grauObj) {
        graus.push(grauObj.grau);
      }
    });

    html += `
            <tr>
                <td>${nomeFormatado}</td>
                <td>${estrutura.join(" - ")}</td>
                <td>${graus.join(" - ")}</td>
            </tr>
        `;
  }

  html += `
            </tbody>
        </table>
    `;
    if (container) container.innerHTML = html;
}

// ---------------- METRÔNOMO (MANTIDAS) --------------

let tempoBPM = 120;
let isPlaying = false;
let metronomeInterval = null;
let audioContext = null;

// Tenta inicializar o AudioContext
function initAudioContext() {
    if (!audioContext) {
        try {
            // Cria um novo AudioContext. Tenta usar o formato padrão ou o legado.
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            // Alerta se não for possível usar o Web Audio API
            console.error('Web Audio API não suportada neste navegador.');
        }
    }
}


/**
 * NOVO/CORRIGIDO: Função para tocar o som do clique usando Web Audio API.
 */
function playClick() {
    // Garante que o AudioContext foi inicializado
    initAudioContext();
    if (!audioContext) return;

    // Cria um oscilador (onda senoidal para um som simples de clique)
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    // Conecta o oscilador ao controle de ganho, e este ao destino (alto-falantes)
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Define a forma de onda e a frequência
    oscillator.type = 'square'; // Onda quadrada para um som mais "seco" (clique)
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // 880Hz (A5)

    // Controla o volume para evitar cliques altos
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);

    // Inicia e para o som rapidamente (cria o "clique")
    oscillator.start();
    // Parar o som após 0.05 segundos
    oscillator.stop(audioContext.currentTime + 0.05);
}

/**
 * INSERIDO: Atualiza o display de BPM.
 */
function updateMetronomeDisplay() {
    const display = document.getElementById('metronomeDisplay');
    const bpmInput = document.getElementById('bpmInput');
    
    // Valida o input
    let newBPM = parseInt(bpmInput.value, 10);
    if (newBPM < 40 || newBPM > 300 || isNaN(newBPM)) {
        newBPM = 120; // Padrão
        bpmInput.value = 120;
    }
    tempoBPM = newBPM;
    
    if (display) display.innerText = `${tempoBPM} BPM`;
    
    // Se o metrônomo estiver tocando, reinicia com o novo BPM
    if (isPlaying) {
        clearInterval(metronomeInterval);
        const intervalMs = 60000 / tempoBPM;
        metronomeInterval = setInterval(playClick, intervalMs);
    }
}

/**
 * INSERIDO: Inicia ou para o metrônomo.
 */
function startStopMetronome() {
    const bpmInput = document.getElementById('bpmInput');
    const startStopButton = document.getElementById('startStopButton');
    
    // Atualiza o valor do BPM e valida
    tempoBPM = parseInt(bpmInput.value, 10);
    if (tempoBPM < 40 || tempoBPM > 300 || isNaN(tempoBPM)) {
        alert("Por favor, insira um BPM entre 40 e 300.");
        bpmInput.value = 120;
        tempoBPM = 120;
        updateMetronomeDisplay();
        return;
    }

    if (!isPlaying) {
        // 1. INICIAR METRÔNOMO
        isPlaying = true;
        if (startStopButton) startStopButton.innerText = '■ Parar';
        if (startStopButton) startStopButton.style.backgroundColor = '#dc3545'; // Vermelho para Parar
        
        // Calcula o intervalo em milissegundos
        const intervalMs = 60000 / tempoBPM;
        
        // Toca o primeiro clique imediatamente
        playClick(); 
        
        // Configura a repetição
        metronomeInterval = setInterval(playClick, intervalMs);
        
    } else {
        // 2. PARAR METRÔNOMO
        isPlaying = false;
        clearInterval(metronomeInterval);
        metronomeInterval = null;
        if (startStopButton) startStopButton.innerText = '▶ Iniciar';
        if (startStopButton) startStopButton.style.backgroundColor = '#007bff'; // Azul para Iniciar
    }
}

// ---------------- INICIALIZAÇÃO ----------------

window.onload = function () {
    const tonicaElement = document.getElementById("tonica");
    const tipoEscalaElement = document.getElementById("tipoEscala");
    
    if (tonicaElement) tonicaElement.value = "C";
    if (tipoEscalaElement) tipoEscalaElement.value = "maior";
    
    // NOVO: Gerar os inputs de afinação na inicialização
    gerarControlesAfinacao(); 

    calcularEscala(); 

    // NOVO: Chama a função para gerar a tabela geral
    gerarTabelaGeralEscalas();
};