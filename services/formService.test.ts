import {
  filterSupportedField,
  filterWritableFields,
  filterWritableOrNonEmptyFields,
  getFieldValue,
  isEmpty,
} from './formService';

describe('filterWritableOrNonEmptyFields function', () => {
  test('should return only writable fields', () => {
    const fieldGroups: any[] = [
      {
        fields: [
          {
            fieldMetadata: { writable: true, fieldType: 'Text' },
            stringValue: '',
          },
          {
            fieldMetadata: { writable: false, fieldType: 'Text' },
            stringValue: '',
          },
        ],
      },
    ];

    const result = filterWritableOrNonEmptyFields(fieldGroups);
    expect(result).toEqual([
      { fieldMetadata: { writable: true, fieldType: 'Text' }, stringValue: '' },
    ]);
  });

  test('should return only non-empty fields', () => {
    const fieldGroups: any[] = [
      {
        fields: [
          {
            fieldMetadata: { writable: false, fieldType: 'Text' },
            stringValue: 'test',
          },
          {
            fieldMetadata: { writable: false, fieldType: 'Text' },
            stringValue: '',
          },
        ],
      },
    ];

    const result = filterWritableOrNonEmptyFields(fieldGroups);
    expect(result).toEqual([
      {
        fieldMetadata: { writable: false, fieldType: 'Text' },
        stringValue: 'test',
      },
    ]);
  });

  test('should return both writable and non-empty fields', () => {
    const fieldGroups: any[] = [
      {
        fields: [
          {
            fieldMetadata: { writable: true, fieldType: 'Text' },
            stringValue: '',
          },
          {
            fieldMetadata: { writable: false, fieldType: 'Text' },
            stringValue: 'test',
          },
          {
            fieldMetadata: { writable: false, fieldType: 'Text' },
            stringValue: '',
          },
        ],
      },
    ];

    const result = filterWritableOrNonEmptyFields(fieldGroups);
    expect(result).toEqual([
      { fieldMetadata: { writable: true, fieldType: 'Text' }, stringValue: '' },
      {
        fieldMetadata: { writable: false, fieldType: 'Text' },
        stringValue: 'test',
      },
    ]);
  });

  test('should return an empty array when no fields are writable or non-empty', () => {
    const fieldGroups: any[] = [
      {
        fields: [
          {
            fieldMetadata: { writable: false, fieldType: 'Text' },
            stringValue: '',
          },
          {
            fieldMetadata: { writable: false, fieldType: 'Text' },
            stringValue: '',
          },
        ],
      },
    ];

    const result = filterWritableOrNonEmptyFields(fieldGroups);
    expect(result).toEqual([]);
  });

  test('should handle multiple field groups', () => {
    const fieldGroups: any[] = [
      {
        fields: [
          {
            fieldMetadata: { writable: true, fieldType: 'Text' },
            stringValue: '',
          },
          {
            fieldMetadata: { writable: false, fieldType: 'Text' },
            stringValue: '',
          },
        ],
      },
      {
        fields: [
          {
            fieldMetadata: { writable: false, fieldType: 'Text' },
            stringValue: 'test',
          },
          {
            fieldMetadata: { writable: false, fieldType: 'Text' },
            stringValue: '',
          },
        ],
      },
    ];

    const result = filterWritableOrNonEmptyFields(fieldGroups);
    expect(result).toEqual([
      { fieldMetadata: { writable: true, fieldType: 'Text' }, stringValue: '' },
      {
        fieldMetadata: { writable: false, fieldType: 'Text' },
        stringValue: 'test',
      },
    ]);
  });
});

