import { useEffect, useState } from 'react';
import { articleCache } from 'services/zitac/articleCache';
import getCustomArticleDetails, {
  Article,
} from 'services/zitac/customArticleService';
import { getPriceByPriority as getPriceByPriorityUtil } from 'utils/pricePriority';

export function useCustomArticleDetails(articleNumber: string | number) {
  const [articleDetails, setArticleDetails] = useState<Article | null>(null);
  const [articleLoading, setArticleLoading] = useState(true);
  const [articleError, setArticleError] = useState<string | null>(null);

  useEffect(() => {
    const cachedArticle = articleCache.get(articleNumber);
    if (cachedArticle) {
      setArticleDetails(cachedArticle);
      setArticleLoading(false);
      setArticleError(null);
      return;
    }

    let alive = true;
    setArticleLoading(true);
    setArticleError(null);

    getCustomArticleDetails(articleNumber)
      .then((a) => {
        if (alive) setArticleDetails(a);
      })
      .catch((e) => {
        if (alive) setArticleError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (alive) setArticleLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [articleNumber]);

  const getLowestPrice = () => {
    const priceList = articleDetails?.priceList?.LagstaPris30Dag;
    if (!priceList || priceList.length === 0) return null;

    // Handle both camelCase (Price) and lowercase (price) from API
    const firstItem = priceList[0] as any;
    const lowestPrice =
      firstItem?.Price !== undefined ? firstItem.Price : firstItem?.price;
    return lowestPrice != null ? String(lowestPrice) : null;
  };

  const getPriceByPriorityWithKey = () => {
    const result = getPriceByPriorityUtil(articleDetails?.priceList);
    if (!result) return null;
    return {
      price: String(result.price),
      pricelistKey: result.pricelistKey,
      referencePrice: result.referencePrice
        ? String(result.referencePrice)
        : undefined,
      referencePriceKey: result.referencePriceKey,
      label: result.label,
      colorClass: result.colorClass,
      discountPercentage: result.discountPercentage,
      discountAmount: result.discountAmount,
    };
  };

  return {
    articleDetails,
    articleLoading,
    articleError,
    getLowestPrice,
    getPriceByPriorityWithKey,
  };
}
