'use client';
import { Heading2 } from 'components/elements/Heading';
import ProductList from 'components/products/zitac/ProductList';
import { useTranslations } from 'hooks/useTranslations';
import { ProductItem, ProductSearchConnection } from 'models/(zitac)/products';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { normalizeUrlPath } from 'utils/motorsok';

interface MotorsokProductGridProps {
  products: ProductSearchConnection;
  totalCount: number;
  showLoadMore?: boolean;
  categoryId?: string;
  productListId?: string;
  onItemClick?: () => void;
  searchResultPage?: boolean;
  groupByCategory?: boolean;
}

interface CategoryInfo {
  id: string;
  name: string;
  url?: string;
}

type GroupedProducts = Map<
  string,
  { category: CategoryInfo; products: ProductItem[] }
>;

/**
 *  Validates that products are only shown at level 3 (motorsok/brand/category/subcategory)
 *  Optionally groups products by their main category (Huvudkategori)
 *  Fetches category data as needed for grouping
 */
export default function MotorsokProductGrid({
  products,
  totalCount,
  showLoadMore = true,
  categoryId,
  productListId,
  onItemClick,
  searchResultPage = false,
  groupByCategory = false,
}: MotorsokProductGridProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const [categoryCache, setCategoryCache] = useState<Map<string, CategoryInfo>>(
    new Map()
  );
  const fetchingRef = useRef<Set<string>>(new Set());

  // fetch category data for unique category URLs when grouping is enabled
  useEffect(() => {
    if (!groupByCategory || !products.nodes) return;

    const categoryUrlsToFetch = collectCategoryUrlsToFetch(
      products.nodes,
      categoryCache,
      fetchingRef
    );

    if (categoryUrlsToFetch.size > 0) {
      fetchCategories(categoryUrlsToFetch, setCategoryCache, fetchingRef);
    }
  }, [products.nodes, groupByCategory, categoryCache]);

  // group products by their main category (Huvudkategori)
  const { groupedProducts, ungroupedProducts } = useMemo(() => {
    if (!groupByCategory || !products.nodes) {
      return { groupedProducts: null, ungroupedProducts: [] };
    }

    const grouped: GroupedProducts = new Map();
    const ungrouped: ProductItem[] = [];

    products.nodes.forEach((product) => {
      const mainCategory = findMainCategory(product, categoryCache);
      if (mainCategory) {
        addToGroup(grouped, mainCategory.id, mainCategory, product);
      } else {
        ungrouped.push(product);
      }
    });

    // convert to array and sort by category name
    const groupedArray = Array.from(grouped.values()).sort((a, b) =>
      a.category.name.localeCompare(b.category.name)
    );

    return {
      groupedProducts: groupedArray.length > 0 ? groupedArray : null,
      ungroupedProducts: ungrouped,
    };
  }, [products.nodes, groupByCategory, categoryCache]);

  // Show products at level 3 and beyond
  const pathSegments = pathname
    .replace(/^\//, '')
    .replace(/\/$/, '')
    .split('/')
    .filter(Boolean);
  const shouldShowProducts =
    pathSegments.length >= 4 && pathSegments[0] === 'motorsok';
  if (!shouldShowProducts) {
    return null;
  }

  /*
  const productHeader = (
    <div className="flex items-center justify-between pb-4 pt-2">
      <Text className="text-secondary-2" data-testid="productgrid__heading">
        {totalCount} {t('productsearchresult.products')}
      </Text>
    </div>
  );
  */

  if (groupByCategory && (groupedProducts || ungroupedProducts.length > 0)) {
    return (
      <div className="w-full">
        {/* productHeader */}
        <div className="space-y-12">
          {groupedProducts?.map(({ category, products: categoryProducts }) => (
            <div key={category.id} className="w-full">
              <Heading2 className="mb-6 text-xl font-semibold">
                {category.name}
              </Heading2>
              <div>
                <ProductList
                  nodes={categoryProducts}
                  edges={[]}
                  pageInfo={products.pageInfo}
                  facets={products.facets}
                  sortCriteria={products.sortCriteria || []}
                  totalCount={categoryProducts.length}
                  showLoadMoreButton={false}
                  onClick={onItemClick}
                  categoryId={categoryId}
                  productListId={productListId}
                  searchResultPage={searchResultPage}
                />
              </div>
            </div>
          ))}
          {ungroupedProducts.length > 0 && (
            <div className="w-full">
              <ProductList
                nodes={ungroupedProducts}
                edges={[]}
                pageInfo={products.pageInfo}
                facets={products.facets}
                sortCriteria={products.sortCriteria || []}
                totalCount={ungroupedProducts.length}
                showLoadMoreButton={false}
                onClick={onItemClick}
                categoryId={categoryId}
                productListId={productListId}
                searchResultPage={searchResultPage}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default display: show all products in a single list
  return (
    <div className="w-full">
      <div>
        <ProductList
          {...products}
          showLoadMoreButton={showLoadMore}
          onClick={onItemClick}
          categoryId={categoryId}
          productListId={productListId}
          searchResultPage={searchResultPage}
        />
      </div>
    </div>
  );
}

/**
 * Collects category URLs that need to be fetched.
 */
function collectCategoryUrlsToFetch(
  products: ProductItem[],
  categoryCache: Map<string, CategoryInfo>,
  fetchingRef: { current: Set<string> }
): Set<string> {
  const urlsToFetch = new Set<string>();

  for (const product of products) {
    if (!product.url) continue;

    const expectedCategoryUrlPath = getExpectedMainCategoryUrlPath(product.url);
    if (!expectedCategoryUrlPath) continue;

    if (hasCategoryData(product, expectedCategoryUrlPath, categoryCache)) {
      continue;
    }

    if (
      !categoryCache.has(expectedCategoryUrlPath) &&
      !fetchingRef.current.has(expectedCategoryUrlPath)
    ) {
      urlsToFetch.add(expectedCategoryUrlPath);
      fetchingRef.current.add(expectedCategoryUrlPath);
    }
  }

  return urlsToFetch;
}

/**
 * Extracts the expected main category URL path from a product URL.
 * Example: /produkter/motortillbehor/branslesystem/kopplingar/product
 * -> produkter/motortillbehor/branslesystem/kopplingar
 */
function getExpectedMainCategoryUrlPath(productUrl: string): string | null {
  const segments = normalizeUrlPath(productUrl).split('/').filter(Boolean);
  return segments.length >= 2 ? segments.slice(0, -1).join('/') : null;
}

/**
 * Checks if we already have category data for a product (from parent or cache).
 */
function hasCategoryData(
  product: ProductItem,
  expectedCategoryUrlPath: string,
  categoryCache: Map<string, CategoryInfo>
): boolean {
  if (product.parent?.url) {
    if (normalizeUrlPath(product.parent.url) === expectedCategoryUrlPath) {
      return true;
    }
  }

  const parents = product.parents?.nodes;
  if (parents) {
    const matchingParent = parents.find((parent) => {
      return (
        parent?.url && normalizeUrlPath(parent.url) === expectedCategoryUrlPath
      );
    });
    if (matchingParent) {
      return true;
    }
  }

  return categoryCache.has(expectedCategoryUrlPath);
}

/**
 * Fetches category data for multiple URLs in parallel.
 */
async function fetchCategories(
  categoryUrls: Set<string>,
  setCategoryCache: React.Dispatch<
    React.SetStateAction<Map<string, CategoryInfo>>
  >,
  fetchingRef: { current: Set<string> }
) {
  const fetchPromises = Array.from(categoryUrls).map(
    async (categoryUrlPath) => {
      try {
        const response = await fetch(
          `/api/category/by-url?url=${encodeURIComponent('/' + categoryUrlPath)}`
        );
        if (response.ok) {
          const data = await response.json();
          return { urlPath: categoryUrlPath, category: data };
        }
      } catch (error) {
        console.error(`Error fetching category for ${categoryUrlPath}:`, error);
      } finally {
        fetchingRef.current.delete(categoryUrlPath);
      }
      return null;
    }
  );

  Promise.all(fetchPromises).then((results) => {
    setCategoryCache((prevCache) => {
      const newCache = new Map(prevCache);
      results.forEach((result) => {
        if (result?.category) {
          newCache.set(result.urlPath, {
            id: result.category.id,
            name: result.category.name,
            url: result.category.url,
          });
        }
      });
      return newCache;
    });
  });
}

/**
 * Finds the main category (Huvudkategori) for a product.
 *
 * The main category is determined from the product's URL structure.
 * Uses cached category data (fetched via API) when available, otherwise extracts from URL.
 */
function findMainCategory(
  product: ProductItem,
  categoryCache: Map<string, CategoryInfo>
): CategoryInfo | null {
  if (!product.url) return null;

  // Extract the expected category URL from the product URL (remove the product slug)
  const productUrlPath = normalizeUrlPath(product.url);
  const productSegments = productUrlPath.split('/').filter(Boolean);
  const expectedMainCategoryUrlPath =
    productSegments.length > 1 ? productSegments.slice(0, -1).join('/') : null;

  if (!expectedMainCategoryUrlPath) return null;

  // Strategy 1: Use cached category (fetched via API) - most reliable
  const cachedCategory = categoryCache.get(expectedMainCategoryUrlPath);
  if (cachedCategory) {
    return cachedCategory;
  }

  // Strategy 2: Extract from URL as fallback
  return extractCategoryFromUrl(productSegments, expectedMainCategoryUrlPath);
}

/**
 * Extracts category info from URL slug as fallback.
 */
function extractCategoryFromUrl(
  productSegments: string[],
  expectedUrl: string
): CategoryInfo {
  const categorySlug = productSegments[productSegments.length - 2];
  const categoryName = categorySlug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    id: expectedUrl || categorySlug,
    name: categoryName,
    url: `/${expectedUrl}`,
  };
}

/**
 * Adds a product to a group in the grouped map.
 */
function addToGroup(
  grouped: GroupedProducts,
  categoryKey: string,
  category: CategoryInfo,
  product: ProductItem
) {
  if (!grouped.has(categoryKey)) {
    grouped.set(categoryKey, { category, products: [] });
  }
  grouped.get(categoryKey)!.products.push(product);
}
