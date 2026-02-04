import { GoogleTagManager, sendGTMEvent } from '@next/third-parties/google';

/**
 * Represents a component to track page view event.
 * To track view event for all routes, include the component in the root layout.
 * @param id the analytic identifier.
 * @returns
 */
export function TrackingManager({ id }: { id: string }) {
  return <GoogleTagManager gtmId={id} />;
}

/**
 * Tracks user interactions by sending the event's `data`.
 * For this function to work, the <TrackingManager /> component must be included
 * in either a parent layout, page, or component, or directly in the same file.
 * @param data the event data.
 */
export function trackEvent(data: any) {
  return sendGTMEvent(data);
}
