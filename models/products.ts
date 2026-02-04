import { CategoryItem } from './category';
import { ContentItem } from './content';
import { DisplayFieldGroup, FieldGroup } from './field';
import { FacetGroupItem, SortResultItem } from './filter';
import { Image } from './image';
import { TextOption } from './option';
import { PageInfo } from './pageInfo';
import { ProductPriceItem } from './price';

export interface ProductItem extends ContentItem {
  name: string | null;
  description: string;
  price: ProductPriceItem;
  smallImages: Image[];
  mediumImages: Image[];
  largeImages: Image[];
  stockStatus: {
    inStockQuantity: number;
    description?: string;
  };
  thumbnailImages: Image[];
  fields: {
    brand?: TextOption[];
    color: TextOption[] | null;
    size: TextOption[] | null;
  };
  articleNumber: string;
  isVariant: boolean;
  parent: CategoryItem;
  rawData: {
    variants: ProductItem[];
  };
  relationships: {
    similarProducts: {
      name: string;
      items: ProductItemsConnection;
    };
    accessory: {
      name: string;
      items: ProductItemsConnection;
    };
  };
  fieldGroups: FieldGroup[];
}

export interface ProductSearchConnection extends ProductItemsConnection {
  facets: FacetGroupItem[];
  sortCriteria: SortResultItem[];
}

export interface ProductItemsConnection {
  pageInfo: PageInfo;
  edges: ProductItemsEdge[];
  nodes: ProductItem[];
  totalCount: number;
}

export interface ProductItemsEdge {
  cursor: string;
  node: ProductItem;
  score: number;
}

export interface ProductWithVariantsListProductVariantConnection {
  pageInfo: PageInfo;
  edges: ProductWithVariantsListProductVariantEdge[];
  nodes: ProductWithVariantsListProduct[];
  totalCount: number;
}

export interface ProductWithVariantsListProduct extends ProductItem {
  images: Image[];
  variants: ProductWithVariantsListProductVariantConnection;
  displayFieldGroups: DisplayFieldGroup[];
}
export interface ProductWithVariantsListProductVariantEdge
  extends ProductItemsEdge {
  node: ProductWithVariantsListProduct;
}
