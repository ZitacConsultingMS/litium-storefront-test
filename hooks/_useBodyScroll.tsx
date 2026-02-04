import { useRef } from 'react';

/**
 * Represents a hook to block or release the block of scrolling on the document body.
 * For example, when a modal dialog is shown, scrolling on document body should be blocked.
 * Usage:
 * `const [blockBodyScroll, allowBodyScroll] = useBodyScroll();`
 * Then invoke `blockBodyScroll()` to block scrolling on document body.
 * To release the block, invoke `allowBodyScroll()`.
 */
export const useBodyScroll = (): [() => void, () => void] => {
  const scrollBlocked = useRef(false);

  let blockBodyScroll = (): void => {};
  let allowBodyScroll = (): void => {};

  if (typeof document === 'undefined') {
    return [blockBodyScroll, allowBodyScroll];
  }

  const html = document.documentElement;
  const { body } = document;
  blockBodyScroll = (): void => {
    if (!body || !body.style || scrollBlocked.current) return;
    if (document == undefined) return;

    const scrollBarWidth = window.innerWidth - html.clientWidth;
    const bodyPaddingRight =
      parseInt(
        window.getComputedStyle(body).getPropertyValue('padding-right')
      ) || 0;

    html.style.position = 'relative';
    html.style.overflow = 'hidden';
    body.style.position = 'relative';
    body.style.overflow = 'hidden';
    body.style.paddingRight = `${bodyPaddingRight + scrollBarWidth}px`;

    scrollBlocked.current = true;
  };

  allowBodyScroll = (): void => {
    if (!body || !body.style || !scrollBlocked.current) return;

    html.style.position = '';
    html.style.overflow = '';
    body.style.position = '';
    body.style.overflow = '';
    body.style.paddingRight = '';

    scrollBlocked.current = false;
  };

  return [blockBodyScroll, allowBodyScroll];
};
