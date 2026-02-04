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
    const isWildcardSearch =
      (text?.includes('*') || text?.includes('?')) ?? false;
    const createFieldInput = (
      value: string,
      boost?: number
    ): StringFieldItemInput => {
      if (isWildcardSearch) {
        return {
          value,
        };
      }
      return {
        value,
        ...(boost && { boost }),
        synonymAnalyzer: true,
        fuzziness: {
          length: null,
          ratio: null,
          distance: null,
        },
      };
    };

    this.bool = {
      should: [
        {
          content: createFieldInput(text),
        },
        {
          name: createFieldInput(text, 2),
        },
      ],
    };
  }
}
