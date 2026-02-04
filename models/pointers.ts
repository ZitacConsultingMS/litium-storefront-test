import { Image } from 'models/image';
import { CategoryItem } from './category';
import { PageItem } from './page';
import { ProductItem } from './products';

export interface PointerMediaImageItem {
  item?: Image;
}

export interface PointerProductCategoryItem {
  id?: string;
  item?: CategoryItem;
}

export interface PointerPageItem {
  id?: string;
  item?: PageItem;
}
export interface PointerProductItem {
  id?: string;
  item?: ProductItem;
}
