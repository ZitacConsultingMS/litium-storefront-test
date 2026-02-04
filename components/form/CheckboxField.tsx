import { Checkbox } from 'components/elements/Checkbox';
import { Controller } from 'react-hook-form';
import ErrorText from './ErrorText';

function CheckboxField({
  control,
  name,
  placeholder,
  disabled = false,
  ...props
}: {
  control: any;
  name: string;
  placeholder: string;
  disabled?: boolean;
}) {
  const errorId = `${name}-error`;

  return (
    <Controller
      // @ts-ignore
      rules={{ disabled: disabled }}
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <div>
          <Checkbox
            id={`checkbox-${name}`}
            checked={value}
            onChange={onChange}
            disabled={disabled}
            aria-describedby={error ? errorId : undefined}
            aria-invalid={error ? 'true' : 'false'}
            {...props}
          >
            <span>{placeholder}</span>
          </Checkbox>
          {error && (
            <ErrorText id={errorId} errors={error} className="mx-3 py-1" />
          )}
        </div>
      )}
    />
  );
}

export default CheckboxField;
