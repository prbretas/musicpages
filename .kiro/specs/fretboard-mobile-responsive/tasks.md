# Implementation Plan: Fretboard Mobile Responsive

## Overview

Trocar o layout do fretboard de "espremer em 100%" para largura fixa em px por casa + scroll
horizontal, com pestana (casa 0) sticky e destaque contínuo. Mudança cirúrgica em
`scripts/script-fretboard.js` (aplicar `dims.width` em px; trastes em px via `FRET_WIDTH`; `.string`
com largura total) e CSS (`overflow-x:auto`, casa 0 sticky, note-cell de toque no mobile). Extrair
`computeFretGeometry` pura para testes determinísticos. `calculateFretboardDimensions` inalterada.

## Tasks

- [x] 1. Geometria dos trastes em px (função pura + aplicação)
  - [x] 1.1 Extrair `computeFretGeometry(fretNumber, fretWidth)` em `script-fretboard.js`
    - Função pura retornando `{ leftPx: fretNumber * fretWidth, widthPx: fretWidth }`
    - Expor em `window` e no `module.exports` para testabilidade
    - _Requirements: 1.1, 6.2_

  - [ ] 1.2 Usar px no `buildStringRow` (substituir o cálculo percentual)
    - Trocar `fretWidthPercent`/`%` por `computeFretGeometry(fretNumber, FRET_WIDTH)` → `left`/`width` em px
    - Setar `stringRow.style.width = (numFrets + 1) * FRET_WIDTH + 'px'` para a corda ter a largura total do braço
    - _Requirements: 1.1, 1.4_

  - [ ] 1.3 Aplicar a largura calculada ao container no render
    - Em `applyInstrumentProfile`: trocar `fretboard.style.width = '100%'` por `fretboard.style.width = dims.width + 'px'`
    - Manter `fretboard.style.height = dims.height + 'px'`
    - _Requirements: 1.2, 5.1, 5.3, 6.1_

  - [ ]* 1.4 Write property test: `tests/cases/fretboard-mobile-responsive/fret-positioning.property.spec.js`
    - **F1:** para fretNumber 0..36 e fretWidth>0, `computeFretGeometry` dá `{leftPx: n*w, widthPx: w}`
    - _Requirements: 1.1_

  - [ ]* 1.5 Write property test: `tests/cases/fretboard-mobile-responsive/container-width.property.spec.js`
    - **F2:** para strings 4..12, frets 0..36, `(frets+1)*FRET_WIDTH >= (frets+1)*22` (sem sobreposição)
    - valida também que `calculateFretboardDimensions().width === (frets+1)*FRET_WIDTH` (regressão F3)
    - _Requirements: 1.4, 6.1_

- [ ] 2. CSS: scroll horizontal + pestana sticky + toque mobile
  - [ ] 2.1 Atualizar `styles/style-fretboard.css`
    - `#fretboard`: trocar `overflow: hidden` por `overflow-x: auto; overflow-y: hidden;` + `-webkit-overflow-scrolling: touch`
    - `.fret:first-child` (casa 0): `position: sticky; left: 0; z-index: 10;` mantendo nut/background
    - Garantir que casas 1..N continuam `position: absolute` com `left` px (do JS)
    - _Requirements: 1.2, 2.1, 2.2_

  - [ ] 2.2 Ajustes responsivos em `styles/style-responsive.css` (<768px)
    - `.note-cell-fret { width: 24px; height: 24px; font-size: 0.6rem; }` (toque, sem sobrepor casa de 40px)
    - `#fretboardContainer { padding: 10px; }`
    - _Requirements: 4.1_

  - [ ] 2.3 Tratamento da casa 0 no JS para compatibilizar com sticky
    - Para `fretNumber === 0`: não usar `position:absolute` inline; aplicar classe para sticky e `width` px
    - Fallback documentado: se sticky conflitar, casa 0 fica `absolute left:0` (legibilidade preservada)
    - _Requirements: 2.1, 2.2_

- [ ] 3. Checkpoint — Verificar lógica e layout
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Destaque contínuo e não-regressão
  - [ ] 4.1 Verificar destaque/overlay após a mudança
    - Confirmar que `highlightFretboardNotes`, shapes CAGED e `in-chord` aplicam classes em todas as casas (independe de viewport)
    - Confirmar reaplicação de destaque após rebuild (troca de instrumento/afinação)
    - _Requirements: 3.1, 3.2, 3.3, 6.3_

  - [ ]* 4.2 Rodar a suíte completa e garantir 180+ testes verdes
    - Em especial `responsive-dimensions.property.spec.js` (inalterado) e os novos
    - _Requirements: 6.4_

- [ ] 5. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.
  - Verificação manual de scroll/sticky/legibilidade no preview (jsdom não cobre layout).

## Notes
- Tasks com `*` são testes (opcionais p/ MVP, recomendadas).
- `calculateFretboardDimensions` NÃO muda — regressão coberta pelo teste existente.
- Layout real (scroll, sticky) exige verificação visual no navegador.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "2.1"] },
    { "id": 2, "tasks": ["1.4", "1.5", "2.2", "2.3"] },
    { "id": 3, "tasks": ["4.1", "4.2"] }
  ]
}
```
