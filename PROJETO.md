# Meeting Cost CLI

CLI mínima em Node.js 24 (ESM, apenas recursos nativos) que calcula o custo
total de mão de obra de uma reunião a partir do número de participantes, da
duração em minutos e do custo por hora.

## Arquitetura

- `src/meetingCost.js`: função de domínio pura e exportada (`calculateMeetingCost`),
  responsável pela validação das regras de negócio e pelo cálculo.
- `src/index.js`: ponto de entrada da CLI, responsável apenas por ler os
  argumentos da linha de comando e exibir o resultado (ou erro) no terminal.

## Regras de validação

- Todos os valores devem ser números finitos.
- Número de participantes deve ser no mínimo 1.
- Duração da reunião (minutos) deve ser maior que zero.
- Custo por hora não pode ser negativo.

## Uso

```bash
npm start -- <participantes> <duracao_minutos> <custo_por_hora>
```

### Exemplo

```bash
npm start -- 5 30 120
```

Saída:

```
Resumo da reunião
-----------------
Participantes:   5
Duração:         30 min
Custo por hora:  R$ 120,00
Custo total:     R$ 300,00
```
