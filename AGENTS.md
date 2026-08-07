# AGENTS.md

Este arquivo existe para orientar qualquer agente de código (humano ou IA) que
for trabalhar neste repositório. Leia-o por completo antes de propor ou
aplicar qualquer alteração. Este documento descreve o produto, a estrutura
real do repositório, os comandos que realmente existem hoje, as invariantes de
domínio extraídas do código-fonte, as restrições de módulos e dependências, as
expectativas de validação e tratamento de erros, os limites de segurança e as
ações que este agente não deve executar sob nenhuma circunstância.

## Visão geral do produto

Este repositório contém o **Meeting Cost CLI**, uma ferramenta de linha de
comando em Node.js cujo único propósito é calcular o custo total de mão de
obra de uma reunião. O produto recebe três valores pela linha de comando: o
número de participantes, a duração da reunião em minutos e o custo por hora
por participante. A partir desses três valores, o produto calcula e imprime no
terminal o custo total da reunião, formatado como moeda brasileira (BRL).

Em outras palavras, o produto responde a uma única pergunta de negócio:
"quanto custou (ou vai custar) esta reunião em termos de mão de obra?". Não há
persistência de dados, não há banco de dados, não há servidor HTTP, não há
autenticação e não há integração com serviços externos. O produto é
deliberadamente pequeno: uma função de domínio pura que calcula o custo e um
ponto de entrada de CLI que lê argumentos e imprime o resultado.

Repetindo por clareza: o produto é uma calculadora de custo de reunião via
linha de comando, nada mais. Não assuma que existam outras funcionalidades,
como exportação para arquivo, relatórios, dashboards ou qualquer forma de
persistência. Essas funcionalidades não existem no código-fonte atual e não
devem ser inventadas em documentação.

## Estrutura real do repositório

A estrutura abaixo reflete exatamente o que existe hoje no repositório, sem
adicionar arquivos hipotéticos ou planejados:

- `package.json`: manifesto do pacote npm. Define o nome (`meeting-cost-cli`),
  a versão, o tipo de módulo (`"type": "module"`, ou seja, ESM), o ponto de
  entrada (`src/index.js`), o binário (`meeting-cost`), o único script npm
  disponível (`start`) e o requisito de engine (`node >= 24`).
- `src/index.js`: ponto de entrada da CLI. Responsável exclusivamente por ler
  os argumentos de linha de comando (`process.argv`), converter valores para
  número, chamar a função de domínio e imprimir o resultado ou o erro no
  terminal.
- `src/meetingCost.js`: módulo de domínio. Contém a função pura e exportada
  `calculateMeetingCost`, que implementa a validação de regras de negócio e o
  cálculo do custo total. Esta função não lê `process.argv` e não usa
  `console.log`; ela apenas recebe um objeto e retorna um objeto ou lança um
  erro.
- `PROJETO.md`: descrição curta do projeto, arquitetura resumida, regras de
  validação e exemplo de uso.
- `README.md`: guia do tutorial de harness engineering associado a este
  repositório. Não é documentação funcional do produto em si.
- `LICENSE`: licença MIT do projeto.

Não existe, no momento, nenhum dos seguintes itens neste repositório:
diretório `test/` ou `tests/`, arquivo `package-lock.json`, diretório
`node_modules/`, arquivo `.gitignore`, configuração de lint, configuração de
formatação, configuração de typecheck, diretório `.github/` com workflows de
CI, diretório `.agents/` com rules, skills ou workflows, diretório `.cursor/`
com hooks, e nenhuma configuração de MCP. Se qualquer um desses itens for
necessário, ele deve ser criado explicitamente em uma etapa própria, e não
como efeito colateral de uma tarefa não relacionada.

## Comandos que realmente existem hoje

O único script npm definido em `package.json` é:

```bash
npm start -- <participantes> <duracao_minutos> <custo_por_hora>
```

Exemplo real de uso, conforme documentado em `PROJETO.md`:

```bash
npm start -- 5 30 120
```

