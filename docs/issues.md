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

### C-001 · `🟠 in progress` · feat: Responsividade mobile do Fretboard

**Prioridade:** P2 · **Urgência:** média · **Esforço:** M · **Risco:** médio
**Spec:** `.kiro/specs/fretboard-mobile-responsive/` · **Progresso:** 2/15 tasks

#### Contexto

O fretboard multi-instrumento funciona bem no desktop, mas a experiência mobile está ruim.
Revisar layout responsivo para tornar o braço legível e tocável em telas pequenas.

#### Comportamento esperado

- Exibir ~12 primeiras casas de forma legível e tocável, com **scroll lateral** para as demais.
- O destaque de escala/overlay continua corretamente ao longo de todo o braço durante o scroll.
- Fret-zero (pestana) permanece fixo/sticky à esquerda durante o scroll horizontal.
- Note-cells com tamanho mínimo 24px (ideal 44px) para toque.

#### Mapeamento técnico

- `script-fretboard.js` — cálculo de dimensões de cells
- `styles/style-fretboard.css` + `styles/style-responsive.css` — breakpoints e scroll

---

### F-001 · `🔵 backlog` · feat: Menu superior com dropdowns por tema

**Prioridade:** P2 · **Urgência:** baixa · **Esforço:** M · **Risco:** médio
**Spec:** a criar · **Relacionada:** sidebar-navigation (concluída)

#### Contexto

Transformar o menu header em um menu com **dropdowns no hover**, agrupando os itens por
tema/categoria. A sidebar já foi implementada (sidebar-navigation); esta issue é complementar
para organizar o menu conforme as features crescem (Afinador, Treino de ouvido, Backing tracks).

#### Agrupamento sugerido

- **Prática:** Metrônomo, Treino de Ouvido, Backing Tracks, Afinador
- **Teoria:** Calculadora de Escalas, Estruturas de Escalas, Círculo de Escalas, Ciclo de Quintas
- **Instrumento:** Braço, Acordes, Teclado Virtual
- **Recursos:** Songsterr

#### Mapeamento técnico

- `scripts/script-nav.js` — lógica de navegação
- `index.html` — estrutura `#headerNav`
- `styles/style.css` — CSS de dropdown + acessibilidade (`aria-expanded`, teclado)

---

### A-001 · `🔵 backlog` · feat: Afinador de instrumento (Web Audio API)

**Prioridade:** P2 · **Urgência:** baixa · **Esforço:** L · **Risco:** baixo
**Spec:** a criar

#### Contexto

Afinador por microfone usando a Web Audio API. Captura `getUserMedia`, detecta frequência
fundamental (autocorrelação ou FFT), converte para nota + cents de desvio e mostra medidor visual.

#### Requisitos do dev

- Seletor de instrumento reusando `InstrumentRegistry`.
- Seletor de afinação customizada reusando `CustomTuningPanel`.
- Presets de transposição: Half Step Down, Full Step Down (deslocam cordas-alvo em -1/-2 semitons).
- Medidor visual (agulha/barra): grave / afinado / agudo em cents.
- Exibido em popup flutuante (reusar `FloatingPopup`).

#### Mapeamento técnico

- Web Audio API + `getUserMedia` (requer HTTPS — ok no GitHub Pages)
- `InstrumentRegistry` (`script-instrument-registry.js`) — perfis com tuning+octaves
- `CustomTuningPanel` (`script-custom-tuning.js`) — validação e reconstrução de cordas
- `FloatingPopup` (`script-floating-popup.js`) — container do popup

---

### B-001 · `🔵 backlog` · feat: Treino de ouvido (Tone.js)

**Prioridade:** P3 · **Urgência:** baixa · **Esforço:** L · **Risco:** baixo
**Spec:** a criar · **Diretriz:** não iniciar sem spec detalhada

#### Contexto

Módulo de ear training acessível pelo menu. Exercícios de identificação de intervalos e ritmos:
o app toca um intervalo/padrão rítmico e o usuário responde. Feedback de acerto/erro, pontuação
e níveis de dificuldade. Áudio via Tone.js ou AudioEngine existente (a avaliar).

#### Requisitos do dev

- Acessível pelo menu, aberto em popup ou seção própria.
- Exercícios de intervalos e ritmos com níveis de dificuldade.
- Não iniciar implementação sem spec dedicada com requirements + design + tasks.

---

### D-001 · `🔵 backlog` · feat: Gerador de backing tracks

**Prioridade:** P3 · **Urgência:** baixa · **Esforço:** L · **Risco:** baixo
**Spec:** a criar · **Diretriz:** não iniciar sem spec detalhada

#### Contexto

Gerar pistas de acompanhamento a partir do campo harmônico/escala selecionada. Usuário escolhe
progressão (ou usa a do campo harmônico), estilo e BPM; o app toca os acordes em loop com padrão
rítmico, sincronizado ao metrônomo existente.

#### Requisitos do dev

- Vive em **popup** (reusar `FloatingPopup`) — não ocupa espaço fixo na página principal.
- Áudio via `AudioEngine`/Tone.js, reusando shapes do `ChordVisualizer`.
- Não iniciar implementação sem spec dedicada.

#### Mapeamento técnico

- `ChordVisualizer` (`script-chord-diagrams.js`) — acordes e shapes
- `script-metronome.js` — timing/BPM
- `FloatingPopup` (`script-floating-popup.js`) — container
- `AudioEngine` (`script-audio-engine.js`) / Tone.js (a avaliar)

---

### J-001 · `🔵 backlog` · feat: Toggle modo completo do Metrônomo

**Prioridade:** P3 · **Urgência:** baixa · **Esforço:** M/L · **Risco:** médio
**Spec:** a criar · **Diretriz:** mapear features do repo prbretas/metronome antes de implementar