describe('filterWritableFields function', () => {
  test('should return only writable fields', () => {
    const fieldGroups: any[] = [
      {
        fields: [
          { fieldMetadata: { writable: true } },
          { fieldMetadata: { writable: false } },
        ],
      },
    ];

    const result = filterWritableFields(fieldGroups);
    expect(result).toEqual([{ fieldMetadata: { writable: true } }]);
  });

  test('should return an empty array when no fields are writable', () => {
    const fieldGroups: any[] = [
      {
        fields: [
          { fieldMetadata: { writable: false } },
          { fieldMetadata: { writable: false } },
        ],
      },
    ];

    const result = filterWritableFields(fieldGroups);
    expect(result).toEqual([]);
  });

  test('should handle multiple field groups', () => {
    const fieldGroups: any[] = [
      {
        fields: [
          { fieldMetadata: { writable: true } },
          { fieldMetadata: { writable: false } },
        ],
      },
      {
        fields: [
          { fieldMetadata: { writable: false } },
          { fieldMetadata: { writable: true } },
        ],
      },
    ];

    const result = filterWritableFields(fieldGroups);
    expect(result).toEqual([
      { fieldMetadata: { writable: true } },
      { fieldMetadata: { writable: true } },
    ]);
  });

  test('should return all fields if all are writable', () => {
    const fieldGroups: any[] = [
      {
        fields: [
          { fieldMetadata: { writable: true } },
          { fieldMetadata: { writable: true } },
        ],
      },
    ];

    const result = filterWritableFields(fieldGroups);
    expect(result).toEqual([
      { fieldMetadata: { writable: true } },
      { fieldMetadata: { writable: true } },
    ]);
  });

  test('should return an empty array for an empty input', () => {
    const fieldGroups: any[] = [];

    const result = filterWritableFields(fieldGroups);
    expect(result).toEqual([]);
  });
});

describe('filterSupportedField function', () => {
  test('should filter out unsupported fields', () => {
    const fieldGroups: any[] = [
      {
        fields: [
          { __typename: 'StringValue' },
          { __typename: 'UnsupportedType' },
        ],
      },
      {
        fields: [
          { __typename: 'IntValue' },
          { __typename: 'BooleanValue' },
          { __typename: 'AnotherUnsupportedType' },
        ],
      },
    ];

    const expectedOutput: any[] = [
      {
        fields: [{ __typename: 'StringValue' }],
      },
      {
        fields: [{ __typename: 'IntValue' }, { __typename: 'BooleanValue' }],
      },
    ];
    expect(filterSupportedField(fieldGroups)).toEqual(expectedOutput);
  });

  test('should return an empty fields array if no supported fields are present', () => {
    const fieldGroups: any[] = [
      {
        fields: [{ __typename: 'UnsupportedType' }],
      },
    ];

    const expectedOutput: any[] = [
      {
        fields: [],
      },
    ];
    expect(filterSupportedField(fieldGroups)).toEqual(expectedOutput);
  });

  test('should return the same fieldGroups if all fields are supported', () => {
    const fieldGroups: any[] = [
      {
        fields: [{ __typename: 'StringValue' }, { __typename: 'BooleanValue' }],
      },
    ];

    const expectedOutput: any[] = [
      {
        fields: [{ __typename: 'StringValue' }, { __typename: 'BooleanValue' }],
      },
    ];

    expect(filterSupportedField(fieldGroups)).toEqual(expectedOutput);
  });

  test('should return an empty array for an empty input', () => {
    const fieldGroups: any[] = [];

    const result = filterSupportedField(fieldGroups);
    expect(result).toEqual([]);
  });
});

