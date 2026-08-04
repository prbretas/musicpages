# Casos de Teste (pasta `tests`)

Este README explica como organizar e executar os casos de teste do projeto.

Estrutura proposta
- `tests/cases/` — coloque aqui todos os arquivos de testes (ex.: `*.spec.js`).
- `tests/README.md` — este arquivo com instruções.

Passo a passo para executar os testes (Windows)

1) Instale o Node.js (versão LTS recomendada).
   - https://nodejs.org/

2) Inicialize `package.json` se ainda não existir (executar no diretório raiz do projeto):

```powershell
npm init -y
```

3) Instale o Vitest como dependência de desenvolvimento:

```powershell
npm install -D vitest
```

Se os testes precisarem do DOM (ex.: manipulação de `document`), instale também `jsdom`:

```powershell
npm install -D jsdom
```

4) Adicione um script de teste em `package.json` (opcional):

```json
"scripts": {
  "test": "vitest"
}
```

5) Executar os testes:

- Rodar todos os testes uma vez:
```powershell
npx vitest run
```

- Rodar em modo watch / com interface interativa:
```powershell
npx vitest
```

- Rodar um arquivo de teste específico:
```powershell
npx vitest tests/cases/example.spec.js
```

Observações importantes
- Se o projeto já tiver um `vitest.config.js`, o Vitest usará essa configuração automaticamente.
- Para mover testes existentes: coloque os arquivos `*.spec.js` dentro de `tests/cases/` e atualize caminhos de importação relativos conforme necessário.
- Se preferir rodar via `npm test`, use o script `test` em `package.json` conforme acima.

Exemplo mínimo de arquivo de teste
- `tests/cases/example.spec.js` contém um teste trivial que garante que o runner está funcionando.

Se quiser, eu posso:
- mover os testes existentes (se houver) para `tests/cases/`;
- adicionar um `package.json` mínimo com script de teste;
- ou executar os testes aqui (se `node` e dependências estiverem instalados no ambiente).