#### Contexto

Adicionar toggle que alterna o popup do metrônomo entre o **modo simples** atual e um
**modo completo** inspirado em https://github.com/prbretas/metronome. Modo simples permanece
como padrão; modo completo é opcional.

#### A mapear no repo (antes de implementar)

- Compasso / time signature
- Subdivisões por batida
- Acentos configuráveis por batida
- Controle visual mais rico
- Persistência da preferência de modo

#### Mapeamento técnico

- `script-metronome.js` — engine atual
- `script-audio-engine.js` — reusar vs. portar do outro projeto
- Popup do metrônomo (`FloatingPopup`) — onde o toggle vive

---

### K-001 · `🟡 spec` · feat: Card de Acorde Interativo (hover-popup + variar posição + play)

**Prioridade:** P2 · **Urgência:** média · **Esforço:** M · **Risco:** médio
**Spec:** `.kiro/specs/chord-card-interactive/` · **Progresso:** 0/29 tasks
**Relacionada:** chord-fretboard-visualization, chord-shape-selector, floating-popups-layout

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

### CV-001 · `🟠 in progress` · feat: Visualizador de Acordes / Campo Harmônico

**Prioridade:** P1 · **Urgência:** alta · **Esforço:** L · **Risco:** médio
**Spec:** `.kiro/specs/chord-visualizer/` · **Progresso:** 8/43 tasks

#### Contexto

Implementação do `ChordVisualizer` com `LocalChordDB`, grid de cards de acordes do campo
harmônico, renderização SVG de diagramas, navegação entre voicings por card e integração com
o evento `scale-changed`. Base para as specs `chord-fretboard-visualization` e `chord-shape-selector`.

---

### CFV-001 · `🟠 in progress` · feat: Chord Fretboard Visualization

**Prioridade:** P1 · **Urgência:** alta · **Esforço:** M · **Risco:** médio
**Spec:** `.kiro/specs/chord-fretboard-visualization/` · **Progresso:** 17/26 tasks
**Depende de:** CV-001 (chord-visualizer)

#### Contexto

Ao clicar em um card de acorde no campo harmônico, o fretboard exibe o shape do acorde com
navegação entre posições alternativas (◀ ▶). Comunicação via `chord-selected` CustomEvent.

#### Pendências (tasks abertas)

- Task 4.2: integrar handler de click/teclado nos ChordCards renderizados
- Tasks 4.3, 4.4: property tests (event detail, exclusividade de card ativo)
- Task 5.5: unit tests de wiring e transições de estado
- Task 7: checkpoint final

---

### CSS-001 · `🟡 spec` · feat: Chord Shape Selector

**Prioridade:** P2 · **Urgência:** média · **Esforço:** M · **Risco:** médio
**Spec:** `.kiro/specs/chord-shape-selector/` · **Progresso:** 0/19 tasks
**Depende de:** CV-001, CFV-001

#### Contexto

Seleção e persistência de chord shapes (voicings) no ChordVisualizer. Botão ✓ individual por
acorde aparece quando o shape exibido difere do persistido; salva no localStorage por escala.
Restaura automaticamente ao reabrir a mesma escala.

---

### SS-001 · `🟠 in progress` · feat: Scale Shapes CAGED

**Prioridade:** P2 · **Urgência:** média · **Esforço:** M · **Risco:** médio
**Spec:** `.kiro/specs/scale-shapes-caged/` · **Progresso:** 14/29 tasks

#### Contexto

Visualizar escalas no braço por shapes CAGED com cores diferenciadas por shape, hover para
destaque individual e toggle on/off de cada shape. Calculado dinamicamente a partir dos intervalos
da escala ativa.

---

## Concluídas

### ✅ MULTI-001 · `🟢 done` · feat: Multi-instrument Fretboard
**Spec:** `.kiro/specs/multi-instrument-fretboard/` · **Concluída:** set/2026 · 40/40 tasks
Fretboard multi-instrumento completo com `InstrumentRegistry`, `CustomTuningPanel`, rebuild dinâmico e suíte de property tests.

### ✅ SN-001 · `🟢 done` · feat: Sidebar Navigation + Topbar com Seletores (Ideias H + I)
**Spec:** `.kiro/specs/sidebar-navigation/` · **Concluída:** set/2026 · 19/19 tasks
Sidebar off-canvas retrátil, topbar fixa com seletores de tônica/escala sincronizados, toggle de tema.

### ✅ UI-001 · `🟢 done` · feat: UI Enhancements (dark mode + nav + circles)
**Spec:** `.kiro/specs/ui-enhancements/` · **Concluída:** set/2026 · 26/31 tasks (5 opcionais pendentes)
Dark mode WCAG AA, header nav, Scale Circle, Circle of Fifths, Songsterr container.

### ✅ FP-001 · `🟢 done` · feat: Floating Popups Layout (Ideia G)
**Spec:** `.kiro/specs/floating-popups-layout/` · **Concluída:** set/2026 · 22/33 tasks (11 opcionais pendentes)
Sistema de popups flutuantes arrastáveis; instâncias de Metrônomo e Estruturas de Escalas.

### ✅ E-001 · `🟢 done` · fix: Correção do Dicionário de Acordes (Ideia E)
**Concluída:** set/2026
4 voicings diminutos corrigidos no `LocalChordDB`; campo harmônico auditado sem erros.

### ✅ README-001 · `🟢 done` · docs: README completo do projeto
**Concluída:** set/2026

---

## Canceladas / Descartadas

### ❌ F-001-v0 · Menu dropdown — substituído pela sidebar
A sidebar (SN-001) cobriu o problema de navegação. F-001 permanece no backlog apenas como
complemento futuro para organizar itens quando as novas features (A, B, D) forem implementadas.
