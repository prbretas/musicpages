# Requirements Document

## Introduction

Esta feature transforma os painéis do Metrônomo e da Estrutura de Escalas em popups flutuantes e arrastáveis, liberando espaço na tela principal. Os popups são acessíveis pelo menu de navegação, podem ser movidos livremente pela viewport, e mantêm a sincronização completa com os demais componentes da aplicação (fretboard, círculo de escalas, campo harmônico, etc.).

## Glossary

- **Popup_Flutuante**: Janela sobreposta ao conteúdo da página, com posição absoluta ou fixa, que pode ser movida pelo usuário via drag-and-drop.
- **Menu_Navegacao**: Barra de navegação no topo da página (`header-nav`) com links para as seções e controles de abertura dos popups.
- **Painel_Metronomo**: Componente visual do metrônomo digital contendo controles de BPM, botão iniciar/parar, presets e indicador de clique.
- **Painel_Estrutura_Escalas**: Componente visual que exibe a tabela geral de estruturas de escalas (intervalos em semitons) para todas as escalas disponíveis.
- **Area_Arraste**: Região do cabeçalho do popup (barra de título) utilizada como ponto de contato para iniciar o arraste.
- **Escala_Selecionada**: A escala atualmente ativa no seletor de tipo de escala (`#tipoEscala`), que determina o destaque visual na tabela de estruturas.
- **Sincronizacao**: Mecanismo pelo qual mudanças de tônica, escala ou tonalidade propagam atualizações para todos os componentes conectados (fretboard, teclado virtual, círculo de escalas, campo harmônico e popups).

## Requirements

### Requisito 1: Sistema de Popup Flutuante Genérico

**User Story:** Como desenvolvedor, eu quero um sistema reutilizável de popups flutuantes, para que novos painéis possam ser facilmente convertidos em popups sem duplicar lógica.

#### Critérios de Aceitação

1. THE Popup_Flutuante SHALL renderizar como uma janela sobreposta ao conteúdo da página com `position: fixed` e `z-index` mínimo de 1000.
2. THE Popup_Flutuante SHALL conter uma Area_Arraste no topo com o título do painel e um botão de fechar, com altura mínima de 32px.
3. WHEN o usuário pressionar e arrastar a Area_Arraste (via mouse ou toque), THE Popup_Flutuante SHALL acompanhar o movimento do ponteiro reposicionando-se na tela em tempo real, sem atraso perceptível (a cada frame de renderização).
4. WHEN o usuário soltar o botão do mouse (ou encerrar o toque) após arrastar, THE Popup_Flutuante SHALL permanecer na última posição registrada até ser movido novamente ou fechado.
5. WHEN o Popup_Flutuante for arrastado para além dos limites da viewport, THE Popup_Flutuante SHALL restringir a posição para que no mínimo 32px de altura da Area_Arraste permaneçam visíveis dentro da viewport.
6. WHEN o usuário clicar no botão de fechar do Popup_Flutuante, THE Popup_Flutuante SHALL ser ocultado (display: none ou remoção do DOM) e nenhum espaço reservado deverá ser mantido no layout da página.
7. WHEN a página for carregada, THE Popup_Flutuante SHALL iniciar em estado oculto (não visível e sem ocupar espaço no layout).
8. WHEN múltiplos Popup_Flutuante estiverem abertos e o usuário clicar ou arrastar um deles, THE Popup_Flutuante clicado SHALL ser trazido para frente dos demais incrementando seu `z-index` acima dos outros popups abertos.
9. IF a viewport for redimensionada enquanto o Popup_Flutuante estiver visível e sua posição ficar fora dos novos limites, THEN THE Popup_Flutuante SHALL reposicionar-se para que pelo menos 32px da Area_Arraste permaneçam visíveis na nova viewport.

### Requisito 2: Popup do Metrônomo

**User Story:** Como músico, eu quero acessar o metrônomo como um popup flutuante pelo menu, para que ele não ocupe espaço fixo na tela e eu possa posicioná-lo onde for conveniente.

#### Critérios de Aceitação

