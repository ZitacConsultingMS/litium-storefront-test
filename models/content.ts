import { Metadata } from './metadata';
import { NavigationLink } from './navigation';

export interface ContentItem {
  metadata?: Metadata;
  url: string;
  __typename?: string;
  fields?: ContentFieldType;
  id: string;
}

export interface ContentFieldType {
  _name?: string;
  [prop: string]: any;
}

export interface ContentConnection {
  nodes: NavigationLink[];
}
