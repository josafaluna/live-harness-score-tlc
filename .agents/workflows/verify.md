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
| Testes automatizados | `npm test` | Pendente — script inexistente |
| Lint | `npm run lint` | Pendente — script inexistente |
| Typecheck | `npm run typecheck` | Pendente — script inexistente |
| Format | `npm run format` | Pendente — script inexistente |

## Passos

1. Confirme em `package.json` que o único script é `start`.
2. Smoke de sucesso:
   ```bash
   npm start -- 5 30 120
   ```
   Esperado: resumo com custo total `R$ 300,00` e exit code 0.
3. Smoke de argumentos insuficientes:
   ```bash
   npm start -- 5 30
   ```
   Esperado: `Erro: ...` contendo `USAGE` e `process.exitCode = 1`.
4. Smoke de regra de domínio (ex.: participantes inválidos):
   ```bash
   npm start -- 0 30 120
   ```
   Esperado: `Erro: ...` via stderr e exit code ≠ 0.
5. Se a mudança alterou fórmula ou validação, repita smokes cobrindo o caso
   novo (sucesso e falha).
6. Registre explicitamente que testes, lint e typecheck estão **pendentes**
   quando não houver scripts correspondentes — não os execute.

## Critério de conclusão

- Smokes com comandos existentes passaram (ou falhas foram corrigidas).
- Sensores ausentes listados como pendentes, sem comandos inventados.
- Nenhuma dependência de runtime adicionada sem pedido explícito.
