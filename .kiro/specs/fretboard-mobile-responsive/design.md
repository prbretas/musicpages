# Design: Fretboard Mobile Responsive

## Visão Geral

Troca o layout do fretboard de "espremer tudo em 100% da largura" para **largura fixa em px por casa
+ scroll horizontal**, com a **pestana (casa 0) sticky** e **destaque contínuo**. O cerne é parar de
forçar `width: 100%` e posicionar os trastes em **pixels** (não percentual), deixando o container
rolar quando o conteúdo excede a viewport.

Mudança mínima, cirúrgica: ajusta duas coisas no `script-fretboard.js` (aplicar `dims.width` em px;
posicionar/dimensionar `.fret` em px) e o CSS do `#fretboard`/`.fret:first-child`. A lógica de
cálculo (`calculateFretboardDimensions`, MIDI, nomes, ordem, espessura) permanece intacta.

## Arquitetura / Mudanças

### 1. `script-fretboard.js`

#### a) Aplicar a largura calculada (em vez de 100%)
No render (`applyInstrumentProfile`, ~linha 567):
```js
// Antes:
fretboard.style.width = '100%';
fretboard.style.height = dims.height + 'px';

// Depois:
fretboard.style.width = dims.width + 'px';   // (frets+1) * FRET_WIDTH
fretboard.style.height = dims.height + 'px';
```
Como `#fretboard` fica dentro de um wrapper com `overflow-x: auto`, uma largura maior que a viewport
gera scroll horizontal natural. Em telas largas onde `dims.width` cabe, não há scroll.

#### b) Posicionar/dimensionar os trastes em px (não %)
Em `buildStringRow` (~linha 429), trocar o cálculo percentual por px, usando a constante existente
`FRET_WIDTH`:
```js
// Antes:
var fretWidthPercent = 100 / (numFrets + 1);
...
fret.style.left  = (fretNumber * fretWidthPercent) + '%';
fret.style.width = fretWidthPercent + '%';

// Depois:
fret.style.left  = (fretNumber * FRET_WIDTH) + 'px';
fret.style.width = FRET_WIDTH + 'px';
```
Isso garante casas de largura fixa (40px) — a note-cell de 22px nunca sobrepõe a vizinha.

> `FRET_WIDTH` já é módulo-level (40). Para expor a `buildStringRow`, ela já está no mesmo escopo do
> IIFE, então acessa `FRET_WIDTH` diretamente.

#### c) (Opcional) tornar `FRET_WIDTH` levemente maior para toque
Mantemos 40px (já > 22px da note-cell + folga). Não precisa aumentar; 40px é confortável para toque
na área da casa. A note-cell segue 22px (critério: ≥ 22px, sem sobreposição — atendido).

### 2. CSS — `styles/style-fretboard.css`

#### a) Scroll horizontal no container do fretboard
```css
#fretboard {
    position: relative;
    /* width agora é fixo (px) via JS; remover width:100% implícito do CSS não é necessário
       porque o JS seta inline. */
    overflow-x: auto;      /* era hidden → agora rola horizontalmente */
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;  /* scroll suave em iOS */
}
```
Nota: como `.string` é `display:flex` com os `.fret` posicionados absolutamente dentro, a largura do
conteúdo é determinada pela largura inline do `#fretboard` (dims.width). O `.string` deve ter
`width: dims.width` também (ou `min-width`) para o flex não encolher. Alternativa mais simples:
dar `width` às `.string` igual ao `#fretboard` via inline no JS, OU usar `min-width` no CSS.

Decisão: no JS, setar `stringRow.style.width = dims.width + 'px'` em `buildStringRow`/no render, para
cada `.string` ter a largura total do braço (garante que os trastes absolutos tenham referência e o
scroll funcione).

#### b) Pestana (casa 0) sticky
```css
.fret:first-child {
    position: sticky;      /* era absolute; sticky mantém à esquerda no scroll */
    left: 0;
    z-index: 10;
    border-left: 8px solid #212121;
    background-color: #212121;
}
```
Atenção: hoje `.fret` é `position: absolute` com `left` inline. `position: sticky` não funciona bem
junto de `left` inline em px num contexto absoluto. Precisamos tratar a casa 0 de forma diferente das
demais. Abordagem:
- As casas 1..N permanecem `position: absolute` com `left` em px (como hoje, mas em px).
- A casa 0 fica `position: sticky; left: 0` — para isso, ela NÃO pode ser `absolute`. Então no JS,
  para `fretNumber === 0`, não aplicar `position:absolute` (deixar sticky via classe) e dar a ela
  `width: FRET_WIDTH`.

