import { ProductSearchConnection } from './(zitac)/products';
import { CategoryItemsConnection } from './category';
import { PageItemsConnection } from './page';

export interface SearchContentType {
  categorySearch: CategoryItemsConnection;
  productSearch: ProductSearchConnection;
  pageSearch: PageItemsConnection;
}

export interface NgramStringFieldInput extends StringFieldItemInput {
  ngram: boolean;
}

export interface StringFieldItemInput {
  value: string;
  synonymAnalyzer?: boolean;
  boost?: number;
  fuzziness?: FuzzinessItemInput;
}

export interface FuzzinessItemInput {
  length?: { low: number; high: number } | null;
  ratio?: number | null;
  distance?: number | null;
}