Não existem, hoje, os comandos `npm test`, `npm run lint`, `npm run format`,
`npm run typecheck` ou `npm run check`, porque não há testes, linter,
formatter ou verificador de tipos configurados neste repositório. Não invente
esses comandos em respostas, commits ou documentação até que eles sejam
efetivamente adicionados ao `package.json`. Se for necessário executar o
programa diretamente sem passar pelo script npm, o comando equivalente é
`node src/index.js <participantes> <duracao_minutos> <custo_por_hora>`, já que
`main` e `bin` em `package.json` apontam para `src/index.js`.

## Invariantes de domínio derivadas do código-fonte

As regras abaixo foram lidas diretamente de `src/meetingCost.js` e devem ser
tratadas como a fonte da verdade sobre o comportamento do domínio:

- Os três valores de entrada (`participants`, `durationMinutes`,
  `hourlyRate`) devem ser números finitos. Qualquer valor que não seja do
  tipo `number` ou que não passe `Number.isFinite` faz a função lançar um
  `TypeError` com uma mensagem identificando qual campo falhou.
- O número de participantes deve ser no mínimo 1. Valores menores que 1 fazem
  a função lançar um `RangeError`.
- A duração da reunião em minutos deve ser estritamente maior que zero.
  Valores menores ou iguais a zero fazem a função lançar um `RangeError`.
- O custo por hora não pode ser negativo. Valores negativos fazem a função
  lançar um `RangeError`. O valor zero é permitido.
- O cálculo do custo total segue a fórmula: horas = duração em minutos
  dividida por 60; custo total = participantes multiplicado pelas horas
  multiplicado pelo custo por hora.
- A função `calculateMeetingCost` é pura: para a mesma entrada, ela sempre
  produz a mesma saída, sem efeitos colaterais, sem leitura de `process.argv`
  e sem chamadas a `console.log` ou `console.error`.

Para reforçar: as invariantes de validação (número finito, participantes >= 1,
duração > 0, custo por hora >= 0) já estão implementadas em
`src/meetingCost.js` e não devem ser duplicadas de forma divergente em
`src/index.js` ou em qualquer outro arquivo. Se uma nova regra de validação
for necessária, ela deve ser adicionada dentro da função de domínio, e não no
ponto de entrada da CLI.

## Restrições de ESM e dependências

Este projeto usa exclusivamente ECMAScript Modules (ESM), conforme declarado
por `"type": "module"` em `package.json`. Isso significa:

- Use `import`/`export`, nunca `require`/`module.exports`, em qualquer novo
  arquivo `.js` adicionado a este repositório.
- Não há nenhuma dependência de runtime declarada em `package.json`. O código
  usa apenas recursos nativos do Node.js (por exemplo, `process.argv`,
  `Number`, `toLocaleString`). Não adicione dependências de runtime sem uma
  necessidade explícita e justificada.
- O requisito de engine é Node.js 24 ou superior (`"engines": { "node":
  ">=24" }`). Não assuma compatibilidade com versões mais antigas do Node.js.
- Não existe `package-lock.json` no repositório neste momento. Se
  dependências forem adicionadas no futuro, um lockfile deve acompanhar essa
  mudança para garantir instalações reproduzíveis.
- Repetindo a restrição principal: ESM obrigatório, zero dependências de
  runtime hoje, Node.js >= 24. Qualquer código novo deve respeitar essas três
  condições simultaneamente.

## Expectativas de validação e tratamento de erros

O padrão de tratamento de erros já estabelecido no código-fonte é:

- Erros de tipo (valor não numérico ou não finito) devem ser sinalizados com
  `TypeError`.
- Erros de intervalo/regra de negócio (participantes < 1, duração <= 0, custo
  por hora < 0) devem ser sinalizados com `RangeError`.
- O ponto de entrada (`src/index.js`) captura qualquer erro lançado pela
  função de domínio dentro de um bloco `try/catch`, imprime uma mensagem
  amigável no formato `Erro: <mensagem>` via `console.error` e define
  `process.exitCode = 1`. Ele não usa `process.exit()` diretamente.
