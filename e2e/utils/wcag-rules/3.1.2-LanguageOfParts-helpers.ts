/**
 * Helper functions for WCAG - 3.1.2 - Language of Parts tests
 * Tests for ensuring the page has a language of parts
 */
import { ElementHandle, Page } from '@playwright/test';
import { loadModule } from 'cld3-asm';
import { Violation, WcagResult } from 'e2e/utils/wcagModel';

type Attribute = 'alt' | 'aria-label' | 'title' | 'placeholder';

// Array of data-testid values to skip from language checking
const skipIds = ['address-summary__address'];

/**
 * Check the language of the text content and verify it matches the default language.
 * @param page - Playwright Page object
 * @param selector - CSS selector to limit the test area
 * @param minConfidence - Minimum confidence level for language detection (0.0 - 1.0)
 */
export async function checkTextLanguage(
  page: Page,
  selector: string = 'body',
  minConfidence: number = 0.8
): Promise<WcagResult> {
  const violations: Violation[] = [];
  const cldFactory = await loadModule();
  const identifier = cldFactory.create(0, 1000);

  try {
    const defaultLang = await page.evaluate(() => {
      return document.documentElement.getAttribute('lang') || 'en';
    });

    const selectorExists = (await page.locator(selector).count()) > 0;
    if (!selectorExists) {
      console.log(
        `No elements matching selector "${selector}" found - test passes by default`
      );
      return { violations };
    }

    const elements = await page.locator(`${selector} *`).elementHandles();

    for (const el of elements) {
      const tagName = await el.evaluate((node) =>
        (node as HTMLElement).tagName.toLowerCase()
      );
      if (['script', 'style', 'noscript', 'svg', 'code'].includes(tagName))
        continue;

      const testId = await el.evaluate((node) =>
        (node as HTMLElement).getAttribute('data-testid')
      );
      if (testId && skipIds.includes(testId)) continue;

      const text = await el.evaluate((node) => {
        const tagName = (node as HTMLElement).tagName.toLowerCase();

        // For paragraph tags, include all text content (including children's text)
        if (tagName === 'p') {
          return node.textContent || '';
        }

        // For other elements, only get direct text nodes
        const textContent = Array.from(node.childNodes)
          .filter((n) => n.nodeType === Node.TEXT_NODE)
          .map((n) => n.textContent || '')
          .join(' ')
          .trim();

        return textContent;
      });

      // Skip short content to avoid false positives
      if (!text || text.length < 30) continue;

      // Skip text that's mostly numbers or special characters
      if (!checkAlphaRatio(text)) continue;

      let result;
      try {
        result = identifier.findLanguage(text);
      } catch (error) {
        console.warn(`Language detection failed for: ${text.slice(0, 50)}...`);
        continue;
      }

      if (
        !result ||
        result.language === 'und' ||
        result.probability < minConfidence
      )
        continue;

      if (result.language !== defaultLang) {
        const inheritedLang = await checkInheritedLanguage(el, defaultLang);
        const langAttr = await el.evaluate((node) =>
          (node as HTMLElement).getAttribute('lang')
        );

        if (!langAttr) {
          // Skip if the content is in the inherited language
          if (result.language === inheritedLang) continue;

          violations.push({
            message: `Missing lang attribute for content likely in '${result.language}': ${text.slice(0, 50)}...`,
          });
        } else if (result.language !== langAttr) {
          violations.push({
            message: `Mismatch: lang="${inheritedLang}" but content seems to be "${result.language}": ${text.slice(0, 50)}...`,
          });
        }
      }
    }

    return { violations };
  } finally {
    identifier.dispose?.();
  }
}

/**
 * Check the language of the description attributes and verify it matches the default language.
 * @param page - Playwright Page object
 * @param attributes - List of attributes to check
 * @param minConfidence - Minimum confidence level for language detection (0.0 - 1.0)
 */
export async function checkAttributeLanguage(
  page: Page,
  attributes: Attribute[] = ['alt', 'aria-label', 'title', 'placeholder'],
  minConfidence: number = 0.8
): Promise<WcagResult> {
  const violations: Violation[] = [];
  const cldFactory = await loadModule();
  const identifier = cldFactory.create(0, 1000);

  try {
    const defaultLang = await page.evaluate(() => {
      return document.documentElement.getAttribute('lang') || 'en';
    });

    for (const attr of attributes) {
      const elements = await page.locator(`[${attr}]`).elementHandles();

      for (const el of elements) {
        const testId = await el.evaluate((node) =>
          (node as HTMLElement).getAttribute('data-testid')
        );
        if (testId && skipIds.includes(testId)) continue;

        const attrValue = await el.evaluate(
          (node, attr) => (node as HTMLElement).getAttribute(attr),
          attr
        );

        // Skip short content to avoid false positives
        if (!attrValue || attrValue.length < 30) continue;

        // Skip text that's mostly numbers or special characters
        if (!checkAlphaRatio(attrValue)) continue;

        let result;
        try {
          result = identifier.findLanguage(attrValue);
        } catch (error) {
          console.warn(
            `Language detection failed for: ${attrValue.slice(0, 50)}...`
          );
          continue;
        }

        if (
          !result ||
          result.language === 'und' ||
          result.probability < minConfidence
        )
          continue;

        if (result.language !== defaultLang) {
          const inheritedLang = await checkInheritedLanguage(el, defaultLang);

          // Skip if the attribute is in the inherited language
          if (result.language === inheritedLang) continue;

          violations.push({
            message: `Attribute '${attr}' likely in '${result.language}' instead of default '${inheritedLang}': ${attrValue.slice(0, 30)}...`,
          });
        }
      }
    }

    return { violations };
  } finally {
    identifier.dispose?.();
  }
}

/**
 * Check the alpha ratio of the text
 * @param text - Text to check
 * @returns True if the alpha ratio is greater than or equal to 0.5, false otherwise
 */
export function checkAlphaRatio(text: string): boolean {
  const alphaRatio = (text.match(/[a-zA-Z]/g) || []).length / text.length;
  return alphaRatio >= 0.5;
}

/**
 * Check for inherited language from parent elements
 */
export async function checkInheritedLanguage(
  el: ElementHandle,
  defaultLang: string = 'en'
): Promise<string> {
  return await el.evaluate((node, defaultLang) => {
    let current: HTMLElement | null = node as HTMLElement;
    while (current) {
      const langAttr = current.getAttribute('lang');
      if (langAttr) return langAttr;
      current = current.parentElement;
    }
    return defaultLang;
  }, defaultLang);
}

/**
 * Run all WCAG 3.1.2 tests and return a combined result
 */
export async function runAllTests(
  page: Page,
  selector: string = 'body',
  minConfidence: number = 0.8
): Promise<WcagResult> {
  const textResult = await checkTextLanguage(page, selector, minConfidence);
  const attrResult = await checkAttributeLanguage(
    page,
    undefined,
    minConfidence
  );

  return {
    violations: [...textResult.violations, ...attrResult.violations],
  };
}

export const wcag312Helpers = {
  checkTextLanguage,
  checkAttributeLanguage,
  runAllTests,
};
