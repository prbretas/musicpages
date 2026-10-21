# Histórico de Entregas Concluídas — MusicPages

Registro permanente de tudo que foi implementado e testado. Ordenado cronologicamente.

---

## set/2026

### ✅ multi-instrument-fretboard (40/40 tasks)
Spec: `.kiro/specs/multi-instrument-fretboard/`
Fretboard multi-instrumento completo: suporte a guitarra 6/7c, baixo, ukulele, banjo; afinação
customizada via `CustomTuningPanel`; `InstrumentRegistry` com perfis e octavas; rebuild dinâmico
de cordas e trastes; destaque de escala e nota tônica. Suíte de property tests completa.

### ✅ sidebar-navigation (19/19 tasks)
Spec: `.kiro/specs/sidebar-navigation/`
Menu horizontal substituído por sidebar off-canvas retrátil: abre por botão hambúrguer, fecha por
overlay/Esc/clique em item, focus trap reusado do FloatingPopup, retorno de foco. Topbar fixa com
botão de menu + seletores de tônica/escala (sincronização bidirecional) + toggle sol/lua de tema.
17 testes novos; suíte total ~180 passando após entrega.

### ✅ ui-enhancements — dark mode + navegação (26/31 tasks)
Spec: `.kiro/specs/ui-enhancements/`
- Dark mode: contraste corrigido em todos os containers, fretboard e teclado virtual (WCAG AA 4.5:1).
- Header nav com links de scroll suave e menu hambúrguer mobile (`script-nav.js`).
- Scale Circle (`script-scale-circle.js`): visualização de escalas em círculo cromático.
- Circle of Fifths (`script-circle-of-fifths.js`): diagrama interativo do ciclo de quintas.
- Songsterr iframe container integrado.
- Pendente (5 tasks opcionais): testes de regressão de contraste e testes de integração de nav.

### ✅ Correção do Dicionário de Acordes (Ideia E)
Auditados 93 voicings do `LocalChordDB` em `script-chord-diagrams.js`. 4 voicings diminutos
estavam errados (dim7 rotulados como tríades dim):
- `Edim` → corrigido para `[-1,7,8,9,8,-1]` (E,G,Bb)
- `Em7b5` → corrigido para `[-1,7,8,7,8,-1]` (E,G,Bb,D)
- `Fdim` → corrigido para `[-1,8,9,10,9,-1]` (F,Ab,B)
- `F#dim` → corrigido para `[-1,9,10,11,10,-1]` (F#,A,C)
Campo harmônico (`gerarCampoHarmonico` em `script-escalas.js`): auditado, sem erros.
Testes de chord-visualizer e chord-fretboard seguem passando (61 testes).

### ✅ README do projeto
README completo e profissional criado no repositório.

### ✅ Ajustes diretos sem spec (set/2026)
- Popup do Metrônomo: presets realinhados em grid 2 colunas uniforme; card interno neutralizado;
  sem scroll horizontal; scrollbar estilizado para light/dark.
- Toggle de tema movido para o header como switch sol/lua (`role="switch"`, aria-checked,
  persistência em localStorage). Removido antigo checkbox "Tema" do corpo da página.

### ✅ floating-popups-layout — core implementado (22/33 tasks)
Spec: `.kiro/specs/floating-popups-layout/`
Sistema genérico de popups flutuantes implementado: `FloatingPopup.create`, `DragManager`,
`ZIndexManager`, `ScaleHighlighter`, `FocusTrap`, instâncias do Metrônomo e Estrutura de Escalas,
integração com menu de navegação, modo bottom sheet mobile, CSS completo.
Estruturas de Escalas agora abre como popup sob demanda (Ideia G — concluída).
Pendente: 11 tasks opcionais de property/unit tests e checkpoint final.

---

## Referência rápida de specs por status

| Spec | Status | Tasks |
|------|--------|-------|
| multi-instrument-fretboard | ✅ completa | 40/40 |
| sidebar-navigation | ✅ completa | 19/19 |
| ui-enhancements | ✅ funcional (pendências opcionais) | 26/31 |
| floating-popups-layout | ✅ funcional (pendências opcionais) | 22/33 |
| chord-fretboard-visualization | 🟠 em andamento | 17/26 |
| scale-shapes-caged | 🟠 em andamento | 14/29 |
| fretboard-mobile-responsive | 🟠 iniciada | 2/15 |
| chord-visualizer | 🟠 iniciada | 8/43 |
| chord-shape-selector | 🔵 pronta p/ implementar | 0/19 |
| chord-card-interactive | 🔵 spec pronta | 0/29 |
