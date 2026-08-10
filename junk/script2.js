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
