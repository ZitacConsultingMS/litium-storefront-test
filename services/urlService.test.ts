import { ReadonlyURLSearchParams } from 'next/navigation';
import { buildUrl } from './urlService';

describe('buildUrl', () => {
  describe('with singleSelect is true', () => {
    test('should return correct url', () => {
      const url = buildUrl(
        '/foo',
        new ReadonlyURLSearchParams(new URLSearchParams('q=tops')),
        { q: 'bottoms' },
        true
      );
      expect(url).toBe('/foo?q=bottoms');
    });
  });
  describe('with singleSelect is false', () => {
    test('should return correct url', () => {
      const url = buildUrl(
        '/foo',
        new ReadonlyURLSearchParams(new URLSearchParams('q=tops')),
        { q: 'bottoms' }
      );
      expect(url).toBe('/foo?q=tops&q=bottoms');
    });
  });
});
