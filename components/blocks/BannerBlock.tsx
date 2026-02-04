import clsx from 'clsx';
import Link from 'components/Link';
import { Button } from 'components/elements/Button';
import { Text } from 'components/elements/Text';
import { Block } from 'models/block';
import { ContentFieldType } from 'models/content';
import {
  PointerMediaImageItem,
  PointerPageItem,
  PointerProductCategoryItem,
  PointerProductItem,
} from 'models/pointers';
import Image from 'next/image';
import { Fragment } from 'react';
import { getAbsoluteImageUrl } from 'services/imageService';
import { imageConfiguration } from 'utils/responsive';

export interface BannerType {
  linkText: string;
  actionText: string;
  blockImagePointer?: PointerMediaImageItem;
  bannerLinkToCategory?: PointerProductCategoryItem[];
  bannerLinkToPage?: PointerPageItem[];
  bannerLinkToProduct?: PointerProductItem[];
}

export interface BannerField extends ContentFieldType {
  banners: BannerType[];
}

interface BannerBlockProps extends Block {
  fields: BannerField;
}

/**
 * A template for BlockBanner block type.
 * @param props an IBannerBlock input param.
 * @returns
 */
export default function BannerBlock(props: BannerBlockProps) {
  const { banners } = props.fields;
  const filteredBanners = banners
    ? banners.filter((banner) => banner.blockImagePointer?.item?.url)
    : [];
  const hasBanner = filteredBanners.length > 0;
  const bannerPerRow = hasBanner ? Math.min(filteredBanners.length, 4) : 1;
  const generateGridCols = () => {
    switch (bannerPerRow) {
      case 4:
        return `gap-6 lg:grid-cols-4`;
      case 3:
        return `gap-6 lg:grid-cols-3`;
      case 2:
        return `gap-6 lg:grid-cols-2`;
      default:
        return ``;
    }
  };

  const generateFontSize = () => {
    switch (bannerPerRow) {
      case 4:
        return `text-4xl md:text-5xl`;
      case 3:
        return `text-4xl md:text-5xl xl:text-7xl`;
      case 2:
        return `text-4xl md:text-5xl lg:text-7xl xl:text-9xl`;
      default:
        return `text-4xl md:text-5xl lg:text-9xl`;
    }
  };

  return hasBanner ? (
    <div className={clsx(bannerPerRow > 1 ? 'container mx-auto px-5' : '')}>
      <div
        className={`grid grid-cols-1 ${generateGridCols()}`}
        data-testid="block-banner"
      >
        {filteredBanners.map((banner, index) => (
          <div
            key={`${props.systemId}-${index}`}
            className="relative"
            data-testid="block-banner__item"
          >
            <Banner
              banner={banner}
              priority={props.priority}
              sizes={(imageConfiguration.banners as any)[bannerPerRow].sizes}
              fontSize={generateFontSize()}
            />
          </div>
        ))}
      </div>
    </div>
  ) : (
    <></>
  );
}

function Banner({
  banner,
  priority,
  sizes,
  fontSize,
}: {
  banner: BannerType;
  priority?: boolean;
  sizes?: string;
  fontSize?: string;
}) {
  const url =
    banner.bannerLinkToCategory?.[0]?.item?.url ??
    banner.bannerLinkToPage?.[0]?.item?.url ??
    banner.bannerLinkToProduct?.[0]?.item?.url;

  if (url) {
    return (
      <Link
        href={url}
        data-testid="block-banner__link-href"
        aria-label={banner.actionText || banner.linkText || ''}
      >
        <BannerImage
          banner={banner}
          priority={priority}
          sizes={sizes}
          fontSize={fontSize}
        />
      </Link>
    );
  }
  return (
    <BannerImage
      banner={banner}
      priority={priority}
      sizes={sizes}
      fontSize={fontSize}
    />
  );
}

function BannerImage({
  banner,
  priority,
  sizes,
  fontSize,
}: {
  banner: BannerType;
  priority?: boolean;
  sizes?: string;
  fontSize?: string;
}) {
  return (
    <Fragment>
      {banner.blockImagePointer?.item?.url && (
        <Image
          priority={priority}
          src={getAbsoluteImageUrl(banner.blockImagePointer.item)}
          height={banner.blockImagePointer.item.dimension.height}
          width={banner.blockImagePointer.item.dimension.width}
          sizes={sizes}
          alt={banner.actionText || banner.linkText || ''}
          style={{
            width: '100%',
            objectFit: 'cover',
            maxHeight: banner.blockImagePointer.item.dimension.height,
          }}
          data-testid="block-banner__image"
        />
      )}
      <div className="absolute left-[50%] top-[50%] w-10/12 translate-x-[-50%] translate-y-[-50%] text-center">
        {banner.linkText && (
          <Text
            className={`mb-0 text-secondary ${fontSize}`}
            data-testid="block-banner__link-text"
          >
            {banner.linkText}
          </Text>
        )}
        {banner.actionText && (
          <Button
            data-testid="block-banner__action-text"
            rounded={true}
            className="mt-5 inline-block max-w-full px-10 py-2 text-sm"
          >
            {banner.actionText}
          </Button>
        )}
      </div>
    </Fragment>
  );
}
