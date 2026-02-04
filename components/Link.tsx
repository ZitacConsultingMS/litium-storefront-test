/* eslint-disable-next-line no-restricted-imports */
import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import React, { AnchorHTMLAttributes } from 'react';

interface LinkProps
  extends NextLinkProps,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof NextLinkProps> {
  /** React children */
  children?: React.ReactNode;
}

/**
 * Overrides NextJS's Link component to disable prefetch by default.
 * This Link component should be used instead.
 * @see https://nextjs.org/docs/app/api-reference/components/link
 */
const Link: React.FC<LinkProps> = ({ prefetch, children, ...props }) => {
  return (
    <NextLink {...props} prefetch={prefetch ?? false}>
      {children}
    </NextLink>
  );
};

export default Link;
