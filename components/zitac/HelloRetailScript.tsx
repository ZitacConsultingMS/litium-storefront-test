'use client';

import { getIsB2B } from 'utils/isB2B';

export function HelloRetailScript({ zsThemeID }: { zsThemeID?: string }) {
  const isB2B = getIsB2B({ zsThemeID });
  if (isB2B) {
    return null;
  }

  const websiteUuid =
    process.env.NEXT_PUBLIC_HELLORETAIL_WEBSITE_UUID ||
    '364b65b0-0c6f-47b5-a54b-9c3a0b78c085';

  const initScript = `
    (function() {
      window.hrq = window.hrq || [];
      window.hrq.push(['init', {
        websiteUuid: '${websiteUuid}',
      }]);
    })();
  `;

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: initScript,
        }}
      />
      <script src="https://helloretailcdn.com/helloretail.js" async />
    </>
  );
}
