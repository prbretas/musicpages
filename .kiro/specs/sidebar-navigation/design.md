# Design: Sidebar Navigation + Seletores no Topo

## Visão Geral

Substitui o `#headerNav` horizontal por uma **topbar fixa enxuta** + uma **sidebar off-canvas**.
A topbar passa a conter: botão de menu (abre a sidebar), seletores de tônica/escala, e o toggle de
tema. A sidebar contém a lista de navegação (seções + popups) e desliza da esquerda sobre um overlay.

A implementação segue o padrão do projeto: Vanilla JS em IIFE, sem build step, CSS com variáveis de
tema (`body.dark`), e reaproveitamento máximo do código existente (`HeaderNav`, `FloatingPopup`,
`calcularEscala`, toggle de tema). Preserva os atributos `data-popup` e âncoras `href="#..."` para
que o wiring de popups e o scroll continuem funcionando sem reescrita.

## Arquitetura

```
Topbar (fixa, sticky top)
├── Botão de menu (hambúrguer)         → abre/fecha Sidebar
├── Seletores (Tônica, Escala)         → sincronizados com #tonica/#tipoEscala
└── Theme toggle (switch sol/lua)      → lógica existente

Sidebar (off-canvas, esquerda) + Overlay
└── <nav> lista de itens
      ├── âncoras href="#..."  (scrollToSection)
      └── itens data-popup=... (FloatingPopup)
```

### Componentes

#### 1. SidebarNav (novo módulo: `scripts/script-sidebar.js`)
IIFE `SidebarNav` responsável pelo ciclo de vida da sidebar.

Estado interno:
- `isOpen` (boolean)
- refs: `sidebarEl`, `overlayEl`, `menuBtn`, `focusTrap`

API pública:
- `init()` — cacheia DOM, registra listeners, estado inicial fechado.
- `open()` — adiciona classe `.sidebar-open` ao body (ou à sidebar), mostra overlay, ativa focus
  trap, move foco para o primeiro focável, `aria-expanded=true`.
- `close()` — remove classes, esconde overlay, desativa focus trap, retorna foco ao `menuBtn`,
  `aria-expanded=false`.
- `toggle()`.

Reuso: o **focus trap** reaproveita `FloatingPopup.createFocusTrap` / `getFocusableElements`
(já expostos em `window._FloatingPopupInternals`), evitando duplicar lógica testada. Se o
FloatingPopup não estiver disponível, cai num trap mínimo local (defensivo).

#### 2. Navegação dos itens (reaproveita HeaderNav)
Os itens da sidebar continuam sendo `<a href="#...">` e `<a data-popup="...">`. O comportamento:
- Âncoras: `HeaderNav.scrollToSection(id)` (já existe) + fechar sidebar.
- Popups: o listener de `data-popup` do `script-floating-popup.js` já trata o toggle do popup; o
  SidebarNav apenas fecha a sidebar após o clique.

Decisão: mínima alteração em `HeaderNav`. Ele deixa de depender de `.hamburger-btn`/`.nav-open` do
layout antigo e passa a ligar o clique dos links à sidebar; `scrollToSection` permanece idêntico.

#### 3. TopbarScaleSelectors (novo: parte de `script-sidebar.js` ou módulo próprio)
Dois `<select>` na topbar (`#topbarTonica`, `#topbarEscala`) espelhando `#tonica`/`#tipoEscala`.

Sincronização bidirecional, fonte única de verdade = os selects originais:
- `change` na topbar → copia valor para o select original correspondente → chama `calcularEscala()`.
- `change` no select original (ou após `calcularEscala`) → atualiza o valor da topbar.
- Para evitar laço infinito, a cópia programática usa um flag `_syncing` e não re-dispara `change`.

As `<option>`/`<optgroup>` da topbar são **geradas por clonagem** do markup dos selects originais no
`init()`, garantindo paridade automática de opções (Req 4.1) sem duplicar a lista manualmente.

### Fluxos

#### Abrir/fechar sidebar
```
menuBtn.click → SidebarNav.toggle()
  open(): body.add('sidebar-open'); overlay visível; focusTrap.activate(); focus 1º item; aria-expanded=true
  close(): body.remove('sidebar-open'); overlay oculto; focusTrap.deactivate(); menuBtn.focus(); aria-expanded=false
overlay.click → close()
Escape (document keydown, se isOpen) → close()
item.click → (scroll ou popup) → close()
```

#### Mudança de escala pela topbar
```
#topbarTonica/#topbarEscala change
  → if (_syncing) return
  → _syncing = true
  → #tonica/#tipoEscala .value = novoValor
  → calcularEscala()   // dispara scale-changed; alimenta todos os módulos
  → sincroniza o OUTRO select da topbar se necessário
  → _syncing = false
```

`calcularEscala()` já lê de `#tonica`/`#tipoEscala` e dispara `scale-changed` — por isso copiamos o
valor para os originais antes de chamar, mantendo uma fonte única de verdade e zero mudança em
`script-escalas.js`.

## Modelos de Dados

