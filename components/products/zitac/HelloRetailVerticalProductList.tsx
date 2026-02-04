'use client';
import clsx from 'clsx';
import SwiperNavigationButtons from 'components/elements/SwiperNavigationButtons';
import { Text } from 'components/elements/Text';
import { useMemo, useRef } from 'react';
import { HelloRetailProduct } from 'services/zitac/helloretail/loadRecoms';
import { Pagination, Scrollbar } from 'swiper/modules';
import { Swiper, SwiperProps, SwiperSlide } from 'swiper/react';
import { mapHelloRetailToProductItem } from 'utils/helloRetailProductMapper';
import ProductCard from './ProductCard';

/**
 * Renders a swipeable vertical product list for HelloRetail recommendations.
 * @param items a list of HelloRetail products
 * @param title a title
 */
function HelloRetailVerticalProductList({
  items,
  title,
  className,
  height = 650,
}: {
  items: HelloRetailProduct[];
  title?: string;
  className?: string;
  height?: number;
}) {
  const swiperRef = useRef<any>(null);
  const { swiperProps, navigationButtons } = SwiperNavigationButtons({
    swiperRef,
    orientation: 'vertical',
  });

  const params: SwiperProps = {
    direction: 'vertical',
    slidesPerView: 'auto',
    spaceBetween: 15,
    mousewheel: true,
    modules: [Pagination, Scrollbar],
    pagination: { clickable: true },
    scrollbar: { draggable: true, hide: true },
    ...swiperProps,
  };

  // Ensure items is an array and filter out items without URLs
  const filteredItems = useMemo(
    () =>
      items?.filter((item) => {
        return item?.url !== undefined;
      }) || [],
    [items]
  );

  // Map HelloRetail products to ProductItems synchronously
  const mappedItems = useMemo(
    () =>
      filteredItems.map((item) => ({
        ...mapHelloRetailToProductItem(item),
        originalHelloRetailItem: item, // Keep reference for inStock prop
      })),
    [filteredItems]
  );

  if (!filteredItems.length) {
    return null;
  }

  return (
    <div
      className={clsx('relative', className)}
      data-testid="helloretail-vertical-product-list__container"
    >
      {title && (
        <Text data-testid="horizontal-product-list__title">{title}</Text>
      )}
      <div className="relative my-6 h-[700px] rounded">
        <Swiper {...params} className="h-full">
          {mappedItems.map((item, index) => (
            <SwiperSlide
              key={item.articleNumber}
              style={{ height: `${height / 2.5}px` }}
            >
              <ProductCard
                {...item}
                showBuyButton={true}
                isVertical={true}
                inStock={item.originalHelloRetailItem.inStock}
                isHelloRetail={true}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Navigation Buttons */}
        {navigationButtons}
      </div>
    </div>
  );
}

export default HelloRetailVerticalProductList;
