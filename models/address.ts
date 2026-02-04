export interface OrderAddress {
  address1: string;
  zipCode: string;
  city: string;
  country: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationName: string;
  phoneNumber: string;
}

export interface CustomerAddress {
  address1?: string;
  zipCode?: string;
  city?: string;
  country?: string;
  phoneNumber?: string;
  addressType?: CustomerAddressType;
  id: string;
}

export interface Country {
  code: string;
  name: string;
}

export interface CustomerAddressType {
  id: string;
  name?: string;
}

interface ManageAddressForPersonError {
  message: string;
}
export interface ManageAddressForPersonPayload {
  errors?: ManageAddressForPersonError[] | null;
  customerAddress?: CustomerAddress | null;
}
interface ManageAddressForOrganizationError {
  message: string;
}
export interface ManageAddressForOrganizationPayload {
  errors?: ManageAddressForOrganizationError[] | null;
  customerAddress?: CustomerAddress | null;
}
