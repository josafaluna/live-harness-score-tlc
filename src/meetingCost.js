/**
 * Domínio: cálculo do custo total de mão de obra de uma reunião.
 *
 * Função pura: mesma entrada sempre produz a mesma saída, sem efeitos
 * colaterais (sem leitura de argv, sem console.log).
 */

/**
 * Calcula o custo total de mão de obra de uma reunião.
 *
 * @param {object} input
 * @param {number} input.participants - Número de participantes (>= 1).
 * @param {number} input.durationMinutes - Duração da reunião em minutos (> 0).
 * @param {number} input.hourlyRate - Custo por hora, por participante (>= 0).
 * @returns {{ participants: number, durationMinutes: number, hourlyRate: number, totalCost: number }}
 * @throws {TypeError} Se algum valor não for um número finito.
 * @throws {RangeError} Se algum valor estiver fora do intervalo permitido.
 */
export function calculateMeetingCost({ participants, durationMinutes, hourlyRate }) {
  assertFiniteNumber(participants, 'número de participantes');
  assertFiniteNumber(durationMinutes, 'duração em minutos');
  assertFiniteNumber(hourlyRate, 'custo por hora');

  if (participants < 1) {
    throw new RangeError('O número de participantes deve ser no mínimo 1.');
  }
  if (durationMinutes <= 0) {
    throw new RangeError('A duração da reunião deve ser maior que zero.');
  }
  if (hourlyRate < 0) {
    throw new RangeError('O custo por hora não pode ser negativo.');
  }

  const hours = durationMinutes / 60;
  const totalCost = participants * hours * hourlyRate;

  return { participants, durationMinutes, hourlyRate, totalCost };
}

function assertFiniteNumber(value, label) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`O valor de "${label}" deve ser um número finito.`);
  }
}
