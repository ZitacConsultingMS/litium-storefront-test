import NavigationLink from 'components/NavigationLink';
import { LinkFieldDefinition } from 'models/navigation';

interface NavigationLinksBlockFieldDefinition {
  navigationLink: LinkFieldDefinition;
}

interface NavigationLinksBlockFieldContainer {
  navigationLinksHeader: LinkFieldDefinition;
  navigationLinks: NavigationLinksBlockFieldDefinition[];
}

/**
 * Renders a NavigationLinks block type.
 * @param props a NavigationLinks block content .
 * @returns
 */
export default function NavigationLinksBlock({
  fields,
}: {
  fields: NavigationLinksBlockFieldContainer;
}) {
  const links = fields.navigationLinks?.map((l) => l.navigationLink);
  return <NavigationLink header={fields.navigationLinksHeader} links={links} />;
}
