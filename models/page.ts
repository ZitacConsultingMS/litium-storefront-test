import { ContentItem } from './content';
import { PageInfo } from './pageInfo';

export interface PageItem extends ContentItem {
  name: string;
  children?: PageItemsConnection;
}

export interface PageItemsConnection {
  pageInfo: PageInfo;
  edges: PageItemsEdge[];
  nodes: PageItem[];
  totalCount: number;
}

export interface PageItemsEdge {
  cursor: string;
  node: PageItem;
}
