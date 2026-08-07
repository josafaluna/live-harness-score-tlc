---
description: Verificação do Meeting Cost CLI usando somente comandos que existem no repositório
---

# Workflow de verificação

Execute somente comandos declarados em `package.json` ou invocação direta do
entrypoint. Não invente scripts.

## Sensores disponíveis

| Sensor | Comando | Status |
|--------|---------|--------|
| Execução CLI | `npm start -- <participantes> <duracao_minutos> <custo_por_hora>` | Disponível |
| Entrypoint | `node src/index.js <participantes> <duracao_minutos> <custo_por_hora>` | Disponível |
| Testes automatizados | `npm test` | Disponível |
| Lint | `npm run lint` | Disponível |
| Typecheck | `npm run typecheck` | Disponível |
| Format | `npm run format` | Disponível |
| Suite completa | `npm run check` | Disponível (`lint` + `typecheck` + `test`) |

## Passos

1. Rode a suite de feedback:
   ```bash
   npm run check
   ```
2. Smoke de sucesso (opcional, se a CLI mudou):
   ```bash
   npm start -- 5 30 120
   ```
   Esperado: resumo com custo total `R$ 300,00` e exit code 0.
3. Smoke de erro (opcional, se parsing/erros mudaram):
   ```bash
   npm start -- 0 30 120
   ```
   Esperado: `Erro: ...` via stderr e exit code ≠ 0.
4. Se alterou formatação ou tipagem isoladamente, use `npm run format`,
   `npm run lint` ou `npm run typecheck` conforme o caso.

## Critério de conclusão

- `npm run check` passou (ou falhas foram corrigidas).
- Nenhuma dependência de runtime adicionada sem pedido explícito.
