'use client';
import clsx from 'clsx';
import { Heading2 } from 'components/elements/Heading';
import SwiperNavigationButtons from 'components/elements/SwiperNavigationButtons';
import { ProductItem } from 'models/(zitac)/products';
import { useRef } from 'react';
import { Scrollbar, Virtual } from 'swiper/modules';
import { Swiper, SwiperProps, SwiperSlide } from 'swiper/react';
import '../HorizontalProductList.scss';
import ProductCard from './ProductCard';

/**
 * Renders a swipeable product list.
 * @param items a list of product.
 * @param title a title
 */
function HorizontalProductList({
  items,
  title,
  className,
}: {
  items: ProductItem[];
  title?: string;
  className?: string;
}) {
  const swiperRef = useRef<any>(null);
  const { swiperProps, navigationButtons } = SwiperNavigationButtons({
    swiperRef,
    className: 'outside',
  });

  const params: SwiperProps = {
    breakpoints: {
      320: {
        slidesPerView: 2,
        spaceBetween: 8,
        slidesPerGroup: 1,
      },
      768: {
        slidesPerView: 3,
        spaceBetween: 8,
      },
      1024: {
        slidesPerView: 3,
        spaceBetween: 18,
        slidesPerGroup: 2,
      },
      1280: {
        slidesPerView: 4,
        spaceBetween: 20,
        slidesPerGroup: 3,
      },
      1536: {
        slidesPerView: 5,
        spaceBetween: 20,
        slidesPerGroup: 4,
      },
    },
    slidesPerView: 5,
    slidesPerGroup: 2,
    scrollbar: {
      draggable: true,
    },
    virtual: true,
    modules: [Virtual, Scrollbar],
    ...swiperProps,
  };

  // Ensure items is an array and filter out items without URLs
  const filteredItems =
    items?.filter((item) => {
      return item?.url !== undefined;
    }) || [];

  if (!filteredItems.length) {
    return null;
  }

  return (
    <div
      className={clsx('my-5', className)}
      data-testid="horizontal-product-list__container"
    >
      {title && (
        <Heading2
          className="mb-4 text-h2"
          data-testid="horizontal-product-list__title"
        >
          {title}
        </Heading2>
      )}
      <div className="relative">
        <Swiper
          {...params}
          className="[&>.swiper-wrapper:has(+.swiper-scrollbar-lock)]:pb-0 [&>.swiper-wrapper]:pb-4"
        >
          {filteredItems.map((item, index) => (
            <SwiperSlide key={item.articleNumber} className="min-w-[175px]">
              <ProductCard {...item} showBuyButton={true} />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Navigation Buttons */}
        {navigationButtons}
      </div>
    </div>
  );
}

export default HorizontalProductList;
