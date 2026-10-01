# Implementation Plan: Sidebar Navigation + Seletores no Topo

## Overview

Redesenho da navegação: topbar fixa (botão de menu + seletores de tônica/escala + toggle de tema) e
sidebar off-canvas acionável, substituindo o menu horizontal atual. Reaproveita `HeaderNav.scrollToSection`,
o wiring de `data-popup` do FloatingPopup, `calcularEscala()`/`scale-changed`, e o focus trap do
FloatingPopup. Vanilla JS (IIFE), sem build step. Testes com vitest + jsdom.

## Tasks

- [ ] 1. Estrutura HTML da topbar e sidebar
  - [ ] 1.1 Substituir `#headerNav`/`#navLinks` por `<header class="topbar">` + `<nav id="appSidebar">` + `#sidebarOverlay` em `index.html`
    - Topbar: botão `#sidebarToggle` (aria-expanded, aria-controls="appSidebar"), container `.topbar-selectors` com `#topbarTonica`/`#topbarEscala` (vazios, preenchidos via JS) e labels `.sr-only`, e o `#themeToggle` existente movido para cá
    - Sidebar: `<nav id="appSidebar" aria-label>` com botão `.sidebar-close` e `<ul>` contendo todos os itens de navegação atuais (mesmos `href` e `data-popup`)
    - Overlay: `<div id="sidebarOverlay" class="sidebar-overlay" hidden>`
    - _Requirements: 1.1, 2.1, 2.4, 3.1, 3.2, 4.1, 5.1_

- [ ] 2. Módulo SidebarNav (ciclo de vida)
  - [ ] 2.1 Criar `scripts/script-sidebar.js` com IIFE `SidebarNav`
    - `init()` cacheia refs e registra listeners; estado inicial fechado
    - `open()`/`close()`/`toggle()` alternam `body.sidebar-open`, visibilidade do overlay e `aria-expanded`
    - `open()` ativa focus trap (reusar `window._FloatingPopupInternals.createFocusTrap`), move foco ao primeiro focável; `close()` desativa e devolve foco ao `#sidebarToggle`
    - Fechar em: clique no overlay, `Escape` (document keydown se aberto), clique na `.sidebar-close`, clique em qualquer item da sidebar
    - Fallback defensivo se FloatingPopup indisponível (trap mínimo local)
    - Expor `window.SidebarNav` e `module.exports` condicional
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 3.3, 3.4, 3.5_

  - [ ] 2.2 Incluir `<script src="scripts/script-sidebar.js" defer></script>` em `index.html` (após script-floating-popup.js)
    - _Requirements: 1.1_

  - [ ]* 2.3 Write unit tests: `tests/cases/sidebar-navigation/sidebar-lifecycle.unit.spec.js`
    - open/close/toggle alteram `body.sidebar-open` e `aria-expanded` (Property P3)
    - overlay click e Escape fecham
    - foco retorna ao `#sidebarToggle` no close
    - _Requirements: 1.2, 1.3, 1.5, 1.6, 3.5_

- [ ] 3. Integração dos itens de navegação
  - [ ] 3.1 Ligar cliques dos itens da sidebar
    - Âncoras `href="#..."`: chamar `HeaderNav.scrollToSection(id)` e fechar sidebar
    - Itens `data-popup`: NÃO rolar (deixar o listener existente do FloatingPopup abrir o popup) e fechar sidebar
    - Ajustar `HeaderNav` para não depender mais de `.hamburger-btn`/`.nav-open` (layout antigo removido), mantendo `scrollToSection` intacto
    - _Requirements: 2.2, 2.3, 2.4, 1.7_

  - [ ]* 3.2 Write unit tests: `tests/cases/sidebar-navigation/nav-items.unit.spec.js`
    - item âncora chama scrollToSection (mock) e fecha sidebar
    - item data-popup não rola e fecha sidebar; atributo data-popup preservado
    - _Requirements: 2.2, 2.3, 2.4_

- [ ] 4. Checkpoint — Sidebar funcional
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Seletores de Tônica/Escala na topbar
  - [ ] 5.1 Preencher e sincronizar os seletores da topbar
    - No `init()`, clonar as `<option>`/`<optgroup>` de `#tonica` → `#topbarTonica` e de `#tipoEscala` → `#topbarEscala` (paridade automática)
    - Definir valor inicial igual ao dos selects originais
    - `change` na topbar: guard `_syncing`; copiar valor para o select original; chamar `calcularEscala()`; sincronizar o par; liberar guard
    - Refletir mudanças externas: após `scale-changed` (ou leitura dos originais), atualizar valores da topbar sem re-disparar `change`
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 5.2_

  - [ ]* 5.2 Write unit tests: `tests/cases/sidebar-navigation/topbar-selectors.unit.spec.js`
    - paridade de opções topbar vs. originais (Property P1)
    - change na topbar copia valor e chama `calcularEscala` uma vez (mock)
    - sincronização idempotente, sem laço (Property P2)
    - `scale-changed` continua sendo disparado (valida via calcularEscala real/mock)
    - _Requirements: 4.1, 4.2, 4.3_

- [ ] 6. Estilos CSS (topbar, sidebar, overlay, tema, responsivo)
  - [ ] 6.1 Adicionar estilos em `styles/style.css` (e responsivo em `styles/style-responsive.css`)
    - `.topbar` sticky, flex, com toggle de tema à direita e seletores no centro/esquerda
    - `.app-sidebar` off-canvas (`transform: translateX(-100%)` → `0` com `body.sidebar-open`), largura `min(280px,80vw)`, transição ≤ 300ms
    - `.sidebar-overlay` scrim com fade; `.sidebar-close`; itens com alvo ≥ 44px
    - Variantes `body.dark` para topbar, sidebar, overlay e seletores (contraste AA)
    - Scroll lock combinado: `body.sidebar-open, body.popup-open { overflow: hidden; }`
    - `.sr-only` util para labels
    - Mobile (<768px): topbar acomoda botão + seletores + tema sem quebrar (empilhar/encolher)
    - Remover CSS órfão do menu horizontal antigo (`.nav-links`, `.hamburger-btn`) se não mais usado
    - _Requirements: 1.2, 1.4, 3.6, 3.7, 5.1, 6.1, 6.2, 7.4_

- [ ] 7. Checkpoint — Navegação completa (sidebar + seletores)
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Regressão e verificação final
  - [ ] 8.1 Garantir não-regressão
    - Popups (metronome, scale-structure) abrem pela sidebar
    - `scale-changed` disparado como antes (mesma detail)
    - Suíte completa passa (163+); CI verde
    - _Requirements: 2.3, 7.1, 7.2, 7.3, 7.4_

- [ ] 9. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes
- Tasks com `*` são opcionais (testes) e podem ser puladas para um MVP mais rápido, mas recomendadas.
- Reuso central: `HeaderNav.scrollToSection`, `FloatingPopup.createFocusTrap`, `calcularEscala`/`scale-changed`, toggle de tema.
- Decisão (design): manter os selects originais em `#scaleCalcSection` sincronizados (menor risco); ocultá-los pode ser uma iteração futura.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1", "2.2"] },
    { "id": 2, "tasks": ["2.3", "3.1"] },
    { "id": 3, "tasks": ["3.2", "5.1"] },
    { "id": 4, "tasks": ["5.2", "6.1"] },
    { "id": 5, "tasks": ["8.1"] }
  ]
}
```
