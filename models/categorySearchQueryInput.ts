import { StringFieldItemInput } from './search';

/**
 * A category search query to send to GraphQL
 */
export class CategorySearchQueryInput {
  name?: StringFieldItemInput;
  content?: StringFieldItemInput;
  bool?: {
    should?: CategorySearchQueryInput[];
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
