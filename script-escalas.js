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

// Mapeamento Invertido para lidar com input de tônica em bemol (Ex: 'Eb')
const notasEnarmonicasInvertido = {
  "DB": 1, 
  "EB": 3, 
  "GB": 6, 
  "AB": 8, 
  "BB": 10,
};

// --- MAPAS BASEADOS NO CÍRCULO DE QUINTAS (Chaves e Armaduras) ---

// Mapeamento das 15 Armaduras de Clave (Escalas Maiores)
const armadurasDeClave = {
  'C': ['C', 'D', 'E', 'F', 'G', 'A', 'B'], 
  'G': ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
  'D': ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'],
  'A': ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'],
  'E': ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'],
  'B': ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#'],
  'F#': ['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'E#'], 
  'C#': ['C#', 'D#', 'E#', 'F#', 'G#', 'A#', 'B#'], 
  'F': ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'],
  'Bb': ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A'],
  'Eb': ['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D'], // CHAVE PARA C MENOR!
  'Ab': ['Ab', 'Bb', 'C', 'Db', 'Eb', 'F', 'G'],
  'Db': ['Db', 'Eb', 'F', 'Gb', 'Ab', 'Bb', 'C'],
  'Gb': ['Gb', 'Ab', 'Bb', 'Cb', 'Db', 'Eb', 'F'], 
  'Cb': ['Cb', 'Db', 'Eb', 'Fb', 'Gb', 'Ab', 'Bb'], 
};

// Mapeamento dos modos para a distância (em semitons) da Tônica do Modo até a Tônica da Maior Relativa
const modeToRelativeMajorDegree = {
    'jonico': 0, 'maior': 0, 'eolio': 3, 'menor_natural': 3, 
    'dorico': 10, 'frigio': 8, 'lidio': 7, 'mixolidio': 5, 'locrio': 1, 
    'menor_harmonica': 3, 'menor_melodica': 3,
    'pentatonica_maior': 0, 'pentatonica_menor': 3,
};

// Nomenclatura dos Graus
const nomenclaturaGrausIntervalos = [
  { grau: "T", nome: "Tônica", semitons: 0 },
  { grau: "2ªb", nome: "2ª Menor", semitons: 1 },
  { grau: "2ª", nome: "2ª Maior", semitons: 2 },
  { grau: "3ªb", nome: "3ª Menor", semitons: 3 },
  { grau: "3ª", nome: "3ª Maior", semitons: 4 },
  { grau: "4ª", nome: "4ª Justa", semitons: 5 },
  { grau: "5ªb", nome: "5ª Diminuta", semitons: 6 }, 
  { grau: "5ª", nome: "5ª Justa", semitons: 7 },
  { grau: "6ªb", nome: "6ª Menor", semitons: 8 }, 
  { grau: "6ª", nome: "6ª Maior", semitons: 9 },
  { grau: "7ªb", nome: "7ª Menor", semitons: 10 },
  { grau: "7ªM", nome: "7ª Maior", semitons: 11 },
  { grau: "8ª", nome: "8ª", semitons: 12 },
];

let cScaleName = "Maior";

// Mapeamento dos Intervalos (em semitons) para as escalas (ESTRUTURA CORRETA)
const estruturasEscalas = {
  maior: [2, 2, 1, 2, 2, 2, 1], 
  menor_natural: [2, 1, 2, 2, 1, 2, 2], 
  menor_harmonica: [2, 1, 2, 2, 1, 3, 1], 
  menor_melodica: [2, 1, 2, 2, 2, 2, 1], 
  jonico: [2, 2, 1, 2, 2, 2, 1],
  dorico: [2, 1, 2, 2, 2, 1, 2],
  frigio: [1, 2, 2, 2, 1, 2, 2],
  lidio: [2, 2, 2, 1, 2, 2, 1],
  mixolidio: [2, 2, 1, 2, 2, 1, 2],
  eolio: [2, 1, 2, 2, 1, 2, 2],
  locrio: [1, 2, 2, 1, 2, 2, 2],
  pentatonica_maior: [2, 2, 3, 2, 3],
  pentatonica_menor: [3, 2, 2, 3, 2], 
  diminuta_tom_e_semitom: [2, 1, 2, 1, 2, 1, 2, 1],
  diminuta_semitom_e_tom: [1, 2, 1, 2, 1, 2, 1, 2],
  cromatica: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  tons_inteiros: [2, 2, 2, 2, 2, 2],
};

// Definição das Qualidades de Acordes (MUITO IMPORTANTE para o CH)
const estruturasAcordes = {
  Maj: [4, 7], m: [3, 7], Maj7: [4, 7, 11], m7: [3, 7, 10], 7: [4, 7, 10],
  m7b5: [3, 6, 10], mMaj7: [3, 7, 11], "Maj7#5": [4, 8, 11], dim7: [3, 6, 9], 
  "7#5": [4, 8, 10], "7b9": [4, 7, 10, 1],
};

// Campos Harmônicos (Inclusão de todos para evitar erros de referência)
const campoHarmonicoMaior = [
  { grau: "I", qualidade: "Maj7" }, { grau: "ii", qualidade: "m7" }, 
  { grau: "iii", qualidade: "m7" }, { grau: "IV", qualidade: "Maj7" }, 
  { grau: "V", qualidade: "7" }, { grau: "vi", qualidade: "m7" }, 
  { grau: "viiº", qualidade: "m7b5" },
];
const campoHarmonicoMenorNatural = [
  { grau: "i", qualidade: "m7" }, { grau: "iiº", qualidade: "m7b5" }, 
  { grau: "III", qualidade: "Maj7" }, { grau: "iv", qualidade: "m7" }, 
  { grau: "v", qualidade: "m7" }, { grau: "VI", qualidade: "Maj7" }, 
  { grau: "VII", qualidade: "7" },
];
const campoHarmonicoMenorHarmonica = [
  { grau: "i", qualidade: "mMaj7" }, { grau: "iiº", qualidade: "m7b5" },
  { grau: "III+", qualidade: "Maj7#5" }, { grau: "iv", qualidade: "m7" },
  { grau: "V", qualidade: "7" }, { grau: "VI", qualidade: "Maj7" },
  { grau: "viiº", qualidade: "dim7" }, 
];
const campoHarmonicoMenorMelodica = [
  { grau: "i", qualidade: "mMaj7" }, { grau: "ii", qualidade: "m7" },
  { grau: "III+", qualidade: "Maj7#5" }, { grau: "IV", qualidade: "7" },
  { grau: "V", qualidade: "7" }, { grau: "viº", qualidade: "m7b5" },
  { grau: "viiº", qualidade: "m7b5" },
];
const campoHarmonicoDorico = [
  { grau: "i", qualidade: "m7" }, { grau: "ii", qualidade: "m7" },
  { grau: "III", qualidade: "Maj7" }, { grau: "IV", qualidade: "7" },
  { grau: "v", qualidade: "m7" }, { grau: "viº", qualidade: "m7b5" },
  { grau: "VII", qualidade: "Maj7" },
];
const campoHarmonicoFrigio = [
  { grau: "i", qualidade: "m7" }, { grau: "II", qualidade: "Maj7" },
  { grau: "III", qualidade: "7" }, { grau: "iv", qualidade: "m7b5" },
  { grau: "vº", qualidade: "m7b5" }, { grau: "VI", qualidade: "Maj7" },
  { grau: "vii", qualidade: "m7" },
];
const campoHarmonicoLidio = [
  { grau: "I", qualidade: "Maj7" }, { grau: "II", qualidade: "7" },
  { grau: "III", qualidade: "m7" }, { grau: "ivº", qualidade: "m7b5" },
  { grau: "V", qualidade: "Maj7" }, { grau: "vi", qualidade: "m7" },
  { grau: "vii", qualidade: "m7" },
];
const campoHarmonicoMixolidio = [
  { grau: "I", qualidade: "7" }, { grau: "ii", qualidade: "m7" },
  { grau: "iiiº", qualidade: "m7b5" }, { grau: "IV", qualidade: "Maj7" },
  { grau: "v", qualidade: "m7" }, { grau: "vi", qualidade: "m7" },
  { grau: "vii", qualidade: "Maj7" },
];
const campoHarmonicoLocrio = [
  { grau: "iº", qualidade: "m7b5" }, { grau: "II", qualidade: "Maj7" },
  { grau: "iii", qualidade: "m7" }, { grau: "iv", qualidade: "m7" },
  { grau: "V", qualidade: "Maj7" }, { grau: "VI", qualidade: "7" },
  { grau: "vii", qualidade: "m7" },
];
const campoHarmonicoPentaMaior = [
  { grau: "I", qualidade: "Maj" }, { grau: "II", qualidade: "m" }, 
  { grau: "III", qualidade: "m" }, { grau: "V", qualidade: "Maj" }, 
  { grau: "VI", qualidade: "m" }, 
];
const campoHarmonicoPentaMenor = [
  { grau: "I", qualidade: "m" }, { grau: "III", qualidade: "Maj" }, 
  { grau: "IV", qualidade: "m" }, { grau: "V", qualidade: "m" }, 
  { grau: "VII", qualidade: "Maj" }, 
];
const campoHarmonicoDiminutaTomSemitom = [
  { grau: "I", qualidade: "dim7" }, { grau: "II", qualidade: "7" }, 
  { grau: "III", qualidade: "dim7" }, { grau: "IV", qualidade: "7" }, 
  { grau: "V", qualidade: "dim7" }, { grau: "VI", qualidade: "7" }, 
  { grau: "VII", qualidade: "dim7" }, { grau: "VIII", qualidade: "7" }, 
];
const campoHarmonicoDiminutaSemitomTom = [
  { grau: "I", qualidade: "7b9" }, { grau: "II", qualidade: "dim7" }, 
  { grau: "III", qualidade: "7b9" }, { grau: "IV", qualidade: "dim7" }, 
  { grau: "V", qualidade: "7b9" }, { grau: "VI", qualidade: "dim7" }, 
  { grau: "VII", qualidade: "7b9" }, { grau: "VIII", qualidade: "dim7" }, 
];
const campoHarmonicoTonsInteiros = [
  { grau: "I", qualidade: "7#5" }, { grau: "II", qualidade: "7#5" }, 
  { grau: "III", qualidade: "7#5" }, { grau: "IV", qualidade: "7#5" }, 
  { grau: "V", qualidade: "7#5" }, { grau: "VI", qualidade: "7#5" },
];
const campoHarmonicoCromatico = [
  { grau: "I", qualidade: "7" }, { grau: "IIb", qualidade: "7" }, 
  { grau: "II", qualidade: "7" }, { grau: "IIIb", qualidade: "7" }, 
  { grau: "III", qualidade: "7" }, { grau: "IV", qualidade: "7" }, 
  { grau: "Vb", qualidade: "7" }, { grau: "V", qualidade: "7" }, 
  { grau: "VIb", qualidade: "7" }, { grau: "VI", qualidade: "7" }, 
  { grau: "VIIb", qualidade: "7" }, { grau: "VII", qualidade: "7" },
];


// --- FUNÇÕES DE CÁLCULO MUSICAL (HELPERS) --------------

/**
 * Retorna o índice cromático (0-11) de qualquer nome de nota.
 */
function getChromaticIndex(noteName) {
    // Tratamento de enarmônicos (E#/F, B#/C, Fb/E, Cb/B) antes da busca.
    noteName = noteName.replace('E#', 'F').replace('B#', 'C').replace('Fb', 'E').replace('Cb', 'B');
    let index = notasCromaticas.indexOf(noteName);
    if (index === -1) {
        // Tenta encontrar em bemol (conversão para índice)
        index = notasEnarmonicasInvertido[noteName.toUpperCase()];
    }
    return index !== undefined ? index : -1;
}

/**
 * Mapeamento direto e mais robusto da Tônica Maior preferida para cada índice.
 */
const preferredMajorTonics = {
    0: 'C',  1: 'Db', 2: 'D',  3: 'Eb', // Chave para C menor!
    4: 'E',  5: 'F',  6: 'Gb', 7: 'G', 
    8: 'Ab', 9: 'A', 10: 'Bb', 11: 'B',
};

/**
 * CORRIGIDO: Obtém o nome da tônica Major (ex: Eb) para buscar a armadura de clave.
 * A lógica agora garante que para index 3 seja retornado 'Eb', corrigindo C menor.
 */
function getMajorTonicNameFromIndex(index, tonicaInput) {
    // Se o input original for explicitamente em sustenido (ex: G#m -> B Maior)
    const isSharpInput = tonicaInput.includes('#') || tonicaInput.includes('X');

    if (isSharpInput) {
        // Nomes de tônica major que usam sustenidos
        const sharpTonicNames = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#']; 
        for (const name of sharpTonicNames) {
            if (getChromaticIndex(name) === index) return name;
        }
    }
    
    // Default para a chave major mais comum (priorizando bemóis para os índices 1, 3, 5, 6, 8, 10)
    let preferredName = preferredMajorTonics[index];
    
    // Tratamento de F#/Gb (index 6): Preferimos F# se a tônica original for natural (mais comum).
    if (index === 6 && !isSharpInput) {
        return 'F#';
    }

    return preferredName || 'C'; 
}


/**
 * Eleva uma nota diatonicamente (mantendo a letra, mas mudando o acidente).
 */
function raiseNoteDiatonic(noteName) {
    const index = getChromaticIndex(noteName);
    const newIndex = (index + 1) % 12;

    // Se for nota já alterada em bemol (Db, Eb, etc.) ou natural (C, D, etc.), 
    // a elevação para o próximo semitom é feita, mas mantendo a notação diatônica.
    // Ex: G# elevado diatonicamente é G## (ou A). Aqui, simplificamos o conceito.
    
    // Tentativa simplificada: Mover para o próximo nome de nota dentro da armadura
    // Esta é uma lógica complexa, mas para o caso de Menor Harmônica/Melódica:
    // Ex: G#m (relativa Bb). A escala de Gm é G, A, Bb, C, D, Eb, F.
    // Menor Harmônica: G, A, Bb, C, D, Eb, F#. O F (nota na 7ª) é elevado para F#.
    
    // A implementação baseada no índice cromático é mais segura.
    if (noteName.length > 1 && noteName.includes('#')) {
        return noteName.replace('#', 'X'); // G# -> Gx (dobrado sustenido)
    }
    if (noteName.length > 1 && noteName.includes('b')) {
        return noteName.slice(0, 1); // Bb -> B (se for para elevar)
    }
    if (noteName.length === 1) {
        return noteName + '#'; // G -> G#
    }
    
    // Fallback: Apenas retorna o próximo semitom (se a lógica acima falhar)
    return notasCromaticas[newIndex];
}

function getEnharmonicTonicName(tonicName) {
    const index = getChromaticIndex(tonicName);
    if (index === -1) return tonicName;

    if (tonicName.includes('#') || ['C#', 'D#', 'F#', 'G#', 'A#'].includes(tonicName)) {
        return notasEnarmonicas[index] || tonicName;
    } 
    else if (tonicName.includes('b') || ['Db', 'Eb', 'Gb', 'Ab', 'Bb', 'Cb', 'Fb'].includes(tonicName)) {
         return notasCromaticas[index] || tonicName;
    }
    
    return tonicName;
}

/**
 * ESSENCIAL PARA TABELA DE INTERVALOS (script-tabinter.js):
 * Obtém o nome da nota (sustenido ou bemol) para um índice cromático, 
 * respeitando a preferência de notação.
 */
function getCorrectedNoteName(index, preferFlat) {
    // 0, 2, 4, 5, 7, 9, 11 (Naturais)
    if ([0, 2, 4, 5, 7, 9, 11].includes(index)) {
        return notasCromaticas[index];
    }
    
    // 1, 3, 6, 8, 10 (Alteradas)
    if (preferFlat && notasEnarmonicas[index]) {
        return notasEnarmonicas[index];
    } else {
        return notasCromaticas[index];
    }
}
// ---------------- FIM DAS FUNÇÕES HELPERS ----------------

const formatarNome = (chave) => {
  return chave
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

function calcularAcorde(tonicaIndex, estrutura) {
  let acorde = [notasCromaticas[tonicaIndex]];
  estrutura.forEach((intervalo) => {
    const notaIndex = (tonicaIndex + intervalo) % 12;
    acorde.push(notasCromaticas[notaIndex]);
  });
  return acorde;
}

function gerarCampoHarmonico(escalaNotas, tonicaIndex, tipoEscala) {
  let output = "";
  let estruturaCH; 
  let escalaEstrutura; 
  let isDiatonicMode = modeToRelativeMajorDegree.hasOwnProperty(tipoEscala);
  let isSymmetric = !isDiatonicMode || ['cromatica', 'tons_inteiros', 'diminuta_tom_e_semitom', 'diminuta_semitom_e_tom'].includes(tipoEscala);

  // Seleciona a estrutura do Campo Harmônico e os intervalos (lógica inalterada)
  switch (tipoEscala) {
    case "maior": case "jonico": estruturaCH = campoHarmonicoMaior; escalaEstrutura = estruturasEscalas["maior"]; cScaleName = "Maior (Jônio)"; break;
    case "menor_natural": case "eolio": estruturaCH = campoHarmonicoMenorNatural; escalaEstrutura = estruturasEscalas["menor_natural"]; cScaleName = "Menor (Eólio)"; break;
    case "menor_harmonica": estruturaCH = campoHarmonicoMenorHarmonica; escalaEstrutura = estruturasEscalas["menor_harmonica"]; cScaleName = "Menor Harmônica"; break;
    case "menor_melodica": estruturaCH = campoHarmonicoMenorMelodica; escalaEstrutura = estruturasEscalas["menor_melodica"]; cScaleName = "Menor Melódica"; break;
    case "dorico": estruturaCH = campoHarmonicoDorico; escalaEstrutura = estruturasEscalas["dorico"]; cScaleName = "Dórico"; break;
    case "frigio": estruturaCH = campoHarmonicoFrigio; escalaEstrutura = estruturasEscalas["frigio"]; cScaleName = "Frígio"; break;
    case "lidio": estruturaCH = campoHarmonicoLidio; escalaEstrutura = estruturasEscalas["lidio"]; cScaleName = "Lídio"; break;
    case "mixolidio": estruturaCH = campoHarmonicoMixolidio; escalaEstrutura = estruturasEscalas["mixolidio"]; cScaleName = "Mixolídio"; break;
    case "locrio": estruturaCH = campoHarmonicoLocrio; escalaEstrutura = estruturasEscalas["locrio"]; cScaleName = "Lócrio"; break;
    case "pentatonica_maior": estruturaCH = campoHarmonicoPentaMaior; escalaEstrutura = estruturasEscalas["pentatonica_maior"]; cScaleName = "Pentatônica Maior"; break;
    case "pentatonica_menor": estruturaCH = campoHarmonicoPentaMenor; escalaEstrutura = estruturasEscalas["pentatonica_menor"]; cScaleName = "Pentatônica Menor"; break;
    case 'diminuta_tom_e_semitom': estruturaCH = campoHarmonicoDiminutaTomSemitom; escalaEstrutura = estruturasEscalas['diminuta_tom_e_semitom']; cScaleName = "Diminuta Tom/Semitom"; break;
    case 'diminuta_semitom_e_tom': estruturaCH = campoHarmonicoDiminutaSemitomTom; escalaEstrutura = estruturasEscalas['diminuta_semitom_e_tom']; cScaleName = "Diminuta Semitom/Tom"; break;
    case 'tons_inteiros': estruturaCH = campoHarmonicoTonsInteiros; escalaEstrutura = estruturasEscalas['tons_inteiros']; cScaleName = "Tons Inteiros"; break;
    case 'cromatica': estruturaCH = campoHarmonicoCromatico; escalaEstrutura = estruturasEscalas['cromatica']; cScaleName = "Cromática"; break;
    default:
      output += `* Campo Harmônico em desenvolvimento para a escala: ${formatarNome(tipoEscala)}.`;
      return output;
  }

  let currentIndex = tonicaIndex; 

  for (let i = 0; i < estruturaCH.length; i++) {
    const grau = estruturaCH[i];
    let acordeTonica;

    if (isDiatonicMode || tipoEscala.includes('pentatonica')) {
        acordeTonica = escalaNotas[i] || 'Nota-Invalida'; 
    } else {
        acordeTonica = notasCromaticas[currentIndex]; 
    }
    
    let qualidadeAcorde = estruturasAcordes[grau.qualidade];

    if (!qualidadeAcorde) {
        const qualidadeChaveSimplificada = grau.qualidade
          .replace("º", "m7b5")
          .replace("+", "")
          .replace("#5", "");
        
        qualidadeAcorde = estruturasAcordes[qualidadeChaveSimplificada];
    }
    
    if (!qualidadeAcorde || acordeTonica === 'Nota-Invalida') {
      output += `${grau.grau} - ${acordeTonica}${grau.qualidade} (Estrutura de acorde desconhecida ou nota inválida)\n`;
    } else {
      let tonicaAcordeIndex = getChromaticIndex(acordeTonica);
      const notasDoAcorde = calcularAcorde(tonicaAcordeIndex, qualidadeAcorde);

      output += `${grau.grau} - ${acordeTonica}${
        grau.qualidade
      } (${notasDoAcorde.join(", ")})\n`;
    }

    if (isSymmetric && i < escalaEstrutura.length) { 
      currentIndex = (currentIndex + escalaEstrutura[i]) % 12;
    }
  }

  return output;
}

// *** FUNÇÃO PRINCIPAL ***
function calcularEscala() {
  const tonicaInput = document
    .getElementById("tonica")
    .value.trim()
    .toUpperCase();
  const tipoEscala = document.getElementById("tipoEscala").value;
  const escalaEstrutura = estruturasEscalas[tipoEscala];
  let cH2TabInterv = document.getElementById("cH2TabInterv");
  let tonicaIndex = getChromaticIndex(tonicaInput);
  
  let isDiatonicMode = modeToRelativeMajorDegree.hasOwnProperty(tipoEscala);
  let isSymmetric = !isDiatonicMode || ['cromatica', 'tons_inteiros', 'diminuta_tom_e_semitom', 'diminuta_semitom_e_tom'].includes(tipoEscala);

  if (tonicaIndex === -1 || !escalaEstrutura) {
    alert("Por favor, insira uma Tônica válida e selecione um Tipo de Escala.");
    return;
  } 

  // (lógica de cScaleName inalterada)
  switch (tipoEscala) {
    case "maior": cScaleName = "Maior (Jônio)"; break;
    case "menor_natural": cScaleName = "Menor Natural(Eólio)"; break;
    case "menor_harmonica": cScaleName = "Menor Harmônica"; break;
    case "menor_melodica": cScaleName = "Menor Melódica"; break;
    case "jonico": cScaleName = "Jônio"; break;
    case "dorico": cScaleName = "Dórico"; break;
    case "frigio": cScaleName = "Frígio"; break;
    case "lidio": cScaleName = "Lídio"; break;
    case "mixolidio": cScaleName = "Mixolídio"; break;
    case "eolio": cScaleName = "Eólio"; break;
    case "locrio": cScaleName = "Lócrio"; break;
    case "pentatonica_maior": cScaleName = "Pentatônica Maior"; break;
    case "pentatonica_menor": cScaleName = "Pentatônica Menor"; break;
    case "diminuta_tom_e_semitom": cScaleName = "Diminuta (T-S)"; break;
    case "diminuta_semitom_e_tom": cScaleName = "Diminuta (S-T)"; break;
    case "tons_inteiros": cScaleName = "Tons Inteiros"; break;
    case "cromatica": cScaleName = "Cromática"; break;
    default: cScaleName = formatarNome(tipoEscala); break;
  }
  
  let escalaNotas = []; 
  let escalaOutput = ""; 
  let prefereBemolParaTodaEscala = false; 

  if (!isSymmetric) {
    // --- Lógica Diatônica / Modal (Círculo de Quintas) ---
    // Define a preferência de bemol se o input foi em bemol
    prefereBemolParaTodaEscala = notasEnarmonicasInvertido.hasOwnProperty(tonicaInput);
    
    // Cálculo do índice da Maior Relativa (CORRETO: C(0) + 3 semitons = Eb(3))
    const semitonesToRelativeMajor = modeToRelativeMajorDegree[tipoEscala];
    const relativeMajorIndex = (tonicaIndex + semitonesToRelativeMajor) % 12;


    // Índices 1, 3, 5, 6, 8, 10 são geralmente tonalidades de bemol
      if ([1, 3, 6, 8, 10].includes(relativeMajorIndex)) {
          // Se a Maior Relativa é uma tonalidade de bemol (como Eb para Cm), 
          // forçamos a preferência de notação em bemol para a tabela.
          prefereBemolParaTodaEscala = true;
      }
      
    // Obtém o nome da Tônica Maior (CORRIGIDO: Garante que para index 3 seja 'Eb')
    let baseMajorTonicName = getMajorTonicNameFromIndex(relativeMajorIndex, tonicaInput);
    
    let baseDiatonicNotes = armadurasDeClave[baseMajorTonicName];

    if (!baseDiatonicNotes) {
        let enharmonicName = getEnharmonicTonicName(baseMajorTonicName); 
        baseDiatonicNotes = armadurasDeClave[enharmonicName];
    }
    
    if (!baseDiatonicNotes) {
        // Isso deve garantir a falha caso a notação esteja errada.
        alert("Erro interno na armadura de clave base.");
        return;
    }
    
    // Rotação das notas para começar na tônica do modo (CORRETO)
    let startIndexForRotation = 0;
    for(let i = 0; i < baseDiatonicNotes.length; i++) {
         if (getChromaticIndex(baseDiatonicNotes[i]) === tonicaIndex) {
             startIndexForRotation = i;
             break;
         }
    }
    
    let notesRotated = [...baseDiatonicNotes];
    for (let i = 0; i < startIndexForRotation; i++) {
        notesRotated.push(notesRotated.shift());
    }
    
    escalaNotas = [...notesRotated]; 
    
    // Lógica para elevar 6ª e 7ª em menor harmônica e melódica (CORRETO)
    if (tipoEscala === 'menor_harmonica') {
        escalaNotas[6] = raiseNoteDiatonic(escalaNotas[6]);
    }
    
    if (tipoEscala === 'menor_melodica') {
        escalaNotas[5] = raiseNoteDiatonic(escalaNotas[5]);
        escalaNotas[6] = raiseNoteDiatonic(escalaNotas[6]);
    }
    
    // (Lógica de exibição de graus e nomes inalterada)
    let distanciaAcumulada = 0;
    escalaNotas.forEach((nota, index) => {
        const grau = index + 1;
        
        if (index > 0) {
            const prevIndex = getChromaticIndex(escalaNotas[index - 1]);
            const currIndex = getChromaticIndex(nota);
            let interval = (currIndex - prevIndex + 12) % 12;
            distanciaAcumulada += interval;
        } else {
             distanciaAcumulada = 0; 
        }
        
        let nomeDoGrau = "Grau (nomenclatura indisponível)";
        if (distanciaAcumulada % 12 < nomenclaturaGrausIntervalos.length) {
             nomeDoGrau = nomenclaturaGrausIntervalos[distanciaAcumulada % 12].nome;
        }
        
        escalaOutput += `${grau} - ${nota} - ${nomeDoGrau}\n`;
    });
        
  } else {
    // --- Lógica de cálculo por Semitons (Escalas Simétricas) ---
    // (Lógica inalterada)
    let currentIndex = tonicaIndex; 
    
    prefereBemolParaTodaEscala = notasEnarmonicasInvertido.hasOwnProperty(tonicaInput);
    
    const notaTonicaCorrigida = notasEnarmonicas[tonicaIndex] && prefereBemolParaTodaEscala ? notasEnarmonicas[tonicaIndex] : notasCromaticas[tonicaIndex];
    escalaNotas.push(notaTonicaCorrigida);
    escalaOutput += `1 - ${notaTonicaCorrigida} - Tônica\n`;

    let grau = 2; 
    let distanciaAcumulada = 0; 

    for (let i = 0; i < escalaEstrutura.length; i++) {
        const intervalo = escalaEstrutura[i];
        distanciaAcumulada += intervalo;

        currentIndex = (currentIndex + intervalo) % 12;
        const nota = notasEnarmonicas[currentIndex] && prefereBemolParaTodaEscala ? notasEnarmonicas[currentIndex] : notasCromaticas[currentIndex];
        escalaNotas.push(nota);

        const nomeDoGrau =
            nomenclaturaGrausIntervalos[distanciaAcumulada % 12].nome;

        escalaOutput += `${grau} - ${nota} - ${nomeDoGrau}\n`;
        grau++;
    }
  }


  const cTomName = escalaNotas[0];
  cH2TabInterv.innerText =
    "📊 Tabela de Intervalos - " + cTomName + " " + cScaleName;

  document.getElementById("escalaResultado").innerText = escalaOutput;

  // 3. Geração do Campo Harmônico
  const campoHarmonicoResult = gerarCampoHarmonico(escalaNotas, tonicaIndex, tipoEscala);
  document.getElementById("campoHarmonicoResultado").innerText =
    campoHarmonicoResult;

  // 4. Geração da Tabela de Intervalos (Função definida em script-tabinter.js)
  // O parâmetro 'prefereBemolParaTodaEscala' é crucial para a notação correta.
  gerarTabelaDeIntervalos(tonicaIndex, escalaNotas, prefereBemolParaTodaEscala);

  // 5. Geração do Teclado Virtual (Função definida em script-keys.js)
  gerarTecladoVirtual(tonicaInput, escalaNotas);
}

// (As funções gerarCampoHarmonico e gerarTabelaGeralEscalas continuam as mesmas)

function gerarTabelaGeralEscalas() {
  const estruturas = estruturasEscalas;
  let html = `<table class="general-scale-table">`;

  html += `<thead><tr>`;
  html += `<th>Escala / Modo</th>`;
  html += `<th colspan="8">Estrutura (Intervalos em Semitons)</th>`;
  html += `</tr></thead><tbody>`;

  for (const escala in estruturas) {
    if (estruturas.hasOwnProperty(escala)) {
      const estrutura = estruturas[escala];

      html += `<tr>`;
      html += `<td class="scale-name-cell">${formatarNome(escala)}</td>`;

      for (let i = 0; i < 8; i++) {
        let intervalo = estrutura[i] !== undefined ? estrutura[i] : "—"; 

        let intervaloFormatado;
        if (intervalo === 1) {
          intervaloFormatado = "Semitom"; 
        } else if (intervalo === 2) {
          intervaloFormatado = "Tom"; 
        } else if (intervalo === 3) {
          intervaloFormatado = "Tom + Semitom"; 
        } else {
          intervaloFormatado = intervalo;
        }

        html += `<td class="interval-value-cell">${intervaloFormatado}</td>`;
      }
      html += `</tr>`;
    }
  }

  html += `</tbody></table>`;
  document.getElementById("tabelaGeralEscalasResultado").innerHTML = html;
}

// Inicialização
window.onload = function () {
  document.getElementById("tonica").value = "C";
  document.getElementById("tipoEscala").value = "maior";
  calcularEscala(); 
  gerarTabelaGeralEscalas();
};