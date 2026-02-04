import { Body, Head, Html, Tailwind, Text } from '@react-email/components';
import { translate } from 'hooks/useTranslations';
import { WebsiteText } from 'models/website';
import { get as getWebsite } from 'services/websiteService.server';

async function EmailAccountChanged(texts: WebsiteText[]) {
  const website = await getWebsite();

  return (
    <Html lang={website.languageCode}>
      <Head />
      <Tailwind>
        <Body className="bg-white font-sans">
          <Text>{translate('logindetails.contentAccountChanged', texts)}</Text>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default EmailAccountChanged;
