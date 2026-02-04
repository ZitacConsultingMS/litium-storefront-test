import { gql } from '@apollo/client';
import { describe, expect, test } from '@jest/globals';
import { queryClient } from './dataService.client';

describe('query', () => {
  describe('validation', () => {
    describe('with absolute url', () => {
      test('Should throw an error', async () => {
        expect.assertions(1);
        try {
          return await queryClient({
            client: {} as any,
            query: TEST_QUERY,
            url: 'https://localhost/man',
            host: 'https://localhost',
          });
        } catch (e) {
          return expect(e).toMatch(
            '"url" param should be a relative url, it should not contain protocol nor domain name. Request cancelled.'
          );
        }
      });
    });
    describe('with host with HTTP', () => {
      test('Should throw an error', async () => {
        expect.assertions(1);
        try {
          return await queryClient({
            client: {} as any,
            query: TEST_QUERY,
            url: '/man',
            host: 'http://localhost:3001',
          });
        } catch (e) {
          return expect(e).toMatch(
            '"host" contains HTTP protocol. Only HTTPS is supported. Request cancelled.'
          );
        }
      });
    });
  });
});

const TEST_QUERY = gql`
  query TestQuery {
    content {
      ... on IContentItem {
        metadata {
          language
        }
      }
    }
  }
`;
