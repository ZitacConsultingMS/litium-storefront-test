'use client';
import clsx from 'clsx';
import Currency from 'components/Currency';
import { Text } from 'components/elements/Text';
import { ProductPriceItem } from 'models/price';
import {
  getHelloRetailPriceByPriority,
  PriceDisplayInfo,
  PRICELIST_CODES,
} from 'utils/pricePriority';
import ProductPrice from './ProductPrice';

interface PriorityPriceDisplayProps {
  priorityPrice:
    | (Omit<PriceDisplayInfo, 'price' | 'referencePrice'> & {
        price: string;
        referencePrice?: string;
      })
    | null;
  regularPrice: ProductPriceItem | null | undefined;
  customRegularPrice?: string | null;
  size?: 'small' | 'large';
  className?: string;
  showDiscount?: boolean;
  showLabel?: boolean;
  dataTestId?: string;
  isVertical?: boolean;
  memberPrice?: number;
  campaignPrice?: number;
  showOnlyMedlemspris?: boolean;
  isLoading?: boolean;
  customLowestPrice?: string | null;
}

/**
 * Helper to check if a price value is valid (not NaN, null, or undefined)
 */
function isValidPrice(price: number | string | null | undefined): boolean {
  if (price == null) return false;
  const num = typeof price === 'string' ? Number(price) : price;
  return !isNaN(num) && isFinite(num);
}

/**
 * Helper to convert HelloRetail price result to display format
 */
function convertHelloRetailPrice(
  result: PriceDisplayInfo | null
): PriorityPriceDisplayProps['priorityPrice'] {
  if (!result || !isValidPrice(result.price)) return null;
  return {
    price: String(result.price),
    referencePrice:
      result.referencePrice && isValidPrice(result.referencePrice)
        ? String(result.referencePrice)
        : undefined,
    referencePriceKey: result.referencePriceKey,
    label: result.label,
    colorClass: result.colorClass,
    pricelistKey: result.pricelistKey,
    discountAmount: result.discountAmount,
    discountPercentage: result.discountPercentage,
  };
}

/**
 * Helper to render discount savings text
 */
function DiscountSavings({
  discountAmount,
  discountPercentage,
}: {
  discountAmount: number;
  discountPercentage: number;
}) {
  return (
    <div className="flex items-baseline gap-1 whitespace-nowrap">
      <Text inline>Du sparar </Text>
      <Currency price={discountAmount} />
      <Text inline>
        {' '}
        ({discountPercentage > 0 ? '-' : ''}
        {discountPercentage}%)
      </Text>
    </div>
  );
}

/**
 * Displays product price based on priority logic with proper labels and colors
 */
