import NavigationLink from 'components/NavigationLink';
import { LinkFieldDefinition } from 'models/navigation';

interface FooterNavigationLinksBlockFieldDefinition {
  navigationLink: LinkFieldDefinition;
}

interface FooterNavigationLinksBlockFieldContainer {
  navigationLinksHeader: LinkFieldDefinition;
  zsFooterNavigationLinks: FooterNavigationLinksBlockFieldDefinition[];
}

/**
 * Renders a NavigationLinks block type.
 * @param props a NavigationLinks block content .
 * @returns
 */
export default function FooterNavigationLinksBlock({
  fields,
}: {
  fields: FooterNavigationLinksBlockFieldContainer;
}) {
  const links = fields.zsFooterNavigationLinks?.map((l) => l.navigationLink);
  return <NavigationLink header={fields.navigationLinksHeader} links={links} />;
}
