/**
 * NOVO: Gera a visualização do teclado virtual (2 Oitavas Completas) centrado na tônica.
 * @param {string} tonicaInput - A tônica selecionada (Ex: 'C').
 * @param {Array<string>} escalaNotas - Array das notas da escala.
 */
function gerarTecladoVirtual(tonicaInput, escalaNotas) {
  const container = document.getElementById("tecladoVirtualContainer");
  if (!container) return;

  container.innerHTML = "";

  // --- Configuração do Teclado (2 Oitavas Completas) ---
  // CORRIGIDO: Array estendido para 2 oitavas completas (C1 até C3), total de 25 notas.
  const tecladoCompleto = [
    "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", // 1ª Oitava
    "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", // 2ª Oitava
    "C", // C3 (Finaliza a 2ª oitava de forma completa)
  ];

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
  
  // LÓGICA DE DESTAQUE OTIMIZADA: Coleta os índices cromáticos de todas as notas da escala.
  const escalaIndices = new Set();
  escalaNotas.forEach(nota => {
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

  // 2. Renderização da faixa completa de 2 oitavas (25 notas)
  const notasParaRenderizar = tecladoCompleto.length; 
  let currentChromaticIndexTotal = 0; 

  for (let i = 0; i < notasParaRenderizar; i++) {
    const notaCromatica = tecladoCompleto[currentChromaticIndexTotal];
    const tipo = tipoTeclas[notaCromatica];

    // NOVO DESTAQUE: Verifica se o índice cromático da tecla está na escala.
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
      // leftPosition = (posição da branca anterior + 40) - 12
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

  // 3. Centralização do Teclado na Tônica (tonicaInput) 
  const faixaRenderizadaLargura = offsetX;
  let xPosicaoTonica = -1;
  let tempX = 0; // Acumulador de largura das teclas brancas
  
  const tonicaParaCentralizar = notasCromaticas[tonicaIndex];

  // Cálculo da posição X da tônica (posição inicial na primeira oitava)
  // Basta calcular a posição da tônica na primeira oitava (C1 a B1)
  for (let i = 0; i < 12; i++) {
      const nota = tecladoCompleto[i];
      const tipo = tipoTeclas[nota];

      if (nota === tonicaParaCentralizar) {
           if (tipo === "preta") {
               // Posição de start da branca anterior (tempX) - 12
               xPosicaoTonica = tempX - 12; 
           } else { // Branca
               xPosicaoTonica = tempX;
           }
           break;
      }

      if (tipo === "branca") {
         tempX += 40;
      }
  }


  const centroVisual = 280; // Ponto central do container visível (estimado)
  let translateOffset = centroVisual - xPosicaoTonica;

  const innerWrapper = document.createElement("div");
  innerWrapper.style.position = "relative";
  innerWrapper.style.width = `${faixaRenderizadaLargura}px`;
  innerWrapper.style.transform = `translateX(${translateOffset}px)`;
  innerWrapper.innerHTML = htmlTeclasBrancas + htmlTeclasPretas;

  container.innerHTML = "";
  container.appendChild(innerWrapper);
}