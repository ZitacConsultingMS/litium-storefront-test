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
    if (categoryId) {
      this.category = {
        includeChildren,
        categoryId,
      };
    }
    if (text) {
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
