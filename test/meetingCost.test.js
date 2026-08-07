import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { calculateMeetingCost } from '../src/meetingCost.js';

describe('calculateMeetingCost', () => {
  describe('cálculo válido', () => {
    it('calcula o custo total para entradas válidas', () => {
      const result = calculateMeetingCost({
        participants: 5,
        durationMinutes: 30,
        hourlyRate: 120,
      });

      assert.deepEqual(result, {
        participants: 5,
        durationMinutes: 30,
        hourlyRate: 120,
        totalCost: 300,
      });
    });

    it('permite hourlyRate zero com custo total zero', () => {
      const result = calculateMeetingCost({
        participants: 1,
        durationMinutes: 60,
        hourlyRate: 0,
      });

      assert.equal(result.totalCost, 0);
    });
  });

  describe('arredondamento', () => {
    it('preserva o resultado fracionário da fórmula sem arredondar', () => {
      const result = calculateMeetingCost({
        participants: 2,
        durationMinutes: 10,
        hourlyRate: 100,
      });

      // Mesma ordem da fórmula: participants * (durationMinutes / 60) * hourlyRate
      assert.equal(result.totalCost, 2 * (10 / 60) * 100);
      // Não arredonda para centavos
      assert.notEqual(result.totalCost, 33.33);
    });

    it('mantém precisão em duração fracionária positiva', () => {
      const result = calculateMeetingCost({
        participants: 3,
        durationMinutes: 0.5,
        hourlyRate: 80,
      });

      // 3 * (0.5 / 60) * 80 = 2
      assert.equal(result.totalCost, 2);
    });
  });

  describe('intervalos inválidos', () => {
    it('rejeita participantes menores que 1', () => {
      assert.throws(
        () =>
          calculateMeetingCost({
            participants: 0,
            durationMinutes: 30,
            hourlyRate: 120,
          }),
        (error) => {
          assert.ok(error instanceof RangeError);
          assert.match(error.message, /participantes/);
          return true;
        },
      );
    });

    it('rejeita duração menor ou igual a zero', () => {
      assert.throws(
        () =>
          calculateMeetingCost({
            participants: 2,
            durationMinutes: 0,
            hourlyRate: 50,
          }),
        (error) => {
          assert.ok(error instanceof RangeError);
          assert.match(error.message, /duração/i);
          return true;
        },
      );
    });

    it('rejeita custo por hora negativo', () => {
      assert.throws(
        () =>
          calculateMeetingCost({
            participants: 2,
            durationMinutes: 30,
            hourlyRate: -1,
          }),
        (error) => {
          assert.ok(error instanceof RangeError);
          assert.match(error.message, /custo por hora/i);
          return true;
        },
      );
    });
  });

  describe('entradas não finitas', () => {
    it('rejeita NaN', () => {
      assert.throws(
        () =>
          calculateMeetingCost({
            participants: Number.NaN,
            durationMinutes: 30,
            hourlyRate: 120,
          }),
        (error) => {
          assert.ok(error instanceof TypeError);
          assert.match(error.message, /número finito/);
          return true;
        },
      );
    });

    it('rejeita Infinity', () => {
      assert.throws(
        () =>
          calculateMeetingCost({
            participants: 2,
            durationMinutes: Number.POSITIVE_INFINITY,
            hourlyRate: 120,
          }),
        (error) => {
          assert.ok(error instanceof TypeError);
          assert.match(error.message, /número finito/);
          return true;
        },
      );
    });

    it('rejeita valores que não são number', () => {
      assert.throws(
        () =>
          calculateMeetingCost({
            // @ts-expect-error — entrada inválida intencional para o teste
            participants: '5',
            durationMinutes: 30,
            hourlyRate: 120,
          }),
        (error) => {
          assert.ok(error instanceof TypeError);
          assert.match(error.message, /número finito/);
          return true;
        },
      );
    });
  });
});
