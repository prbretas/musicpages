# Implementation Plan: Chord Shape Selector

## Overview

Estende o ChordVisualizer IIFE com dois novos módulos internos — `ShapeSelectionManager` (lógica pura de persistência) e `ConfirmButtonRenderer` (criação/controle DOM do botão ✓) — e modifica a função `render()` existente para integrar persistência via localStorage e exibição condicional do botão de confirmação. Testes de propriedade validam lógica pura; testes unitários cobrem integração DOM.

## Tasks

- [x] 1. Implementar ShapeSelectionManager
  - [x] 1.1 Criar módulo ShapeSelectionManager dentro do IIFE
    - Adicionar o objeto `ShapeSelectionManager` em `scripts/script-chord-diagrams.js` logo antes do Internal State
    - Implementar `deriveScaleKey(tonica, tipoEscala)` — retorna `tonica + "_" + tipoEscala`
    - Implementar `buildStorageKey(chordName, scaleKey)` — retorna `"chordShape:" + chordName + ":" + scaleKey`
    - Implementar `getPersistedIndex(chordName, scaleKey, shapesCount)` — lê localStorage, valida, retorna 0 se inválido e remove entrada
    - Implementar `persist(chordName, scaleKey, index)` — escreve no localStorage com try/catch silencioso
    - Implementar `shouldShowConfirm(displayedIndex, persistedIndex)` — retorna `displayedIndex !== persistedIndex`
    - Implementar `loadForScale(tonica, tipoEscala)` — atualiza `currentScaleKey`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1_

  - [x] 1.2 Write property test: StorageKey Derivation
    - **Property 5: StorageKey Derivation**
    - Gerar strings arbitrárias para tonica/tipoEscala/chordName
    - Verificar que `deriveScaleKey` retorna formato `tonica + "_" + tipoEscala`
    - Verificar que `buildStorageKey` retorna formato `"chordShape:" + chordName + ":" + scaleKey`
    - Criar em `tests/cases/chord-shape-selector/storage-key-derivation.property.spec.js`
    - **Validates: Requirements 3.1, 3.6**

  - [x] 1.3 Write property test: Confirm Persists Correctly (Round-Trip)
    - **Property 4: Confirm Persists Correctly (Round-Trip)**
    - Gerar chordName, scaleKey e index válidos
    - Chamar `persist()` seguido de `getPersistedIndex()` com shapesCount > index
    - Verificar que o valor retornado é o mesmo index persistido
    - Criar em `tests/cases/chord-shape-selector/persist-round-trip.property.spec.js`
    - **Validates: Requirements 2.3, 3.1, 3.3**

  - [x] 1.4 Write property test: Out-of-Bounds Clamping
    - **Property 6: Out-of-Bounds Clamping**
    - Gerar shapesCount ≥ 1 e índices fora dos limites (≥ shapesCount, negativos, NaN)
    - Verificar que `getPersistedIndex()` retorna 0
    - Verificar que a entrada inválida é removida do localStorage
    - Criar em `tests/cases/chord-shape-selector/out-of-bounds-clamping.property.spec.js`
    - **Validates: Requirements 3.4**

  - [x] 1.5 Write property test: Per-Scale Independence
    - **Property 7: Per-Scale Independence**
    - Gerar chordName fixo com dois scaleKeys distintos e índices distintos
    - Persistir index X sob scaleKeyA e index Y sob scaleKeyB
    - Verificar que leitura por scaleKeyA retorna X e por scaleKeyB retorna Y
    - Criar em `tests/cases/chord-shape-selector/per-scale-independence.property.spec.js`
    - **Validates: Requirements 4.2**

- [x] 2. Implementar ConfirmButtonRenderer e integrar na render()
  - [x] 2.1 Criar módulo ConfirmButtonRenderer dentro do IIFE
    - Adicionar o objeto `ConfirmButtonRenderer` em `scripts/script-chord-diagrams.js` após `ShapeSelectionManager`
    - Implementar `createButton()` — cria `<button>` com classe `chord-confirm-btn`, aria-label, display:none, textContent ✓
    - Implementar `updateVisibility(btn, visible)` — alterna `display` entre `''` e `'none'`
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 2.2 Modificar render() para integrar persistência e ConfirmButton
    - Chamar `ShapeSelectionManager.loadForScale(tonica, tipoEscala)` no handler scale-changed (antes de render)
    - Para cada acorde com múltiplos shapes: ler `getPersistedIndex()` e inicializar VoicingNavigator nesse index
    - Renderizar o shape no `persistedIndex` em vez do index 0
    - Criar ConfirmButton via `ConfirmButtonRenderer.createButton()` e inserir após indicator
    - Atualizar handlers de ◀/▶ para chamar `ConfirmButtonRenderer.updateVisibility()` após navegação
    - Adicionar handler de click no ConfirmButton que chama `persist()`, atualiza `persistedIndex` local, e esconde botão
    - Garantir que acordes com 1 shape não renderizam nav/confirm
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 2.4, 2.5, 3.2, 3.3, 4.4, 6.1, 6.2, 6.3_

  - [x] 2.3 Write property test: ConfirmButton Visibility
    - **Property 3: ConfirmButton Visibility**
    - Gerar pares arbitrários de inteiros (displayedIndex, persistedIndex)
    - Verificar que `shouldShowConfirm` retorna `true` sse `displayedIndex !== persistedIndex`
    - Criar em `tests/cases/chord-shape-selector/confirm-button-visibility.property.spec.js`
    - **Validates: Requirements 2.1, 2.2, 2.5**

  - [x] 2.4 Write property test: Cyclic Navigation
    - **Property 1: Cyclic Navigation**
    - Gerar total T > 1 e currentIndex I (0 ≤ I < T)
    - Verificar que `next()` produz `(I + 1) % T`
    - Verificar que `prev()` produz `(I - 1 + T) % T`
    - Criar em `tests/cases/chord-shape-selector/cyclic-navigation.property.spec.js`
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4**

  - [x] 2.5 Write property test: Voicing Indicator Format
    - **Property 2: Voicing Indicator Format**
    - Gerar total T ≥ 1 e index I (0 ≤ I < T)
    - Verificar que `getIndicator()` retorna `"${I+1}/${T}"`
    - Criar em `tests/cases/chord-shape-selector/voicing-indicator-format.property.spec.js`
    - **Validates: Requirements 1.5**

- [x] 3. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Estilização e acessibilidade
  - [x] 4.1 Adicionar CSS do ConfirmButton
    - Adicionar regra `.chord-confirm-btn` em `styles/style.css` (light + dark mode)
    - Garantir `:focus` visível (outline verde)
    - Tamanho mínimo 22×22px
    - _Requirements: 5.2, 5.5_

- [x] 5. Integração com scale-changed event
  - [x] 5.1 Garantir fluxo correto no evento scale-changed
    - `_lastTonica` e `_lastTipoEscala` salvos no handler de `scale-changed`
    - `ShapeSelectionManager.loadForScale()` chamado antes de render
    - Acordes sem persistência para nova escala iniciam em index 0
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 6. Final checkpoint
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
