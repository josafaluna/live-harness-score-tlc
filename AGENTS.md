# AGENTS.md

Leia este arquivo antes de alterar o repositório.

## Produto

**Meeting Cost CLI** (Node.js >= 24, ESM): calcula o custo de mão de obra de
uma reunião a partir de participantes, duração (minutos) e custo por hora.
Sem persistência, HTTP, autenticação ou integrações. Não invente features.

## Estrutura

| Caminho | Papel |
|---------|--------|
| `src/index.js` | CLI (argv, saída, erros) — sem regras de negócio |
| `src/meetingCost.js` | Domínio puro: `calculateMeetingCost` |
| `test/` | Testes com o runner nativo do Node.js |
| `.agents/rules/` | Rules com escopo de caminho |
| `.agents/skills/` | Skills acionáveis sob demanda |
| `.agents/workflows/` | Workflows explícitos (ex.: verificação) |

## Comandos reais

```bash
npm start -- <participantes> <duracao_minutos> <custo_por_hora>
# ex.: npm start -- 5 30 120

npm test
npm run lint
npm run format
npm run typecheck
npm run check
```

`check` executa lint, typecheck e testes. Para o fluxo de verificação, use
`.agents/workflows/verify.md`.

## Harness

- Ao editar `src/**`, siga a rule em `.agents/rules/`.
- Ao adicionar/alterar regra de cálculo, use
  `.agents/skills/add-calculation-case/`.
- Após mudanças, execute o workflow de verificação.

## Limites

- Zero dependências de runtime sem justificativa explícita; se adicionar,
  inclua lockfile na mesma mudança.
- Não crie hooks, MCP, subagentes, pre-commit ou o workflow do Harness Score
  sem pedido explícito.
- Não altere `package.json`, `README.md`, `PROJETO.md` ou `LICENSE` sem pedido.
- Não faça commit automático.
- Erros na CLI: `Erro: <mensagem>` em stderr e `process.exitCode = 1`.
