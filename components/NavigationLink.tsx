'use client';
import Link from 'components/Link';
import { Text } from 'components/elements/Text';
import { PrimaryNavigationContext } from 'contexts/primaryNavigationContext';
import { LinkFieldDefinition } from 'models/navigation';
import { Fragment, useContext } from 'react';

interface NavigationLinkProps {
  header: LinkFieldDefinition;
  links?: LinkFieldDefinition[];
}

/**
 * Represents a navigation link component, which is used in primary and footer navigations.
 * @param props
 * @returns
 */
export default function NavigationLink(props: NavigationLinkProps) {
  const setNavigationVisible = useContext(PrimaryNavigationContext).setVisible;
  const onLinkClick = () => {
    setNavigationVisible(false);
  };
  const { header, links } = props;
  return (
    <Fragment>
      <div className="mb-3 text-lg">
        {header?.url ? (
          <Link
            href={header.url}
            data-testid="navigation-link__header"
            onClick={onLinkClick}
          >
            {header?.text}
          </Link>
        ) : (
          <Text data-testid="navigation-link__header">{header?.text}</Text>
        )}
      </div>
      {links &&
        links
          .filter(
            (navigationLink) => !!navigationLink?.text && !!navigationLink?.url
          )
          .map((navigationLink, index) => (
            <div
              className="my-2 text-sm group-[.slide-navigation]:hidden"
              key={`${navigationLink.text}-${index}`}
            >
              <Link
                href={navigationLink.url || ''}
                data-testid="navigation-link__links"
                onClick={onLinkClick}
              >
                {navigationLink.text}
              </Link>
            </div>
          ))}
    </Fragment>
  );
}
