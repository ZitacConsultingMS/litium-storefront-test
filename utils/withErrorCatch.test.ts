import { ErrorField } from 'components/form/ErrorText';
import { withErrorCatch } from './withErrorCatch';

describe('withErrorCatch', () => {
  test('should clear errors when async function resolves', async () => {
    const callback = jest.fn();

    await withErrorCatch(async () => {
      // Simulate successful async operation
      return Promise.resolve();
    }, callback);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith([]);
  });

  test('should map GraphQL errors array to ErrorField[]', async () => {
    const callback = jest.fn();

    const graphqlErrors: ErrorField[] = [
      { message: 'GraphQL error 1' },
      { message: 'GraphQL error 2' },
    ];

    await withErrorCatch(async () => {
      throw graphqlErrors;
    }, callback);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(graphqlErrors);
  });

  test('should map network errors to ErrorField[]', async () => {
    const callback = jest.fn();

    const networkErrors: ErrorField[] = [
      { message: 'Network error 1' },
      { message: 'Network error 2' },
    ];

    const networkErrorObject = {
      networkError: {
        result: {
          errors: networkErrors,
        },
      },
    } as any;

    await withErrorCatch(async () => {
      throw networkErrorObject;
    }, callback);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(networkErrors);
  });

  test('should fallback to error.message when no specific error mapping is found', async () => {
    const callback = jest.fn();

    const errorMessage = 'Generic runtime error';

    await withErrorCatch(async () => {
      throw new Error(errorMessage);
    }, callback);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith([{ message: errorMessage }]);
  });
});
