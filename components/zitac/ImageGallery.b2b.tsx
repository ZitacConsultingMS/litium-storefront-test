'use client';
import clsx from 'clsx';
import { Button } from 'components/elements/Button';
import { WebsiteContext } from 'contexts/websiteContext';
import { useBodyScroll } from 'hooks/useBodyScroll';
import { useTranslations } from 'hooks/useTranslations';
import { Image as ImageModel } from 'models/image';
import Image from 'next/image';
import { Fragment, useCallback, useContext, useState } from 'react';
import { getAbsoluteImageUrl } from 'services/imageService';
import { FreeMode, Navigation, Scrollbar, Thumbs } from 'swiper/modules';
import { Swiper, SwiperProps, SwiperSlide } from 'swiper/react';
import { filterValidImages } from 'utils/imageUtils';
import { imageConfiguration } from 'utils/responsive';
import { Text } from '../elements/Text';
import Close from '../icons/zitac/close';
import '../ImageGallery.scss';
import Sidebar from '../Sidebar';

interface ImageGalleryProps {
  /**
   * List of thumbnail images to be shown.
   */
  thumbnailImages: ImageModel[];
  /**
   * List of large images to be shown.
   */
  largeImages: ImageModel[];

  /**
   * Alternative text for images that are broken.
   */
  alternativeText: string;
  /**
   * Field groups containing product tags
   */
  fieldGroups?: any[];
}

/**
 * Render image gallery
 * @param props gallery's image
 */
const ImageGallery = (props: ImageGalleryProps) => {
  const [modalVisibility, setModalVisibility] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [blockBodyScroll, allowBodyScroll] = useBodyScroll();
  const t = useTranslations();

  const onClose = useCallback(() => {
    setModalVisibility(false);
    allowBodyScroll();
  }, [allowBodyScroll]);
  const onClickImage = useCallback(
    (index: number) => {
      setCurrentIndex(index);
      setModalVisibility(true);
      blockBodyScroll();
    },
    [blockBodyScroll]
  );
  // Filter out non-image files (like PDFs)
  const validThumbnailImages = filterValidImages(props.thumbnailImages || []);
  const validLargeImages = filterValidImages(props.largeImages || []);

  const noImage =
    !validThumbnailImages?.length ||
    !validThumbnailImages[0] ||
    !validLargeImages?.length ||
    !validLargeImages[0];

  return noImage ? (
    <Fragment />
  ) : (
    <Fragment>
      <div className="flex flex-col-reverse flex-wrap gap-y-2 lg:flex-row">
        <div className="hidden w-full lg:block">
          <ThumbsGallery
            largeImages={validLargeImages}
            thumbnailImages={validThumbnailImages}
            alternativeText={props.alternativeText}
            selectedSlideIndex={currentIndex}
            onClick={onClickImage}
            fieldGroups={props.fieldGroups}
          ></ThumbsGallery>
        </div>
        <div className="block w-full lg:hidden">
          <HorizontalGallery
            images={validLargeImages}
            alternativeText={props.alternativeText}
            selectedSlideIndex={currentIndex}
            onClick={onClickImage}
            fieldGroups={props.fieldGroups}
          ></HorizontalGallery>
        </div>
      </div>
      {modalVisibility && (
        <Sidebar visible={modalVisibility} fullscreen={true} className="!p-0">
          <div className="max-h-full">
            <div className="flex justify-center p-4">
              <Text className="w-full text-center text-sm">
                {t('productdetail.imagegallery.title')}
              </Text>
              <Button
                className="!border-0 !bg-transparent p-0 text-primary"
                aria-label={t('commons.closeimagegallery')}
                onClick={onClose}
              >
                <Close />
              </Button>
            </div>
            <div className="h-full">
              <div className="hidden lg:block">
                <ThumbsGallery
                  largeImages={validLargeImages}
                  thumbnailImages={validThumbnailImages}
                  alternativeText={props.alternativeText}
                  selectedSlideIndex={currentIndex}
                  fullscreen={true}
                  fieldGroups={props.fieldGroups}
                ></ThumbsGallery>
              </div>
              <div className="mb-4 block lg:hidden">
                <HorizontalGallery
                  images={validLargeImages}
                  alternativeText={props.alternativeText}
                  selectedSlideIndex={currentIndex}
                  fullscreen={true}
                  fieldGroups={props.fieldGroups}
                ></HorizontalGallery>
              </div>
            </div>
          </div>
        </Sidebar>
      )}
    </Fragment>
  );
};

/**
 * Render image gallery with thumbnail images.
 * @param image list of large images.
 * @param thumbnailImages list of thumbnail images.
 * @param alternativeText alternative text for images that are broken.
 * @param selectedSlideIndex current index number of selected slide to be shown when in fullscreen.
 * @param fullscreen flag to show image gallery in fullscreen, default is false.
 * @param onClick large image's onClick event.
 * @param fieldGroups field groups containing product tags.
 */
