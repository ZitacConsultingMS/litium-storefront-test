import { Block } from 'models/block';
import { ContentFieldType } from 'models/content';
import { LinkFieldDefinition } from 'models/navigation';
import SecondaryNavigationLink from '../navigation/SecondaryNavigationLink';

interface SecondaryNavigationLinkBlockFieldContainer extends ContentFieldType {
  navigationLink: LinkFieldDefinition;
}

interface SecondaryNavigationLinkBlockProps extends Block {
  fields: SecondaryNavigationLinkBlockFieldContainer;
}
/**
 * Renders a Secondary navigation.
 * @param props content of Secondary navigation block.
 * Otherwise, SlideMenu component.
 */
function SecondaryNavigationLinkBlock(
  props: SecondaryNavigationLinkBlockProps
) {
  const { text, url } = props.fields.navigationLink;
  return (
    <li className="my-3">
      {url && text && (
        <SecondaryNavigationLink
          url={url}
          text={text}
        ></SecondaryNavigationLink>
      )}
    </li>
  );
}

export default SecondaryNavigationLinkBlock;
