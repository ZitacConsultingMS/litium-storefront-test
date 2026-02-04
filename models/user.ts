import { PageInfo } from './pageInfo';
export interface OrganizationItem {
  id: string;
  fields?: {
    _nameInvariantCulture: string;
  };
}
export interface CurrentUser {
  selectedOrganization?: PersonOrganizationLink;
  person: PersonItem;
}

export interface PersonItem {
  organizations: OrganizationConnection;
  id: string;
}
export interface PersonOrganizationLink {
  organization: OrganizationItem;
  roleOperations: RoleOperation[];
}

interface RoleOperation {
  roleOperationId: string;
}

export interface OrganizationConnection {
  edges: OrganizationEdge[];
  nodes: PersonOrganizationLink[];
  pageInfo: PageInfo;
  totalCount: number;
}

interface OrganizationEdge {
  cursor: string;
  node: PersonOrganizationLink;
}
