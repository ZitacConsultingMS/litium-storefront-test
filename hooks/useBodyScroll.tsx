import { useRef } from 'react';

/**
 * Hook to block or allow scrolling on the document body.
 * Usage:
 * const [blockBodyScroll, allowBodyScroll] = useBodyScroll();
 */
export const useBodyScroll = (): [() => void, () => void] => {
  const scrollBlocked = useRef(false);
  const scrollPosition = useRef(0);

  let blockBodyScroll = (): void => {};
  let allowBodyScroll = (): void => {};

  if (typeof document === 'undefined') {
    return [blockBodyScroll, allowBodyScroll];
  }

  const html = document.documentElement;
  const { body } = document;

  blockBodyScroll = (): void => {
    if (!body || !body.style || scrollBlocked.current) return;

    scrollPosition.current = window.scrollY;

    const scrollBarWidth = window.innerWidth - html.clientWidth;
    const bodyPaddingRight =
      parseInt(
        window.getComputedStyle(body).getPropertyValue('padding-right')
      ) || 0;

    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollPosition.current}px`;
    body.style.width = '100%';
    body.style.paddingRight = `${bodyPaddingRight + scrollBarWidth}px`;

    scrollBlocked.current = true;
  };

  allowBodyScroll = (): void => {
    if (!body || !body.style || !scrollBlocked.current) return;

    const { scrollY } = window;

    body.style.overflow = '';
    body.style.position = '';
    body.style.top = '';
    body.style.width = '';
    body.style.paddingRight = '';

    window.scrollTo(0, scrollPosition.current || scrollY);

    scrollBlocked.current = false;
  };

  return [blockBodyScroll, allowBodyScroll];
};
