'use client';

import { Text } from 'components/elements/Text';
import { useTranslations } from 'hooks/useTranslations';

/**
 * Represents a component to display a stock status
 * @param inStockQuantity quantity in stock.
 * @param className optional custom css class name.
 * @returns
 */
function StockStatus({
  inStockQuantity,
  className,
  ...props
}: {
  inStockQuantity: number;
  className?: string;
}) {
  const t = useTranslations();
  return (
    <Text className={className} {...props}>
      {inStockQuantity > 0
        ? t('stockstatus.instock')
        : t('stockstatus.outofstock')}
    </Text>
  );
}

export default StockStatus;
