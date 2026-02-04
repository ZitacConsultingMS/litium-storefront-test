'use client';
import BrandLink from 'components/zitac/BrandLink';
import { WebsiteContext } from 'contexts/websiteContext';
import { useCustomArticleDetails } from 'hooks/useCustomArticleDetails';
import Image from 'next/image';
import { useContext } from 'react';
import { getAbsoluteUrlFromString } from 'services/zitac/customImageService';

interface BrandLogotypeProps {
  articleNumber: string;
  className?: string;
  size?: 'small' | 'large';
}

/**
 * Displays the brand logotype for a product
 */
export default function BrandLogotype({
  articleNumber,
  className = 'mt-4 flex justify-end',
  size = 'small',
}: BrandLogotypeProps) {
  const website = useContext(WebsiteContext);
  const { articleDetails } = useCustomArticleDetails(articleNumber);

  // Check if brand image exists
  const brandImage = articleDetails?.fieldsWithTextOptions?.brandImage?.[0];

  if (!brandImage?.imageUrl) {
    return null;
  }

  // Define size-based styling
  const sizeClasses = {
    small: 'max-h-24 w-auto object-contain', // Smaller for below image gallery
    large: 'max-h-36 w-auto object-contain rounded-lg', // Larger for accordion
  };

  return (
    <div className={className}>
      <BrandLink
        linkUrl={brandImage.linkUrl}
        className="inline-block transition-opacity hover:opacity-80"
      >
        <Image
          src={getAbsoluteUrlFromString(
            brandImage.imageUrl,
            website.imageServerUrl
          )}
          alt={brandImage.description || 'Brand Logotype'}
          width={size === 'large' ? 200 : 150}
          height={size === 'large' ? 100 : 60}
          className={sizeClasses[size]}
        />
      </BrandLink>
    </div>
  );
}
