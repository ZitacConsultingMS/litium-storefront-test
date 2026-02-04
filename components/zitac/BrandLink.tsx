import Link from 'components/Link';
import { ReactNode } from 'react';

interface BrandLinkProps {
  linkUrl?: string | null;
  children: ReactNode;
  className?: string;
  fallbackHref?: string;
}

/**
 * Reusable component for brand links that constructs the brand URL
 * Centralizes the brand URL structure for easy maintenance
 */
export default function BrandLink({ 
  linkUrl, 
  children, 
  className = '', 
  fallbackHref = '#' 
}: BrandLinkProps) {
  const brandHref = linkUrl ? `/brand/${linkUrl}` : fallbackHref;
  
  return (
    <Link href={brandHref} className={className}>
      {children}
    </Link>
  );
}
