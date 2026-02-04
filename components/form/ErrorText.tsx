import clsx from 'clsx';
import { Text } from 'components/elements/Text';
import { Fragment } from 'react';
/**
 * Renders error texts.
 * @param errors a list of error messages or a single error message
 * @param className a customized class name
 */
export default function ErrorText({
  errors,
  className,
  id,
}: {
  errors: ErrorField | ErrorField[];
  className?: string;
  id?: string;
}) {
  if (!Object.keys(errors).length) {
    return <Fragment></Fragment>;
  }

  return (
    <div className={clsx('text-xs text-error', className)} id={id} role="alert">
      {Array.isArray(errors)
        ? errors?.map((err, idx) => (
            <Text key={idx} data-testid="error-text">
              {err.message}
            </Text>
          ))
        : errors?.message && (
            <Text data-testid="error-text">{errors.message}</Text>
          )}
    </div>
  );
}

export interface ErrorField {
  type?: string;
  message?: string;
}
