# Convenção de Workflow Git & CI/CD

Esta convenção é obrigatória para todo trabalho de desenvolvimento no MusicPages.

## Fluxo de desenvolvimento

1. **Nunca commitar direto na `main`.** Toda mudança nasce em uma branch.
2. **Criar branch a partir da `main` atualizada** antes de iniciar qualquer desenvolvimento:
   - Features: `feature/<descrição-curta>`
   - Correções: `fix/<descrição-curta>`
   - Experimentos/estudo: `chore/<descrição-curta>` ou `spike/<descrição-curta>`
3. **Desenvolver na branch**, commitando em incrementos pequenos e descritivos.
4. **Rodar os testes localmente** (`npm test`) antes de abrir o PR. Todos devem passar.
5. **Push da branch** com `git push -u origin <branch>`.
6. **Abrir Pull Request** para a `main` (via `gh pr create`).
   - Título conciso (< 70 caracteres).
   - Descrição com: resumo das mudanças, o que foi testado, pendências/limitações.
7. **CI deve passar** no PR (ver seção CI/CD). PR não é mergeado com CI vermelho.
8. **Merge** só após CI verde e revisão. Preferir merge do PR pela interface/`gh`.

## Convenção de commits

- Mensagens no imperativo e descritivas (ex.: `fix: corrige voicing de Cmaj7 no LocalChordDB`).
- Prefixos sugeridos: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`.
- Preferir `git add <arquivos específicos>` a `git add .` para evitar commits acidentais.
- Nunca commitar segredos (`.env`, credenciais, tokens).

## Segurança git

- Não usar operações destrutivas (`push --force`, `reset --hard`, `clean -f`, `branch -D`) sem
  pedido explícito.
- Não pular hooks (`--no-verify`) salvo pedido explícito.
- Não alterar `git config`.
- Preferir novos commits a `--amend` em trabalho já publicado.

## CI/CD (GitHub Actions)

- O workflow em `.github/workflows/ci.yml` roda `npm ci` + `npm test` em todo push e PR para `main`.
- O deploy é via **GitHub Pages** (site estático servido da `main`).
- Um PR só é elegível para merge com o job de CI verde.

## Testes

- Stack: **vitest** (ambiente **jsdom**) + **fast-check** (property-based testing).
- Rodar com `npm test`.
- Padrão de nomes: `*.property.spec.js` (property-based), `*.unit.spec.js` (exemplos/edge cases).
- Testes ficam em `tests/cases/<feature>/`.
