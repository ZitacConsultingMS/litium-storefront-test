import AxeBuilder from '@axe-core/playwright';
import { test as base } from '@playwright/test';

type AxeFixture = {
  makeAxeBuilder: () => AxeBuilder;
};

// Extend base test by providing "makeAxeBuilder"
//
// This new "test" can be used in multiple test files, and each of them will get
// a consistently configured AxeBuilder instance.
export const test = base.extend<AxeFixture>({
  makeAxeBuilder: async ({ page }, use) => {
    const makeAxeBuilder = () =>
      new AxeBuilder({ page }).withTags([
        'wcag22a',
        'wcag22aa',
        'wcag21a',
        'wcag21aa',
        'wcag2a',
        'wcag2aa',
      ]);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(makeAxeBuilder);
  },
});
export { expect } from '@playwright/test';
