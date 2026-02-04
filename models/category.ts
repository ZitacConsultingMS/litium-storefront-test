import { ContentItem } from './content';
import { Image } from './image';
import { NavigationLink } from './navigation';
import { PageInfo } from './pageInfo';
import { ProductSearchConnection } from './products';

export interface CategoryItem extends ContentItem {
  name: string;
  products?: ProductSearchConnection;
  subNavigations?: NavigationLink;
  images?: Image[];
  description?: string;
  children?: CategoryConnection;
}

export interface CategoryConnection {
  pageInfo: PageInfo;
  nodes: CategoryItem[];
  totalCount: number;
}

export interface CategoryItemsConnection {
  pageInfo: PageInfo;
  edges: CategoryItemsEdge[];
  nodes: CategoryItem[];
  totalCount: number;
}

export interface CategoryItemsEdge {
  cursor: string;
  node: CategoryItem;
}
