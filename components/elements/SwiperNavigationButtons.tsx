'use client';
import { useState } from 'react';
import { SwiperProps } from 'swiper/react';
import './SwiperNavigationButtons.scss';

interface SwiperNavigationButtonsProps {
  swiperRef: React.MutableRefObject<any>;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

/**
 * Reusable navigation buttons for Swiper components
 * Provides left/right (horizontal) or top/bottom (vertical) arrow buttons with smooth show/hide transitions
 */
function SwiperNavigationButtons({ 
  swiperRef, 
  className = '',
  orientation = 'horizontal'
}: SwiperNavigationButtonsProps) {
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const handleSwiperInit = (swiper: any) => {
    swiperRef.current = swiper;
    // Use setTimeout to ensure swiper is fully initialized
    setTimeout(() => {
      setIsBeginning(swiper.isBeginning);
      setIsEnd(swiper.isEnd);
    }, 0);
  };

  const handleSlideChange = (swiper: any) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  const handleReachEnd = (swiper: any) => {
    setIsEnd(true);
  };

  const handleReachBeginning = (swiper: any) => {
    setIsBeginning(true);
  };

  // Button base classes
  const buttonBaseClasses = "w-10 h-10 bg-white border border-border rounded shadow-sm transition-all duration-300 flex items-center justify-center";
  
  // Position classes based on orientation
  const prevButtonClasses = orientation === 'horizontal'
    ? "absolute left-0 top-1/2 -translate-y-1/2"
    : "absolute -top-4 left-1/2 -translate-x-1/2";
  
  const nextButtonClasses = orientation === 'horizontal'
    ? "absolute right-0 top-1/2 -translate-y-1/2"
    : "absolute -bottom-4 left-1/2 -translate-x-1/2";

  // Arrow icons based on orientation
  const prevIcon = orientation === 'horizontal' ? (
    <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ) : (
    <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  );

  const nextIcon = orientation === 'horizontal' ? (
    <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ) : (
    <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );

  // Return the enhanced Swiper props and navigation buttons
  return {
    swiperProps: {
      onSwiper: handleSwiperInit,
      onSlideChange: handleSlideChange,
      onReachEnd: handleReachEnd,
      onReachBeginning: handleReachBeginning,
    } as Partial<SwiperProps>,
    
    navigationButtons: (
      <div className={`swiper-navigation-buttons ${className}`}>
        <button
          className={`nav-button-prev ${prevButtonClasses} ${buttonBaseClasses} z-10 ${
            isBeginning ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
          aria-label="Previous items"
          onClick={() => !isBeginning && swiperRef.current?.slidePrev()}
        >
          {prevIcon}
        </button>
        <button
          className={`nav-button-next ${nextButtonClasses} ${buttonBaseClasses} z-10 ${
            isEnd ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
          aria-label="Next items"
          onClick={() => !isEnd && swiperRef.current?.slideNext()}
        >
          {nextIcon}
        </button>
      </div>
    )
  };
}

export default SwiperNavigationButtons;
