# Design Document

## Overview

Estende o ChordVisualizer IIFE existente em `script-chord-diagrams.js` com funcionalidade de seleção e persistência de chord shapes. A feature adiciona um botão de confirmação (✓) por acorde que aparece quando o shape exibido difere do persistido, e gerencia a persistência via localStorage com chaves compostas por escala.

A arquitetura segue o padrão IIFE existente, sem build step, com Vanilla JS. Novos componentes são adicionados como sub-módulos internos ao IIFE.

## Architecture

### Componentes Internos (dentro do IIFE)

```
┌─────────────────────────────────────────────────────────┐
│  ChordVisualizer IIFE                                   │
│                                                         │
│  ┌─────────────────┐   ┌──────────────────────────┐    │
│  │ VoicingNavigator│──▶│ ShapeSelectionManager     │    │
│  │ (existente)     │   │ (novo)                    │    │
│  └─────────────────┘   │  - persistedIndices{}     │    │
│                         │  - currentScaleKey        │    │
│  ┌─────────────────┐   │  - getPersistedIndex()    │    │
│  │ LocalChordDB    │   │  - persist()              │    │
│  │ (existente)     │   │  - buildStorageKey()      │    │
│  └─────────────────┘   │  - deriveScaleKey()       │    │
│                         │  - shouldShowConfirm()    │    │
│  ┌─────────────────┐   │  - loadForScale()         │    │
│  │ SVGRenderer     │   └──────────────────────────┘    │
│  │ (existente)     │                                    │
│  └─────────────────┘   ┌──────────────────────────┐    │
│                         │ ConfirmButtonRenderer     │    │
│  ┌─────────────────┐   │ (novo)                    │    │
│  │ render()        │──▶│  - createButton()         │    │
│  │ (modificado)    │   │  - updateVisibility()     │    │
│  └─────────────────┘   └──────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────┐
│  localStorage API   │
│  (browser)          │
└─────────────────────┘
```

### Fluxo de Dados

1. **scale-changed event** → `render()` → `ShapeSelectionManager.loadForScale(scaleKey)` → lê localStorage para cada acorde
2. **Navegação (◀/▶)** → `VoicingNavigator.next()/prev()` → re-render SVG → `ShapeSelectionManager.shouldShowConfirm()` → atualiza visibilidade do botão ✓
3. **Confirm (✓ click)** → `ShapeSelectionManager.persist(chordName, index)` → escreve localStorage → esconde botão

## Components and Interfaces

### ShapeSelectionManager

Módulo interno responsável por gerenciar o estado de persistência dos shapes selecionados.

```javascript
/**
 * ShapeSelectionManager — manages persistence of selected chord shape indices.
 * Pure logic module (no DOM manipulation).
 */
var ShapeSelectionManager = {
  /** @type {string} Current scale key for localStorage lookups */
  currentScaleKey: '',

  /**
   * Derives a ScaleKey from tonica and tipoEscala.
   * Format: "{tonica}_{tipoEscala}"
   *
   * @param {string} tonica - Root note (e.g. "C", "F#")
   * @param {string} tipoEscala - Scale type (e.g. "maior", "menor_natural")
   * @returns {string} ScaleKey (e.g. "C_maior", "F#_menor_natural")
   */
  deriveScaleKey: function (tonica, tipoEscala) {
    return tonica + '_' + tipoEscala;
  },

  /**
   * Builds the full localStorage key for a chord shape.
   * Format: "chordShape:{chordName}:{scaleKey}"
   *
   * @param {string} chordName - Full chord name (e.g. "Am7")
   * @param {string} scaleKey - ScaleKey from deriveScaleKey()
   * @returns {string} Full storage key
   */
  buildStorageKey: function (chordName, scaleKey) {
    return 'chordShape:' + chordName + ':' + scaleKey;
  },

  /**
   * Reads the persisted ShapeIndex for a chord from localStorage.
   * Returns 0 if not found, invalid, or out of bounds.
   * Removes invalid entries from localStorage.
   *
   * @param {string} chordName - Full chord name
   * @param {string} scaleKey - Current ScaleKey
   * @param {number} shapesCount - Total available shapes for this chord
   * @returns {number} The persisted ShapeIndex (0-indexed), or 0 as default
   */
  getPersistedIndex: function (chordName, scaleKey, shapesCount) {
    try {
      var key = this.buildStorageKey(chordName, scaleKey);
      var stored = localStorage.getItem(key);
      if (stored === null) return 0;
      var index = parseInt(stored, 10);
      if (isNaN(index) || index < 0 || index >= shapesCount) {
        localStorage.removeItem(key);
        return 0;
      }
      return index;
    } catch (e) {
      return 0;
    }
  },

  /**
   * Persists the given ShapeIndex to localStorage.
   *
   * @param {string} chordName - Full chord name
   * @param {string} scaleKey - Current ScaleKey
   * @param {number} index - ShapeIndex to persist
   */
  persist: function (chordName, scaleKey, index) {
    try {
      var key = this.buildStorageKey(chordName, scaleKey);
      localStorage.setItem(key, String(index));
    } catch (e) {
      // localStorage unavailable — fail silently
    }
  },

  /**
   * Determines whether the ConfirmButton should be visible.
   *
   * @param {number} displayedIndex - Currently displayed ShapeIndex
   * @param {number} persistedIndex - Last persisted ShapeIndex
   * @returns {boolean} True if button should be visible
   */
  shouldShowConfirm: function (displayedIndex, persistedIndex) {
    return displayedIndex !== persistedIndex;
  },

  /**
   * Loads persisted indices for a new scale.
   * Updates currentScaleKey.
   *
   * @param {string} tonica - Root note
   * @param {string} tipoEscala - Scale type
   */
  loadForScale: function (tonica, tipoEscala) {
    this.currentScaleKey = this.deriveScaleKey(tonica, tipoEscala);
  }
};
```

