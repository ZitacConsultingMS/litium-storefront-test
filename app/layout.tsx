import { loadDevMessages, loadErrorMessages } from '@apollo/client/dev';
import { TrackingManager } from 'components/TrackingManager';
import { ConsentManagerScript } from 'components/zitac/ConsentManagerScript';
import { HelloRetailScript } from 'components/zitac/HelloRetailScript';
import { IPaperScript } from 'components/zitac/IPaper';
import { TrustpilotScript } from 'components/zitac/TrustpilotScript';
import { Inter } from 'next/font/google';
import { get } from 'services/websiteService.server';
import 'styles/globals.scss';

if (process.env.NODE_ENV !== 'production') {
  loadDevMessages();
  loadErrorMessages();
}
const inter = Inter({
  subsets: ['latin'],
});

/**
 * A mandatory root layout, defined at the top level of the `app` directory and applies to all routes.
 * @param children Children components. More info: https://nextjs.org/docs/app/api-reference/file-conventions/layout#children-required
 * @param params The dynamic route parameters object from the root segment down to that layout.
 * @returns
 */
export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: any;
}) {
  const website = await get();

  return (
    <html
      lang={website.languageCode}
      {...(website.zsThemeID ? { className: website.zsThemeID } : {})}
    >
      <head>
        <IPaperScript />
        <TrustpilotScript />
        <HelloRetailScript zsThemeID={website.zsThemeID} />
      </head>
      <TrackingManager id={website.analytics.googleTagManager} />
      <body className="overflow-x-hidden font-body">
        <ConsentManagerScript zsThemeID={website.zsThemeID} />
        {children}
      </body>
    </html>
  );
}

export const metadata = {
  title: {
    default: 'Litium Accelerator',
    template: '%s | Litium Accelerator',
  },
};
