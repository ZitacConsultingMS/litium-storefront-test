import { InputText } from 'components/elements/Input';
import { useTranslations } from 'hooks/useTranslations';
import { Controller } from 'react-hook-form';
import ErrorText from './ErrorText';

/**
 * Renders a form input field.
 * @param control an object contains methods for registering components into React Hook Form
 * @param name an unique name of input field
 * @param placeholder a short hint that describes the expected value of an input field
 * @param type a type of <input> element to display
 */

function InputField({
  control,
  name,
  placeholder,
  type = 'text',
  disabled = false,
  autocomplete,
  ...props
}: {
  control: any;
  name: string;
  placeholder: string;
  type?: string;
  disabled?: boolean;
  autocomplete?: string;
}) {
  const t = useTranslations();
  const errorId = `${name}-error`;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <div>
          <InputText
            onChange={onChange}
            value={value}
            id={name}
            type={type}
            placeholder={placeholder}
            className={error && '!border-error'}
            disabled={disabled}
            aria-describedby={error ? errorId : undefined}
            aria-invalid={error ? 'true' : 'false'}
            autocomplete={autocomplete}
            {...props}
          />
          {error && (
            <ErrorText
              id={errorId}
              errors={transformError(t, error)}
              className="mx-3 py-1"
            />
          )}
        </div>
      )}
    />
  );
}

function transformError(translate: any, errors: any) {
  if (Array.isArray(errors)) return errors;
  return { message: translate(errors.message) };
}

export default InputField;
