export interface TextOption {
  value?: string;
  name?: string;
}

export interface RoleOption {
  __typename: string;
  name: string;
  roleOperationId: string;
}
