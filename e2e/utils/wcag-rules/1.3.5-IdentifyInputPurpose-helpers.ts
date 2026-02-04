/**
 * Helper functions for WCAG - 1.3.5 - Identify Input Purpose tests
 * Tests for ensuring form fields that collect user information have appropriate autocomplete attributes
 */
import { Page } from '@playwright/test';
import { Violation, WcagResult } from 'e2e/utils/wcagModel';

// Map of common input fields and their expected autocomplete values
const AUTOCOMPLETE_MAPPINGS = {
  // Name fields
  firstname: ['given-name', 'cc-given-name'],
  lastname: ['family-name', 'cc-family-name'],
  middlename: ['additional-name', 'cc-additional-name'],
  nickname: ['nickname'],
  honorificprefix: ['honorific-prefix'],
  honorificsuffix: ['honorific-suffix'],

  // Contact fields
  email: ['email'],
  phone: [
    'tel',
    'tel-national',
    'tel-local',
    'tel-country-code',
    'tel-area-code',
    'tel-extension',
  ],
  mobile: ['tel-national', 'tel-local'],

  // Address fields
  address: ['street-address'],
  addressline1: ['address-line1'],
  addressline2: ['address-line2'],
  addressline3: ['address-line3'],
  city: ['address-level2'],
  district: ['address-level3'],
  ward: ['address-level4'],
  state: ['address-level1'],
  province: ['address-level1'],
  zip: ['postal-code'],
  zipcode: ['postal-code'],
  postalcode: ['postal-code'],
  country: ['country', 'country-name'],

  // Payment fields
  cardnumber: ['cc-number'],
  cardname: ['cc-name'],
  ccname: ['cc-name'],
  cvc: ['cc-csc'],
  cvv: ['cc-csc'],
  expiry: ['cc-exp'],
  expdate: ['cc-exp'],
  expirymonth: ['cc-exp-month'],
  expiryyear: ['cc-exp-year'],
  cardtype: ['cc-type'],

  // Account fields
  username: ['username'],
  password: ['current-password', 'new-password'],
  newpassword: ['new-password'],
  currentpassword: ['current-password'],
  otp: ['one-time-code'],
  code: ['one-time-code'],

  // Other common fields
  birthdate: ['bday'],
  birthday: ['bday'],
  birthmonth: ['bday-month'],
  birthdayday: ['bday-day'],
  birthyear: ['bday-year'],
  language: ['language'],
  url: ['url'],
  photo: ['photo'],
  organization: ['organization'],
  company: ['organization'],
  jobtitle: ['organization-title'],
  title: ['honorific-prefix'],
  name: ['name', 'fullname'],
};

export async function testInputAutocompletePurpose(
  page: Page
): Promise<WcagResult> {
  const violations: Violation[] = [];
  const inputFields = await page
    .locator(
      'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]), select, textarea'
    )
    .all();

  if (inputFields.length === 0) {
    console.log('No input fields found - test passes by default');
    return { violations };
  }

  for (const input of inputFields) {
    // Get field attributes
    const id = (await input.getAttribute('id')) || '';
    const name = (await input.getAttribute('name')) || '';
    const type = (await input.getAttribute('type')) || '';
    const placeholder = (await input.getAttribute('placeholder')) || '';
    const autocomplete = (await input.getAttribute('autocomplete')) || '';
    const ariaLabel = (await input.getAttribute('aria-label')) || '';

    // Try to get label text if label[for] exists
    let labelText = '';
    if (id) {
      const labelLocator = page.locator(`label[for="${id}"]`);
      if ((await labelLocator.count()) > 0) {
        labelText = (await labelLocator.first().textContent()) || '';
      }
    }

    // Combine all possible identifiers
    const identifiers = [id, name, type, placeholder, ariaLabel, labelText]
      .map((text) => text.toLowerCase().replace(/[^a-z]/g, ''))
      .filter(Boolean);

    // Try to match exact keys (e.g., "username" === "username")
    let expectedTokens: string[] = [];
    for (const key of Object.keys(AUTOCOMPLETE_MAPPINGS)) {
      if (identifiers.includes(key)) {
        expectedTokens =
          AUTOCOMPLETE_MAPPINGS[key as keyof typeof AUTOCOMPLETE_MAPPINGS];
        break;
      }
    }

    // If no exact match, try partial match (e.g., "abcname" includes "name")
    if (expectedTokens.length === 0) {
      for (const key of Object.keys(AUTOCOMPLETE_MAPPINGS)) {
        if (identifiers.some((id) => id.includes(key))) {
          expectedTokens =
            AUTOCOMPLETE_MAPPINGS[key as keyof typeof AUTOCOMPLETE_MAPPINGS];
          break;
        }
      }
    }

    if (expectedTokens.length > 0) {
      if (!autocomplete) {
        violations.push({
          message: `Missing autocomplete on field likely for "${expectedTokens.join(', ')}"`,
        });
      } else if (!expectedTokens.includes(autocomplete)) {
        violations.push({
          message: `Incorrect autocomplete "${autocomplete}" on field likely for "${expectedTokens.join(', ')}"`,
        });
      }
    } else {
      console.log(
        `Field "${id || name}" does not match known mappings — skipped`
      );
    }
  }

  return { violations };
}

/**
 * Run all WCAG 1.3.5 tests and return a combined result
 */
export async function runAllTests(page: Page): Promise<WcagResult> {
  const textResult = await testInputAutocompletePurpose(page);

  return {
    violations: [...textResult.violations],
  };
}

export const wcag135Helpers = {
  testInputAutocompletePurpose,
  runAllTests,
};
