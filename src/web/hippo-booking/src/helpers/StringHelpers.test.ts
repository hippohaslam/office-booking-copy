import { describe, expect } from 'vitest';
import { isNullOrEmpty } from './StringHelpers';

describe('isNullOrEmpty', () => {
    const testCases: { input: string | null | undefined, expected: boolean }[] = [
      { input: null, expected: true },
      { input: undefined, expected: true },
      { input: '', expected: true },
      { input: 'Hello', expected: false },
      { input: 'H', expected: false },
      { input: ' ', expected: true }
    ];

    test.each(testCases)('should return %p for input %p', ({expected, input}) => {
        expect(isNullOrEmpty(input)).toBe(expected);
    });
  });