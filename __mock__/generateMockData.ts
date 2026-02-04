import { Cart, DiscountInfo } from 'models/cart';
import { CategoryItemsConnection } from 'models/category';
import { Image } from 'models/image';
import { OrderRow } from 'models/order';
import { PageItemsConnection } from 'models/page';
import { ProductItem, ProductSearchConnection } from 'models/products';
import { OrganizationConnection, PersonOrganizationLink } from 'models/user';
import { DiscountType } from 'utils/constants';

export function generateImages(maxImage: number): Image[] {
  const images: Image[] = [];
  for (let i = 0; i < maxImage; i++) {
    images.push({
      url: `/img-${i}`,
      dimension: {
        width: 420,
        height: 600,
      },
    });
  }
  return images;
}

export function generateProductSearchResultData(
  maxItem: number,
  maxImage: number
): ProductSearchConnection {
  const data: ProductSearchConnection = {
    nodes: generateProductItems(maxItem, maxImage),
    edges: [],
    totalCount: 0,
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
    },
    facets: [],
    sortCriteria: [],
  };
  data.totalCount = data.nodes.length;
  return data;
}

export function generateCategorySearchResultData(
  maxItem: number,
  maxImage: number
): CategoryItemsConnection {
  const data: CategoryItemsConnection = {
    nodes: [],
    edges: [],
    totalCount: 0,
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };
  for (let i = 0; i < maxItem; i++) {
    data.nodes[i] = {
      __typename: 'category',
      id: `Category${i}`,
      name: `Category name ${i}`,
      description: `Description ${i}`,
      images: generateImages(maxImage),
      url: `/category-${i}`,
      products: generateProductSearchResultData(0, 0),
    };
  }
  data.totalCount = data.nodes.length;
  return data;
}

export function generatePageSearchResultData(
  maxItem: number
): PageItemsConnection {
  const data: PageItemsConnection = {
    nodes: [],
    edges: [],
    totalCount: 0,
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };
  for (let i = 0; i < maxItem; i++) {
    data.nodes[i] = {
      __typename: 'page',
      id: `Page${i}`,
      name: `Page name ${i}`,
      url: `/page-${i}`,
      fields: { _name: 'page', introduction: `Page description ${i}` },
    };
  }
  data.totalCount = data.nodes.length;
  return data;
}

const generateDiscount = (
  maxDiscount: number,
  discountType?: string,
  differentDiscountType?: boolean
): DiscountInfo[] => {
  const discountInfos: DiscountInfo[] = [];
  for (let i = 0; i < maxDiscount; i++) {
    discountInfos.push({
      discountType: differentDiscountType
        ? i % 2
          ? DiscountType.MixAndMatch
          : DiscountType.DiscountedProductPrice
        : discountType || DiscountType.MixAndMatch,
      resultOrderRow: {
        totalIncludingVat: -398,
        totalExcludingVat: -320,
        rowType: 'DISCOUNT',
        articleNumber: `abc-xyz-${i}`,
        quantity: i + 1,
        rowId: i.toString(),
        discountInfos: [],
      },
    });
  }

  return discountInfos;
};

export function generateCartLineItemData(
  maxItem: number,
  maxQuantity = 1,
  maxDiscount = 0,
  differentDiscountType = false,
  discountType?: string
): Cart {
  const data: Cart = {
    discountInfos: [],
    rows: [],
    grandTotal: maxItem * 1000,
    productCount: maxItem,
    discountCodes: [],
    totalVat: 0,
    showPricesIncludingVat: true,
    currency: {
      code: 'SEK',
      symbol: 'SEK',
      symbolPosition: 'RIGHT_WITH_SPACE',
      minorUnits: 0,
    },
  };

  for (let i = 0; i < maxItem; i++) {
    const cartLineItem: OrderRow = {
      discountInfos:
        maxDiscount > 0
          ? generateDiscount(maxDiscount, discountType, differentDiscountType)
          : [],
      rowId: i.toString(),
      articleNumber: `abc-xyz-${i}`,
      quantity: maxQuantity,
      totalIncludingVat: maxQuantity * 698,
      totalExcludingVat: maxQuantity * 560,
      product: generateProductItems(1, 1)[0],
      rowType: 'PRODUCT',
    };
    data.rows.push(cartLineItem);
  }
  return data;
}

export function generateProductItems(
  maxItem: number,
  maxImage: number
): ProductItem[] {
  const data: ProductItem[] = [];
  for (let i = 0; i < maxItem; i++) {
    data.push({
      __typename: 'product',
      id: `${new Date().toDateString()}-${i}`,
      name: `Product name ${i}`,
      fields: {
        brand: [{ name: `Brand name ${i}` }],
        color: [{ name: 'Black' }],
        size: [{ name: 'S' }],
      },
      description: `Description ${i}`,
      smallImages: generateImages(maxImage),
      largeImages: generateImages(maxImage),
      mediumImages: generateImages(maxImage),
      price: {
        currency: 'SEK',
        unitPriceIncludingVat: 1000,
        unitPriceExcludingVat: 800,
        discountPriceIncludingVat: null,
        discountPriceExcludingVat: null,
      },
      stockStatus: {
        inStockQuantity: 1,
      },
      rawData: {
        variants: [
          {
            fields: {
              color: [{ name: 'Black' }],
              size: [{ name: 'S' }],
            },
            url: '/woman/tops/court-dress-black_s',
          },
          {
            fields: {
              color: [{ name: 'Green' }],
              size: [{ name: 'L' }],
            },
            url: '/woman/tops/court-dress-northern-green_l',
          },
          {
            fields: {
              color: [{ name: 'Green' }],
              size: [{ name: 'M' }],
            },
            url: '/woman/tops/court-dress-northern-green_m',
          },
          {
            fields: {
              color: [{ name: 'Black' }],
              size: [{ name: 'M' }],
            },
            url: '/woman/tops/court-dress-black_m',
          },
          {
            fields: {
              color: [{ name: 'Black' }],
              size: [{ name: 'L' }],
            },
            url: '/woman/tops/court-dress-black_l',
          },
          {
            fields: {
              color: [{ name: 'Green' }],
              size: [{ name: 'S' }],
            },
            url: '/woman/tops/court-dress-northern-green_s',
          },
        ],
      } as any,
      parent: {
        id: `ParentTo${i}`,
        name: 'Tops',
        url: '/woman/tops',
        __typename: 'Category',
      },
      relationships: {
        similarProducts: {
          name: 'Similar products',
          items: {
            nodes: [],
          } as any,
        },
        accessory: {
          name: 'Accessories',
          items: {
            nodes: [],
          } as any,
        },
      },
      url: `/product-card-${i}`,
      thumbnailImages: generateImages(maxImage),
      articleNumber: `foo ${i}`,
      isVariant: true,
      fieldGroups: [] as any,
    });
  }
  return data;
}

export function generateOrganizationLinks(
  maxItem: number
): PersonOrganizationLink[] {
  const data: PersonOrganizationLink[] = [];
  for (let i = 0; i < maxItem; i++) {
    data.push({
      organization: {
        id: `${new Date().toDateString()}-${i}`,
        fields: {
          _nameInvariantCulture: `Organization ${i}`,
        },
      },
      roleOperations: [],
    });
  }
  return data;
}

export function generateOrganizationConnection(
  maxItem: number
): OrganizationConnection {
  return {
    edges: [],
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
    },
    totalCount: maxItem,
    nodes: generateOrganizationLinks(maxItem),
  };
}
