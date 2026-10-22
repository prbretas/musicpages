# Issues Locais — MusicPages

Tracker de issues e features do projeto. Issues ficam aqui, não no GitHub.

## Status Legend

| Badge | Significado |
|-------|-------------|
| `🔵 backlog` | Refinada, aguardando spec ou priorização |
| `🟡 spec` | Spec criada, aguardando implementação |
| `🟠 in progress` | Em desenvolvimento ativo |
| `🟢 done` | Implementada e testada |
| `⛔ blocked` | Bloqueada por dependência ou decisão |
| `❌ cancelled` | Descartada |

---

## Abertas

### L-001 · `🟠 in progress` · feat: Hero Section dinâmica da escala + remover Transpositor da página

**Prioridade:** P2 · **Urgência:** média · **Esforço:** M · **Risco:** baixo
**Spec:** não requerida (sem spec — implementação direta)

#### Contexto

A página abre hoje com o "Transpositor de Escalas Musicais" como destaque visual (h1 + selects +
botão). A ideia é substituir esse bloco por uma **hero section dinâmica** que exibe a tonalidade
e escala ativas de forma visual e informativa. Os seletores migram para a topbar (já implementada
em SN-001) e o bloco antigo some da seção principal.

#### Comportamento esperado

- **Hero section** abaixo da topbar: exibe a tônica em destaque (letra grande), nome da escala,
  sonoridade, sentimentos despertados, uso comum e exemplos de músicas famosas.
- Atualiza automaticamente ao trocar tônica/escala na topbar (evento `scale-changed`).
- Layout em duas colunas: texto à esquerda, Círculo de Escalas à direita (como na referência).
- O `#scaleCalcSection` (Transpositor) é ocultado da view principal — os selects originais
  (`#tonica`, `#tipoEscala`) permanecem no DOM (usados pela sidebar sync) mas a seção inteira
  fica `display: none` ou é movida para popup/seção colapsável acessível pelo menu.

#### Referência visual

`img/IMG DEVELOPMENT/` — screenshots do layout desejado (hero C Maior + topbar com selects).

---

### CSS-001 · `🟡 spec` · feat: Chord Shape Selector

**Prioridade:** P2 · **Urgência:** média · **Esforço:** M · **Risco:** médio
**Spec:** `.kiro/specs/chord-shape-selector/` · **Progresso:** 0/19 tasks

#### Contexto

Seleção e persistência de chord shapes (voicings) no ChordVisualizer. Botão ✓ individual por
acorde aparece quando o shape exibido difere do persistido; salva no localStorage por escala.
Restaura automaticamente ao reabrir a mesma escala.

---

### K-001 · `🟡 spec` · feat: Card de Acorde Interativo (hover-popup + variar posição + play)

**Prioridade:** P2 · **Urgência:** média · **Esforço:** M · **Risco:** médio
**Spec:** `.kiro/specs/chord-card-interactive/` · **Progresso:** 0/29 tasks
**Depende de:** CSS-001

#### Contexto

Evolução da interação dos cards de acorde no campo harmônico para um popup flutuante arrastável,
reunindo hover-preview, navegação entre voicings e playback. Camada de UI que une as specs
`chord-fretboard-visualization` e `chord-shape-selector`.

#### Comportamento esperado

1. **Hover** — abre popup flutuante com diagrama do voicing atual (some ao sair, persiste ao clicar).
2. **Clique** — fixa o popup com botões **Variar** e **▶ Play**.
3. **Variar** — carrossel horizontal de shapes alternativos; voicing selecionado vira o ativo.
4. **▶ Play** — toca o voicing via `playChord` / `AudioEngine`.
5. **Arrastável** — reusa `FloatingPopup` (drag, focus trap).

#### Mapeamento técnico

| O que existe | Onde reusar |
|---|---|
| `createVoicingNavigator(total)` | navegação entre shapes |
| `playChord(chordShape)` | playback via AudioEngine |
| `handleChordCardClick(chord, cardElement)` | ponto de entrada; será evoluído |
| `FloatingPopup` (`script-floating-popup.js`) | drag, overlay, focus trap |
| `LocalChordDB` | fonte dos voicings |

---

### F-001 · `🔵 backlog` · feat: Menu superior com dropdowns por tema

**Prioridade:** P2 · **Urgência:** baixa · **Esforço:** M · **Risco:** médio
**Spec:** a criar · **Nota:** aguardar A/B/D para definir itens de menu finais.

#### Agrupamento sugerido

