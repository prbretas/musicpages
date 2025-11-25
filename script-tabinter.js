/**
 * CRIA UM ARRAY AUXILIAR que lista as 12 notas cromáticas, em ordem.
 * Onde notas alteradas em # ficam no index impar, e em b ficam na lista notasEnarmonicas
 * (Funções e constantes como notasCromaticas e notasEnarmonicas são importadas via script-escalasNEW.js)
 */

/**
 * Cria a Tabela de Intervalos Dinâmica e aplica destaque.
 * @param {number} tonicaIndex - Índice da nota base.
 * @param {Array<string>} escalaNotas - Array das notas que compõem a escala (para destaque).
 * @param {boolean} prefereBemol - Se for true, usa nomenclatura em bemol na linha 1.
 */
function gerarTabelaDeIntervalos(tonicaIndex, escalaNotas, prefereBemol) {
  let html = `<table class="interval-table">`;
  const tabelaContainer = document.getElementById("tabelaIntervalosResultado");

  // A Tabela é construída sempre a partir da Tônica (0 semitons) até a Oitava (12 semitons)
  const notasParaTabela = [];
  const grausParaTabela = [];
  
  // LINHA 1: Nomes das Notas
  for (let i = 0; i <= 12; i++) {
    const absoluteIndex = (tonicaIndex + i) % 12;
    
    // Obtém o nome da nota com base na preferência (Função global de script-escalasNEW.js)
    let nota = getCorrectedNoteName(absoluteIndex, prefereBemol);
    
    // A tônica (i=0) e a oitava (i=12) devem usar o nome corrigido da própria tônica.
    if (i === 0 || i === 12) {
      nota = getCorrectedNoteName(tonicaIndex, prefereBemol); 
    }
    
    notasParaTabela.push(nota);
    
    // Obtém o nome do grau (Ex: "3ªb", "5ª")
    const grauObj = nomenclaturaGrausIntervalos.find(g => g.semitons === i);
    grausParaTabela.push(grauObj ? grauObj.grau : i); // Usa o número de semitons como fallback
  }


  // CRUCIAL PARA O DESTAQUE: Cria um array com todas as representações enharmônicas válidas
  let escalaNotasEnarmonicas = [...escalaNotas];
  
  // Adiciona as enarmônicas das notas da escala.
  escalaNotas.forEach(nota => {
      const index = getChromaticIndex(nota); // Usa função global de script-escalasNEW.js
      if (index !== -1) {
          // Tenta adicionar a versão bemol
          if (notasEnarmonicas[index] && notasEnarmonicas[index] !== nota) {
              escalaNotasEnarmonicas.push(notasEnarmonicas[index]);
          } 
          // Tenta adicionar a versão sustenido
          const sharpName = notasCromaticas[index]; 
          if (sharpName && sharpName !== nota) {
               escalaNotasEnarmonicas.push(sharpName);
          }
      }
  });

  // Limpa o array e garante que todas as notas estejam em MAIÚSCULAS para comparação segura.
  escalaNotasEnarmonicas = Array.from(new Set(escalaNotasEnarmonicas.map(n => n.toUpperCase())));


  // --- INÍCIO DA MONTAGEM HTML ---

  // LINHA 1: Nomes das Notas (C, C#, D, D#, ...)
  html += `<tr>`;
  notasParaTabela.forEach((nota, index) => {
    // A comparação agora usa o array aprimorado escalaNotasEnarmonicas
    const notaUpper = nota.toUpperCase().replace(/X/g, '##'); // Trata duplo sustenido (G##)
    
    const classeDestaque = (escalaNotasEnarmonicas.includes(notaUpper))
      ? "note-in-scale"
      : "";

    // Adiciona a classe especial para a Tônica
    const classeTonica = index === 0 ? "tonic-note" : "";

    html += `<td class="note-cell ${classeDestaque} ${classeTonica}">${nota}</td>`;
  });
  html += `</tr>`;


  // LINHA 2: Graus/Intervalos (T, 2ªb, 2ª, 3ªb, ...)
  html += `<tr>`;
  for (let i = 0; i <= 12; i++) {
    const grauNome = grausParaTabela[i];
    const notaDaTabela = notasParaTabela[i]; // Nota correspondente na linha 1
    
    const notaUpper = notaDaTabela.toUpperCase().replace(/X/g, '##');

    // A lógica de destaque do grau deve ser a mesma da nota.
    const classeDestaque = (escalaNotasEnarmonicas.includes(notaUpper))
      ? "note-in-scale"
      : "";
    
    html += `<td class="degree-cell ${classeDestaque}">${grauNome}</td>`;
  }
  html += `</tr>`;

  // LINHA 3: Semitons (0, 0.5,1.0,1.5,2.0,2.5, 3, ...)
  html += `<tr>`;
  for (let i = 0; i <= 12; i++) {
    const notaDaTabela = notasParaTabela[i];
    
    const notaUpper = notaDaTabela.toUpperCase().replace(/X/g, '##');

    // Lógica de Destaque
    const classeDestaque = (escalaNotasEnarmonicas.includes(notaUpper))
      ? "note-in-scale"
      : "";
      
    html += `<td class="semitone-cell ${classeDestaque}">${i/2}</td>`;
  }
  html += `</tr>`;

  // LINHA 4: PENSANDO EM NUMEROS INTEIROS (0, 1, 2, 3, ...)
  html += `<tr>`;
  for (let i = 0; i <= 12; i++) {
    const notaDaTabela = notasParaTabela[i];
    
    const notaUpper = notaDaTabela.toUpperCase().replace(/X/g, '##');

    // Lógica de Destaque
    const classeDestaque = (escalaNotasEnarmonicas.includes(notaUpper))
      ? "note-in-scale"
      : "";
      
    html += `<td class="semitone-cell ${classeDestaque}">${i}</td>`;
  }
  html += `</tr>`;

  // --- FIM DA MONTAGEM HTML ---
  html += `</table>`;
  tabelaContainer.innerHTML = html;
}