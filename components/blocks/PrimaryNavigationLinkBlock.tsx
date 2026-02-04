import { Block } from 'models/block';
import { ContentFieldType } from 'models/content';
import { LinkFieldDefinition } from 'models/navigation';
import dynamic from 'next/dynamic';
import HoverableMenu from '../navigation/HoverableMenu';
import SlideMenu from '../navigation/SlideMenu';

interface PrimaryNavigationLinkBlockFieldContainer extends ContentFieldType {
  navigationLink: LinkFieldDefinition;
}

interface PrimaryNavigationLinkBlockProps extends Block {
  fields: PrimaryNavigationLinkBlockFieldContainer;
  desktop?: boolean;
}

// Lazy load BlockContainer to prevent circular import when running tests
const BlockContainer: any = dynamic(() =>
  import('./BlockContainer').then((mod) => mod.default)
);

/**
 * Renders a Primary navigation.
 * @param props content of Primary navigation block.
 * @param desktop a flag to indicate if HoverableMenu component should be used.
 * Otherwise, SlideMenu component.
 */
function PrimaryNavigationLinkBlock(props: PrimaryNavigationLinkBlockProps) {
  return props.desktop ? (
    <HoverableMenu
      navigationLink={props.fields.navigationLink || {}}
      hasChildren={(props.children?.length || 0) > 0}
    >
      {props.children && (
        <BlockContainer
          blocks={props.children}
          className="m-5 inline"
        ></BlockContainer>
      )}
    </HoverableMenu>
  ) : (
    <SlideMenu
      navigationLink={props.fields.navigationLink || {}}
      hasChildren={(props.children?.length || 0) > 0}
    >
      {props.children && (
        <BlockContainer blocks={props.children}></BlockContainer>
      )}
    </SlideMenu>
  );
}

export default PrimaryNavigationLinkBlock;