### ConfirmButtonRenderer

Módulo interno para criação e controle de visibilidade do botão ✓.

```javascript
/**
 * ConfirmButtonRenderer — creates and manages ConfirmButton DOM elements.
 */
var ConfirmButtonRenderer = {
  /**
   * Creates the ConfirmButton element.
   *
   * @returns {HTMLButtonElement} The confirm button element
   */
  createButton: function () {
    var btn = document.createElement('button');
    btn.className = 'chord-confirm-btn';
    btn.textContent = '\u2713'; // ✓
    btn.setAttribute('aria-label', 'Confirmar shape selecionado');
    btn.style.display = 'none'; // hidden by default
    return btn;
  },

  /**
   * Updates visibility of the ConfirmButton.
   * Uses display:none to hide, never removes from DOM.
   *
   * @param {HTMLButtonElement} btn - The button element
   * @param {boolean} visible - Whether button should be shown
   */
  updateVisibility: function (btn, visible) {
    btn.style.display = visible ? '' : 'none';
  }
};
```

### Modified `render()` Function

A função `render()` existente é modificada para:
1. Chamar `ShapeSelectionManager.loadForScale()` no início
2. Ler o `persistedIndex` para cada acorde via `getPersistedIndex()`
3. Inicializar o `VoicingNavigator` no `persistedIndex` em vez de 0
4. Criar o `ConfirmButton` após o indicator (para acordes com múltiplos shapes)
5. Atualizar visibilidade do botão após cada navegação

### Event Handlers (dentro da closure de navegação)

```javascript
// Dentro da closure para cada chord card:
prevBtn.addEventListener('click', function (e) {
  e.stopPropagation();
  navState.prev();
  // Re-render SVG
  svgWrapperEl.innerHTML = '';
  var newSvg = SVGRenderer.renderDiagram(allShapes[navState.currentIndex], opts);
  svgWrapperEl.appendChild(newSvg);
  indicatorEl.textContent = navState.getIndicator();
  // Update confirm button visibility
  ConfirmButtonRenderer.updateVisibility(
    confirmBtn,
    ShapeSelectionManager.shouldShowConfirm(navState.currentIndex, persistedIndex)
  );
});

confirmBtn.addEventListener('click', function (e) {
  e.stopPropagation();
  ShapeSelectionManager.persist(chordName, scaleKey, navState.currentIndex);
  persistedIndex = navState.currentIndex;
  ConfirmButtonRenderer.updateVisibility(confirmBtn, false);
});
```

### DOM Structure (por chord card com múltiplos shapes)

```html
<div class="chord-card">
  <div class="chord-card-label">
    <span class="chord-degree">vi</span>
    <span class="chord-name">Am7</span>
  </div>
  <div class="chord-svg-wrapper">
    <!-- SVG diagram -->
  </div>
  <div class="chord-voicing-nav">
    <button class="chord-nav-btn" aria-label="Voicing anterior">◀</button>
    <span class="chord-voicing-indicator">1/3</span>
    <button class="chord-confirm-btn" aria-label="Confirmar shape selecionado" style="display:none">✓</button>
    <button class="chord-nav-btn" aria-label="Próximo voicing">▶</button>
  </div>
</div>
```

## Data Models

### StorageKey Format

```
chordShape:{chordName}:{scaleKey}
```

Exemplos:
- `chordShape:Am7:C_maior`
- `chordShape:Dm7:A_menor_natural`
- `chordShape:F#m7b5:G_maior`

### localStorage Value

Valor armazenado é um inteiro como string (`"0"`, `"1"`, `"2"`, etc.) representando o ShapeIndex 0-indexed.

