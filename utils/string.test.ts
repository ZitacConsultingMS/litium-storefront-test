import { camelize, localeSensitiveCompare } from './string';

describe('camelize', () => {
  describe('with parameter', () => {
    test('should return the correct camel value', () => {
      expect(camelize('TestValue')).toBe('testValue');
    });
    test('should return the same camel cased string', () => {
      expect(camelize('testValue')).toBe('testValue');
    });
  });
  describe('without parameter', () => {
    test('should return the empty value', () => {
      expect(camelize('')).toBe('');
    });
  });
});

describe('localeSensitiveCompare', () => {
  test('should return 0 when strings are equal', () => {
    const result = localeSensitiveCompare('a', 'a', 'en');
    expect(result).toBe(0);
  });

  test('should return a negative number when the first string comes before the second string', () => {
    const result = localeSensitiveCompare('a', 'b', 'en');
    expect(result).toBeLessThan(0);
  });

  test('should return a positive number when the first string comes after the second string', () => {
    const result = localeSensitiveCompare('b', 'a', 'en');
    expect(result).toBeGreaterThan(0);
  });

  test('should handle accented characters correctly for French locale', () => {
    const result = localeSensitiveCompare('é', 'e', 'fr');
    expect(result).toBeGreaterThan(0);
  });

  test('should handle accented characters correctly for Spanish locale', () => {
    const result = localeSensitiveCompare('ñ', 'n', 'es');
    expect(result).toBeGreaterThan(0);
  });

  test('should be case insensitive when sensitivity is accent', () => {
    const result = localeSensitiveCompare('aB', 'Ab', 'en');
    expect(result).toBe(0);
  });
});
