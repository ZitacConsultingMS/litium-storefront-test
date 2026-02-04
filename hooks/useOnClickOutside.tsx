import { RefObject, useEffect, useRef } from 'react';

/**
 * Custom hook to detect clicks outside of a specified element.
 * Compatible with React 19 and matches the API of use-onclickoutside package.
 *
 * @param ref - A ref object pointing to the element to monitor
 * @param handler - The callback function to execute when a click outside occurs
 */
export default function useOnClickOutside<T extends HTMLElement>(
  ref: RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void
): void {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      // If the ref's current element exists and the click is not inside that element
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handlerRef.current(event);
      }
    };

    // Options for touchstart to improve scroll performance
    const touchOptions: AddEventListenerOptions = { passive: true };

    // Attach the event listener to the document
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, touchOptions);

    // Clean up the event listener when the component unmounts or ref changes
    // Note: removeEventListener requires the same options object that was used with addEventListener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside, touchOptions as any);
    };
  }, [ref]);
}

