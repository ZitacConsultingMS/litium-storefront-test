'use client';

import { revalidatePage } from 'app/actions/liveEditing/revalidatePage';
import { useCallback, useEffect } from 'react';

/**
 * Turn on live editing for the page, this will revalidate the page when a block is updated.
 * Revalidating the page will make sure that the page is updated with the latest data.
 */
export default function LiveEditing({
  children,
}: {
  children: React.ReactNode;
}) {
  const handleBlockEvent = useCallback(async () => {
    revalidatePage(window.location.pathname.replace(/^\//, ''));
  }, []);

  useEffect(() => {
    const handlers = [
      window.litiumBridge.on('blockUpdated', handleBlockEvent),
      window.litiumBridge.on('blockAdded', handleBlockEvent),
      window.litiumBridge.on('blockDeleted', handleBlockEvent),
      window.litiumBridge.on('blockOrderChanged', handleBlockEvent),
      window.litiumBridge.on('pageUpdated', handleBlockEvent),
    ];
    return () => {
      handlers.forEach((off) => off && off());
    };
  }, [handleBlockEvent]);
  return <>{children}</>;
}
