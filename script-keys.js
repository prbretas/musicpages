
/**
 * NOVO: Gera a visualização do teclado virtual (1 Oitava) centrado na tônica.
 * @param {string} tonicaInput - A tônica selecionada (Ex: 'C').
 * @param {Array<string>} escalaNotas - Array das notas da escala.
 */
function gerarTecladoVirtual(tonicaInput, escalaNotas) {
  const container = document.getElementById("tecladoVirtualContainer");
  if (!container) return;

  container.innerHTML = "";

  // --- Configuração do Teclado (2 Oitavas Completas como BASE) ---
  // Usamos 2 oitavas para ter margem de deslocamento e garantir a centralização
  const tecladoCompleto = [
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

  let tonicaIndex = notasCromaticas.indexOf(tonicaInput);
  // Se a tônica foi inputada como bemol, encontra o índice correto
  if (tonicaIndex === -1 && notasEnarmonicasInvertido[tonicaInput]) {
      tonicaIndex = notasEnarmonicasInvertido[tonicaInput];
  }


  let htmlTeclasBrancas = "";
  let htmlTeclasPretas = "";
  let offsetX = 0; // Posição horizontal acumulada (início da tecla branca)
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

  // A nota C (índice 0) é o ponto de partida do teclado cromático.
  // Rendering 5 notas antes do C na sequência total de 24 notas cromáticas.
  const startIndex = 5; // Posição cromática na 1ª oitava.

  // faixa de 18 notas brancas e 15 pretas para garantir que a tônica esteja sempre visível e centralizada.
  const notasParaRenderizar = 24;
  let startChromaticIndex = 0; // Começamos no C (índice 0)
  let currentChromaticIndex = startChromaticIndex;

  // 3. Renderização de uma faixa de 13 teclas brancas + pretas
  let numBrancasRenderizadas = 0;
  let currentChromaticIndexTotal = 0; // Índice de 0 a 23

  for (let i = 0; i < notasParaRenderizar; i++) {
    const notaCromatica = tecladoCompleto[currentChromaticIndexTotal];
    const tipo = tipoTeclas[notaCromatica];

    // O teclado deve realçar as notas da escala, independente da notação (# ou b) usada na escalaNotas
    let isNotaNaEscala = escalaNotas.includes(notaCromatica);
    
    // NOVO: Adiciona a verificação da nota enarmônica para o destaque
    if (!isNotaNaEscala && notasEnarmonicas[notasCromaticas.indexOf(notaCromatica)]) {
        if(escalaNotas.includes(notasEnarmonicas[notasCromaticas.indexOf(notaCromatica)])) {
            isNotaNaEscala = true;
        }
    }
    

    // Define o destaque
    let classeDestaque = "";
    if (isNotaNaEscala) {
      classeDestaque = tipo === "branca" ? "destaque-branca" : "destaque-preta";
    }

    // Define a nota a ser exibida (sem bemóis, como solicitado)
    let notaExibida =
      tipo === "preta" ? notaCromatica.replace("#", "♯") : notaCromatica;

    if (tipo === "branca") {
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
    } else if (tipo === "preta") {
      // Teclas Pretas (Posicionamento absoluto baseado na tecla branca anterior)
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

  // 4. Centralização do Teclado na Tônica (tonicaInput)

  // Largura total da faixa renderizada
  const faixaRenderizadaLargura = offsetX;

  // Calcular a posição X da Tônica (tonicaInput) na faixa renderizada
  let xPosicaoTonica = -1;
  let currentX = 0;
  
  // Usa o tecladoCompleto para calcular o deslocamento
  const tonicaParaCentralizar = notasCromaticas[tonicaIndex];

  for (let i = 0; i < tecladoCompleto.length; i++) {
    const nota = tecladoCompleto[i];
    const tipo = tipoTeclas[nota];
    
    // Busca a posição da tônica (usando o índice cromático da nota)
    if (nota === tonicaParaCentralizar) {
      xPosicaoTonica = currentX;
      break;
    }

    // Simula o deslocamento para achar a posição da tônica
    if (tipo === "branca") {
      currentX += 40;
    }
  }

  // Se a tônica for preta, a posição X é a da tecla branca anterior + 20px (metade)
  if (tonicaParaCentralizar.includes("#")) {
    xPosicaoTonica = currentX - 12; // Ajusta para a posição da tecla preta
  } else {
    xPosicaoTonica = currentX;
  }
  
  // Garante que o índice foi encontrado
  if (xPosicaoTonica === -1) {
      xPosicaoTonica = 0; // Fallback para C (0)
  }

  // Ponto Central da Tela de Exibição (aproximadamente 300px)
  const centroVisual = 280; // Metade da largura esperada do container pai

  // Deslocamento necessário para trazer a Tônica para o centro
  let translateOffset = centroVisual - xPosicaoTonica;

  // Cria o wrapper interno que será transladado (movido horizontalmente)
  const innerWrapper = document.createElement("div");
  innerWrapper.style.position = "relative";
  innerWrapper.style.width = `${faixaRenderizadaLargura}px`;
  innerWrapper.style.transform = `translateX(${translateOffset}px)`;
  innerWrapper.innerHTML = htmlTeclasBrancas + htmlTeclasPretas;

  container.innerHTML = "";
  container.appendChild(innerWrapper);
}
