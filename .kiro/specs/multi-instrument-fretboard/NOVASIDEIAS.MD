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
  - Implementado: CircleOfFifths IIFE com SVG 450x450, anéis externo (maiores) e interno (menores), clique mostra armadura de clave, marcação de enarmônicos, AudioEngine no clique.

- [x] ISSUE 07 - Incluir container iframe do Songsterr — RESOLVIDA EM 10/08/2026
  - Implementado: Iframe direto para https://www.songsterr.com/ sem input de URL. O usuário navega dentro do próprio Songsterr.


- [x] ISSUE 12 - Botão fechar/cancelar comparação de escalas — RESOLVIDA EM 10/08/2026
  - Implementado: Botão toggle "Comparar Escalas" / "✕ Fechar Comparação" com cor vermelha quando ativo. Ao fechar, esconde os selects e remove polígono de comparação.


## IDEIAS A SEREM DESENVOLVIDAS

### ISSUE 08 — Visualizador de Acordes (inspirado em chords.alday.dev)

**Descrição**: Incluir um container para visualizar os acordes da escala selecionada, mostrando diagramas de braço do instrumento com as posições dos dedos. Deve suportar:
1. Exibir automaticamente os acordes do campo harmônico da escala atual
2. Alternar entre diferentes posições/voicings do mesmo acorde no braço
3. Adaptar os diagramas ao instrumento selecionado (guitarra 6 cordas vs ukulele vs baixo — a afinação afeta as shapes)
4. Diagramas SVG com frets, cordas, posições dos dedos (bolinhas numeradas), pestana (barra), cordas abertas (O) e cordas mudas (X)

**Referência visual**: https://chords.alday.dev/

**Implementação sugerida**:
- Criar `scripts/script-chord-diagrams.js` (IIFE)
- Definir banco de dados interno com shapes dos acordes mais comuns por instrumento/afinação
- Renderizar diagramas SVG (similar ao [svguitar](https://github.com/omnibrain/svguitar))
- Escutar evento `'scale-changed'` para atualizar acordes exibidos
- Botões "< >" para navegar entre voicings do mesmo acorde
- Integrar com AudioEngine para tocar o acorde ao clicar

**Complexidade**: Alta — requer banco de dados de shapes de acordes e engine de cálculo de voicings

---

### ISSUE 09 — Avaliar Guitar Pro API (parse.bot)

**Descrição**: Avaliar a API do Guitar Pro disponível em https://parse.bot/marketplace/40f91705-6f12-422e-8dc5-6f3991e33a94/guitarpro-com-api

**Refinamento / Análise**:
- **O que é**: Marketplace de API que faz scraping/parse do site guitarpro.com. Não é uma API oficial do Guitar Pro.
- **Funcionalidade provável**: Buscar tabs/partituras do Guitar Pro, acessar metadados de músicas
- **Riscos**:
  - API não-oficial — pode quebrar sem aviso se o site mudar
  - Possível violação de ToS do Guitar Pro
  - Dependência de serviço terceiro (parse.bot) — disponibilidade incerta
  - Custo: provavelmente pago (marketplace)
- **Viabilidade para o projeto**: Baixa a média. Seria útil para importar tabs, mas a instabilidade e o custo não justificam para um projeto pessoal/educacional.
- **Alternativa**: Considerar formato .gp (Guitar Pro files) — existem parsers open-source como [alphaTab](https://github.com/CoderLine/alphaTab) que lêem arquivos .gp5/.gpx localmente, sem API.

**Recomendação**: ⚠️ Não implementar por enquanto. Avaliar alphaTab como alternativa local se quiser suporte a arquivos Guitar Pro.

---

### ISSUE 10 — Avaliar Ultimate Guitar API (joncardasis/ultimate-api)

**Descrição**: Avaliar a API do Ultimate Guitar disponível em https://github.com/joncardasis/ultimate-api

**Refinamento / Análise**:
- **O que é**: Biblioteca Python (não JavaScript) que faz web scraping do site ultimate-guitar.com
- **Última atualização**: 2017 — projeto abandonado há 9 anos
- **Funcionalidade**: Buscar cifras, tabs e letras por artista/música
- **Riscos**:
  - Projeto Python — incompatível com o stack JavaScript do MusicPages (precisaria de um backend)
  - Abandonado desde 2017 — certamente quebrado pois o Ultimate Guitar mudou várias vezes
  - Web scraping viola ToS do Ultimate Guitar
  - Ultimate Guitar tem proteção anti-bot (Cloudflare, etc.)
- **Viabilidade para o projeto**: Muito baixa. Não funciona, não é JavaScript, viola ToS.

**Recomendação**: ❌ Não implementar. Se quiser cifras/tabs, usar o iframe do Songsterr (já implementado) ou avaliar a Uberchord API (Issue 11) para dados de acordes.

---

### ISSUE 11 — Avaliar Uberchord API

**Descrição**: Avaliar a API da Uberchord disponível em https://api.uberchord.com/

**Refinamento / Análise**:
- **O que é**: API REST gratuita que retorna dados de acordes de guitarra (finger positions, strings, frets)
- **Endpoints principais**:
  - `GET /v1/chords/{chordName}` — retorna diagrama do acorde (ex: `/v1/chords/Am`)
  - `GET /v1/chords?nameLike={partial}` — busca por nome parcial
- **Formato de resposta**: JSON com campos como `strings` (posição por corda), `fingering`, `chordName`
- **Vantagens**:
  - Gratuita e sem autenticação (API key não necessária)
  - REST simples, consumível direto do browser via fetch
  - Dados estruturados prontos para renderizar diagramas SVG
  - Boa cobertura de acordes comuns
- **Riscos**:
  - API pode ser descontinuada (a empresa foca no app mobile)
  - Dados apenas para guitarra standard tuning — não cobre ukulele ou baixo nativamente
  - Sem garantia de SLA ou uptime
  - CORS: precisa verificar se permite chamadas do browser
- **Viabilidade para o projeto**: Média-alta para guitarra. Pode ser combinada com o Issue 08 (visualizador de acordes) como fonte de dados.

**Recomendação**: ✅ Vale implementar como fonte de dados complementar para a Issue 08. Fazer fallback para banco local caso a API esteja fora do ar. Testar CORS antes de investir tempo.

**Próximo passo**: Fazer teste de CORS com `fetch('https://api.uberchord.com/v1/chords/Am')` no browser para verificar se funciona direto.

13 - corrigir a escala pentatonicas. pois esta errado esta aparecendo 7 notas, deveriam ser apenas 5.

14 - Gostaria de incluir as escalas que estao nas imagens da pasta /img,

15 - corrigir o ciclo de quintas, pois nao esta aparecendo na tela corretamente.