## INTRUÇOES 
NESTE ARQUIVO IREI INLCUIR NOVAS IDEIAS PARA IMPLEMENTAÇÃO E DESENVOLVIMENTO, PARA ISSO QUERO QUE VOCE REFINE A MINHA IDEIA QUE CRIE, CRIE AS ISSUES E DEPOIS REMOVA O QUE ESCREVI DAQUI. E DEPOIS INCLUA NA LISTA DE TAREFAS A SEREM DESENVOLVIDAS.

## MATRIZ DE PRIORIZAÇÃO (set/2026)

Labels: **Prioridade** (P1 alta / P2 média / P3 baixa) · **Urgência** (alta/média/baixa) ·
**Esforço** (S pequeno / M médio / L grande) · **Risco de regressão** (baixo/médio/alto).
"Risco" = quanto a mudança pode quebrar o que já funciona.

| Ideia | Tema | Prioridade | Urgência | Esforço | Risco | Precisa spec? |
|-------|------|-----------|----------|---------|-------|---------------|
| G — Estruturas de Escalas em popup | UI/layout | **P1** | média | **S** | **baixo** | Não (concluir spec existente) |
| E — Correção do Dicionário de Acordes | Dados/correção | **P1** | **alta** | M | médio | Não (auditoria + fix) |
| C — Responsividade mobile do Fretboard | UI/responsivo | P2 | média | M | médio | Parcial (ajuste de spec feita) |
| F — Menu dropdown por tema | UI/navegação | P2 | baixa | M | médio | Recomendável |
| H — Menu lateral retrátil (sidebar) | UI/navegação | P2 | média | M/L | **alto** | **Sim** |
| I — Seletores Tônica/Escala no topo | UI/navegação | P2 | média | M | médio | **Sim** (com H) |
| A — Afinador (Web Audio API) | Feature nova | P2 | baixa | **L** | baixo | **Sim** |
| D — Gerador de backing tracks | Feature nova | P3 | baixa | **L** | baixo | **Sim** (dev exigiu) |
| B — Treino de ouvido (Tone.js) | Feature nova | P3 | baixa | **L** | baixo | **Sim** (dev exigiu) |

> Nota: F (dropdown por tema) e H (sidebar off-canvas) resolvem o mesmo problema de navegação por
> caminhos diferentes — escolher UMA antes de implementar. I (seletores no topo) deve ser decidida
> junto com a direção de navegação escolhida.

### Ordem de execução recomendada
1. **G** — menor esforço, risco baixo, fecha pendência de spec já em andamento. (em andamento)
2. **E** — alta urgência (dados incorretos afetam acordes/campo harmônico e specs encadeadas).
   Começar pela auditoria (read-only) antes de corrigir.
3. **C** — melhora percebida direta no mobile; depende de testes visuais em breakpoints.
4. **F** — organização de navegação; fazer depois que novas features (A/B/D) definirem os itens de menu.
5. **A / D / B** — features grandes e novas; cada uma exige spec dedicada antes de codar
   (D e B o dev exigiu explicitamente análise/refino prévio).

> Observação: G, E, C e F mexem em código existente (maior risco de regressão relativo, por isso
> entram antes e com testes). A, B e D são aditivas (baixo risco de quebrar o existente) porém de
> esforço grande, então ficam para depois e com spec.

## ISSUES ABERTAS:

### Spec completa (pronta para implementação)
- **Floating Popups Layout** — Popups flutuantes arrastáveis para Metrônomo e Estrutura de Escalas. Spec: `.kiro/specs/floating-popups-layout/`
- **Chord Fretboard Visualization** — Ao clicar em um acorde no visualizador, exibir o shape no fretboard com navegação entre posições alternativas. Spec: `.kiro/specs/chord-fretboard-visualization/`
- **Scale Shapes CAGED** — Visualizar escalas no braço por shapes com cores diferenciadas, hover para destaque e toggle on/off. Spec: `.kiro/specs/scale-shapes-caged/`
- **Chord Shape Selector** — Selecionar e persistir o voicing preferido de cada acorde no campo harmônico com botão de confirmação. Spec: `.kiro/specs/chord-shape-selector/`

