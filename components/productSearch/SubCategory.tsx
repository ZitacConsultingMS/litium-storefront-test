'use client';
import Link from 'components/Link';
import { CategoryItem } from 'models/category';
import { useEffect, useRef } from 'react';
import { Scrollbar } from 'swiper/modules';
import { Swiper, SwiperProps, SwiperSlide } from 'swiper/react';
import './SubCategory.scss';

/**
 * Renders a subcategory list.
 * @param subCategories a subcategory list of category.
 */
function SubCategory({ subCategories }: { subCategories: CategoryItem[] }) {
  const swiperRef = useRef<any>(null);
  const params: SwiperProps = {
    slidesPerView: 'auto',
    spaceBetween: 10,
    scrollbar: true,
    modules: [Scrollbar],
    onSwiper: (swiper: any) => (swiperRef.current = swiper),
  };

  useEffect(() => {
    const breakpointChecker = function () {
      let breakpoint = window?.matchMedia('(min-width: 1024px)');
      if (breakpoint.matches === true) {
        swiperRef.current.disable();
      } else {
        swiperRef.current.enable();
      }
    };

    window?.addEventListener('resize', breakpointChecker);
    breakpointChecker();
    return () => window?.removeEventListener('resize', breakpointChecker);
  }, []);
  return (
    <div className="sub-category -mx-5 mb-5">
      <div className="mb-3 px-5">
        {!!subCategories && (
          <Swiper {...params}>
            {subCategories
              .filter(({ url, name }) => {
                return !!url && !!name;
              })
              .map((item, index) => (
                <SwiperSlide key={item?.url || index}>
                  <div className="mr-2 rounded bg-secondary-3 px-3 py-1 text-sm last:mr-0 lg:mb-2">
                    <Link href={item?.url} data-testid="sub-category">
                      {item.name}
                    </Link>
                  </div>
                </SwiperSlide>
              ))}
          </Swiper>
        )}
      </div>
    </div>
  );
}

export default SubCategory;
