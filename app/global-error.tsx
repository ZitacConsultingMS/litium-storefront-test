'use client';

import { WebsiteContext } from 'contexts/websiteContext';
import { useContext } from 'react';
import ErrorPage from './error';

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  const website = useContext(WebsiteContext);

  return (
    <html lang={website.languageCode}>
      <body>
        <ErrorPage error={error} />
      </body>
    </html>
  );
}
