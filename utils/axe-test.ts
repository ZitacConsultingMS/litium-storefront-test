import AxeBuilder from '@axe-core/playwright';
import { Page, test as base } from '@playwright/test';

type AxeFixture = {
  makeAxeBuilder: (page?: Page) => AxeBuilder;
  b2bPage: B2BPage;
  b2cPage: B2CPage;
};

// Extend base test by providing "makeAxeBuilder"
//
// This new "test" can be used in multiple test files, and each of them will get
// a consistently configured AxeBuilder instance.
export const test = base.extend<AxeFixture>({
  makeAxeBuilder: async ({ page: defaultPage }, use) => {
    const makeAxeBuilder = (page?: Page) =>
      new AxeBuilder({ page: page ?? defaultPage }).withTags([
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
  b2bPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: 'playwright/.auth/b2b.json',
    });
    const b2bPage = new B2BPage(await context.newPage());
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(b2bPage);
    await context.close();
  },
  b2cPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: 'playwright/.auth/b2c.json',
    });
    const b2cPage = new B2CPage(await context.newPage());
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(b2cPage);
    await context.close();
  },
});

// Page Object Model for the "admin" page.
// Here you can add locators and helper methods specific to the admin page.
class B2BPage {
  // Page signed in as "b2b".
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }
}

// Page Object Model for the "user" page.
// Here you can add locators and helper methods specific to the user page.
class B2CPage {
  // Page signed in as "b2c".
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }
}

export { expect } from '@playwright/test';