export default function PriorityPriceDisplay({
  priorityPrice,
  regularPrice,
  customRegularPrice,
  size = 'small',
  className = '',
  showDiscount = true,
  showLabel = true,
  dataTestId,
  isVertical = false,
  memberPrice,
  campaignPrice,
  showOnlyMedlemspris = false,
  isLoading = false,
  customLowestPrice,
}: PriorityPriceDisplayProps) {
  const textSize = size === 'large' ? 'text-2xl' : 'text-[1.18rem]';
  const gapClass = size === 'large' ? 'gap-3' : 'gap-2';

  // Show loading state when fetching from API
  if (isLoading) {
    return (
      <div className={className}>
        <div className={`flex flex-row items-baseline ${gapClass}`}>
          <div
            className={clsx(
              'animate-pulse rounded bg-gray-200',
              size === 'large' ? 'h-8 w-32' : 'h-5 w-24'
            )}
            data-testid={dataTestId ? `${dataTestId}__loading` : undefined}
          />
        </div>
      </div>
    );
  }

  // HelloRetail prices take precedence over regular priorityPrice
  const hasHelloRetailPrices =
    (campaignPrice != null && !isNaN(campaignPrice)) ||
    (memberPrice != null && !isNaN(memberPrice));

  const helloRetailPriorityPrice =
    hasHelloRetailPrices && regularPrice?.unitPriceIncludingVat
      ? convertHelloRetailPrice(
          getHelloRetailPriceByPriority(
            regularPrice.unitPriceIncludingVat,
            memberPrice,
            campaignPrice
          )
        )
      : null;

  const effectivePriorityPrice = helloRetailPriorityPrice || priorityPrice;

  // Price with label (SB or SD, or HelloRetail Medlemspris)
  if (effectivePriorityPrice?.label) {
    const { discountAmount, discountPercentage, label } =
      effectivePriorityPrice;

    // Validate the main price before rendering
    if (!isValidPrice(effectivePriorityPrice.price)) {
      return null;
    }

    const priceNum = Number(effectivePriorityPrice.price);
    const hasDiscountInfo =
      discountAmount != null && discountPercentage != null;
    const shouldShowLabel = !showOnlyMedlemspris || label === 'Medlemspris';

    const isMedlemspris = label === 'Medlemspris';
    const referencePriceClassName = isMedlemspris
      ? '!text-[0.95rem] text-dark-gray'
      : '!text-[0.95rem] text-dark-gray line-through';

    return (
      <div className={className}>
        <div className={`flex flex-row items-baseline ${gapClass}`}>
          <Currency
            price={priceNum}
            className={clsx(
              textSize,
              effectivePriorityPrice.colorClass || 'font-medium text-red',
              effectivePriorityPrice.colorClass?.includes('text-red') &&
                !effectivePriorityPrice.colorClass.includes('font-medium') &&
                'font-medium'
            )}
            data-testid={dataTestId}
          />
          {effectivePriorityPrice.referencePrice &&
            isValidPrice(effectivePriorityPrice.referencePrice) && (
              <ProductPrice
                price={regularPrice}
                customRegularPrice={effectivePriorityPrice.referencePrice}
                className={referencePriceClassName}
                showDiscount={false}
                data-testid={dataTestId}
              />
            )}
        </div>
        {showLabel && shouldShowLabel && (
          <div className="text-dark-gray">
            {hasDiscountInfo ? (
              <DiscountSavings
                discountAmount={discountAmount!}
                discountPercentage={discountPercentage!}
              />
            ) : (
              <Text inline>{label}</Text>
            )}
          </div>
        )}
        {customLowestPrice &&
          effectivePriorityPrice.pricelistKey ===
            PRICELIST_CODES.CAMPAIGN_PRICE && (
            <div>
              <span className="flex gap-1 whitespace-nowrap text-base italic text-dark-gray">
                <p>Lägsta pris senaste 30 dagarna: </p>
                <Currency price={Number(customLowestPrice)} />
              </span>
            </div>
          )}
      </div>
    );
  }

  // Price without label (SC or K1) - fallback to regular price
  const displayPrice =
    effectivePriorityPrice?.price ||
    customRegularPrice ||
    regularPrice?.unitPriceIncludingVat;

  // If no valid price exists, don't render anything
  if (!isValidPrice(displayPrice)) {
    return null;
  }

  const displayPriceNum = Number(displayPrice);
  const referencePriceFromPriority =
    effectivePriorityPrice?.referencePrice &&
    isValidPrice(effectivePriorityPrice.referencePrice)
      ? Number(effectivePriorityPrice.referencePrice)
      : null;
  const referencePriceFromDiscount =
    showDiscount &&
    regularPrice?.discountPriceIncludingVat &&
    isValidPrice(regularPrice.discountPriceIncludingVat) &&
    regularPrice.discountPriceIncludingVat !== displayPriceNum
      ? regularPrice.discountPriceIncludingVat
      : null;
  const referencePriceToShow =
    referencePriceFromPriority || referencePriceFromDiscount;

  const hasDiscount =
    referencePriceToShow != null && referencePriceToShow !== displayPriceNum;
  const baseColorClass =
    effectivePriorityPrice?.colorClass ||
    (hasDiscount ? 'text-red font-medium' : 'text-dark-gray');
  const priceColorClass =
    baseColorClass.includes('text-red') &&
    !baseColorClass.includes('font-medium')
      ? `${baseColorClass} font-medium`
      : baseColorClass;

  return (
    <div className={className}>
      <div className={`flex flex-row items-baseline ${gapClass}`}>
        <Currency
          price={displayPriceNum}
          className={clsx(textSize, priceColorClass)}
          data-testid={dataTestId}
        />
        {referencePriceToShow != null && (
          <Currency
            price={referencePriceToShow}
            className="!text-[0.95rem] text-dark-gray line-through"
            data-testid={dataTestId}
          />
        )}
      </div>
      {showLabel &&
        !showOnlyMedlemspris &&
        effectivePriorityPrice?.discountAmount != null &&
        effectivePriorityPrice?.discountPercentage != null && (
          <div className="text-dark-gray">
            <DiscountSavings
              discountAmount={effectivePriorityPrice.discountAmount}
              discountPercentage={effectivePriorityPrice.discountPercentage}
            />
          </div>
        )}
      {customLowestPrice &&
        effectivePriorityPrice?.pricelistKey ===
          PRICELIST_CODES.CAMPAIGN_PRICE && (
          <div>
            <span className="flex gap-1 whitespace-nowrap text-base italic text-dark-gray">
              <p>Lägsta pris senaste 30 dagarna: </p>
              <Currency price={Number(customLowestPrice)} />
            </span>
          </div>
        )}
    </div>
  );
}