1. WHEN o usuário clicar no item "Metrônomo" no Menu_Navegacao, THE Popup_Flutuante SHALL exibir o Painel_Metronomo como popup flutuante com posição centralizada na viewport, contendo um botão de fechar visível no canto superior direito do popup.
2. WHEN o usuário clicar no item "Metrônomo" no Menu_Navegacao enquanto o Popup_Flutuante já estiver visível, THE Popup_Flutuante SHALL fechar o popup do metrônomo (comportamento toggle).
3. THE Painel_Metronomo SHALL manter todos os controles existentes (input numérico de BPM com intervalo 20–300, botão iniciar/parar, 8 botões de presets de andamento, display de BPM e indicador visual de clique) dentro do popup.
4. WHILE o Painel_Metronomo estiver em modo popup, THE Painel_Metronomo SHALL permitir que o usuário arraste o popup pela sua barra de título para reposicioná-lo livremente dentro dos limites da viewport.
5. WHILE o Painel_Metronomo estiver em modo popup, THE Painel_Metronomo SHALL manter o funcionamento do áudio (Web Audio API) independentemente da posição do popup na tela.
6. IF o metrônomo estiver tocando WHEN o usuário fechar o Popup_Flutuante (via botão fechar ou toggle do menu), THEN THE Painel_Metronomo SHALL parar a reprodução do áudio e retornar o botão iniciar/parar ao estado inicial ("▶ Iniciar").
7. THE Painel_Metronomo SHALL ser removido da posição fixa original no fluxo do HTML (seção `#metronomeContainer` dentro de `.container`) e exibido exclusivamente via popup.

### Requisito 3: Popup da Estrutura de Escalas

**User Story:** Como músico, eu quero visualizar a tabela de estruturas de escalas em um popup flutuante com destaque na escala selecionada, para que eu possa consultá-la rapidamente sem perder espaço na tela.

#### Critérios de Aceitação

1. WHEN o usuário clicar no item "Estruturas de Escalas" no Menu_Navegacao, THE Popup_Flutuante SHALL exibir o Painel_Estrutura_Escalas como popup flutuante centralizado na viewport, sobrepondo o conteúdo da página.
2. THE Painel_Estrutura_Escalas SHALL exibir a tabela geral de estruturas de escalas contendo uma linha para cada escala definida no objeto `estruturasEscalas`, com o nome da escala e seus intervalos em semitons.
3. WHEN o Popup_Flutuante estiver visível e o valor do seletor `#tipoEscala` corresponder a uma escala na tabela, THE Painel_Estrutura_Escalas SHALL destacar a linha correspondente aplicando uma cor de fundo diferenciada que a distingua das demais linhas.
4. WHEN o usuário alterar a seleção no seletor `#tipoEscala` enquanto o Popup_Flutuante estiver visível, THE Painel_Estrutura_Escalas SHALL remover o destaque da linha anterior e aplicar o destaque na nova linha correspondente à Escala_Selecionada.
5. THE Painel_Estrutura_Escalas SHALL ser removido da posição fixa original no fluxo do HTML (seção `#tabelaGeralEscalasResultado` e o título/parágrafo associados à "Estruturas de Escalas").
6. WHEN o usuário clicar fora do Popup_Flutuante ou pressionar a tecla Escape, THE Popup_Flutuante SHALL ser fechado e removido da visualização.
7. WHEN o Popup_Flutuante for exibido, THE Popup_Flutuante SHALL incluir um botão de fechar visível no canto superior direito com rótulo acessível indicando a ação de fechamento.

### Requisito 4: Integração com Menu de Navegação

**User Story:** Como usuário, eu quero acessar os popups do metrônomo e da estrutura de escalas pelo menu de navegação, para que eu tenha um ponto de acesso claro e consistente.

#### Critérios de Aceitação

1. THE Menu_Navegacao SHALL conter um item de menu para abrir o Popup_Flutuante do Painel_Metronomo com ícone ou texto identificável.
2. THE Menu_Navegacao SHALL conter um item de menu para abrir o Popup_Flutuante do Painel_Estrutura_Escalas com ícone ou texto identificável.
3. WHEN o popup correspondente já estiver visível e o usuário clicar novamente no item do menu, THE Popup_Flutuante SHALL ser trazido para o foco (z-index superior) sem criar uma nova instância.
4. WHILE um Popup_Flutuante estiver aberto, THE Menu_Navegacao SHALL indicar visualmente que o popup está ativo aplicando uma classe CSS distinta (ex: `active`) ao item de menu correspondente.

### Requisito 5: Sincronização entre Componentes

**User Story:** Como músico, eu quero que a seleção de tônica e escala continue sincronizada com todos os componentes, incluindo os popups, para que eu tenha uma experiência coesa ao estudar teoria musical.

