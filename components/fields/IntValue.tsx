import InputField from 'components/form/InputField';
import { IntValueModel } from 'models/field';

function IntValue({ value, control }: { value: IntValueModel; control: any }) {
  const { field, name, fieldMetadata } = value;

  return (
    <div className="mb-3">
      <InputField
        control={control}
        name={field}
        placeholder={name}
        data-testid="int-value__input-field"
        disabled={!fieldMetadata.writable}
      />
    </div>
  );
}

export default IntValue;
