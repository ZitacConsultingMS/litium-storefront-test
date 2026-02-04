import { useEffect, useState } from 'react';

const useIsAtTop = () => {
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      if (document.activeElement?.tagName !== 'INPUT') {
        setIsAtTop(window.scrollY === 0);
      }
      lastScrollY = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return isAtTop;
};

export default useIsAtTop;
