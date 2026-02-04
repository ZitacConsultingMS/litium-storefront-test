'use client';
import { HtmlText } from 'components/elements/HtmlText';
import { useEffect, useRef } from 'react';

/**
 * Adds and executes inline script.
 * @param domId an element id.
 * @param scriptContent a script content.
 */
const executeScript = (domId: string, scriptContent: string) => {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  try {
    script.appendChild(document.createTextNode(scriptContent));
  } catch (e) {
    // to support IE
    script.text = scriptContent;
  }
  document.getElementById(domId)?.appendChild(script);
};

/**
 * Includes a script file by its URL.
 * @param domId an element Id where the script should be added to.
 * @param scriptUrl a script URL.
 */
const includeScript = (domId: string, scriptUrl: string) => {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = scriptUrl;
  document.getElementById(domId)?.appendChild(script);
};

/**
 * Represents a payment checkout widget.
 * @param scripts a list of inline scripts.
 * @param scriptFiles a list script URL.
 * @param html an HTML snippet.
 * @param onLoad callback when widget is loaded
 * @returns
 */
const CheckoutWidget = ({
  scripts,
  scriptFiles,
  html,
  id,
  onLoad,
}: {
  scripts?: string[];
  scriptFiles?: string[];
  html: string;
  id: string;
  onLoad?: () => void;
}) => {
  const firstRender = useRef(true);

  useEffect(() => {
    // Make sure it is executed only once.
    // firstRender is used to prevent eslint warning when having empty dependencies array
    if (!firstRender.current) {
      return;
    }
    firstRender.current = false;
    scripts?.forEach((script: string) => executeScript(id, script));
    scriptFiles?.forEach((url: string) => includeScript(id, url));

    // Call onLoad callback after scripts are loaded
    onLoad?.();
  }, [scripts, scriptFiles, id, onLoad]);

  return <HtmlText id={id} innerHTML={html} />;
};

export default CheckoutWidget;
