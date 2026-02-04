import { StringFieldItemInput } from './search';

/**
 * A page search query to send to GraphQL
 */
export class PageSearchQueryInput {
  name?: StringFieldItemInput;
  content?: StringFieldItemInput;
  bool?: {
    should: PageSearchQueryInput[];
  };

  constructor(text: string) {
    this.bool = {
      should: [
        {
          content: {
            value: text,
            synonymAnalyzer: true,
            fuzziness: {
              length: null,
              ratio: null,
              distance: null,
            },
          },
        },
        {
          name: {
            value: text,
            boost: 2,
            synonymAnalyzer: true,
            fuzziness: {
              length: null,
              ratio: null,
              distance: null,
            },
          },
        },
      ],
    };
  }
}