### Novas ideias (refinadas em set/2026 — aguardando spec)
As ideias abaixo foram refinadas na seção "NOVAS IDEIAS REFINADAS". Próximo passo de cada uma é
criar a spec em `.kiro/specs/` antes de implementar.
- **Afinador (Web Audio API)** — detector de pitch por microfone com medidor de desvio. (Ideia A)
- **Treino de ouvido (Tone.js)** — exercícios de intervalos e ritmos em rotina separada. (Ideia B)
- **Responsividade mobile do Fretboard** — melhorar layout/toque em telas pequenas. (Ideia C)
- **Gerador de backing tracks** — pistas de acompanhamento a partir do campo harmônico. (Ideia D)
- **Correção do Dicionário de Acordes** — corrigir voicings do LocalChordDB; avaliar Tonal.js/Uberchord. (Ideia E)
- **Menu superior com dropdown por tema** — agrupar navegação em dropdowns no hover. (Ideia F)
- **Estruturas de Escalas em popup** — concluir spec floating-popups (tasks 6.2 e 10.2). (Ideia G)
- **Menu lateral retrátil (sidebar)** — navegação off-canvas que se esconde. (Ideia H)
- **Seletores de Tônica/Escala no topo** — acesso rápido no header. (Ideia I)

### Concluído
- ~~**README do projeto** — Criar um README completo e profissional para o repositório.~~

### Coberta por outras features
- **Sincronização geral** — Já tratada dentro das specs de Floating Popups (req 5), Chord Fretboard Visualization (req 4), e Scale Shapes CAGED (req 5).

## NOVAS IDEIAS REFINADAS (set/2026)

### IDEIA A — Afinador de instrumento (Web Audio API)
Afinador por microfone usando a Web Audio API. Captura o áudio do `getUserMedia`, detecta a
frequência fundamental (pitch detection via autocorrelação ou FFT), converte para nota + cents
de desvio e mostra um medidor visual (agulha/barra) indicando se está grave, afinado ou agudo.
Deve reaproveitar o AudioEngine e respeitar o instrumento/afinação ativos para sugerir a nota alvo
de cada corda. Exibido em popup flutuante ou seção dedicada acessível pelo menu.
- Complexidade: Alta (DSP de pitch detection + permissão de microfone)
- Dependências: Web Audio API, getUserMedia (requer HTTPS — ok no GitHub Pages)
- Requisito (do dev): afinador orientado por instrumento + afinação alvo.
  - Seletor de instrumento reusando o `InstrumentRegistry` (guitarra 6/7, baixo, ukulele, banjo, etc.),
    para que as notas-alvo de cada corda correspondam ao instrumento escolhido.
  - Seletor/entrada de afinação customizada reusando o `CustomTuningPanel` (ex.: DADGAD na guitarra).
  - Presets de transposição global: Half Step Down, Full Step Down (e afins), que deslocam todas as
    cordas-alvo em -1 / -2 semitons sobre a afinação base do instrumento.
  - O afinador detecta a nota tocada e a compara com a corda-alvo esperada da afinação ativa,
    indicando se está abaixo/afinado/acima e por quantos cents.
  - Nota técnica: o `InstrumentRegistry` já expõe `getAll/getById` e perfis com tuning+octaves; o
    `CustomTuningPanel` já valida notas e reconstrói cordas — ambos devem ser a base de dados do afinador.

### IDEIA B — Treino de ouvido (Tone.js, página/rotina separada)
Módulo de ear training acessível pelo menu, aberto em popup ou seção própria. Exercícios de
identificação de intervalos e de ritmos: o app toca um intervalo/padrão rítmico e o usuário
responde; feedback de acerto/erro, pontuação e níveis de dificuldade. Áudio sintetizado com Tone.js
(ou com o AudioEngine existente, a avaliar) para timbres e sequenciamento rítmico.
- Complexidade: Alta (nova rotina de UI + lógica de exercícios + Tone.js)
- Dependências: Tone.js (avaliar peso vs. reuso do AudioEngine atual)
- Diretriz (do dev): **não iniciar implementação sem spec**. Fazer análise e refinamento bem
  detalhados primeiro (criar spec dedicada em `.kiro/specs/` com requirements + design + tasks).

### IDEIA C — Melhorar responsividade mobile do Fretboard
O fretboard multi-instrumento funciona bem no desktop mas a experiência mobile está ruim.
Rever layout responsivo: scroll horizontal com fret-zero fixo, dimensionamento de note-cells para
toque (mínimo 24px, ideal 44px), zoom/escala, orientação landscape, e teste nos breakpoints de
`style-responsive.css`. Objetivo: fretboard legível e tocável em telas pequenas.
- Complexidade: Média (CSS responsivo + ajustes de JS no cálculo de dimensões)
- Relacionada: multi-instrument-fretboard (concluída), style-responsive.css
- Requisito (do dev): comportamento de scroll por "janelas" de casas.
  - No mobile, exibir ~12 primeiras casas de forma legível e tocável, com **scroll lateral**
    para alcançar as casas restantes (ex.: 12–24), em vez de espremer todo o braço na tela.
  - O destaque de escala/overlay (incluindo o hover de shapes, que ficou bom) deve **continuar
    corretamente ao longo de todo o braço** conforme o usuário faz scroll — nada de o destaque
    "cortar" ou se perder nas casas fora da viewport inicial.
  - Fret-zero (pestana) permanece fixo/sticky à esquerda durante o scroll horizontal.

