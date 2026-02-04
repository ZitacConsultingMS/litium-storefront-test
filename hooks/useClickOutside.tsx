import { useEffect, useRef, RefObject, MutableRefObject } from 'react';

/**
 * Custom hook to detect clicks outside of a specified component.
 *
 * @param {Function} handler - The callback function to execute when a click outside occurs.
 * @returns {React.RefObject} A ref object to attach to the component you want to monitor.
 */
export function useClickOutside<T extends HTMLElement>(
  handler: (event: MouseEvent | TouchEvent) => void
): MutableRefObject<T | null> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      // If the ref's current element exists and the click is not inside that element
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler(event); // Execute the provided handler
      }
    };

    // Attach the event listener to the document
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside); // Also listen for touch events

    // Clean up the event listener when the component unmounts or dependencies change
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [handler]); // Re-run effect if the handler function changes

  return ref;
}
