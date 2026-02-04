import { loadDevMessages, loadErrorMessages } from '@apollo/client/dev';
import { TrackingManager } from 'components/TrackingManager';
import LiveEditing from 'components/blocks/LiveEditing';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import { buildServerUrl } from 'services/urlService';
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
  params: Promise<any>;
}) {
  const website = await get();

  return (
    <html lang={website.languageCode} className={inter.className}>
      {!website.preview && (
        <TrackingManager id={website.analytics.googleTagManager} />
      )}
      <body className="overflow-x-hidden">
        {/* Skip link for keyboard users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-black"
        >
          Skip to content
        </a>
        {website.preview && (
          <>
            {website.preview.scripts.map((value, i) => (
              <Script
                key={'preview-script-' + i}
                src={buildServerUrl(value.src)}
                type={value.attributes?.find((a) => a.name === 'type')?.value}
                strategy="beforeInteractive"
                crossOrigin="anonymous"
              ></Script>
            ))}
            {website.preview.styleSheets.map((value, i) => (
              <link
                key={'preview-css-' + i}
                href={buildServerUrl(value.src)}
                rel="stylesheet"
              ></link>
            ))}
            <LiveEditing>{children}</LiveEditing>
          </>
        )}
        {!website.preview && children}
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
