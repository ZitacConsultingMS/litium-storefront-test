import InputField from 'components/form/InputField';
import TextareaField from 'components/form/TextareaField';
import { StringValueModel } from 'models/field';

function StringValue({
  value,
  control,
}: {
  value: StringValueModel;
  control: any;
}) {
  const { field, name, fieldMetadata } = value;

  return (
    <div className="mb-3">
      {fieldMetadata.fieldType === 'Text' && (
        <InputField
          control={control}
          name={field}
          placeholder={name}
          data-testid="string-value__input-field"
          disabled={!fieldMetadata.writable || field === '_email'}
        />
      )}
      {fieldMetadata.fieldType === 'MultirowText' && (
        <TextareaField
          control={control}
          name={field}
          placeholder={name}
          data-testid="string-value__textarea-field"
          disabled={!fieldMetadata.writable}
        />
      )}
    </div>
  );
}

export default StringValue;
