# Implementation Plan: Chord Shape Selector

## Overview

Estende o ChordVisualizer IIFE com dois novos módulos internos — `ShapeSelectionManager` (lógica pura de persistência) e `ConfirmButtonRenderer` (criação/controle DOM do botão ✓) — e modifica a função `render()` existente para integrar persistência via localStorage e exibição condicional do botão de confirmação. Testes de propriedade validam lógica pura; testes unitários cobrem integração DOM.

## Tasks

- [ ] 1. Implementar ShapeSelectionManager
  - [ ] 1.1 Criar módulo ShapeSelectionManager dentro do IIFE
    - Adicionar o objeto `ShapeSelectionManager` em `scripts/script-chord-diagrams.js` logo antes de `createVoicingNavigator()`
    - Implementar `deriveScaleKey(tonica, tipoEscala)` — retorna `tonica + "_" + tipoEscala`
    - Implementar `buildStorageKey(chordName, scaleKey)` — retorna `"chordShape:" + chordName + ":" + scaleKey`
    - Implementar `getPersistedIndex(chordName, scaleKey, shapesCount)` — lê localStorage, valida, retorna 0 se inválido e remove entrada
    - Implementar `persist(chordName, scaleKey, index)` — escreve no localStorage com try/catch silencioso
    - Implementar `shouldShowConfirm(displayedIndex, persistedIndex)` — retorna `displayedIndex !== persistedIndex`
    - Implementar `loadForScale(tonica, tipoEscala)` — atualiza `currentScaleKey`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1_

  - [ ]* 1.2 Write property test: StorageKey Derivation
    - **Property 5: StorageKey Derivation**
    - Gerar strings arbitrárias para tonica/tipoEscala/chordName
    - Verificar que `deriveScaleKey` retorna formato `tonica + "_" + tipoEscala`
    - Verificar que `buildStorageKey` retorna formato `"chordShape:" + chordName + ":" + scaleKey`
    - Mínimo 100 iterações
    - Criar em `tests/cases/chord-shape-selector/storage-key-derivation.property.spec.js`
    - **Validates: Requirements 3.1, 3.6**

  - [ ]* 1.3 Write property test: Confirm Persists Correctly (Round-Trip)
    - **Property 4: Confirm Persists Correctly (Round-Trip)**
    - Gerar chordName, scaleKey e index válidos
    - Chamar `persist()` seguido de `getPersistedIndex()` com shapesCount > index
    - Verificar que o valor retornado é o mesmo index persistido
    - Mínimo 100 iterações
    - Criar em `tests/cases/chord-shape-selector/persist-round-trip.property.spec.js`
    - **Validates: Requirements 2.3, 3.1, 3.3**

  - [ ]* 1.4 Write property test: Out-of-Bounds Clamping
    - **Property 6: Out-of-Bounds Clamping**
    - Gerar shapesCount ≥ 1 e índices fora dos limites (≥ shapesCount, negativos, NaN)
    - Verificar que `getPersistedIndex()` retorna 0
    - Verificar que a entrada inválida é removida do localStorage
    - Mínimo 100 iterações
    - Criar em `tests/cases/chord-shape-selector/out-of-bounds-clamping.property.spec.js`
    - **Validates: Requirements 3.4**

  - [ ]* 1.5 Write property test: Per-Scale Independence
    - **Property 7: Per-Scale Independence**
    - Gerar chordName fixo com dois scaleKeys distintos e índices distintos
    - Persistir index X sob scaleKeyA e index Y sob scaleKeyB
    - Verificar que leitura por scaleKeyA retorna X e por scaleKeyB retorna Y
    - Mínimo 100 iterações
    - Criar em `tests/cases/chord-shape-selector/per-scale-independence.property.spec.js`
    - **Validates: Requirements 4.2**

