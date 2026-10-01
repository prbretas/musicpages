# 🎵 MusicPages

Ferramenta interativa de teoria musical para guitarristas e músicos. Permite visualizar escalas, acordes, campo harmônico e praticar com metrônomo — tudo em uma única página, sem necessidade de instalação.

**[🔗 Acesse a aplicação ao vivo](https://prbretas.github.io/musicpages/)**

## Funcionalidades

### Calculadora de Escalas
- Seleção de tônica e tipo de escala (diatônicas, modos gregos, pentatônicas, blues, exóticas)
- Exibição das notas da escala e campo harmônico
- Tabela de intervalos e estruturas de escalas em semitons

### Braço do Instrumento (Fretboard)
- Fretboard interativo com destaque das notas da escala selecionada
- Suporte a múltiplos instrumentos (guitarra, baixo, ukulele, banjo, etc.)
- Afinação customizável
- Engine de áudio para tocar notas individualmente

### Visualizador de Acordes
- Diagramas SVG dos acordes do campo harmônico
- Navegação entre voicings (shapes) alternativos
- Base local de acordes com múltiplas posições

### Teclado Virtual
- Representação visual de piano/teclado com destaque das notas da escala

### Círculo de Escalas e Ciclo de Quintas
- Visualização circular interativa das relações entre escalas
- Ciclo de quintas com indicação da tonalidade ativa

### Metrônomo Digital
- Controle de BPM (20–300)
- Presets de andamento (Grave, Largo, Adagio, Andante, Allegro, Vivace, Presto, Prestissimo)
- Indicador visual de clique
- Áudio via Web Audio API

### Songsterr
- Integração com busca de tabs no Songsterr

## Tecnologias

- **HTML5 / CSS3 / JavaScript** — Vanilla, sem frameworks ou build step
- **Padrão IIFE** — Módulos encapsulados sem poluir escopo global
- **Web Audio API** — Áudio de metrônomo e notas
- **SVG** — Diagramas de acorde renderizados dinamicamente
- **Custom Events** — Comunicação desacoplada entre módulos (`scale-changed`)
- **GitHub Pages** — Deploy estático

## Estrutura do Projeto

```
musicpages/
├── index.html                  # Página única da aplicação
├── styles/
│   ├── style.css               # Estilos principais
│   ├── style-fretboard.css     # Estilos do fretboard
│   └── style-responsive.css    # Media queries e responsividade
├── scripts/
│   ├── script.js               # Inicialização e utilitários
│   ├── script-nav.js           # Menu de navegação
│   ├── script-escalas.js       # Motor de escalas e campo harmônico
│   ├── script-fretboard.js     # Renderização do fretboard
│   ├── script-metronome.js     # Metrônomo digital
│   ├── script-audio-engine.js  # Engine de áudio (Web Audio API)
│   ├── script-chord-diagrams.js # Visualizador de acordes SVG
│   ├── script-scale-circle.js  # Círculo de escalas
│   ├── script-circle-of-fifths.js # Ciclo de quintas
│   ├── script-keys.js          # Teclado virtual
│   ├── script-instrument-registry.js # Registro de instrumentos
│   ├── script-instrument-selector.js # Seletor de instrumento
│   ├── script-custom-tuning.js # Afinação customizada
│   ├── script-songsterr.js     # Integração Songsterr
│   └── script-tabinter.js      # Tabela de intervalos
├── tests/
│   └── cases/                  # Testes organizados por feature
├── img/                        # Imagens
└── package.json                # Dev dependencies (vitest, fast-check)
```

## Desenvolvimento

### Pré-requisitos

- Node.js (para rodar testes)
- Navegador moderno com suporte a Web Audio API

### Instalação

```bash
git clone https://github.com/prbretas/musicpages.git
cd musicpages
npm install
```

### Rodar localmente

Abra `index.html` diretamente no navegador ou use um servidor estático:

```bash
npx serve .
```

### Testes

```bash
npm test
```

Usa **vitest** com ambiente **jsdom** e **fast-check** para property-based testing.

## Roadmap

- [ ] Popups flutuantes para Metrônomo e Estrutura de Escalas
- [ ] Visualização de acordes no fretboard ao clicar no campo harmônico
- [ ] Shapes de escalas no fretboard (estilo CAGED) com cores por posição
- [ ] Persistência de voicing preferido por acorde

## Licença

Este projeto é de uso pessoal/educacional.
