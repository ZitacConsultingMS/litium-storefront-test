import NavigationLink from 'components/NavigationLink';
import { CategoryItem } from 'models/category';
import { LinkFieldDefinition } from 'models/navigation';

interface PointerProductCategoryItem {
  item: CategoryItem;
}

interface PrimaryNavigationCategoriesBlockFieldContainer {
  categoryLink: PointerProductCategoryItem[];
}

/**
 * Renders navigation menu items for a Category.
 * @param props Category navigation block's fields.
 * @returns
 */
function PrimaryNavigationCategoriesBlock({
  fields,
}: {
  fields: PrimaryNavigationCategoriesBlockFieldContainer;
}) {
  const category = fields.categoryLink[0]?.item;
  const header: LinkFieldDefinition = {
    text: category?.name,
    url: category?.url,
  };
  const links = category.children?.nodes.map((l) => ({
    text: l.name ?? l.url,
    url: l.url,
  }));
  return <NavigationLink header={header} links={links} />;
}

export default PrimaryNavigationCategoriesBlock;