Sem novas estruturas de dados. Reuso de:
- IDs existentes: `#tonica`, `#tipoEscala`, `#metronomeContainer`, `#scaleStructureSection`, etc.
- Evento existente: `scale-changed` (detail: `{ notes, tonica, tipoEscala, tonicaIndex }`).

## HTML (estrutura alvo)

```html
<header class="topbar">
  <button id="sidebarToggle" class="sidebar-toggle" aria-expanded="false"
          aria-controls="appSidebar" aria-label="Abrir menu">&#9776;</button>

  <div class="topbar-selectors">
    <label for="topbarTonica" class="sr-only">Tônica</label>
    <select id="topbarTonica"></select>           <!-- opções clonadas de #tonica -->
    <label for="topbarEscala" class="sr-only">Escala</label>
    <select id="topbarEscala"></select>           <!-- opções clonadas de #tipoEscala -->
  </div>

  <button id="themeToggle" ...>...</button>        <!-- toggle existente, movido p/ cá -->
</header>

<div id="sidebarOverlay" class="sidebar-overlay" hidden></div>
<nav id="appSidebar" class="app-sidebar" aria-label="Navegação principal">
  <button class="sidebar-close" aria-label="Fechar menu">&times;</button>
  <ul>
    <li><a href="#metronomeContainer" data-popup="metronome">Metrônomo</a></li>
    ... (demais itens, iguais aos atuais) ...
  </ul>
</nav>
```

O `#headerNav`/`#navLinks` atuais são substituídos por essa estrutura. Mantém-se os mesmos `href` e
`data-popup`.

## CSS (pontos-chave)

- `.app-sidebar`: `position: fixed; top:0; left:0; height:100vh; width:min(280px,80vw);
  transform: translateX(-100%); transition: transform 250ms ease;`
- `body.sidebar-open .app-sidebar { transform: translateX(0); }`
- `.sidebar-overlay`: `position: fixed; inset:0; background: rgba(0,0,0,.45); opacity:0;
  transition: opacity 250ms;` + estado aberto.
- Tema dark: variantes `body.dark .app-sidebar`, `body.dark .topbar` com contraste AA.
- Scroll lock: `body.sidebar-open { overflow: hidden; }` — coexistir com `body.popup-open`
  (ambos apenas setam overflow hidden; a remoção de um não deve reativar scroll se o outro ativo).
- `.sr-only` para labels visualmente ocultos mas acessíveis.
- Alvos de toque ≥ 44px nos itens e botões.

## Tratamento de Scroll Lock (coexistência sidebar × popup)

Risco: fechar a sidebar remove `overflow:hidden` enquanto um popup ainda está aberto (ou vice-versa).
Mitigação: usar classes independentes (`sidebar-open`, `popup-open`) e uma regra CSS combinada
`body.sidebar-open, body.popup-open { overflow: hidden; }`. Assim o scroll só volta quando **nenhuma**
das duas estiver ativa — nenhuma lógica JS extra de contagem é necessária.

## Estratégia de Testes

Testes unitários (vitest + jsdom), em `tests/cases/sidebar-navigation/`:
- `sidebar-lifecycle.unit.spec.js`: open/close/toggle alteram classe e `aria-expanded`; Escape e
  overlay fecham; foco retorna ao botão no close.
- `topbar-selectors.unit.spec.js`:
  - opções da topbar == opções dos selects originais (paridade por clonagem);
  - change na topbar copia valor para o original e chama `calcularEscala` (mock) uma única vez;
  - sincronização não entra em laço (flag `_syncing`);
  - `scale-changed` continua sendo disparado (via calcularEscala real ou mock que valida chamada).
- `nav-items.unit.spec.js`: clicar item âncora chama `scrollToSection` e fecha sidebar; clicar item
  `data-popup` não rola e fecha sidebar; `data-popup` preservado.

Regressão: rodar a suíte completa (deve seguir em 163+). Não remover testes existentes de nav/popup.

### Correctness Properties
- **P1 (paridade de opções):** para todo `<option>` em `#tonica`/`#tipoEscala`, existe uma opção de
  mesmo `value` e `textContent` na topbar correspondente, e vice-versa.
- **P2 (idempotência de sincronização):** aplicar a sincronização topbar→original→topbar não altera
  o valor final nem dispara `change` adicional (sem laço).
- **P3 (estado do aria-expanded):** `aria-expanded` do botão de menu é `true` sse `isOpen === true`.

## Decisões e Trade-offs
- **Reusar `FloatingPopup.createFocusTrap`** em vez de reimplementar: menos código, já testado.
- **Clonar opções** dos selects originais em vez de duplicar markup: elimina risco de divergência.
- **Manter os selects originais** em `#scaleCalcSection` (sincronizados) em vez de removê-los:
  menor risco de regressão e preserva o fluxo do botão "Gerar Escala". (Pode-se ocultar depois, se o
  dev preferir, numa iteração separada.)
- **Sidebar à esquerda**: convenção comum; largura `min(280px, 80vw)` evita cobrir tudo no mobile.
