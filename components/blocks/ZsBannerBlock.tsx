import { Button } from 'components/elements/Button';
import { HtmlText } from 'components/elements/HtmlText';
import { Text } from 'components/elements/Text';
import { Block } from 'models/block';
import { ContentFieldType } from 'models/content';
import { TextOption } from 'models/option';
import {
  PointerMediaImageItem,
  PointerPageItem,
  PointerProductCategoryItem,
  PointerProductItem,
} from 'models/pointers';
import Image from 'next/image';
import Link from 'next/link';
import { getAbsoluteImageUrl } from 'services/imageService';
import 'styles/zitac/bannerBlock.scss';
import { imageConfiguration } from 'utils/responsive';

export interface ZsBannerType {
  linkText: string;
  actionText: string;
  zsTextEditor: string;
  zsBackgroundPosition?: TextOption[];
  zsBackgroundBlur?: TextOption[];
  zsBannerImageHeight?: boolean;
  zsBannerTextShadow?: boolean;
  zsBannerTextColor?: TextOption[];
  blockImagePointer?: PointerMediaImageItem;
  bannerLinkToCategory?: PointerProductCategoryItem[];
  bannerLinkToPage?: PointerPageItem[];
  bannerLinkToProduct?: PointerProductItem[];
}

export interface ZsBannerField extends ContentFieldType {
  zsBanner: ZsBannerType[];
}

interface ZsBannerBlockProps extends Block {
  fields: ZsBannerField;
}

/**
 * A template for ZsBlockBanner block type.
 * @param props an IBannerBlock input param.
 * @returns
 */
export default function ZsBannerBlock(props: ZsBannerBlockProps) {
  const { zsBanner } = props.fields;
  const filteredBanners = zsBanner
    ? zsBanner.filter((zsBanner) => zsBanner.blockImagePointer?.item?.url)
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
        return `grid-col-1 one`;
      //return `w-screen left-1/2 relative -translate-x-2/4`;
    }
  };

  return hasBanner ? (
    <div
      className={`zsBannerBlock grid grid-cols-1 ${generateGridCols()}`}
      data-testid="zs-banner-block"
    >
      {filteredBanners.map((zsBanner, index) => (
        <div
          key={`${props.systemId}-${index}`}
          className="relative"
          data-testid="banner-block__item"
        >
          <Banner
            zsBanner={zsBanner}
            priority={props.priority}
            sizes={(imageConfiguration.banners as any)[bannerPerRow].sizes}
          />
        </div>
      ))}
    </div>
  ) : (
    <></>
  );
}

function Banner({
  zsBanner,
  priority,
  sizes,
}: {
  zsBanner: ZsBannerType;
  priority?: boolean;
  sizes?: string;
}) {
  const url =
    zsBanner.bannerLinkToCategory?.[0]?.item?.url ??
    zsBanner.bannerLinkToPage?.[0]?.item?.url ??
    zsBanner.bannerLinkToProduct?.[0]?.item?.url;

  if (url) {
    return (
      <Link href={url} data-testid="banner-block__link-href">
        <BannerImage zsBanner={zsBanner} priority={priority} sizes={sizes} />
      </Link>
    );
  }
  return <BannerImage zsBanner={zsBanner} priority={priority} sizes={sizes} />;
}

function BannerImage({
  zsBanner,
  priority,
  sizes,
}: {
  zsBanner: ZsBannerType;
  priority?: boolean;
  sizes?: string;
}) {
  const image = zsBanner.blockImagePointer?.item;
  const imageUrl = image ? getAbsoluteImageUrl(image) : '';
  const useFill = !zsBanner.zsBannerImageHeight;
  const textColor = zsBanner.zsBannerTextColor?.[0]?.value ?? 'text-white';
  const textShadow = zsBanner.zsBannerTextShadow;

  return (
    <div
      className={`banner-container ${!useFill ? 'bannerImageHeight' : ''} relative h-full w-full overflow-hidden rounded-xl py-10 md:py-16`}
    >
      {image && (
        <Image
          src={imageUrl}
          alt={zsBanner.linkText || 'Banner image'}
          priority={priority}
          sizes={sizes}
          className={`w-full ${zsBanner.zsBackgroundPosition?.[0]?.value ?? 'object-center'} ${
            useFill ? 'object-cover brightness-75' : 'object-contain'
          }`}
          {...(useFill
            ? { fill: true }
            : {
                width: image.dimension?.width,
                height: image.dimension?.height,
              })}
        />
      )}
      <div
        className={`banner-content ${
          useFill ? 'relative' : 'absolute inset-0'
        } z-[2] flex flex-col items-center justify-center text-center`}
      >
        {zsBanner.linkText && (
          <Text
            className={`mb-2 font-heading text-2xl ${textColor} [text-shadow:_0_1px_6px_rgb(0_0_0_/_40%)] md:text-4xl`}
            data-testid="banner-block__link-text"
          >
            {zsBanner.linkText}
          </Text>
        )}
        {zsBanner.zsTextEditor && (
          <HtmlText
            className={`min-w-full ${textColor} ${textShadow ? 'html-editor-text-shadow' : ''}`}
            innerHTML={zsBanner.zsTextEditor}
            data-testid="text__editor"
          ></HtmlText>
        )}
        {zsBanner.actionText && (
          <Button
            data-testid="banner-block__action-text"
            className={`af:bg-af-orange mt-10 inline-block max-w-full rounded-md bg-seasea-blue px-10 py-2 text-sm text-white hover:brightness-90 md:text-base`}
          >
            {zsBanner.actionText}
          </Button>
        )}
      </div>
    </div>
  );
}