### Per-Card State (closure variables)

```javascript
{
  navState: VoicingNavigator,  // currentIndex, total, next(), prev()
  persistedIndex: number,       // last confirmed index (from localStorage or 0)
  confirmBtn: HTMLButtonElement, // reference to the ✓ button
  chordName: string,            // full chord name for StorageKey
  scaleKey: string              // current ScaleKey
}
```

## Error Handling

| Cenário | Comportamento |
|---------|---------------|
| localStorage indisponível (Private Browsing, quota excedida) | `getPersistedIndex()` retorna 0, `persist()` falha silenciosamente. Navegação funciona normalmente sem persistência. |
| ShapeIndex persistido excede shapes disponíveis | `getPersistedIndex()` retorna 0, remove entrada inválida do localStorage. |
| localStorage contém valor não-numérico | `parseInt` retorna NaN → tratado como inválido → retorna 0, remove entrada. |
| Acorde com 0 shapes (indisponível na DB) | Card mostra "Acorde indisponível", sem nav/confirm. |
| Acorde com 1 shape | Card renderizado sem nav arrows, indicator ou ConfirmButton. Nenhuma escrita em localStorage. |
| scale-changed event sem detail válido | `render()` já valida detail — retorna early sem crash. |

## Testing Strategy

### Unit Tests (vitest)

- Verificar estrutura DOM do ConfirmButton (aria-label, classe, posição)
- Verificar que acordes com 1 shape não renderizam controles de navegação
- Verificar comportamento quando localStorage é indisponível
- Verificar que scale-changed event com detail inválido não causa crash

### Property Tests (vitest + fast-check)

- Navegação cíclica do VoicingNavigator (next/prev wrap)
- Formato do indicator string
- Visibilidade do ConfirmButton baseada em displayed vs persisted index
- Round-trip de persistência (persist → getPersistedIndex)
- Formato de StorageKey e ScaleKey
- Clamping de índices fora dos limites
- Independência de persistência por escala
- Mínimo 100 iterações por property test

### Configuração de Teste

- Framework: vitest com environment jsdom
- PBT: fast-check (já instalado)
- Padrão de teste: `tests/cases/chord-shape-selector/*.property.spec.js`
- Módulos testáveis: `ShapeSelectionManager` e `VoicingNavigator` são funções puras, exportáveis para teste sem DOM real

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Cyclic Navigation

*For any* VoicingNavigator with total shapes T > 1 and any current index I (0 ≤ I < T), calling `next()` SHALL produce index (I + 1) % T, and calling `prev()` SHALL produce index (I - 1 + T) % T.

**Validates: Requirements 1.1, 1.2, 1.3, 1.4**

### Property 2: Voicing Indicator Format

*For any* VoicingNavigator with total T and current index I, `getIndicator()` SHALL return the string `"${I+1}/${T}"`.

**Validates: Requirements 1.5**

### Property 3: ConfirmButton Visibility

*For any* pair of integers (displayedIndex, persistedIndex), `shouldShowConfirm(displayedIndex, persistedIndex)` SHALL return `true` if and only if `displayedIndex !== persistedIndex`.

**Validates: Requirements 2.1, 2.2, 2.5**

### Property 4: Confirm Persists Correctly (Round-Trip)

*For any* valid chordName, scaleKey, and shapeIndex, after calling `persist(chordName, scaleKey, index)`, a subsequent call to `getPersistedIndex(chordName, scaleKey, shapesCount)` with shapesCount > index SHALL return that same index.

**Validates: Requirements 2.3, 3.1, 3.3**

### Property 5: StorageKey Derivation

*For any* tonica string and tipoEscala string, `deriveScaleKey(tonica, tipoEscala)` SHALL return `tonica + "_" + tipoEscala`, and `buildStorageKey(chordName, scaleKey)` SHALL return `"chordShape:" + chordName + ":" + scaleKey`.

**Validates: Requirements 3.1, 3.6**

### Property 6: Out-of-Bounds Clamping

*For any* persisted ShapeIndex value that is ≥ shapesCount (or negative, or NaN), `getPersistedIndex()` SHALL return 0 and remove the invalid entry from localStorage.

**Validates: Requirements 3.4**

### Property 7: Per-Scale Independence

*For any* chord that exists in two different scales (scaleKeyA ≠ scaleKeyB), persisting index X under scaleKeyA and index Y under scaleKeyB, then reading back using scaleKeyA SHALL return X and reading back using scaleKeyB SHALL return Y.

**Validates: Requirements 4.2**

### Property 8: Single-Shape Chords Have No Controls

*For any* chord with exactly 1 available shape, the rendered card SHALL not contain navigation buttons, voicing indicator, or ConfirmButton elements.

**Validates: Requirements 6.1, 6.2**
