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
  "DB": 1, // Corrigido para UPPECASE
  "EB": 3, // Corrigido para UPPECASE
  "GB": 6, // Corrigido para UPPECASE
  "AB": 8, // Corrigido para UPPECASE
  "BB": 10, // Corrigido para UPPECASE
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

// ---------------- FUNÇÕES DE CÁLCULO MUSICAL --------------

/**
 * Determina o nome correto da nota (Sustenido ou Bemol) baseado na preferência da escala (useFlats).
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
      // USAR a constante CORRETA para a Pentatônica Maior (5 elementos)
      estruturaCH = campoHarmonicoPentaMaior; // Renomeado para evitar confusão com CH de 7 notas
      escalaEstrutura = estruturasEscalas["pentatonica_maior"];
      cScaleName = "Pentatônica Maior";
      break;
    case "pentatonica_menor":
      // USAR a constante CORRETA para a Pentatônica Menor (5 elementos)
      estruturaCH = campoHarmonicoPentaMenor; // Renomeado para evitar confusão com CH de 7 notas
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
    
    // Tenta buscar a estrutura de acorde pelo nome da qualidade exata (Maj7, mMaj7, dim7, etc.)
    let qualidadeAcorde = estruturasAcordes[grau.qualidade];

    // Se o nome da qualidade exata (grau.qualidade) não foi encontrado,
    // usa a lógica de substituição para buscar a estrutura base (para graus com símbolos especiais)
    if (!qualidadeAcorde) {
        // Ex: viiº -> m7b5 (para CHs que usam m7b5 no viiº, como o Major)
        const qualidadeChaveSimplificada = grau.qualidade
          .replace("º", "m7b5")
          .replace("+", "")
          .replace("#5", "");
        
        qualidadeAcorde = estruturasAcordes[qualidadeChaveSimplificada];
    }
    
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



// --- FUNÇÃO PRINCIPAL ---

function calcularEscala() {
  const tonicaInput = document
    .getElementById("tonica")
    .value.trim()
    .toUpperCase();
  const tipoEscala = document.getElementById("tipoEscala").value;
  const escalaEstrutura = estruturasEscalas[tipoEscala];
  let cH2TabInterv = document.getElementById("cH2TabInterv");
  let cTomName = tonicaInput;
  let tonicaIndex = -1;
  
  // Flag para determinar se a escala deve usar bemóis na nomenclatura
  let prefereBemolParaTodaEscala = false;


  // 1. Lógica para encontrar o índice da tônica (lidando com # e b)
  tonicaIndex = notasCromaticas.indexOf(tonicaInput); // Tenta Sustenido/Natural
  
  if (tonicaIndex === -1) {
    // Tenta encontrar o índice da tônica na versão bemol (Mapeamento Invertido)
    const indexBemol = notasEnarmonicasInvertido[tonicaInput];
    if (indexBemol !== undefined) {
      tonicaIndex = indexBemol;
    } else {
      alert(
          "Tônica não reconhecida. Use Sustenidos (#), Bemóis (b) ou a notação padrão (C, D, E, F, G, A, B)."
      );
      return;
    }
  }
  
  // 2. NOVA Lógica Definitiva da Armadura de Clave (Círculo de Quintas)
  // Tônicas que tradicionalmente usam bemóis (índices): Db(1), Eb(3), F(5), Gb(6), Ab(8), Bb(10)
  const tonicIndicesQueUsamBemois = new Set([1, 3, 5, 6, 8, 10]); 
  
  // Verifica se o índice da tônica é um dos que usam bemóis na armadura de clave
  if (tonicIndicesQueUsamBemois.has(tonicaIndex)) {
      const inputContemSustenido = tonicaInput.includes('#');
      const isEnharmonicSixth = tonicaIndex === 6; // F# / Gb
      
      // Regra: Prefere bemol, a menos que seja o caso enharmônico (índice 6)
      // E o usuário tenha explicitamente digitado com '#'.
      if (!(isEnharmonicSixth && inputContemSustenido)) {
           prefereBemolParaTodaEscala = true;
      }
  }
  // Outras tônicas (C, G, D, A, E, B) usam sustenidos.


  // Lógica para obter o nome da escala (código original, sem alterações)
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
  
  // O nome da tônica no cabeçalho usa a nomenclatura corrigida
  cTomName = getCorrectedNoteName(tonicaIndex, prefereBemolParaTodaEscala);
  cH2TabInterv.innerText =
    "📊 Tabela de Intervalos - " + cTomName + " " + cScaleName;

  if (!tonicaInput || !escalaEstrutura) {
    alert("Por favor, insira uma Tônica válida e selecione um Tipo de Escala.");
    return;
  }

  // ******* CORREÇÃO E GERAÇÃO DA ESCALA ********

  let escalaNotas = []; // Declarando a variável
  let escalaOutput = ""; // Declarando a variável
  let currentIndex = tonicaIndex; // Declarando a variável

  // 1. Geração da Escala e da Nomenclatura
  const notaTonicaCorrigida = getCorrectedNoteName(tonicaIndex, prefereBemolParaTodaEscala);
  escalaNotas.push(notaTonicaCorrigida);
  escalaOutput += `1 - ${notaTonicaCorrigida} - Tônica\n`;

  let grau = 2; // Declarando a variável
  let distanciaAcumulada = 0; // Para calcular a distância total em semitons

  for (let i = 0; i < escalaEstrutura.length; i++) {
    const intervalo = escalaEstrutura[i];
    distanciaAcumulada += intervalo;

    currentIndex = (currentIndex + intervalo) % 12;
    // NOVO: Usa a função de correção para a nota na escala
    const nota = getCorrectedNoteName(currentIndex, prefereBemolParaTodaEscala);
    escalaNotas.push(nota);

    // Busca o nome do grau pela distância acumulada em semitons (0 a 11)
    const nomeDoGrau =
      nomenclaturaGrausIntervalos[distanciaAcumulada % 12].nome;

    // Formato de saída: Número do Grau - Nota - Nomenclatura
    escalaOutput += `${grau} - ${nota} - ${nomeDoGrau}\n`;
    grau++;
  }

  document.getElementById("escalaResultado").innerText = escalaOutput;

  // 2. Geração do Campo Harmônico
  const campoHarmonicoResult = gerarCampoHarmonico(tonicaIndex, tipoEscala);
  document.getElementById("campoHarmonicoResultado").innerText =
    campoHarmonicoResult;

  // 3. Geração da Tabela de Intervalos
  // NOVO: Passa a preferência para a função da Tabela
  gerarTabelaDeIntervalos(tonicaIndex, escalaNotas, prefereBemolParaTodaEscala);

  gerarTecladoVirtual(tonicaInput, escalaNotas);
}

window.onload = function () {
  document.getElementById("tonica").value = "C";
  document.getElementById("tipoEscala").value = "maior";

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
    return chave
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
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
        let intervalo = estrutura[i] !== undefined ? estrutura[i] : "—"; // '—' se for menor que 8 notas

        // Aplica formatação de Tom/Semitom se o valor for 1 ou 2
        let intervaloFormatado;
        if (intervalo === 1) {
          intervaloFormatado = "Semitom"; // Semitom
        } else if (intervalo === 2) {
          intervaloFormatado = "Tom"; // Tom
        } else if (intervalo === 3) {
          intervaloFormatado = "Tom + Semitom"; // Tom e Semitom (Tom e Meio)
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