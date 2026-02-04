'use client';
import Link from 'components/Link';
import SwiperNavigationButtons from 'components/elements/SwiperNavigationButtons';
import { WebsiteContext } from 'contexts/websiteContext';
import { CategoryItem } from 'models/category';
import Image from 'next/image';
import { useContext, useRef } from 'react';
import { getAbsoluteImageUrl } from 'services/imageService';
import { Swiper, SwiperProps, SwiperSlide } from 'swiper/react';
import '../SubCategory.scss';

/**
 * Renders a subcategory item card.
 */
function SubCategoryItem({
  item,
  index,
  fullWidth = false,
  className = '',
}: {
  item: CategoryItem;
  index: number;
  fullWidth?: boolean;
  className?: string;
}) {
  const website = useContext(WebsiteContext);

  return (
    <div
      className={`h-full overflow-hidden rounded bg-[#efefef] text-sm ${
        fullWidth ? 'w-full' : 'w-36'
      } ${className}`.trim()}
    >
      <Link
        href={item?.url}
        data-testid="sub-category"
        className="flex h-full flex-col items-center overflow-hidden"
      >
        {(() => {
          const image = item.images?.[0];
          const imageUrl = image
            ? getAbsoluteImageUrl(image, website?.imageServerUrl)
            : '';
          return imageUrl ? (
            <div className="flex h-20 w-full flex-shrink-0 items-center justify-center bg-white p-2">
              <Image
                src={imageUrl}
                alt={item.name}
                width={64}
                height={64}
                className="h-16 w-16 object-contain"
                unoptimized={true}
              />
            </div>
          ) : (
            <div className="flex h-20 w-full flex-shrink-0 items-center justify-center bg-white p-2">
              <span> </span>
            </div>
          );
        })()}
        <div className="flex min-h-[3rem] flex-1 items-center justify-center break-words px-2 py-2.5 text-center leading-tight">
          {item.name}
        </div>
      </Link>
    </div>
  );
}

/**
 * Renders a subcategory list.
 * @param subCategories a subcategory list of category.
 * @param layout 'swiper' for horizontal swiper (default) or 'vertical' for vertical list
 */
function SubCategory({
  subCategories,
  layout = 'swiper',
}: {
  subCategories: CategoryItem[];
  layout?: 'swiper' | 'vertical';
}) {
  const swiperRef = useRef<any>(null);
  const { swiperProps, navigationButtons } = SwiperNavigationButtons({
    swiperRef,
    className: 'outside',
  });

  const params: SwiperProps = {
    slidesPerView: 'auto',
    spaceBetween: 10,
    speed: 300,
    slidesPerGroup: 3,
    allowTouchMove: true,
    modules: [],
    ...swiperProps,
  };

  const filteredCategories = subCategories.filter(({ url, name }) => {
    return !!url && !!name;
  });

  if (!filteredCategories.length) {
    return null;
  }

  if (layout === 'vertical') {
    return (
      <div className="sub-category mb-12">
        <div className="grid grid-cols-2 justify-items-center gap-3 sm:grid-cols-[repeat(auto-fill,minmax(144px,1fr))]">
          {filteredCategories.map((item, index) => (
            <SubCategoryItem
              key={item?.url || index}
              item={item}
              index={index}
              className="w-full"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="sub-category -mx-5 mb-12">
      <div className="relative mx-5">
        <Swiper {...params}>
          {filteredCategories.map((item, index) => (
            <SwiperSlide key={item?.url || index}>
              <SubCategoryItem
                item={item}
                index={index}
                className="mr-2 last:mr-0"
              />
            </SwiperSlide>
          ))}
        </Swiper>
        {navigationButtons}
      </div>
    </div>
  );
}

export default SubCategory;
