'use client';

import Script from 'next/script';

export function ConsentManagerScript({ zsThemeID }: { zsThemeID: string }) {
  const isB2B = zsThemeID === 'af';
  return (
    <>
      {isB2B ? (
        <Script
          type="text/javascript"
          data-cmp-ab="1"
          src="https://cdn.consentmanager.net/delivery/js/semiautomatic.min.js"
          data-cmp-cdid="1dc821aa6291e"
          data-cmp-host="a.delivery.consentmanager.net"
          data-cmp-cdn="cdn.consentmanager.net"
          data-cmp-codesrc="0"
        ></Script>
      ) : (
        <Script
          type="text/javascript"
          data-cmp-ab="1"
          src="https://cdn.consentmanager.net/delivery/js/semiautomatic.min.js"
          data-cmp-cdid="89413f573279f"
          data-cmp-host="a.delivery.consentmanager.net"
          data-cmp-cdn="cdn.consentmanager.net"
          data-cmp-codesrc="0"
        ></Script>
      )}
    </>
  );
}
