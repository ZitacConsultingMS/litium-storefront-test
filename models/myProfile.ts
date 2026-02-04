import { Block } from './block';
import { ContentItem } from './content';
import { FieldGroup } from './field';
import { PageItemsConnection } from './page';

export interface MyProfilePage extends ContentItem {
  name: string;
  parents: PageItemsConnection;
  children: PageItemsConnection;
  blocks: MyProfilePageBlockContainer;
  fieldGroups: FieldGroup[];
}

interface MyProfilePageBlockContainer {
  main: Block[];
}
