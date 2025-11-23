

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
    const classeDestaque = (escalaNotasEnarmonicas.includes(notaDaTabela))
      ? "note-in-scale"
      : "";
    // A classe do grau é 'degree-cell', mas o destaque deve ser aplicado.
    html += `<td class="degree-cell ${classeDestaque}">${grauNome}</td>`;
  }
  html += `</tr>`;

  // LINHA 3: Semitons (0, 1, 2, 3, ...)
  html += `<tr>`;
  for (let i = 0; i <= 12; i++) {
    const notaDaTabela = notasParaTabela[i];
    
    // Lógica de Destaque
    const classeDestaque = (escalaNotasEnarmonicas.includes(notaDaTabela))
      ? "note-in-scale"
      : "";
      
    html += `<td class="semitone-cell ${classeDestaque}">${i/2}</td>`;
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
    const classeDestaque = (escalaNotasEnarmonicas.includes(notaDaTabela))
      ? "note-in-scale"
      : "";
      
    // Aplica a nova classe 'semitones-number-cell' para a estilização específica
    html += `<td class="semitones-number-cell ${classeDestaque}">${grauNumero}</td>`;
  }
  html += `</tr>`;

  html += ` </tbody></table>`;

  document.getElementById("tabelaIntervalosResultado").innerHTML = html;
}