import { WebsiteContext } from 'contexts/websiteContext';
import { WebsiteText } from 'models/website';
import { useContext } from 'react';

/**
 * Represents a hook to translate text based on Website's text.
 * Usage:
 * `const t = useTranslations();`
 * Then `invoke t('key')` will look up from translation list and print out text.
 */
export const useTranslations = () => {
  const context = useContext(WebsiteContext);
  return (key: string) => translate(key, context?.texts);
};

export const translate = (key: string, texts: WebsiteText[]) =>
  texts?.filter((item: WebsiteText) => item.key === key)[0]?.value || key;
