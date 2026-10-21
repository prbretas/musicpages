## INSTRUÇÕES

Neste arquivo incluo novas ideias para implementação. Ao receber uma ideia nova:

1. **Refinar** — detalhar comportamento, mapeamento técnico, complexidade e riscos.
2. **Criar issue** — adicionar entrada em `docs/issues.md` com status `🔵 backlog`.
3. **Remover** o rascunho bruto deste arquivo.
4. **Atualizar a Matriz de Priorização** abaixo.
5. **Criar spec** em `.kiro/specs/<nome>/` quando priorizada — atualizar issue para `🟡 spec`.

> Detalhes completos de cada issue ficam em `docs/issues.md`.
> Histórico do que foi entregue fica em `docs/concluido.md`.
> Fluxo Git completo (branch → commit → PR → merge) em `.kiro/steering/git-workflow.md`.

### Fluxo resumido para iniciar uma issue

```
1. docs/issues.md  → status: 🟠 in progress
2. git checkout main && git pull origin main
3. git checkout -b feature/<issue-id>-<desc>
4. desenvolver + commits incrementais
5. npx vitest run   ← todos passando
6. git push -u origin <branch>
7. gh pr create     ← CI verde → merge
8. docs/issues.md  → status: 🟢 done
9. docs/concluido.md → registrar entrega
```

---

## MATRIZ DE PRIORIZAÇÃO (out/2026)

Labels: **Prioridade** (P1 alta / P2 média / P3 baixa) · **Urgência** (alta/média/baixa) ·
**Esforço** (S pequeno / M médio / L grande) · **Risco** (baixo/médio/alto).

| Issue | Ideia | Tema | Prio | Urgência | Esforço | Risco | Status |
|-------|-------|------|------|----------|---------|-------|--------|
| CV-001 | Chord Visualizer / Campo Harmônico | Dados/UI | **P1** | **alta** | L | médio | `🟠 in progress` 8/43 |
| CFV-001 | Chord Fretboard Visualization | UI/interação | **P1** | **alta** | M | médio | `🟠 in progress` 17/26 |
| C-001 | Responsividade mobile do Fretboard | UI/responsivo | P2 | média | M | médio | `🟠 in progress` 2/15 |
| SS-001 | Scale Shapes CAGED | UI/fretboard | P2 | média | M | médio | `🟠 in progress` 14/29 |
| CSS-001 | Chord Shape Selector | Feature | P2 | média | M | médio | `🟡 spec` 0/19 |
| K-001 | Card de Acorde Interativo | UI/Feature | P2 | média | M | médio | `🟡 spec` 0/29 |
| F-001 | Menu dropdown por tema | UI/navegação | P2 | baixa | M | médio | `🔵 backlog` |
| J-001 | Toggle modo completo do Metrônomo | Feature | P3 | baixa | M/L | médio | `🔵 backlog` |
| A-001 | Afinador (Web Audio API) | Feature nova | P2 | baixa | L | baixo | `🔵 backlog` |
| D-001 | Gerador de backing tracks | Feature nova | P3 | baixa | L | baixo | `🔵 backlog` |
| B-001 | Treino de ouvido (Tone.js) | Feature nova | P3 | baixa | L | baixo | `🔵 backlog` |

> CSS-001 e K-001 dependem de CV-001 e CFV-001 — concluir as duas P1 primeiro.
> F-001 deve aguardar A-001/B-001/D-001 para definir os itens finais do menu.
> J-001 requer mapeamento do repo `prbretas/metronome` antes de começar.

### Ordem de execução recomendada

1. **CV-001** — base do campo harmônico; desbloqueará CFV-001, CSS-001 e K-001.
2. **CFV-001** — visualização de acorde no fretboard; 17/26 concluídas, perto do fim.
3. **C-001** — melhora percebida direta no mobile; depende de testes visuais em breakpoints.
4. **SS-001** — shapes CAGED no fretboard; 14/29 concluídas, em andamento.
5. **CSS-001** — persistência de voicings; depende de CV-001 + CFV-001.
6. **K-001** — popup interativo de acorde; depende de CV-001, CFV-001 e CSS-001.
7. **F-001** — dropdown de navegação; fazer após A/B/D definirem os itens de menu.
8. **A-001 / D-001 / B-001** — features novas de grande esforço; cada uma exige spec antes.
9. **J-001** — mapear repo `prbretas/metronome` antes de criar spec.

---

## ISSUES ABERTAS (resumo)

> Detalhes completos em `docs/issues.md`.

### 🟠 Em desenvolvimento
- **CV-001** — Chord Visualizer / Campo Harmônico · spec: `.kiro/specs/chord-visualizer/`
- **CFV-001** — Chord Fretboard Visualization · spec: `.kiro/specs/chord-fretboard-visualization/`
- **C-001** — Responsividade mobile do Fretboard · spec: `.kiro/specs/fretboard-mobile-responsive/`
- **SS-001** — Scale Shapes CAGED · spec: `.kiro/specs/scale-shapes-caged/`

### 🟡 Spec pronta (aguardando implementação)
- **CSS-001** — Chord Shape Selector · spec: `.kiro/specs/chord-shape-selector/`
- **K-001** — Card de Acorde Interativo · spec: `.kiro/specs/chord-card-interactive/`

### 🔵 Backlog (aguardando spec)
- **F-001** — Menu dropdown por tema
- **A-001** — Afinador de instrumento (Web Audio API)
- **J-001** — Toggle modo completo do Metrônomo
- **D-001** — Gerador de backing tracks
- **B-001** — Treino de ouvido (Tone.js)
