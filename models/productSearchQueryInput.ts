import { NgramStringFieldInput, StringFieldItemInput } from './search';

/**
 * A product search query to send to GraphQL
 */
export class ProductSearchQueryInput {
  category?: CategoryFieldInput;
  name?: NgramStringFieldInput;
  content?: StringFieldItemInput;
  bool?: {
    should: ProductSearchQueryInput[];
  };
  productList?: ProductListFieldInput;

  constructor(args: {
    text?: string;
    categoryId?: string;
    includeChildren?: boolean;
    productListId?: string;
  }) {
    const {
      text = '',
      categoryId,
      includeChildren = true,
      productListId,
    } = args;

    // Handle category filter
    if (categoryId) {
      this.category = {
        includeChildren,
        categoryId,
      };
    }
    const isWildcardSearch =
      (text?.includes('*') || text?.includes('?')) ?? false;
    // Handle text search
    if (isWildcardSearch) {
      this.bool = {
        should: [
          {
            content: {
              value: text,
            },
          },
          {
            name: {
              value: text,
              ngram: true,
            },
          },
        ],
      };
    } else if (text) {
      this.bool = {
        should: [
          {
            content: {
              value: text,
              synonymAnalyzer: true,
              fuzziness: {
                length: null,
                ratio: null,
                distance: null,
              },
            },
          },
          {
            name: {
              value: text,
              ngram: true,
              synonymAnalyzer: true,
              boost: 20,
            },
          },
        ],
      };
    }

    // Handle product list filter
    if (productListId) {
      this.productList = {
        productListId,
      };
    }
  }
}

interface CategoryFieldInput {
  categoryId: string;
  includeChildren: boolean;
}

interface ProductListFieldInput {
  productListId: string;
}
