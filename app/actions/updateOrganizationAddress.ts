'use server';
import {
  CustomerAddress,
  ManageAddressForOrganizationPayload,
} from 'models/address';
import { manageAddressForOrganization } from 'services/organizationService.server';

export default async function updateOrganizationAddress(
  formData: CustomerAddress
): Promise<ManageAddressForOrganizationPayload> {
  let errors: any;
  try {
    const result = await manageAddressForOrganization(formData);
    errors = result.manageAddressForOrganization?.errors;
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

  return { errors: null };
}