- [ ] 2. Implementar ConfirmButtonRenderer e integrar na render()
  - [ ] 2.1 Criar módulo ConfirmButtonRenderer dentro do IIFE
    - Adicionar o objeto `ConfirmButtonRenderer` em `scripts/script-chord-diagrams.js` após `ShapeSelectionManager`
    - Implementar `createButton()` — cria `<button>` com classe `chord-confirm-btn`, aria-label, display:none, textContent ✓
    - Implementar `updateVisibility(btn, visible)` — alterna `display` entre `''` e `'none'`
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ] 2.2 Modificar render() para integrar persistência e ConfirmButton
    - Chamar `ShapeSelectionManager.loadForScale(tonica, tipoEscala)` no início do render
    - Para cada acorde com múltiplos shapes: ler `getPersistedIndex()` e inicializar VoicingNavigator nesse index
    - Renderizar o shape no `persistedIndex` em vez do index 0
    - Criar ConfirmButton via `ConfirmButtonRenderer.createButton()` e inserir após indicator
    - Atualizar handlers de ◀/▶ para chamar `ConfirmButtonRenderer.updateVisibility()` após navegação
    - Adicionar handler de click no ConfirmButton que chama `persist()`, atualiza `persistedIndex` local, e esconde botão
    - Garantir que acordes com 1 shape não renderizam nav/confirm
    - Passar `tonica` e `tipoEscala` da interface existente (variáveis de closure do IIFE) para a render
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 2.4, 2.5, 3.2, 3.3, 4.4, 6.1, 6.2, 6.3_

  - [ ]* 2.3 Write property test: ConfirmButton Visibility
    - **Property 3: ConfirmButton Visibility**
    - Gerar pares arbitrários de inteiros (displayedIndex, persistedIndex)
    - Verificar que `shouldShowConfirm` retorna `true` sse `displayedIndex !== persistedIndex`
    - Mínimo 100 iterações
    - Criar em `tests/cases/chord-shape-selector/confirm-button-visibility.property.spec.js`
    - **Validates: Requirements 2.1, 2.2, 2.5**

  - [ ]* 2.4 Write property test: Cyclic Navigation
    - **Property 1: Cyclic Navigation**
    - Gerar total T > 1 e currentIndex I (0 ≤ I < T)
    - Verificar que `next()` produz `(I + 1) % T`
    - Verificar que `prev()` produz `(I - 1 + T) % T`
    - Mínimo 100 iterações
    - Criar em `tests/cases/chord-shape-selector/cyclic-navigation.property.spec.js`
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4**

  - [ ]* 2.5 Write property test: Voicing Indicator Format
    - **Property 2: Voicing Indicator Format**
    - Gerar total T ≥ 1 e index I (0 ≤ I < T)
    - Verificar que `getIndicator()` retorna `"${I+1}/${T}"`
    - Mínimo 100 iterações
    - Criar em `tests/cases/chord-shape-selector/voicing-indicator-format.property.spec.js`
    - **Validates: Requirements 1.5**

- [ ] 3. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Estilização e acessibilidade
  - [ ] 4.1 Adicionar CSS do ConfirmButton
    - Adicionar regra `.chord-confirm-btn` em `styles/style.css` com estilo consistente com theme existente
    - Garantir `:focus` visível (outline ou box-shadow) para navegação por teclado
    - Garantir tamanho de alvo mínimo 44x44px para touch
    - Posicionar entre indicator e botão ▶ dentro de `.chord-voicing-nav`
    - _Requirements: 5.2, 5.5_

- [ ] 5. Integração com scale-changed event
  - [ ] 5.1 Garantir fluxo correto no evento scale-changed
    - Verificar que o listener de `scale-changed` passa `tonica` e `tipoEscala` para `render()`
    - Garantir que ao trocar de escala, ConfirmButtons são escondidos pois displayed === persisted após restauração
    - Garantir que acordes sem persistência para a nova escala começam em index 0
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ]* 5.2 Write unit tests: integração DOM e edge cases
    - Testar que acorde com 1 shape não renderiza nav, indicator ou ConfirmButton (Property 8)
    - Testar que localStorage indisponível não causa crash (fallback a index 0)
    - Testar que scale-changed com detail inválido não causa crash
    - Testar estrutura DOM: ConfirmButton tem aria-label, classe, e posição correta
    - Criar em `tests/cases/chord-shape-selector/dom-integration.unit.spec.js`
    - **Property 8: Single-Shape Chords Have No Controls**
    - **Validates: Requirements 5.1, 5.3, 5.4, 6.1, 6.2**

- [ ] 6. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties (design Correctness Properties 1–8)
- Unit tests validate DOM integration and edge cases
- `ShapeSelectionManager` é lógica pura — testável sem DOM, exportável via `window.__test__` pattern existente
- `createVoicingNavigator` já existe — property tests 1 e 2 validam comportamento existente como regressão

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "1.4", "1.5", "2.2"] },
    { "id": 2, "tasks": ["2.3", "2.4", "2.5", "4.1"] },
    { "id": 3, "tasks": ["5.1"] },
    { "id": 4, "tasks": ["5.2"] }
  ]
}
```