### IDEIA D — Gerador de backing tracks
Gerar pistas de acompanhamento a partir do campo harmônico/escala selecionada. Usuário escolhe
progressão (ou usa a do campo harmônico), estilo e BPM; o app toca os acordes em loop com um
padrão rítmico, sincronizado ao metrônomo existente. Aberto em popup ou tela separada pelo menu.
Áudio via AudioEngine/Tone.js, reusando as shapes do ChordVisualizer para as notas dos acordes.
- Complexidade: Alta (sequenciamento, padrões rítmicos, UI de progressão)
- Dependências: ChordVisualizer (acordes), metrônomo (timing), AudioEngine/Tone.js
- Diretriz (do dev): **não iniciar sem análise/refino detalhado** (criar spec primeiro).
- Requisito (do dev): a seção deve viver **separada**, acessada por um **popup** (reusar o
  sistema `FloatingPopup` já existente), e não ocupar espaço fixo na página principal.


### IDEIA E — Corrigir e melhorar o Dicionário de Acordes / Campo Harmônico
Os acordes do ChordVisualizer (LocalChordDB) estão com voicings incorretos e precisam ser
corrigidos. Validar/regenerar as 84 shapes (12 raízes × 7 qualidades) contra uma fonte confiável,
avaliar uso de biblioteca de teoria (Tonal.js) para derivar notas/intervalos e, opcionalmente,
integrar a Uberchord API como fonte online com fallback local. Fecha o trabalho pendente da spec
chord-visualizer.
- Complexidade: Média/Alta (correção de dados + possível integração de lib/API)
- Relacionada: chord-visualizer (parcial), chord-fretboard-visualization, chord-shape-selector
- Dependências (opcionais): Tonal.js, Uberchord API
- Requisito (do dev): **auditoria de correção** antes de qualquer coisa. Validar se as informações
  exibidas de **notas e acordes** estão corretas — tanto os voicings do LocalChordDB quanto as notas
  do campo harmônico derivado da escala. O dev revisou e sente que ainda não está certo.
  - Passo 1: auditar o LocalChordDB (84 shapes) e o cálculo do campo harmônico contra uma fonte
    confiável (ou Tonal.js), documentando quais acordes/notas estão errados.
  - Passo 2: corrigir os dados e, se fizer sentido, derivar notas/intervalos por biblioteca.
- RESULTADO DA AUDITORIA (set/2026):
  - Campo harmônico (`gerarCampoHarmonico` + `estruturasAcordes` em `script-escalas.js`): fórmulas de
    intervalos corretas; campos maiores/menores/modos conferidos — sem erros encontrados.
  - LocalChordDB (`script-chord-diagrams.js`): auditados 93 voicings calculando as notas tocadas
    (afinação EADGBE) vs. a teoria. **4 voicings estavam ERRADOS**, todos acordes diminutos/meio-dim:
    - `Edim` tinha C# (não pertence) e faltava G → corrigido para `[-1,7,8,9,8,-1]` (E,G,Bb).
    - `Em7b5` tinha C# e faltava D → corrigido para `[-1,7,8,7,8,-1]` (E,G,Bb,D).
    - `Fdim` tinha D e faltava Ab → corrigido para `[-1,8,9,10,9,-1]` (F,Ab,B).
    - `F#dim` tinha D# e faltava A → corrigido para `[-1,9,10,11,10,-1]` (F#,A,C).
  - Os 4 shapes antigos eram, na prática, acordes dim7 (4 notas) rotulados como tríades dim.
  - Após correção: 93/93 voicings corretos (quinta omitida em dominantes é aceitável e não contada
    como erro). Testes de chord-visualizer e chord-fretboard seguem passando (61).
  - Pendente (opcional, fora do escopo da auditoria): avaliar Tonal.js/Uberchord para derivação
    automática e expandir o DB para outros instrumentos.

