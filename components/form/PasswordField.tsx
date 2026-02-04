import { InputPassword } from 'components/elements/InputPassword';
import { Controller } from 'react-hook-form';
import ErrorText from './ErrorText';

/**
 * Renders a form password field.
 * @param control an object contains methods for registering components into React Hook Form
 * @param name an unique name of password field
 * @param placeholder a short hint that describes the expected value of a password field
 */

function PasswordField({
  control,
  name,
  placeholder,
  ...props
}: {
  control: any;
  name: string;
  placeholder: string;
}) {
  const errorId = `${name}-error`;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <div>
          <InputPassword
            onChange={onChange}
            value={value}
            id={name}
            placeholder={placeholder}
            className={error && '!border-error'}
            aria-describedby={error ? errorId : undefined}
            aria-invalid={error ? 'true' : 'false'}
            {...props}
          />
          {error && (
            <ErrorText id={errorId} errors={error} className="mx-3 py-1" />
          )}
        </div>
      )}
    />
  );
}

export default PasswordField;
