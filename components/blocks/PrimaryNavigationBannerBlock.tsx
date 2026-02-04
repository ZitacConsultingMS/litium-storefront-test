import { Text } from 'components/elements/Text';
import NavigationBannerLink from 'components/navigation/NavigationBannerLink';
import { LinkFieldDefinition } from 'models/navigation';
import { PointerMediaImageItem } from 'models/pointers';
import Image from 'next/image';
import { getAbsoluteImageUrl } from 'services/imageService';

interface PrimaryNavigationBannerBlockFieldContainer {
  navigationLink: LinkFieldDefinition;
  blockImagePointer: PointerMediaImageItem;
}

/**
 * Render a banner menu in primnary navigation.
 * @param fields Banner block's fields.
 * @returns
 */
function PrimaryNavigationBannerBlock({
  fields,
}: {
  fields: PrimaryNavigationBannerBlockFieldContainer;
}) {
  const link = fields.navigationLink;
  const image = fields.blockImagePointer.item;

  return (
    <NavigationBannerLink link={link}>
      {image && (
        <Image
          alt={link?.text ? `${link?.text} image` : ''}
          src={getAbsoluteImageUrl(image)}
          width={image.dimension.width}
          height={image.dimension.height}
          data-testid="primary-navigation-banner__image"
        ></Image>
      )}
      {link?.text && (
        <Text data-testid="primary-navigation-banner__text">{link.text}</Text>
      )}
    </NavigationBannerLink>
  );
}

export default PrimaryNavigationBannerBlock;
