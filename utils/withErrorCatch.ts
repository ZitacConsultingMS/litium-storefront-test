import { ErrorField } from 'components/form/ErrorText';

/**
 * Provides a wrapper for async functions and capture any
 * GraphQL / network / runtime errors in a format expected by
 * <ErrorText/> (ErrorField | ErrorField[]). A callback function is required to handle the errors.
 * The errors can be empty, in which case the error texts should disappear.
 *
 * Usage:
 *   withErrorCatch(async () => {
 *     // async function to execute
 *   }, (errors) => {
 *     // handle errors
 *   });
 */
export const withErrorCatch = async (
  fn: () => Promise<any>,
  callbackFn: (errors: ErrorField[]) => void
) => {
  try {
    await fn();
    // Clear previous errors if the operation succeeds.
    callbackFn([]);
  } catch (error: any) {
    const handledErrors: ErrorField[] = [];

    // 1. GraphQL errors that were thrown from the Storefront API
    if (Array.isArray(error)) {
      handledErrors.push(
        ...error.map((e: any) => ({ message: e.message ?? String(e) }))
      );
    }

    // 2. Errors coming from Apollo network layer (e.g. 400/500 responses)
    if (error?.networkError?.result?.errors) {
      handledErrors.push(
        ...error.networkError.result.errors.map((e: any) => ({
          message: e.message,
        }))
      );
    }

    // 3. Fallback to the error.message itself if we could not map anything
    if (!handledErrors.length && error?.message) {
      handledErrors.push({ message: error.message });
    }

    // 4. As the component hierarchy expects either ErrorField or ErrorField[],
    // we supply an array (can contain one element). When there are no errors
    // we still clear the state so the error texts disappear.
    callbackFn(handledErrors);
  }
};
