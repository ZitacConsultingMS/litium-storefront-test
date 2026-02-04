import MultiSelectField from 'components/form/MultiSelectField';
import { IntOptionFieldValuesModel } from 'models/field';

function IntOptionFieldValues({
  value,
  control,
}: {
  value: IntOptionFieldValuesModel;
  control: any;
}) {
  const { field, name, fieldMetadata } = value;

  return (
    <div className="mb-3">
      <MultiSelectField
        control={control}
        name={field}
        placeholder={name}
        items={fieldMetadata.intOptions.items}
        textSelector={(opt) => opt.name || opt.value}
        idSelector={(opt) => opt.value}
        multiSelect={fieldMetadata.intOptions.multiSelect}
        data-testid="int-option-field-values__select-field"
        disabled={!fieldMetadata.writable}
      />
    </div>
  );
}

export default IntOptionFieldValues;