- Mensagens de erro devem ser claras, específicas sobre qual campo falhou e
  escritas em português, seguindo o padrão já usado em
  `src/meetingCost.js` e `src/index.js`.
- Entradas insuficientes na linha de comando (menos de três argumentos)
  devem gerar uma mensagem de erro que inclua o texto de uso (`USAGE`),
  como já implementado em `parseArgs`.

Vale reforçar novamente: toda validação de regra de negócio pertence à função
de domínio pura em `src/meetingCost.js`, nunca ao ponto de entrada da CLI. O
ponto de entrada apenas converte texto em número com `Number(...)` e delega a
validação de domínio para a função `calculateMeetingCost`.

## Limites de segurança

Este é um programa de linha de comando local, sem rede, sem banco de dados e
sem armazenamento de credenciais. Ainda assim, observe os seguintes limites:

- Nunca adicione leitura de variáveis de ambiente sensíveis, chamadas de rede,
  chamadas de sistema de arquivos fora do necessário, ou execução de comandos
  de shell dentro do código-fonte do produto sem justificativa explícita e
  aprovação do usuário.
- Nunca commite segredos, tokens, chaves de API ou credenciais neste
  repositório, mesmo em exemplos ou testes futuros.
- Não introduza dependências de runtime sem necessidade comprovada; cada
  dependência nova é uma superfície de ataque adicional e um ponto de falha
  adicional na cadeia de suprimentos.
- Trate toda entrada do usuário (argumentos de linha de comando) como não
  confiável até que passe pela validação existente em
  `src/meetingCost.js`.

## Ações que este agente não pode executar

Para preservar o escopo controlado deste repositório, este agente não deve:

- Criar arquivos de teste, configuração de lint, configuração de formatação
  ou configuração de typecheck, a menos que explicitamente solicitado.
- Criar workflows de CI, arquivos `.github/workflows/`, hooks do Cursor,
  rules, skills, sensores ou configuração de MCP, a menos que explicitamente
  solicitado.
- Alterar `package.json`, `README.md`, `PROJETO.md` ou `LICENSE` sem
  solicitação explícita.
- Adicionar dependências de runtime sem necessidade explícita e justificada.
- Fazer commit de alterações automaticamente. Toda mudança deve ser revisada
  pelo usuário antes de qualquer commit.
- Inventar comandos npm que não existem em `package.json`, como `npm test`,
  `npm run lint` ou `npm run check`, até que sejam de fato adicionados.
- Duplicar ou contradizer as invariantes de validação já existentes em
  `src/meetingCost.js` ao escrever documentação ou código novo.

## Checklist de conclusão

Antes de considerar qualquer tarefa neste repositório como concluída,
verifique:

- [ ] O comando `npm start -- <participantes> <duracao_minutos> <custo_por_hora>`
      ainda funciona como esperado, com uma entrada válida de exemplo.
- [ ] As invariantes de domínio (números finitos, participantes >= 1, duração
      > 0, custo por hora >= 0) continuam implementadas e não foram
      relaxadas ou removidas.
- [ ] A função `calculateMeetingCost` permanece pura, exportada e livre de
      efeitos colaterais.
- [ ] O código continua usando exclusivamente ESM (`import`/`export`).
- [ ] Nenhuma dependência de runtime foi adicionada sem justificativa
      explícita.
- [ ] Nenhum arquivo fora do escopo solicitado (`package.json`, `README.md`,
      `PROJETO.md`, `LICENSE`, testes, CI, hooks, rules, skills, MCP) foi
      criado ou alterado sem pedido explícito.
- [ ] Nenhum segredo, token ou credencial foi introduzido no repositório.
- [ ] Nenhum commit foi criado automaticamente; a revisão do diff foi deixada
      para o usuário.
- [ ] As mensagens de erro continuam claras, específicas e no formato
      `Erro: <mensagem>` no ponto de entrada da CLI.
