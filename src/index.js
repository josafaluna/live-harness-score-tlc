#!/usr/bin/env node
/**
 * Ponto de entrada da CLI: leitura de argumentos e saída no terminal.
 * Toda a regra de negócio vive em meetingCost.js.
 */
import { calculateMeetingCost } from './meetingCost.js';

const USAGE =
  'Uso: npm start -- <participantes> <duracao_minutos> <custo_por_hora>\n' +
  'Exemplo: npm start -- 5 30 120';

function parseArgs(argv) {
  const [participantsRaw, durationRaw, hourlyRateRaw] = argv;

  if (participantsRaw === undefined || durationRaw === undefined || hourlyRateRaw === undefined) {
    throw new Error(`Argumentos insuficientes.\n${USAGE}`);
  }

  return {
    participants: Number(participantsRaw),
    durationMinutes: Number(durationRaw),
    hourlyRate: Number(hourlyRateRaw),
  };
}

function formatCurrency(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function printResult(result) {
  console.log('Resumo da reunião');
  console.log('-----------------');
  console.log(`Participantes:   ${result.participants}`);
  console.log(`Duração:         ${result.durationMinutes} min`);
  console.log(`Custo por hora:  ${formatCurrency(result.hourlyRate)}`);
  console.log(`Custo total:     ${formatCurrency(result.totalCost)}`);
}

function main() {
  try {
    const input = parseArgs(process.argv.slice(2));
    const result = calculateMeetingCost(input);
    printResult(result);
  } catch (error) {
    console.error(`Erro: ${error.message}`);
    process.exitCode = 1;
  }
}

main();
