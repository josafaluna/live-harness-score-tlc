---
name: add-calculation-case
description: >-
  Use when adding or changing a meeting cost calculation rule, validation
  edge case, or formula in calculateMeetingCost.
---

# Adicionar ou alterar caso de cálculo

Processo repetível para evoluir o domínio em `src/meetingCost.js` sem quebrar
a arquitetura da CLI.

## Quando usar

- Nova regra de validação (TypeError ou RangeError).
- Alteração da fórmula de `totalCost`.
- Ajuste de mensagem de erro de domínio.
- Caso de borda (zero, mínimo, não-finito, etc.).

## Passos

1. **Localize a mudança**
   - Regras e cálculo → `src/meetingCost.js` apenas.
   - Parsing/saída/USAGE → `src/index.js` apenas.
   - Nunca duplique validação de domínio na CLI.

2. **Defina o contrato do caso**
   - Entrada: valores de `participants`, `durationMinutes`, `hourlyRate`.
   - Resultado esperado: retorno com `totalCost`, ou `TypeError` / `RangeError`
     com mensagem clara em português.
   - Confirme se o caso reforça ou altera uma invariante existente.

3. **Implemente de forma mínima**
   - Mantenha `calculateMeetingCost` pura (sem I/O, sem `process`, sem `console`).
   - Preserve ESM (`export`/`import`).
   - Não adicione dependências de runtime.

4. **Cubra casos de borda explicitamente**
   - Tipo: `NaN`, `Infinity`, não-número → `TypeError`.
   - Faixa: `participants < 1`, `durationMinutes <= 0`, `hourlyRate < 0` →
     `RangeError`.
   - Limites válidos: `participants === 1`, duração fracionária positiva,
     `hourlyRate === 0` (custo total zero).
   - Fórmula: `hours = durationMinutes / 60`;
     `totalCost = participants * hours * hourlyRate`.

5. **Verifique com o que existe**
   - Siga `.agents/workflows/verify.md`.
   - Cubra o caso novo em `test/` quando alterar regra ou validação.
   - Rode `npm run check` (lint, typecheck e testes).
   - Smoke opcional da CLI: `npm start -- <participantes> <duracao_minutos> <custo_por_hora>`.

6. **Checklist antes de encerrar**
   - [ ] Domínio permanece puro e exportado.
   - [ ] CLI não ganhou regra de negócio.
   - [ ] Mensagens de erro em português e específicas ao campo.
   - [ ] `npm run check` passou.
