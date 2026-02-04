'use client';
import clsx from 'clsx';
import { WebsiteContext } from 'contexts/websiteContext';
import { useBodyScroll } from 'hooks/useBodyScroll';
import { useTranslations } from 'hooks/useTranslations';
import { Image as ImageModel } from 'models/image';
import Image from 'next/image';
import { Fragment, useCallback, useContext, useState } from 'react';
import { getAbsoluteImageUrl } from 'services/imageService';
import { FreeMode, Navigation, Scrollbar, Thumbs } from 'swiper/modules';
import { Swiper, SwiperProps, SwiperSlide } from 'swiper/react';
import { imageConfiguration } from 'utils/responsive';
import './ImageGallery.scss';
import Sidebar from './Sidebar';
import { Button } from './elements/Button';
import { Text } from './elements/Text';
import Close from './icons/close';

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
  const noImage =
    !props.thumbnailImages?.length ||
    !props.thumbnailImages[0] ||
    !props.largeImages?.length ||
    !props.largeImages[0];

  return noImage ? (
    <Fragment />
  ) : (
    <Fragment>
      <div className="flex flex-col-reverse flex-wrap gap-y-2 lg:flex-row">
        <div className="hidden lg:block">
          <ThumbsGallery
            {...props}
            selectedSlideIndex={currentIndex}
            onClick={onClickImage}
          ></ThumbsGallery>
        </div>
        <div className="mb-4 block w-full lg:hidden">
          <HorizontalGallery
            images={props.largeImages}
            alternativeText={props.alternativeText}
            selectedSlideIndex={currentIndex}
            onClick={onClickImage}
            className="[&>.swiper-wrapper]:pb-5"
          ></HorizontalGallery>
        </div>
      </div>
      {modalVisibility && (
        <Sidebar
          visible={modalVisibility}
          fullscreen={true}
          className="!p-0"
          onClose={onClose}
        >
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
                  {...props}
                  selectedSlideIndex={currentIndex}
                  fullscreen={true}
                ></ThumbsGallery>
              </div>
              <div className="mb-4 block lg:hidden">
                <HorizontalGallery
                  images={props.largeImages}
                  alternativeText={props.alternativeText}
                  selectedSlideIndex={currentIndex}
                  fullscreen={true}
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
 */
const ThumbsGallery = ({
  largeImages,
  thumbnailImages,
  alternativeText,
  selectedSlideIndex = 0,
  fullscreen = false,
  onClick,
}: {
  largeImages: ImageModel[];
  thumbnailImages: ImageModel[];
  alternativeText: string;
  selectedSlideIndex?: number;
  fullscreen?: boolean;
  onClick?: (index: number) => void;
}) => {
  const [thumbsSwiper, setThumbsSwiper] = useState<any>();
  const [mainSwiper, setMainSwiper] = useState<any>();
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
        'flex flex-row',
        fullscreen && 'h-[calc(100dvh_-_50px)] pb-8'
      )}
    >
      {/* Thumbnail images */}
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
                className="ml-0 h-32 w-24 rounded"
                sizes={imageConfiguration.lightboxImage.thumbnail.sizes}
                data-testid={'thumbs-gallery__thumbnail-image'}
                tabIndex={0}
                onKeyDown={(event: React.KeyboardEvent) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    mainSwiper?.slideTo(index);
                  }
                }}
              />
            )}
          </SwiperSlide>
        ))}
      </Swiper>
      {/* Main images */}
      <Swiper
        {...imageParams}
        className={clsx('thumbs-gallery__main-image', fullscreen && 'lightbox')}
        onSwiper={setMainSwiper}
      >
        {largeImages?.map((value, index) => (
          <SwiperSlide key={`swiper-slide-${index}`}>
            {value && (
              <Image
                priority
                src={getAbsoluteImageUrl(value, website.imageServerUrl)}
                alt={alternativeText}
                width={value?.dimension?.width}
                height={value?.dimension?.height}
                className={clsx(
                  'mx-auto',
                  !fullscreen && 'max-w-sm',
                  fullscreen &&
                    'max-h-full max-w-full object-contain object-top !pt-0'
                )}
                sizes={imageConfiguration.lightboxImage.large.sizes}
                onClick={(event: any) => {
                  event.preventDefault();
                  onClick && onClick(index);
                }}
                data-testid={'thumbs-gallery__main-image'}
                tabIndex={0}
                onKeyDown={(event: React.KeyboardEvent) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onClick && onClick(index);
                  }
                }}
              />
            )}
          </SwiperSlide>
        ))}
      </Swiper>
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
 */
const HorizontalGallery = ({
  images,
  alternativeText,
  selectedSlideIndex = 0,
  fullscreen = false,
  className,
  onClick,
}: {
  images: ImageModel[];
  alternativeText: string;
  selectedSlideIndex?: number;
  fullscreen?: boolean;
  className?: string;
  onClick?: (index: number) => void;
}) => {
  const website = useContext(WebsiteContext);

  return (
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
            <SwiperSlide key={`image-compact-${index}`}>
              <Image
                priority
                src={getAbsoluteImageUrl(image, website.imageServerUrl)}
                alt={alternativeText}
                width={image?.dimension?.width}
                height={image?.dimension?.height}
                sizes={imageConfiguration.lightboxImage.large.sizes}
                className={clsx(
                  'mx-auto cursor-pointer',
                  !fullscreen && 'max-w-xs',
                  fullscreen && 'h-full object-contain object-top'
                )}
                onClick={(event: any) => {
                  event.preventDefault();
                  onClick && onClick(index);
                }}
                data-testid="horizontal-gallery__image"
                tabIndex={0}
                onKeyDown={(event: React.KeyboardEvent) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onClick && onClick(index);
                  }
                }}
              />
            </SwiperSlide>
          )
      )}
    </Swiper>
  );
};

export default ImageGallery;
