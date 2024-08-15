import { describe, expect } from 'vitest';
import { isNullOrEmpty, sanitiseForId } from './StringHelpers';

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

describe('sanitiseForId', () => {
    test('should correctly format string from unformatted label', () => {
        const inputLabel = "This I*£@&^%`!s Tab 2";
        expect(sanitiseForId(inputLabel)).toBe("this-is-tab-2");
    })
})