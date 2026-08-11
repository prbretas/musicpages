## INSTRUÇÕES
NESSE ARQUIVO FICARÃO AS IDEIAS QUE EU TIVE PARA DESENVOLVIMENTO.
DEVE SER REALIZADO REFINAMENTO PARA CADA TAREFA. 
DEPOIS DE DESENVOLVIDA E IMPLEMENTADA DEVE SER REMOVIDO DESSE ARQUIVO PARA MANTERMOS SEMPRE LIMPO. E INCLUIR NA LISTA DE ISSUES DESENVOLVIDAS, BEM COMO A DATA QUE FOI DESENVOLVIDA.


## ISSUES CONCLUÍDAS

- [x] ISSUE 01 - Alterar afinação do instrumento e selecionar instrumento (baixo, guitarra 7 cordas, etc.) — RESOLVIDA EM 09/08/2026
  - Implementado: InstrumentRegistry com 7 perfis, selector dropdown, custom tuning panel com validação, reset button, escala persistente ao trocar instrumento.

- [x] ISSUE 02 - Alterar o fretboard de acordo com o instrumento desejado — RESOLVIDA EM 09/08/2026
  - Implementado: FretboardRenderer dinâmico que reconstrói strings, frets, espessuras e MIDI baseado no perfil selecionado.

- [x] ISSUE 03 - Corrigir tema Dark Mode (contraste errado em alguns lugares) — RESOLVIDA EM 10/08/2026
  - Implementado: body.dark rules para todos os containers (metronome, input-group, output, tabelas, preset buttons, fretboard, teclado virtual, novos containers). Contraste mínimo 4.5:1 verificado.

- [x] ISSUE 04 - Incluir menu no header — RESOLVIDA EM 10/08/2026
  - Implementado: nav sticky com hamburger responsivo, smooth scroll, aria-expanded, CSS para desktop/mobile, dark mode.

- [x] ISSUE 05 - Incluir container visual de escalas (Círculo de Escalas) — RESOLVIDA EM 10/08/2026
  - Implementado: ScaleCircle IIFE com SVG 400x400, 12 notas posicionadas em círculo, polígono conectando notas da escala, modo comparação com 2 escalas, som ao clicar em nota via AudioEngine.

- [x] ISSUE 06 - Incluir container para o Ciclo de Quintas — RESOLVIDA EM 10/08/2026
  - Implementado: CircleOfFifths IIFE com SVG 450x450, anéis externo (maiores) e interno (menores), clique mostra armadura de clave, marcação de enarmônicos, AudioEngine no clique. Corrigida inicialização em 10/08/2026.

- [x] ISSUE 07 - Incluir container iframe do Songsterr — RESOLVIDA EM 10/08/2026
  - Implementado: Link button para abrir Songsterr em nova aba (iframe bloqueado pelo X-Frame-Options do site).

- [x] ISSUE 08 — Visualizador de Acordes — RESOLVIDA EM 10/08/2026
  - Implementado: ChordVisualizer IIFE com SVGRenderer de diagramas, LocalChordDB com 84 acordes (12 raízes × 7 qualidades), navegação entre voicings (prev/next com indicador), escuta evento scale-changed, grid responsivo com chord cards, dark mode.

- [x] ISSUE 09 — Avaliar Guitar Pro API (parse.bot) — DESCARTADA EM 10/08/2026
  - Decisão: Não implementar. API não-oficial, instável, paga. Alternativa local (alphaTab) possível no futuro.

- [x] ISSUE 10 — Avaliar Ultimate Guitar API — DESCARTADA EM 10/08/2026
  - Decisão: Não implementar. Projeto Python abandonado desde 2017, viola ToS.

- [x] ISSUE 11 — Avaliar Uberchord API — ABSORVIDA PELA ISSUE 08 EM 10/08/2026
  - Análise: API gratuita e sem auth, REST simples. Incorporada como fonte de dados futura no chord-visualizer spec (com fallback para LocalChordDB).

- [x] ISSUE 12 - Botão fechar/cancelar comparação de escalas — RESOLVIDA EM 10/08/2026
  - Implementado: Botão toggle "Comparar Escalas" / "✕ Fechar Comparação" com cor vermelha quando ativo. Ao fechar, esconde os selects e remove polígono de comparação.

- [x] ISSUE 13 - Corrigir escalas pentatônicas (apareciam 7 notas em vez de 5) — RESOLVIDA EM 10/08/2026
  - Causa: pentatônicas estavam no modeToRelativeMajorDegree, forçando cálculo diatônico (7 notas). Fix: removidas do mapa, agora calculadas por semitons (5 notas corretas).

- [x] ISSUE 14 - Incluir escalas exóticas das imagens da pasta /img — RESOLVIDA EM 10/08/2026
  - Implementado: Egípcia [2,3,2,3,2], Hirajoshi [2,1,4,1,4], Iwato [1,4,1,4,2], Man Gong [3,2,3,2,2], Ritusen [2,2,3,2,3], Blues Maior [2,1,1,3,2,3], Blues Menor [3,2,1,1,3,2]. Novo optgroup "Escalas Exóticas" no dropdown.


## IDEIAS A SEREM DESENVOLVIDAS

### ISSUE 15 — Corrigir o Ciclo de Quintas (não aparecia na tela)

**Status**: ✅ Corrigido em 10/08/2026 — faltava a chamada `CircleOfFifths.init('circleOfFifthsContainer')` no DOMContentLoaded.

---

### ISSUE 16 — Integração Uberchord API (complemento ao Visualizador de Acordes)

**Descrição**: Adicionar o UberchordClient como fonte de dados online complementar ao LocalChordDB no Visualizador de Acordes (Issue 08). Já especificado no `chord-visualizer` spec (task 6.1).

**Próximo passo**: Testar CORS com `fetch('https://api.uberchord.com/v1/chords/Am')` no browser. Se funcionar, implementar task 6.1 do spec.

**Complexidade**: Média

---

### ISSUE 17 — Reprodução sonora dos acordes (strum pattern)

**Descrição**: Ao clicar em um diagrama de acorde, tocar as notas do acorde em sequência (strum) via AudioEngine. Já especificado no `chord-visualizer` spec (task 8.1).

**Complexidade**: Média
