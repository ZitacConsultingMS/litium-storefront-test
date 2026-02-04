import MultiSelectField from 'components/form/MultiSelectField';
import { TextOptionFieldValuesModel } from 'models/field';

function TextOptionFieldValues({
  value,
  control,
}: {
  value: TextOptionFieldValuesModel;
  control: any;
}) {
  const { field, name, fieldMetadata } = value;

  return (
    <div className="mb-3">
      <MultiSelectField
        control={control}
        name={field}
        placeholder={name}
        items={fieldMetadata.textOptions.items}
        textSelector={(opt) => opt.name || opt.value}
        idSelector={(opt) => opt.value}
        multiSelect={fieldMetadata.textOptions.multiSelect}
        data-testid="text-option-field-values__select-field"
        disabled={!fieldMetadata.writable}
      />
    </div>
  );
}

export default TextOptionFieldValues;
