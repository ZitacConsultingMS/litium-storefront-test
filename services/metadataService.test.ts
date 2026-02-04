import { describe, expect, test } from '@jest/globals';
import * as dataService from 'services/dataService.server';
import { createMetadataFromUrl } from './metadataService.server';

jest.mock('next/headers', () => ({
  headers: jest.fn(),
}));

jest.mock('../utils/headers', () => ({
  getHost: jest.fn().mockReturnValue('https://localhost:3001'),
}));

jest.mock('services/dataService.server', () => ({
  queryServer: jest.fn(),
}));

describe('createMetadataFromUrl', () => {
  test('Should return title', async () => {
    jest.spyOn(dataService, 'queryServer').mockResolvedValue({
      content: {
        metadata: {
          title: 'foo',
        },
      },
    });
    const metadata = await createMetadataFromUrl('/woman');
    expect(metadata.title).toBe('foo');
  });
  test('Should return description', async () => {
    jest.spyOn(dataService, 'queryServer').mockResolvedValue({
      content: {
        metadata: {
          title: 'foo',
          tags: [
            {
              name: 'description',
              content: 'bar',
            },
          ],
        },
      },
    });
    const metadata = await createMetadataFromUrl('/woman');
    expect(metadata.description).toBe('bar');
  });
  test('Should return robots information', async () => {
    jest.spyOn(dataService, 'queryServer').mockResolvedValue({
      content: {
        metadata: {
          title: 'foo',
          tags: [
            {
              name: 'robots',
              content: 'index,follow',
            },
          ],
        },
      },
    });
    const metadata = await createMetadataFromUrl('/woman');
    expect(metadata.robots).toBe('index,follow');
  });
  test('Should return canonical information', async () => {
    jest.spyOn(dataService, 'queryServer').mockResolvedValue({
      content: {
        metadata: {
          title: 'foo',
          links: [
            {
              attributes: [
                {
                  name: 'rel',
                  value: 'canonical',
                },
              ],
              href: '/bar.html',
            },
          ],
        },
      },
    });
    const metadata = await createMetadataFromUrl('/woman');
    expect(metadata.alternates?.canonical).toBe('/bar.html');
  });
  describe('openGraph', () => {
    test('Should not return openGraph if it is empty', async () => {
      jest.spyOn(dataService, 'queryServer').mockResolvedValue({
        content: {
          metadata: {
            title: 'foo',
          },
        },
      });
      const metadata = await createMetadataFromUrl('/woman');
      expect(metadata.openGraph).toBeUndefined;
    });
    test('Should return openGraph title information', async () => {
      jest.spyOn(dataService, 'queryServer').mockResolvedValue({
        content: {
          metadata: {
            title: 'foo',
            tags: [
              {
                name: 'og:title',
                content: 'foo',
              },
            ],
          },
        },
      });
      const metadata = await createMetadataFromUrl('/woman');
      expect(metadata.openGraph?.title).toBe('foo');
    });
    test('Should return openGraph image information', async () => {
      jest.spyOn(dataService, 'queryServer').mockResolvedValue({
        content: {
          metadata: {
            title: 'foo',
            tags: [
              {
                name: 'og:image',
                content: 'http://localhost/foo.png',
              },
              {
                name: 'og:image:secure_url',
                content: 'https://localhost/foo.png',
              },
            ],
          },
        },
      });
      const metadata = await createMetadataFromUrl('/woman');
      expect(metadata.openGraph?.images).toStrictEqual([
        {
          url: 'http://localhost/foo.png',
          secureUrl: 'https://localhost/foo.png',
        },
      ]);
    });
  });
  describe('icons', () => {
    test('Should not return icons if it is empty', async () => {
      jest.spyOn(dataService, 'queryServer').mockResolvedValue({
        content: {
          metadata: {
            title: 'foo',
          },
        },
      });
      const metadata = await createMetadataFromUrl('/woman');
      expect(metadata.icons).toBeUndefined;
    });
    test('Should return icon', async () => {
      jest.spyOn(dataService, 'queryServer').mockResolvedValue({
        content: {
          metadata: {
            title: 'foo',
            links: [
              {
                attributes: [
                  {
                    name: 'rel',
                    value: 'icon',
                  },
                  {
                    name: 'sizes',
                    value: '32x32',
                  },
                  {
                    name: 'type',
                    value: 'image/png',
                  },
                ],
                href: '/icon.png',
              },
            ],
          },
        },
      });
      const metadata = await createMetadataFromUrl('/woman');
      expect(metadata.icons).toStrictEqual({
        apple: [],
        icon: [{ sizes: '32x32', type: 'image/png', url: '/icon.png' }],
        shortcut: [],
      });
    });
    test('Should return shortcut icon', async () => {
      jest.spyOn(dataService, 'queryServer').mockResolvedValue({
        content: {
          metadata: {
            title: 'foo',
            links: [
              {
                attributes: [
                  {
                    name: 'rel',
                    value: 'shortcut icon',
                  },
                  {
                    name: 'sizes',
                    value: '32x32',
                  },
                  {
                    name: 'type',
                    value: 'image/png',
                  },
                ],
                href: '/icon.png',
              },
            ],
          },
        },
      });
      const metadata = await createMetadataFromUrl('/woman');
      expect(metadata.icons).toStrictEqual({
        apple: [],
        icon: [],
        shortcut: [{ sizes: '32x32', type: 'image/png', url: '/icon.png' }],
      });
    });
    test('Should return apple touch icon', async () => {
      jest.spyOn(dataService, 'queryServer').mockResolvedValue({
        content: {
          metadata: {
            title: 'foo',
            links: [
              {
                attributes: [
                  {
                    name: 'rel',
                    value: 'apple-touch-icon',
                  },
                  {
                    name: 'sizes',
                    value: '32x32',
                  },
                  {
                    name: 'type',
                    value: 'image/png',
                  },
                ],
                href: '/icon.png',
              },
            ],
          },
        },
      });
      const metadata = await createMetadataFromUrl('/woman');
      expect(metadata.icons).toStrictEqual({
        apple: [{ sizes: '32x32', type: 'image/png', url: '/icon.png' }],
        icon: [],
        shortcut: [],
      });
    });
  });
});
