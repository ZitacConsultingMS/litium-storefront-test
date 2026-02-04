'use client';
import clsx from 'clsx';
import { Heading2 } from 'components/elements/Heading';
import SwiperNavigationButtons from 'components/elements/SwiperNavigationButtons';
import { useMemo, useRef } from 'react';
import { HelloRetailProduct } from 'services/zitac/helloretail/loadRecoms';
import { Scrollbar, Virtual } from 'swiper/modules';
import { Swiper, SwiperProps, SwiperSlide } from 'swiper/react';
import { mapHelloRetailToProductItem } from 'utils/helloRetailProductMapper';
import '../HorizontalProductList.scss';
import ProductCard from './ProductCard';

interface Breakpoints {
  320?: number;
  768?: number;
  1024?: number;
  1280?: number;
  1536?: number;
  default?: number;
}

/**
 * Renders a swipeable product list for HelloRetail recommendations.
 * @param items a list of HelloRetail products
 * @param title a title
 * @param slidesPerViewBreakpoints custom breakpoints for slidesPerView
 */
function HelloRetailHorizontalProductList({
  items,
  title,
  className,
  slidesPerViewBreakpoints,
}: {
  items: HelloRetailProduct[];
  title?: string;
  className?: string;
  slidesPerViewBreakpoints?: Breakpoints;
}) {
  const swiperRef = useRef<any>(null);
  const { swiperProps, navigationButtons } = SwiperNavigationButtons({
    swiperRef,
    className: 'outside',
  });

  const defaultBreakpoints = {
    320: 2,
    768: 3,
    1024: 3,
    1280: 4,
    1536: 5,
    default: 5,
  };

  const breakpoints = slidesPerViewBreakpoints || defaultBreakpoints;

  const params: SwiperProps = {
    breakpoints: {
      320: {
        slidesPerView: breakpoints[320] ?? defaultBreakpoints[320],
        spaceBetween: 8,
        slidesPerGroup: 1,
      },
      768: {
        slidesPerView: breakpoints[768] ?? defaultBreakpoints[768],
        spaceBetween: 8,
      },
      1024: {
        slidesPerView: breakpoints[1024] ?? defaultBreakpoints[1024],
        spaceBetween: 18,
        slidesPerGroup: 2,
      },
      1280: {
        slidesPerView:
          breakpoints[1280] ?? breakpoints.default ?? defaultBreakpoints[1280],
        spaceBetween: 20,
        slidesPerGroup: 3,
      },
      1536: {
        slidesPerView:
          breakpoints[1536] ?? breakpoints.default ?? defaultBreakpoints[1536],
        spaceBetween: 20,
        slidesPerGroup: 4,
      },
    },
    slidesPerView:
      breakpoints.default ?? breakpoints[1280] ?? defaultBreakpoints.default,
    scrollbar: {
      draggable: true,
    },
    virtual: true,
    modules: [Virtual, Scrollbar],
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
      className={clsx('my-5', className)}
      data-testid="helloretail-horizontal-product-list__container"
    >
      {title && (
        <Heading2
          className="mb-4 text-h2"
          data-testid="helloretail-horizontal-product-list__title"
        >
          {title}
        </Heading2>
      )}
      <div className="relative">
        <Swiper
          {...params}
          className="[&>.swiper-wrapper:has(+.swiper-scrollbar-lock)]:pb-0 [&>.swiper-wrapper]:pb-4"
        >
          {mappedItems.map((item, index) => (
            <SwiperSlide key={item.articleNumber} className="min-w-[175px]">
              <ProductCard
                {...item}
                showBuyButton={true}
                inStock={item.originalHelloRetailItem.inStock}
                isHelloRetail={true}
              />
            </SwiperSlide>
          ))}
        </Swiper>
        {navigationButtons}
      </div>
    </div>
  );
}

export default HelloRetailHorizontalProductList;
