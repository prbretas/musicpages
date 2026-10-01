# Requirements: Fretboard Mobile Responsive

## Introdução

O Braço do Instrumento (fretboard) funciona bem no desktop, mas no mobile fica ilegível: todas as
casas (até 25 incluindo a pestana) são espremidas na largura da tela, fazendo as note-cells (22px)
se sobreporem umas às outras. Esta feature torna o fretboard **legível e tocável em telas pequenas**,
exibindo as casas em tamanho fixo com **scroll horizontal**, mantendo a **pestana (casa 0) fixa** à
esquerda e o **destaque de escala/shapes contínuo** ao longo de todo o braço durante o scroll.

Consolida a **Ideia C** do `melhorias.md`.

### Causa raiz atual (contexto)
- `calculateFretboardDimensions` calcula `width = (frets+1)*40` corretamente, mas o render força
  `fretboard.style.width = '100%'` (ignora a largura) e as `.fret` usam largura em `%`
  (`100/(numFrets+1)`), espremendo tudo.
- `#fretboard { overflow: hidden }` impede qualquer scroll.
- `.note-cell-fret` tem 22px fixos → sobreposição quando o traste fica menor que isso.

## Glossário
- **Pestana / fret-zero / nut**: a casa 0 (notas soltas), primeira coluna à esquerda.
- **Viewport do fretboard**: a área visível do `#fretboard` (com scroll horizontal).
- **note-cell**: a bolinha com a nota em cada casa/corda (`.note-cell-fret`).

## Requisitos

### Requisito 1 — Casas em tamanho legível com scroll horizontal
**User Story:** Como usuário mobile, quero ver as casas em tamanho legível e rolar lateralmente para
alcançar as demais, em vez de ver tudo espremido.

#### Acceptance Criteria
1. Cada casa DEVE ter uma largura mínima fixa em px (não percentual) suficiente para a note-cell não
   sobrepor as vizinhas (largura de casa ≥ largura da note-cell + folga).
2. QUANDO a soma das larguras das casas excede a largura visível ENTÃO o `#fretboard` DEVE permitir
   **scroll horizontal** (`overflow-x: auto`).
3. EM telas pequenas, aproximadamente as **12 primeiras casas** DEVEM caber de forma legível na
   viewport inicial (o restante é alcançável via scroll). ("Aproximadamente" porque depende da
   largura exata da tela; o critério objetivo é: largura de casa fixa + scroll, não espremer tudo.)
4. As note-cells NÃO DEVEM se sobrepor em nenhuma largura de tela.

### Requisito 2 — Pestana (casa 0) fixa durante o scroll
**User Story:** Como usuário, quero que a casa 0 (notas soltas) permaneça visível enquanto rolo o
braço, para sempre saber a corda/afinação.

#### Acceptance Criteria
1. QUANDO o usuário rola o fretboard horizontalmente ENTÃO a coluna da casa 0 (`.fret:first-child`)
   DEVE permanecer fixa (sticky) na borda esquerda.
2. A pestana fixa DEVE ficar acima (z-index) das demais casas durante o scroll, sem sobrepor o
   conteúdo de forma a escondê-lo incorretamente.

### Requisito 3 — Destaque contínuo ao longo do braço
**User Story:** Como usuário, quero que o destaque de escala e o hover de shapes continuem corretos
em todas as casas conforme eu rolo, sem cortar.

#### Acceptance Criteria
1. O destaque de escala (`.in-scale`, `.tonic`), os shapes CAGED (`.shape-N`) e o destaque de acorde
   (`.in-chord`, `.chord-root`) DEVEM aparecer corretamente em TODAS as casas, inclusive as fora da
   viewport inicial, permanecendo visíveis ao rolar.
2. O comportamento de hover dos shapes DEVE continuar funcionando nas casas acessadas via scroll.
3. A troca de escala/instrumento DEVE reposicionar/recalcular o destaque corretamente no novo
   layout com scroll.

### Requisito 4 — Alvos de toque adequados
**User Story:** Como usuário mobile, quero tocar as notas sem errar o alvo.

#### Acceptance Criteria
1. As note-cells DEVEM manter um tamanho mínimo adequado ao toque (mínimo atual 22px; idealmente ≥
   24px na área interativa), sem sobreposição.
2. O scroll horizontal NÃO DEVE disparar reprodução acidental de nota ao arrastar (o toque para
   tocar nota é distinto do gesto de scroll).

### Requisito 5 — Sem regressão no desktop
**User Story:** Como usuário desktop, quero que o fretboard continue bom como está hoje.

#### Acceptance Criteria
1. EM telas largas, o fretboard DEVE exibir as casas em tamanho fixo; se couber inteiro, sem scroll;
   se não couber (muitas casas), com scroll horizontal — nunca espremido.
2. A pestana fixa e o destaque contínuo DEVEM valer igualmente no desktop.
3. A altura dinâmica por número de cordas (`min(strings*50, 600)`) DEVE ser preservada.

### Requisito 6 — Preservar lógica e testes existentes
**User Story:** Como mantenedor, quero que a mudança não quebre a lógica atual nem os testes.

#### Acceptance Criteria
1. `calculateFretboardDimensions` DEVE continuar retornando `width = (frets+1)*40` e
   `height = min(strings*50, 600)` (o teste `responsive-dimensions.property.spec.js` deve seguir
   passando).
2. Os cálculos de MIDI, nomes de nota, ordem das cordas e espessura NÃO DEVEM mudar.
3. A reaplicação de destaque após rebuild (troca de instrumento/afinação) DEVE continuar funcionando.
4. A suíte completa DEVE continuar passando (180 testes) após a mudança.
