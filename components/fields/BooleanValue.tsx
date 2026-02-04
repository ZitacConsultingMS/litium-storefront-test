import CheckboxField from 'components/form/CheckboxField';
import { BooleanValueModel } from 'models/field';

function BooleanValue({
  value,
  control,
}: {
  value: BooleanValueModel;
  control: any;
}) {
  const { field, name, fieldMetadata } = value;

  return (
    <div className="mb-3">
      <CheckboxField
        control={control}
        name={field}
        placeholder={name}
        data-testid="boolean-value__checkbox-field"
        disabled={!fieldMetadata.writable}
      />
    </div>
  );
}

export default BooleanValue;