- **Prática:** Metrônomo, Treino de Ouvido, Backing Tracks, Afinador
- **Teoria:** Calculadora de Escalas, Estruturas de Escalas, Círculo de Escalas, Ciclo de Quintas
- **Instrumento:** Braço, Acordes, Teclado Virtual
- **Recursos:** Songsterr

---

### A-001 · `🔵 backlog` · feat: Afinador de instrumento (Web Audio API)

**Prioridade:** P2 · **Urgência:** baixa · **Esforço:** L · **Risco:** baixo
**Spec:** a criar

Afinador por microfone (Web Audio API). Seletor de instrumento via `InstrumentRegistry`,
afinação customizada via `CustomTuningPanel`, presets Half/Full Step Down, medidor visual em cents.
Exibido em `FloatingPopup`.

---

### J-001 · `🔵 backlog` · feat: Toggle modo completo do Metrônomo

**Prioridade:** P3 · **Urgência:** baixa · **Esforço:** M/L · **Risco:** médio
**Spec:** a criar · **Diretriz:** mapear features do repo prbretas/metronome antes de implementar.

---

### D-001 · `🔵 backlog` · feat: Gerador de backing tracks

**Prioridade:** P3 · **Urgência:** baixa · **Esforço:** L · **Risco:** baixo
**Spec:** a criar · **Diretriz:** não iniciar sem spec detalhada.

---

### B-001 · `🔵 backlog` · feat: Treino de ouvido (Tone.js)

**Prioridade:** P3 · **Urgência:** baixa · **Esforço:** L · **Risco:** baixo
**Spec:** a criar · **Diretriz:** não iniciar sem spec detalhada.

---

## Concluídas

### ✅ CV-001 · `🟢 done` · feat: Chord Visualizer / Campo Harmônico — out/2026
**Spec:** `.kiro/specs/chord-visualizer/` · PR #11
UberchordClient (cache+fallback), `playChord` (strum MIDI), `instrument-changed`, theme wiring (MutationObserver), CSS offline indicator.

### ✅ CFV-001 · `🟢 done` · feat: Chord Fretboard Visualization — out/2026
**Spec:** `.kiro/specs/chord-fretboard-visualization/` · PR #12
Fretboard exibe shapes de acorde ao clicar no card, navega entre posições alternativas (◀ ▶), restaura destaque de escala. Comunicação via `chord-selected`/`chord-deselected` CustomEvents.

### ✅ C-001 · `🟢 done` · feat: Responsividade mobile do Fretboard — out/2026
**Spec:** `.kiro/specs/fretboard-mobile-responsive/` · PR #13
Fretboard com scroll horizontal px-fixo, pestana sticky, note-cells 24px no mobile, destaque contínuo.

### ✅ SS-001 · `🟢 done` · feat: Scale Shapes CAGED — out/2026
**Spec:** `.kiro/specs/scale-shapes-caged/` · PR #14
Shapes CAGED com cores por shape, hover com esmaecer dos demais, toggles on/off, integração com scale-changed.

### ✅ MULTI-001 · `🟢 done` · feat: Multi-instrument Fretboard — set/2026
**Spec:** `.kiro/specs/multi-instrument-fretboard/` · 40/40 tasks
Fretboard multi-instrumento com `InstrumentRegistry`, `CustomTuningPanel`, rebuild dinâmico.

### ✅ SN-001 · `🟢 done` · feat: Sidebar Navigation + Topbar (Ideias H + I) — set/2026
**Spec:** `.kiro/specs/sidebar-navigation/` · 19/19 tasks
Sidebar off-canvas retrátil, topbar com seletores sincronizados, toggle sol/lua.

### ✅ UI-001 · `🟢 done` · feat: UI Enhancements — set/2026
**Spec:** `.kiro/specs/ui-enhancements/` · 26/31 tasks (5 opcionais)
Dark mode WCAG AA, header nav, Scale Circle, Circle of Fifths, Songsterr.

### ✅ FP-001 · `🟢 done` · feat: Floating Popups Layout — set/2026
**Spec:** `.kiro/specs/floating-popups-layout/` · 22/33 tasks (11 opcionais)
Popups flutuantes arrastáveis para Metrônomo e Estruturas de Escalas.

### ✅ E-001 · `🟢 done` · fix: Correção do Dicionário de Acordes — set/2026
4 voicings diminutos corrigidos no `LocalChordDB`.

### ✅ README-001 · `🟢 done` · docs: README completo do projeto — set/2026

---

## Canceladas / Descartadas

### ❌ F-001-v0 · Menu dropdown — substituído pela sidebar
Sidebar (SN-001) resolveu o problema de navegação. F-001 aguarda as novas features (A/B/D) para definir os itens finais.
