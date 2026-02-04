export interface FieldGroup {
  fieldGroupId: string;
  name: string | null;
  fields: Field[];
}

export interface Field {
  id: string;
  field: string;
  name: string;
  fieldMetadata: FieldMetadata;
  __typename: string;
}

export interface FieldMetadata {
  fieldType: string;
  readable: boolean;
  writable: boolean;
  inputField: string;
  inputModel: string;
}

export interface StringValueModel extends Field {
  stringValue: string;
}

export interface TextOptionFieldValuesModel extends Field {
  textOptionFieldValues: {
    name: string;
    value: string;
  }[];
  fieldMetadata: TextOptionsFieldMetadata;
}

interface TextOptionsFieldMetadata extends FieldMetadata {
  textOptions: {
    multiSelect: boolean;
    items: {
      name: string;
      value: string;
    }[];
  };
}

export interface DecimalValueModel extends Field {
  decimalValue: number | null;
}

export interface DecimalOptionFieldValuesModel extends Field {
  decimalOptionFieldValues: {
    name: string;
    value: number;
  }[];
  fieldMetadata: DecimalOptionFieldMetadata;
}

interface DecimalOptionFieldMetadata extends FieldMetadata {
  decimalOptions: {
    multiSelect: boolean;
    items: {
      name: string;
      value: number;
    }[];
  };
}

export interface IntValueModel extends Field {
  intValue: number | null;
}

export interface IntOptionFieldValuesModel extends Field {
  intOptionFieldValues: {
    name: string;
    value: number;
  }[];
  fieldMetadata: IntOptionFieldMetadata;
}

interface IntOptionFieldMetadata extends FieldMetadata {
  intOptions: {
    multiSelect: boolean;
    items: {
      name: string;
      value: number;
    }[];
  };
}

export interface BooleanValueModel extends Field {
  booleanValue: boolean | null;
}
export interface DisplayFieldGroup {
  fieldGroupId: string;
  fields: Field[];
}
