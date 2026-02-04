'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Runs after redirect from login/logout (when refreshCart=true is in the URL).
 * Performs a full page navigation to the current URL without the param so the
 * server gets a fresh request with the auth cookie and the UI (header, cart,
 * checkout) recognizes the user without a manual refresh.
 */
export default function AuthRefreshHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('refreshCart') !== 'true') return;

    const url = new URL(window.location.href);
    url.searchParams.delete('refreshCart');
    window.location.replace(url.toString());
  }, [searchParams]);

  return null;
}
