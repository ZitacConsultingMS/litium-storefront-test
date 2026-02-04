import { Field, FieldGroup } from 'models/field';
import * as yup from 'yup';

/**
 * Generates a Yup validation schema based on the provided field definitions.
 *
 * This function takes an array of field definitions and constructs a Yup validation schema.
 * Each field definition contains metadata that specifies the type of the field.
 * The schema is dynamically generated using this metadata.
 *
 * Supported field types:
 * - boolean: A boolean field.
 * - decimal: A decimal number field.
 * - decimalOption: An optional decimal number field.
 * - int: A integer field.
 * - intOption: An optional integer field.
 * - multiRowText: A multi-line text field.
 * - text: A text field.
 * - textOption: An optional text field.
 *
 * @param fields An array of field objects.
 * @returns a Yup validation schema object configured according to the specified field definitions.
 *
 * Example usage:
 *
 * const fields = [
 *     { field: 'name', fieldMetadata: { fieldType: 'Text' } },
 *     { field: 'age', fieldMetadata: { fieldType: 'Int' } },
 *     { field: 'price', fieldMetadata: { fieldType: 'Decimal' } }
 * ];
 *
 * const schema = generateValidationSchema(fields);
 */
export function generateValidationSchema(fields: Field[], cultureCode: string) {
  const schema: any = {};
  for (let item of fields) {
    schema[item.field] = Types(item.fieldMetadata.fieldType, cultureCode);
  }
  return yup.object(schema);
}

const decimalSchema = (cultureCode: string) =>
  yup.string().when({
    is: (exists: any) => !!exists,
    then: (rule) =>
      rule.test('is-decimal', 'form.decimal.not.valid', (value) => {
        if (isNaN(formatDecimalValue(cultureCode, value))) {
          return false;
        }
        return true;
      }),
  });
const intSchema = yup.string().when({
  is: (exists: any) => !!exists,
  then: (rule) =>
    rule.test('is-integer', 'form.integer.not.valid', (value) => {
      return /^\d+$/.test(value + '');
    }),
});

// A map of field types to Yup validation schemas. This object defines how different field types should be validated.
const Types = (type: string, cultureCode: string) => {
  switch (type) {
    case 'Text':
      return yup.string();
    case 'TextOption':
      return yup.array();
    case 'MultirowText':
      return yup.string();
    case 'Decimal':
      return decimalSchema(cultureCode);
    case 'DecimalOption':
      return yup.array();
    case 'Int':
      return intSchema;
    case 'IntOption':
      return yup.array();
    case 'Boolean':
      return yup.boolean();
    default:
      return yup.string();
  }
};

export function filterWritableFields(fieldGroups: FieldGroup[]) {
  return fieldGroups.reduce(
    (accumulator: any, group: FieldGroup) => [
      ...accumulator,
      ...group.fields.filter((field: any) => !!field.fieldMetadata.writable),
    ],
    []
  );
}

export function filterWritableOrNonEmptyFields(fieldGroups: FieldGroup[]) {
  return fieldGroups.reduce(
    (accumulator: any, group: FieldGroup) => [
      ...accumulator,
      ...group.fields.filter(
        (item: any) =>
          item.fieldMetadata.writable || !isEmpty(getFieldValue(item))
      ),
    ],
    []
  );
}

/**
 * Retrieves the appropriate field value from the item based on its field type.
 * @param item The item containing field metadata and values.
 * @returns The value of the field, defaulting to an empty string, empty array, or false, depending on the field type.
 */
export function getFieldValue(item: any) {
  switch (item.fieldMetadata.fieldType) {
    case 'Text':
      return item.stringValue || '';
    case 'TextOption':
      return item.textOptionFieldValues || [];
    case 'MultirowText':
      return item.stringValue || '';
    case 'Decimal':
      return item.decimalValue || '';
    case 'DecimalOption':
      return item.decimalOptionFieldValues || [];
    case 'Int':
      return item.intValue || '';
    case 'IntOption':
      return item.intOptionFieldValues || [];
    case 'Boolean':
      return item.booleanValue || false;
    default:
      return '';
  }
}

export function isEmpty(value: any) {
  return (
    // null or undefined
    value == null ||
    // has length and it's zero
    (value.hasOwnProperty('length') && value.length === 0) ||
    // is an Object and has no keys
    (value.constructor === Object && Object.keys(value).length === 0)
  );
}

/**
 * Formats a decimal value according to the specified culture, using the Globalize library
 *
 * @param culture - The culture code (e.g., 'en-US', 'fr-FR') used to format the number.
 * @param value - The string representation of the number to be formatted.
 * @returns - The parsed floating-point number. Returns NaN if the input value is invalid.
 */
export function formatDecimalValue(culture: string, value: string | undefined) {
  const Globalize = require('globalize');
  // The parseFloat method will return NaN (Not a Number) if the input value cannot be parsed as a number.
  return Globalize(culture).parseFloat(value);
}

const supportedFieldTypes = [
  'StringValue',
  'IntValue',
  'BooleanValue',
  'DecimalValue',
  'TextOptionFieldValues',
  'IntOptionFieldValues',
  'DecimalOptionFieldValues',
];

/**
 * Filters the fields within each field group to include only the supported field types.
 *
 * The function takes an array of field groups, each containing multiple fields, and filters out
 * any fields that are not of a type listed in the supportedFieldTypes array. It returns a new array of
 * field groups where each field group retains only the fields of the supported types.
 *
 * @param fieldGroups - An array of field group objects. Each field group contains an array of fields.
 * @returns - A new array of field groups with fields filtered to include only the supported types.
 *
 * The supported field types are defined in the supportedFieldTypes array:
 * - 'StringValue'
 * - 'IntValue'
 * - 'BooleanValue'
 * - 'DecimalValue'
 * - 'TextOptionFieldValues'
 * - 'IntOptionFieldValues'
 * - 'DecimalOptionFieldValues'
 */

export function filterSupportedField(fieldGroups: FieldGroup[]) {
  return fieldGroups.map((fieldGroup: FieldGroup) => {
    return {
      ...fieldGroup,
      fields: fieldGroup.fields.filter((field: Field) =>
        supportedFieldTypes.includes(field.__typename)
      ),
    };
  });
}