#### Critérios de Aceitação

1. WHEN o evento `scale-changed` for disparado com um `tipoEscala` no detail, THE Painel_Estrutura_Escalas SHALL remover o destaque da linha anteriormente destacada e aplicar o destaque visual na linha correspondente ao novo `tipoEscala`, em no máximo 500ms após o recebimento do evento.
2. WHILE o Popup_Flutuante do Painel_Estrutura_Escalas estiver aberto no momento do evento `scale-changed`, THE Painel_Estrutura_Escalas SHALL atualizar o destaque visual imediatamente sem necessidade de fechar e reabrir o popup.
3. IF o Popup_Flutuante do Painel_Estrutura_Escalas estiver fechado no momento do evento `scale-changed`, THEN THE Painel_Estrutura_Escalas SHALL armazenar o valor de `tipoEscala` recebido e aplicar o destaque correto na próxima vez que o popup for aberto.
4. WHEN o evento `scale-changed` for disparado com um `tipoEscala` que não corresponde a nenhuma linha da tabela de estruturas, THE Painel_Estrutura_Escalas SHALL remover qualquer destaque existente sem aplicar novo destaque.

### Requisito 6: Responsividade e Acessibilidade

**User Story:** Como usuário em dispositivo móvel, eu quero que os popups se adaptem a telas menores, para que eu consiga utilizá-los confortavelmente em qualquer dispositivo.

#### Critérios de Aceitação

1. WHILE a viewport tiver largura inferior a 768px, THE Popup_Flutuante SHALL ocupar 100% da largura da tela com uma altura máxima de 80% da viewport.
2. WHILE a viewport tiver largura inferior a 768px, THE Popup_Flutuante SHALL ser posicionado na parte inferior da tela em formato de painel deslizante (bottom sheet) com uma animação de entrada de no máximo 300ms, ao invés de flutuante livre.
3. WHEN o usuário pressionar a tecla Tab com o Popup_Flutuante aberto, THE Popup_Flutuante SHALL mover o foco entre os elementos interativos internos do popup de forma cíclica (focus trap), impedindo que o foco saia para elementos fora do popup.
4. WHEN o usuário pressionar a tecla Escape com o Popup_Flutuante aberto, THE Popup_Flutuante SHALL fechar o popup e retornar o foco ao elemento que o acionou.
5. THE Popup_Flutuante SHALL conter os atributos ARIA `role="dialog"`, `aria-label` com descrição do conteúdo, e `aria-modal="true"` para leitores de tela.
6. THE Popup_Flutuante SHALL herdar as variáveis de cor do tema ativo (claro ou escuro) da aplicação, mantendo contraste mínimo de 4.5:1 entre texto e fundo conforme WCAG 2.1 nível AA.
7. WHILE o Popup_Flutuante estiver aberto, THE Popup_Flutuante SHALL impedir a rolagem do conteúdo de fundo (body scroll lock).

### Requisito 7: Suporte a Interação por Toque

**User Story:** Como usuário em dispositivo com tela sensível ao toque, eu quero arrastar os popups usando gestos de toque, para que a experiência seja equivalente ao uso com mouse.

#### Critérios de Aceitação

1. WHEN o usuário tocar e arrastar a Area_Arraste em dispositivo touch, THE Popup_Flutuante SHALL acompanhar a posição do primeiro dedo em contato, atualizando sua posição na tela a cada evento de movimento registrado.
2. WHILE o usuário estiver arrastando o Popup_Flutuante por toque, THE Popup_Flutuante SHALL impedir o scroll da página e qualquer gesto de navegação do navegador (como pull-to-refresh) até que o dedo seja levantado.
3. WHEN o usuário levantar o dedo após arrastar o Popup_Flutuante por toque, THE Popup_Flutuante SHALL permanecer na última posição registrada e respeitar as mesmas restrições de limite de viewport definidas para o arraste por mouse (Area_Arraste visível).
4. IF múltiplos toques simultâneos forem detectados sobre a Area_Arraste, THEN THE Popup_Flutuante SHALL considerar apenas o primeiro ponto de contato para o cálculo de posição, ignorando toques adicionais.
5. WHEN o toque iniciar sobre elementos interativos dentro do Popup_Flutuante (botões, inputs, sliders) que não sejam a Area_Arraste, THE Popup_Flutuante SHALL não iniciar o arraste, permitindo a interação normal com o elemento tocado.
