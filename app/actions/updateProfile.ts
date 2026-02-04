'use server';

import { Field } from 'models/field';
import {
  formatDecimalValue,
  generateValidationSchema,
} from 'services/formService';
import { updateProfilePerson } from 'services/userService.server';

export const updateProfile = async function (
  fields: Field[],
  cultureCode: string,
  data: any
): Promise<any> {
  try {
    await generateValidationSchema(fields, cultureCode).validate(data);
    const input = {
      items: transformData(fields, cultureCode, data),
    };
    const result = await updateProfilePerson(input);
    return result;
  } catch (errors: any) {
    return { errors };
  }
};

function transformData(fields: Field[], cultureCode: string, data: any) {
  let items = [];
  for (const [key, value] of Object.entries(data)) {
    const item = fields.filter((i) => i.field === key)[0];
    if (item.fieldMetadata.writable && item.field !== '_email') {
      items.push({
        [item.fieldMetadata.inputField]: {
          id: item.id,
          value: transformValue(item, cultureCode, value),
        },
      });
    }
  }
  return items;
}

function transformValue(item: any, cultureCode: string, value: any) {
  if (Array.isArray(value)) return value.map((item) => item.value);
  if (item.fieldMetadata.fieldType === 'Int') return parseInt(value);
  if (item.fieldMetadata.fieldType === 'Decimal')
    return formatDecimalValue(cultureCode, value);
  return value;
}
