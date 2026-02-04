import { Block } from './block';

export interface ErrorPage {
  fields: ErrorPageFieldContainer | null;
  blocks?: ErrorPageBlockContainer;
}

interface ErrorPageFieldContainer {
  editor: string;
  title: string;
}

interface ErrorPageBlockContainer {
  blockContainer: Block[];
}
