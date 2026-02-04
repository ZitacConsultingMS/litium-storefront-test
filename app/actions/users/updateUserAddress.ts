'use server';
import { CustomerAddress, ManageAddressForPersonPayload } from 'models/address';
import { manageAddressForPerson } from 'services/userService.server';

export default async function updateUserAddress(
  formData: CustomerAddress
): Promise<ManageAddressForPersonPayload> {
  let errors: any;
  let customerAddress: any;
  try {
    const result = await manageAddressForPerson(formData);
    errors = result.manageAddressForPerson?.errors;
    customerAddress = result.manageAddressForPerson.customerAddress;
  } catch (error: any) {
    if (error?.networkError?.result?.errors) {
      errors = error?.networkError?.result?.errors;
    } else {
      throw error;
    }
  }

  if (errors?.length > 0) {
    return {
      errors,
    };
  }

  return { errors: null, customerAddress };
}
