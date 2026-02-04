'use client';
import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    Trustpilot?: {
      load?: () => void;
      loadFromElement?: (element: HTMLElement, force?: boolean) => void;
    };
  }
}

interface TrustpilotProps {
  articleNumber?: string;
  name?: string | null;
  templateId: string;
  businessUnitId: string;
  locale?: string;
  theme?: string;
  styleHeight?: string;
  styleWidth?: string;
  token?: string;
  reviewLanguages?: string;
  noReviews?: string;
  fullwidth?: string;
  stars?: string;
}

export default function Trustpilot({
  articleNumber,
  name,
  templateId,
  businessUnitId,
  locale = 'sv-SE',
  theme = 'light',
  styleHeight,
  styleWidth = '100%',
  token,
  reviewLanguages = 'sv',
  noReviews = 'show',
  fullwidth = 'true',
  stars,
}: TrustpilotProps) {
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeWidget = () => {
      if (window.Trustpilot?.loadFromElement && widgetRef.current) {
        try {
          window.Trustpilot.loadFromElement(widgetRef.current, true);
        } catch (error) {
          console.error('Error loading Trustpilot widget:', error);
        }
      } else {
        setTimeout(initializeWidget, 100);
      }
    };

    const timer = setTimeout(initializeWidget, 500);
    return () => clearTimeout(timer);
  }, [articleNumber, name, templateId, businessUnitId]);

  useEffect(() => {
    // Only adjust height for product reviews, not topbar
    if (!articleNumber || styleHeight) return;

    const setHeight = (height: number) => {
      const iframe = widgetRef.current?.querySelector('iframe');
      if (iframe && height > 0 && height < 1000) {
        iframe.style.height = `${height}px`;
        iframe.style.overflow = 'hidden';
      }
    };

    const checkIframe = () => {
      const iframe = widgetRef.current?.querySelector('iframe');
      if (iframe && !iframe.style.height) {
        setHeight(300); // Default for "no reviews" case
      }
    };

    const handleMessage = (e: MessageEvent) => {
      if (!e.origin.includes('trustpilot.com') || !e.data) return;
      const height =
        typeof e.data === 'object'
          ? e.data.height
          : typeof e.data === 'number'
            ? e.data
            : undefined;
      if (height) setHeight(height);
    };

    window.addEventListener('message', handleMessage);
    const observer = new MutationObserver(checkIframe);

    if (widgetRef.current) {
      observer.observe(widgetRef.current, { childList: true, subtree: true });
      checkIframe();
    }

    return () => {
      observer.disconnect();
      window.removeEventListener('message', handleMessage);
    };
  }, [articleNumber, styleHeight]);

  return (
    <>
      <div
        ref={widgetRef}
        className="trustpilot-widget trustpilot-widget-container"
        data-locale={locale}
        data-template-id={templateId}
        data-businessunit-id={businessUnitId}
        data-style-width={styleWidth}
        data-theme={theme}
        data-sku={articleNumber}
        data-name={name}
        data-review-languages={reviewLanguages}
        data-no-reviews={noReviews}
        data-fullwidth={fullwidth}
        {...(styleHeight && { 'data-style-height': styleHeight })}
        {...(token && { 'data-token': token })}
        {...(stars && { 'data-stars': stars })}
      >
        <a
          href="https://se.trustpilot.com/review/seasea.se"
          target="_blank"
          rel="noopener"
        >
          Trustpilot
        </a>
      </div>
    </>
  );
}