### IDEIA F — Menu superior com dropdown por tema
Transformar o menu header (hoje uma lista plana de links) em um menu com **dropdowns no hover**,
agrupando os itens por tema/categoria para reduzir a largura e organizar a navegação.
- Exemplo de agrupamento (a refinar): "Prática" (Metrônomo, Treino de Ouvido, Backing Tracks,
  Afinador), "Teoria" (Calculadora de Escalas, Estruturas de Escalas, Círculo de Escalas, Ciclo de
  Quintas), "Instrumento" (Braço, Acordes, Teclado Virtual), "Recursos" (Songsterr).
- Precisa de equivalente mobile acessível (o hambúrguer atual continua, dropdowns viram submenus
  expansíveis) e manter `aria-expanded`/navegação por teclado.
- Complexidade: Média (CSS de dropdown + ajustes no `script-nav.js` + acessibilidade)
- Relacionada: ui-enhancements (menu concluído), `scripts/script-nav.js`, `index.html` (`#headerNav`)

### IDEIA G — Estruturas de Escalas acionada por botão (popup), não fixa em tela
Hoje a seção "🗺️ Estruturas de Escalas" (`#tabelaGeralEscalasResultado`) aparece **fixa na página**.
Ela deve ser acionada por botão/menu e aberta como **popup** sob demanda, para consulta quando o
usuário quiser verificar as escalas — liberando espaço na tela principal.
- IMPORTANTE: isto já está **parcialmente previsto** na spec `floating-popups-layout` (task 6.2 cria
  a instância do popup de Estruturas de Escalas, e o item de menu `data-popup="scale-structure"` já
  existe no `index.html`). O que falta é a **task 10.2**: remover/ocultar a seção fixa do fluxo
  principal mantendo o container para o popup movê-lo. Ou seja, concluir a spec já existente.
- Complexidade: Baixa/Média (concluir wiring de uma spec já em andamento)
- Relacionada: floating-popups-layout (parcial — tasks 6.2 e 10.2)


### IDEIA H — Menu lateral retrátil (sidebar off-canvas)
Substituir/complementar a navegação do topo por um **menu lateral que se esconde** (off-canvas),
aberto por um botão (hambúrguer) e deslizando a partir da borda. Objetivo: liberar o topo e
organizar melhor a navegação conforme o app cresce (afinador, treino de ouvido, backing tracks).
- Comportamento: abre/fecha com animação de slide, overlay escurecendo o fundo, fecha no Esc e ao
  clicar fora; preserva `aria-expanded`/foco (acessível por teclado).
- Decisão a tomar: a sidebar **substitui** o menu superior atual ou **coexiste** com ele? E como se
  relaciona com a Ideia F (dropdown por tema)? São abordagens concorrentes para o mesmo problema de
  navegação — escolher uma direção antes de implementar para evitar retrabalho.
- Complexidade: Média/Alta (nova estrutura de navegação + animação + acessibilidade + responsivo)
- Relacionada: ui-enhancements (menu), `scripts/script-nav.js`, `index.html` (`#headerNav`), Ideia F
- Diretriz: **criar spec antes** — é redesenho de navegação, mexe em layout central.

### IDEIA I — Seletores de Tônica e Escala no menu superior
Mover os seletores de **tônica** e **tipo de escala** (hoje dentro de `#scaleCalcSection`) para o
**menu superior**, deixando a seleção sempre visível e de acesso rápido, sem rolar até a calculadora.
- A troca nos seletores continua disparando `calcularEscala()` e o evento `scale-changed` (que já
  alimenta fretboard, acordes, círculos, etc.) — a integração existente é preservada.
- Pontos a refinar: onde encaixar no header sem poluir (talvez junto da sidebar da Ideia H), rótulos
  acessíveis, comportamento mobile, e se os seletores somem/ficam na seção original.
- Complexidade: Média (reposicionar controles + garantir que o wiring de eventos continua intacto)
- Relacionada: `scripts/script-escalas.js` (`calcularEscala`, `scale-changed`), `index.html`
- Diretriz: **criar spec antes** — acopla com a Ideia H (navegação); decidir layout em conjunto.

### Feitas nesta rodada (set/2026) — ajustes diretos sem spec
- Popup do Metrônomo: presets realinhados em grid 2 colunas uniforme (sem botões soltos); card
  interno neutralizado; sem scroll horizontal; scrollbar estilizado para light/dark.
- Toggle de tema movido para o header como **switch sol/lua** (`role="switch"`, aria-checked,
  persistência em localStorage preservada). Removido o antigo checkbox "Tema" do corpo da página.
