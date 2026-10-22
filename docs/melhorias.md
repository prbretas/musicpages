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
| L-001 | Hero Section da Escala + remover Transpositor | UI/UX | P2 | média | M | baixo | `🟠 in progress` |
| CV-001 | Chord Visualizer / Campo Harmônico | Dados/UI | **P1** | **alta** | L | médio | `🟢 done` PR #11 |
| CFV-001 | Chord Fretboard Visualization | UI/interação | **P1** | **alta** | M | médio | `🟢 done` PR #12 |
| C-001 | Responsividade mobile do Fretboard | UI/responsivo | P2 | média | M | médio | `🟢 done` PR #13 |
| SS-001 | Scale Shapes CAGED | UI/fretboard | P2 | média | M | médio | `🟢 done` PR #14 |
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

1. **CSS-001** — persiste voicings; spec pronta, pode iniciar agora.
2. **K-001** — popup interativo de acorde; depende de CSS-001 estar funcional.
3. **F-001** — dropdown de navegação; fazer após A/B/D definirem os itens de menu.
4. **A-001 / D-001 / B-001** — features novas de grande esforço; cada uma exige spec antes.
5. **J-001** — mapear repo `prbretas/metronome` antes de criar spec.

---

## ISSUES ABERTAS (resumo)

> Detalhes completos em `docs/issues.md`.

### 🟠 Em desenvolvimento
*(nenhuma no momento)*

### 🟡 Spec pronta (aguardando implementação)
- **CSS-001** — Chord Shape Selector · spec: `.kiro/specs/chord-shape-selector/`
- **K-001** — Card de Acorde Interativo · spec: `.kiro/specs/chord-card-interactive/`

### 🔵 Backlog (aguardando spec)
- **F-001** — Menu dropdown por tema
- **A-001** — Afinador de instrumento (Web Audio API)
- **J-001** — Toggle modo completo do Metrônomo
- **D-001** — Gerador de backing tracks
- **B-001** — Treino de ouvido (Tone.js)
