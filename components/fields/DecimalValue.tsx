import InputField from 'components/form/InputField';
import { DecimalValueModel } from 'models/field';

function DecimalValue({
  value,
  control,
}: {
  value: DecimalValueModel;
  control: any;
}) {
  const { field, name, fieldMetadata } = value;

  return (
    <div className="mb-3">
      <InputField
        control={control}
        name={field}
        placeholder={name}
        data-testid="decimal-value__input-field"
        disabled={!fieldMetadata.writable}
      />
    </div>
  );
}

export default DecimalValue;