const ThumbsGallery = ({
  largeImages,
  thumbnailImages,
  alternativeText,
  selectedSlideIndex = 0,
  fullscreen = false,
  onClick,
  fieldGroups,
}: {
  largeImages: ImageModel[];
  thumbnailImages: ImageModel[];
  alternativeText: string;
  selectedSlideIndex?: number;
  fullscreen?: boolean;
  onClick?: (index: number) => void;
  fieldGroups?: any[];
}) => {
  const [thumbsSwiper, setThumbsSwiper] = useState<any>();
  const website = useContext(WebsiteContext);
  const thumbnailParams: SwiperProps = {
    spaceBetween: 10,
    slidesPerView: 'auto',
    modules: [Thumbs],
    direction: 'vertical',
    initialSlide: selectedSlideIndex,
    onSwiper: setThumbsSwiper,
    watchSlidesProgress: true,
  };

  const imageParams: any = {
    modules: [Thumbs, FreeMode],
    thumbs: { swiper: thumbsSwiper },
    initialSlide: selectedSlideIndex,
    loop: true,
  };
  if (fullscreen) {
    imageParams.modules = [Thumbs, FreeMode, Navigation];
    imageParams.navigation = true;
    thumbnailParams.style = {
      maxHeight: '100%',
    };
  }

  return (
    <div
      className={clsx(
        'relative aspect-square overflow-hidden rounded-xl bg-white p-4',
        fullscreen && 'm-auto h-[calc(100dvh_-_50px)] !p-0 pb-8'
      )}
    >
      {/* Thumbnail images */}
      {!fullscreen && (
        <Swiper
          {...thumbnailParams}
          className={clsx(
            'thumbs-gallery__thumbnail-image',
            fullscreen && 'lightbox'
          )}
        >
          {thumbnailImages?.map((value, index) => (
            <SwiperSlide key={`thumbs-swiper-${index}`}>
              {value && (
                <Image
                  src={getAbsoluteImageUrl(value, website.imageServerUrl)}
                  alt={alternativeText}
                  width={value?.dimension?.width}
                  height={value?.dimension?.height}
                  className="ml-0 aspect-square w-24 rounded-md object-cover"
                  sizes={imageConfiguration.lightboxImage.thumbnail.sizes}
                  data-testid={'thumbs-gallery__thumbnail-image'}
                />
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      )}
      {/* Main images */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Swiper
          {...imageParams}
          className={clsx(
            'thumbs-gallery__main-image h-full w-full',
            fullscreen && 'lightbox'
          )}
        >
          {largeImages?.map((value, index) => (
            <SwiperSlide
              key={`swiper-slide-${index}`}
              className="flex h-full w-full items-center justify-center"
            >
              {value && (
                <div className="flex h-full w-full items-center justify-center">
                  <Image
                    priority
                    src={getAbsoluteImageUrl(value, website.imageServerUrl)}
                    alt={alternativeText}
                    width={value?.dimension?.width}
                    height={value?.dimension?.height}
                    className={clsx(
                      'rounded-xl object-contain',
                      'p-6 lg:p-10 xl:p-12',
                      'max-h-full w-full max-w-full',
                      !fullscreen /* && 'max-w-sm' */,
                      fullscreen &&
                        'max-h-full max-w-full object-contain object-top'
                    )}
                    sizes={imageConfiguration.lightboxImage.large.sizes}
                    onClick={(event: any) => {
                      event.preventDefault();
                      onClick && onClick(index);
                    }}
                    data-testid={'thumbs-gallery__main-image'}
                  />
                </div>
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

/**
 * Render a horizontal image gallery
 * @param image list of large images.
 * @param alternativeText alternative text for images that are broken.
 * @param selectedSlideIndex current index number of selected slide to be shown when in fullscreen.
 * @param fullscreen flag to show image gallery in fullscreen, default is false.
 * @param onClick large image's onClick event.
 * @param fieldGroups field groups containing product tags.
 */
const HorizontalGallery = ({
  images,
  alternativeText,
  selectedSlideIndex = 0,
  fullscreen = false,
  className,
  onClick,
  fieldGroups,
}: {
  images: ImageModel[];
  alternativeText: string;
  selectedSlideIndex?: number;
  fullscreen?: boolean;
  className?: string;
  onClick?: (index: number) => void;
  fieldGroups?: any[];
}) => {
  const website = useContext(WebsiteContext);

  return (
    <div className="relative">
      <Swiper
        scrollbar={{ draggable: true }}
        initialSlide={selectedSlideIndex}
        className={clsx(
          'horizontal-gallery',
          fullscreen && 'lightbox',
          className
        )}
        modules={[Scrollbar]}
        loop={true}
      >
        {images.map(
          (image, index) =>
            image && (
              <SwiperSlide
                className="flex items-center justify-center rounded-xl bg-white"
                key={`image-compact-${index}`}
              >
                <Image
                  priority
                  src={getAbsoluteImageUrl(image, website.imageServerUrl)}
                  alt={alternativeText}
                  width={image?.dimension?.width}
                  height={image?.dimension?.height}
                  sizes={imageConfiguration.lightboxImage.large.sizes}
                  className={clsx(
                    'cursor-pointer rounded-xl p-8 sm:p-12',
                    'max-h-full max-w-full object-contain',
                    !fullscreen,
                    fullscreen && 'h-full object-contain object-top'
                  )}
                  onClick={(event: any) => {
                    event.preventDefault();
                    onClick && onClick(index);
                  }}
                  data-testid="horizontal-gallery__image"
                />
              </SwiperSlide>
            )
        )}
      </Swiper>
    </div>
  );
};

export default ImageGallery;
