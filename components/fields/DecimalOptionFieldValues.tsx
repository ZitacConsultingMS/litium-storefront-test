import MultiSelectField from 'components/form/MultiSelectField';
import { DecimalOptionFieldValuesModel } from 'models/field';

function DecimalOptionFieldValues({
  value,
  control,
}: {
  value: DecimalOptionFieldValuesModel;
  control: any;
}) {
  const { field, name, fieldMetadata } = value;

  return (
    <div className="mb-3">
      <MultiSelectField
        control={control}
        name={field}
        placeholder={name}
        items={fieldMetadata.decimalOptions.items}
        textSelector={(opt) => opt.name || opt.value}
        idSelector={(opt) => opt.value}
        multiSelect={fieldMetadata.decimalOptions.multiSelect}
        data-testid="decimal-option-field-values__select-field"
        disabled={!fieldMetadata.writable}
      />
    </div>
  );
}

export default DecimalOptionFieldValues;
