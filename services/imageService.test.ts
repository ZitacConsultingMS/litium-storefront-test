import { describe, expect, test } from '@jest/globals';
import { Image } from 'models/image';
import { getAbsoluteImageUrl } from './imageService';

describe('getAbsoluteImageUrl', () => {
  describe('with empty path', () => {
    test('Should return empty string', () => {
      const image: Image = {
        url: '',
        dimension: {},
      };
      expect(getAbsoluteImageUrl(image)).toBe('');
    });
  });
  describe('with null Image', () => {
    test('Should return empty string', () => {
      expect(getAbsoluteImageUrl(null)).toBe('');
    });
  });

  describe('with path', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = {
        ...originalEnv,
        RUNTIME_IMAGE_SERVER_URL: '',
      };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    test('Should return a url with path and default environment variable value', () => {
      const image: Image = {
        url: 'xyz',
        dimension: {},
      };
      expect(getAbsoluteImageUrl(image)).toBe(
        `${process.env.RUNTIME_LITIUM_SERVER_URL}/xyz`
      );
    });
  });
});
