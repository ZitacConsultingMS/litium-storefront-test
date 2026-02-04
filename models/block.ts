import { ContentFieldType } from './content';

export interface BlocksType {
  [key: string]: Block[];
}

export interface Block {
  __typename: string;
  fields: ContentFieldType;
  systemId: string;
  children?: Block[];

  /**
   * Flag to indicate if block gets high priority and preload.
   * The purpose is to set its images high priority and preload.
   * Block implementation should pass it to Images that should preload.
   * More info about Image's priority: https://nextjs.org/docs/api-reference/next/image#priority
   */
  priority?: boolean;
}
