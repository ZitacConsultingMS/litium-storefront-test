import { Block } from './block';
import { ContentItem } from './content';
import { PageItemsConnection } from './page';

export interface LoginDetailsPage extends ContentItem {
  name: string;
  parents: PageItemsConnection;
  children: PageItemsConnection;
  blocks: LoginDetailsPageContainer;
}

interface LoginDetailsPageContainer {
  main: Block[];
}
