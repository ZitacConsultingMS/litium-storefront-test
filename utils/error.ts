import { ErrorField } from 'components/form/ErrorText';
import * as yup from 'yup';

/**
 * Convert the yup error into an ErrorField type array.
 * @param errors Yup validation errors.
 * @returns Validation errors.
 */
export function convertYupErrorsIntoErrorFields(
  errors: yup.ValidationError
): ErrorField[] {
  const validationErrors: ErrorField[] = [];

  errors.inner.forEach((error: any) => {
    if (error.path !== undefined) {
      validationErrors.push({ message: error.message });
    }
  });

  return validationErrors;
}