describe('getFieldValue function', () => {
  test('should return stringValue for Text field', () => {
    const item = { fieldMetadata: { fieldType: 'Text' }, stringValue: 'test' };
    expect(getFieldValue(item)).toBe('test');
  });

  test('should return empty string for Text field if stringValue is not present', () => {
    const item = { fieldMetadata: { fieldType: 'Text' } };
    expect(getFieldValue(item)).toBe('');
  });

  test('should return textOptionFieldValues for TextOption field', () => {
    const item = {
      fieldMetadata: { fieldType: 'TextOption' },
      textOptionFieldValues: ['option1', 'option2'],
    };
    expect(getFieldValue(item)).toEqual(['option1', 'option2']);
  });

  test('should return empty array for TextOption field if textOptionFieldValues is not present', () => {
    const item = { fieldMetadata: { fieldType: 'TextOption' } };
    expect(getFieldValue(item)).toEqual([]);
  });

  test('should return stringValue for MultirowText field', () => {
    const item = {
      fieldMetadata: { fieldType: 'MultirowText' },
      stringValue: 'multirow text',
    };
    expect(getFieldValue(item)).toBe('multirow text');
  });

  test('should return empty string for MultirowText field if stringValue is not present', () => {
    const item = { fieldMetadata: { fieldType: 'MultirowText' } };
    expect(getFieldValue(item)).toBe('');
  });

  test('should return decimalValue for Decimal field', () => {
    const item = {
      fieldMetadata: { fieldType: 'Decimal' },
      decimalValue: 123.45,
    };
    expect(getFieldValue(item)).toBe(123.45);
  });

  test('should return undefined for Decimal field if decimalValue is not present', () => {
    const item = { fieldMetadata: { fieldType: 'Decimal' } };
    expect(getFieldValue(item)).toBe('');
  });

  test('should return decimalOptionFieldValues for DecimalOption field', () => {
    const item = {
      fieldMetadata: { fieldType: 'DecimalOption' },
      decimalOptionFieldValues: [1.23, 4.56],
    };
    expect(getFieldValue(item)).toEqual([1.23, 4.56]);
  });

  test('should return empty array for DecimalOption field if decimalOptionFieldValues is not present', () => {
    const item = { fieldMetadata: { fieldType: 'DecimalOption' } };
    expect(getFieldValue(item)).toEqual([]);
  });

  test('should return intValue for Int field', () => {
    const item = { fieldMetadata: { fieldType: 'Int' }, intValue: 123 };
    expect(getFieldValue(item)).toBe(123);
  });

  test('should return undefined for Int field if intValue is not present', () => {
    const item = { fieldMetadata: { fieldType: 'Int' } };
    expect(getFieldValue(item)).toBe('');
  });

  test('should return intOptionFieldValues for IntOption field', () => {
    const item = {
      fieldMetadata: { fieldType: 'IntOption' },
      intOptionFieldValues: [1, 2, 3],
    };
    expect(getFieldValue(item)).toEqual([1, 2, 3]);
  });

  test('should return empty array for IntOption field if intOptionFieldValues is not present', () => {
    const item = { fieldMetadata: { fieldType: 'IntOption' } };
    expect(getFieldValue(item)).toEqual([]);
  });

  test('should return booleanValue for Boolean field', () => {
    const item = {
      fieldMetadata: { fieldType: 'Boolean' },
      booleanValue: true,
    };
    expect(getFieldValue(item)).toBe(true);
  });

  test('should return false for Boolean field if booleanValue is not present', () => {
    const item = { fieldMetadata: { fieldType: 'Boolean' } };
    expect(getFieldValue(item)).toBe(false);
  });

  test('should return empty string for unknown field type', () => {
    const item = { fieldMetadata: { fieldType: 'Unknown' } };
    expect(getFieldValue(item)).toBe('');
  });
});

describe('isEmpty function', () => {
  test('should return true for null', () => {
    expect(isEmpty(null)).toBe(true);
  });

  test('should return true for undefined', () => {
    expect(isEmpty(undefined)).toBe(true);
  });

  test('should return true for empty string', () => {
    expect(isEmpty('')).toBe(true);
  });

  test('should return false for non-empty string', () => {
    expect(isEmpty('test')).toBe(false);
  });

  test('should return true for empty array', () => {
    expect(isEmpty([])).toBe(true);
  });

  test('should return false for non-empty array', () => {
    expect(isEmpty([1, 2, 3])).toBe(false);
  });

  test('should return true for empty object', () => {
    expect(isEmpty({})).toBe(true);
  });

  test('should return false for non-empty object', () => {
    expect(isEmpty({ key: 'value' })).toBe(false);
  });

  test('should return false for number zero', () => {
    expect(isEmpty(0)).toBe(false);
  });

  test('should return false for boolean false', () => {
    expect(isEmpty(false)).toBe(false);
  });

  test('should return false for boolean true', () => {
    expect(isEmpty(true)).toBe(false);
  });

  test('should return false for non-empty date', () => {
    expect(isEmpty(new Date())).toBe(false);
  });
});