Como as `.fret` dividem a mesma `.string` (flex) e as 1..N são absolutas (fora do fluxo), a casa 0
sticky ocupa o início do fluxo. Para alinhar, as casas 1..N já têm `left` absoluto a partir de 0; a
casa 0 sticky sobrepõe o início. Isso funciona porque a casa 0 tem z-index 10 (fica por cima) e
largura fixa; o conteúdo rolável começa visualmente após ela.

> Trade-off: misturar sticky (casa 0) com absolute (casas 1..N) é delicado. Alternativa mais robusta
> considerada: layout em CSS grid/flex com todas as casas no fluxo. Porém isso exigiria refatorar
> todo o posicionamento (markers, note-cells) — fora do escopo mínimo. Mantemos a abordagem
> incremental e validamos visualmente; se o sticky conflitar, fallback: deixar a casa 0 também
> absolute `left:0` SEM sticky (perde o "fixo no scroll" mas mantém legibilidade — degradação
> aceitável). A spec marca o sticky como objetivo; o fallback preserva o Req 1 mesmo se o Req 2 for
> parcial.

#### c) Responsivo (`styles/style-responsive.css`)
```css
@media (max-width: 768px) {
  #fretboardContainer { padding: 10px; }
  /* note-cell um pouco maior para toque, sem sobrepor (casa=40px) */
  .note-cell-fret { width: 24px; height: 24px; font-size: 0.6rem; }
}
```

## Fluxos

- **Render / troca de instrumento:** `applyInstrumentProfile` → `calculateFretboardDimensions`
  (inalterado) → `fretboard.style.width = dims.width+'px'` → `buildStringRow` posiciona trastes em px
  e seta `.string` width = dims.width → destaque reaplicado (inalterado). O container com
  `overflow-x:auto` passa a rolar.
- **Scroll:** a pestana sticky permanece à esquerda; note-cells (presas aos trastes em px) rolam
  junto e mantêm o destaque — o destaque é por classe CSS na célula, independente de viewport, logo
  continua correto em todas as casas (Req 3).

## Modelos de Dados
Sem novas estruturas. Reuso de `FRET_WIDTH`, `STRING_HEIGHT`, `MAX_HEIGHT`,
`calculateFretboardDimensions`.

## Estratégia de Testes

### Testes de unidade/propriedade (vitest + jsdom), em `tests/cases/fretboard-mobile-responsive/`
- `fret-positioning.property.spec.js` (nova função pura testável):
  extrair uma função pura `computeFretGeometry(fretNumber, fretWidth)` → `{ leftPx, widthPx }` e
  validar: `leftPx === fretNumber*fretWidth`, `widthPx === fretWidth`, para fretNumber 0..36.
  **Property F1:** posição do traste é linear e largura é constante.
- `container-width.property.spec.js`: para strings 4..12 e frets 0..36, a largura aplicada ao
  container (via helper que replica o render) é `(frets+1)*FRET_WIDTH` e ≥ largura necessária para
  não sobrepor note-cells (`(frets+1)*FRET_WIDTH >= (frets+1)*22`).
  **Property F2:** largura total comporta todas as casas sem sobreposição.
- Regressão: `responsive-dimensions.property.spec.js` existente continua válido (função inalterada).

### Verificação manual (documentada, não automatizável)
- Layout real de scroll/sticky e legibilidade mobile exigem teste visual no navegador (jsdom não
  calcula layout). Será validado no preview e pelo dev.

### Correctness Properties
- **F1:** `computeFretGeometry(n, w) = { leftPx: n*w, widthPx: w }` para todo n≥0, w>0.
- **F2:** largura total `(frets+1)*FRET_WIDTH ≥ (frets+1)*NOTE_CELL_MIN` ⇒ sem sobreposição
  (com FRET_WIDTH=40 > NOTE_CELL=22, sempre verdadeiro).
- **F3 (regressão):** `calculateFretboardDimensions` inalterada.

## Decisões e Trade-offs
- **Px em vez de %**: a mudança central; resolve a sobreposição e habilita scroll real.
- **Refator mínimo**: não reescrevemos o posicionamento absoluto; só trocamos a unidade (%→px) e o
  overflow. Menor risco de regressão.
- **Sticky da casa 0 com fallback**: se o sticky conflitar com o posicionamento absoluto das demais
  casas, aceitamos degradar o Req 2 (pestana não-fixa) preservando o Req 1 (legibilidade+scroll),
  e tratamos o sticky numa iteração dedicada. Documentado para não travar a entrega principal.
- **Extrair `computeFretGeometry` pura**: habilita teste determinístico sem depender de layout real.
