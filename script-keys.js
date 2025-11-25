/**
 * NOVO: Gera a visualização do teclado virtual, ajustando o número de oitavas
 * de 2 para 1 em telas pequenas (<= 768px).
 * @param {string} tonicaInput - A tônica selecionada (Ex: 'C').
 * @param {Array<string>} escalaNotas - Array das notas da escala.
 */
function gerarTecladoVirtual(tonicaInput, escalaNotas) {
  const container = document.getElementById("tecladoVirtualContainer");
  if (!container) return;

  container.innerHTML = "";

  // --- 1. DETECÇÃO DE TELA E CONFIGURAÇÃO DO TECLADO ---
  // Verifica se a largura da tela é igual ou menor que o breakpoint móvel (768px)
  let isSmallScreen = window.innerWidth;

  let tecladoCompleto = [
      "C","C#",
      "D","D#",
      "E","F",
      "F#","G",
      "G#","A",
      "A#","B",
      "C","C#",
      "D","D#",
      "E", "F",
      "F#","G",
      "G#","A",
      "A#","B",
      "C",
    ];

  if (isSmallScreen <= 550) {
    // Teclado para telas pequenas: 1 Oitava e um pouco mais (C1 até C2)
    // para garantir a centralização visual da tônica, total de 13 notas.
    tecladoCompleto.length = 13
  } else if (isSmallScreen <= 768) {
    // Teclado para telas pequenas: 1 Oitava e um pouco mais (C1 até E2)
    // para garantir a centralização visual da tônica, total de 17 notas.
    tecladoCompleto.length = 17
  } else {
    // Teclado para telas maiores: 2 Oitavas completas (C1 até C3), total de 25 notas.
      tecladoCompleto.length
  }

  const tipoTeclas = {
    C: "branca",
    D: "branca",
    E: "branca",
    F: "branca",
    G: "branca",
    A: "branca",
    B: "branca",
    "C#": "preta",
    "D#": "preta",
    "F#": "preta",
    "G#": "preta",
    "A#": "preta",
  };

  // LÓGICA DE DESTAQUE: Coleta os índices cromáticos das notas da escala.
  const escalaIndices = new Set();
  escalaNotas.forEach((nota) => {
    const index = getChromaticIndex(nota); // Função global de script-escalasNEW.js
    if (index !== -1) {
      escalaIndices.add(index);
    }
  });

  let tonicaIndex = notasCromaticas.indexOf(tonicaInput);
  if (tonicaIndex === -1 && notasEnarmonicasInvertido[tonicaInput]) {
    tonicaIndex = notasEnarmonicasInvertido[tonicaInput];
  }

  let htmlTeclasBrancas = "";
  let htmlTeclasPretas = "";
  let offsetX = 0; // Posição horizontal acumulada (início da tecla branca)

  // --- 2. RENDERIZAÇÃO ---
  const notasParaRenderizar = tecladoCompleto.length;
  let currentChromaticIndexTotal = 0;

  for (let i = 0; i < notasParaRenderizar; i++) {
    const notaCromatica = tecladoCompleto[currentChromaticIndexTotal];
    const tipo = tipoTeclas[notaCromatica];

    // Verifica se o índice cromático da tecla está na escala.
    const notaIndex = getChromaticIndex(notaCromatica);
    const isNotaNaEscala = notaIndex !== -1 && escalaIndices.has(notaIndex);

    let classeDestaque = "";
    if (isNotaNaEscala) {
      classeDestaque = tipo === "branca" ? "destaque-branca" : "destaque-preta";
    }

    // Adiciona destaque para a Tônica na primeira ocorrência
    if (notaIndex === tonicaIndex && i === 0) {
      classeDestaque += " tonic-note-key";
    }

    // Define a nota a ser exibida (com sustenido formatado)
    let notaExibida =
      tipo === "preta" ? notaCromatica.replace("#", "♯") : notaCromatica;

    if (tipo === "branca") {
      // Teclas Brancas
      htmlTeclasBrancas += `<div 
                class="tecla branca ${classeDestaque}" 
                style="left: ${offsetX}px; z-index: 1;"
            >
                ${notaExibida}
            </div>`;
      offsetX += 40; // Largura da tecla branca
    } else if (tipo === "preta") {
      // Teclas Pretas
      const leftPosition = offsetX - 12;

      htmlTeclasPretas += `<div 
                class="tecla preta ${classeDestaque}" 
                style="left: ${leftPosition}px; z-index: 2;"
            >
                ${notaExibida}
            </div>`;
    }

    currentChromaticIndexTotal++;
  }

  // --- 3. CENTRALIZAÇÃO ---
  const faixaRenderizadaLargura = offsetX;
  let xPosicaoTonica = -1;
  let tempX = 0; // Acumulador de largura das teclas brancas

  const tonicaParaCentralizar = notasCromaticas[tonicaIndex];

  // Cálculo da posição X da tônica (posição inicial na primeira oitava)
  // Itera apenas sobre a primeira oitava (12 notas) para encontrar a posição da tônica.
  for (let i = 0; i < 12; i++) {
    const nota = tecladoCompleto[i];
    const tipo = tipoTeclas[nota];

    if (nota === tonicaParaCentralizar) {
      if (tipo === "preta") {
        xPosicaoTonica = tempX - 12;
      } else {
        // Branca
        xPosicaoTonica = tempX;
      }
      break;
    }
    if (tipo === "branca") {
      tempX += 40;
    }
  }

  const centroVisual = 280;
  let translateOffset = centroVisual - xPosicaoTonica;

  const innerWrapper = document.createElement("div");
  innerWrapper.style.position = "relative";
  innerWrapper.style.width = `${faixaRenderizadaLargura}px`;
  innerWrapper.innerHTML = htmlTeclasBrancas + htmlTeclasPretas;

  container.innerHTML = "";
  container.appendChild(innerWrapper);
}

// 4. Lógica de Listener de Redimensionamento:
// Adiciona um listener para recalcular o teclado ao redimensionar a tela (rotação do celular/redimensionamento do browser)
window.addEventListener("resize", () => {
  // Verifica se a função calcularEscala existe (é carregada por script-escalasNEW.js)
  if (typeof calcularEscala === "function") {
    calcularEscala();
  }
});
