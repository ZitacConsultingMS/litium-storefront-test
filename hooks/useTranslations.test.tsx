import { render, screen } from '@testing-library/react';
import { EmptyWebsite, WebsiteContext } from 'contexts/websiteContext';
import { Website } from 'models/website';
import { useTranslations } from './useTranslations';

describe('useTranslationsHook', () => {
  test('Should return key when key does not exist in translation list ', () => {
    const MockWebsite: Website = {
      ...EmptyWebsite,
    };
    render(
      <WebsiteContext.Provider value={MockWebsite}>
        <TranslationUsageComponent />
      </WebsiteContext.Provider>
    );
    expect(screen.getByTestId('use-translations__text')).toHaveTextContent(
      'translationKey'
    );
  });
  test('Should return text when key exists in translation list', () => {
    const MockWebsite: Website = {
      ...EmptyWebsite,
      texts: [
        {
          key: 'translationKey',
          value: 'Lorem Ipsum',
        },
      ],
    };
    render(
      <WebsiteContext.Provider value={MockWebsite}>
        <TranslationUsageComponent />
      </WebsiteContext.Provider>
    );
    expect(screen.getByTestId('use-translations__text')).toHaveTextContent(
      'Lorem Ipsum'
    );
  });
});

/**
 * Renders a use translations example component that's using the hook to test that hook manually
 */
function TranslationUsageComponent() {
  const t = useTranslations();
  return <div data-testid="use-translations__text">{t('translationKey')}</div>;
}
