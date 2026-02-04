'use client';

import { Heading1 } from 'components/elements/Heading';
import { HtmlText } from 'components/elements/HtmlText';
import { ErrorPage } from 'models/error';
import { default as DefaultErrorPage } from 'next/dist/pages/_error';
import { Fragment, useEffect, useState } from 'react';
import { getErrorPageContent } from './actions/getErrorPageContent';

/**
 * Represent a {@link https://nextjs.org/docs/app/api-reference/file-conventions/error error} file to render UI when a requested page errors
 */
export default function Page({
  error,
}: {
  error: Error & { digest?: string };
}) {
  const [errorPagecontent, setErrorPageContent] = useState<ErrorPage>({
    fields: null,
  });
  const [showDefaultErrorPage, setShowDefaultErrorPage] = useState(false);

  useEffect(() => {
    const getContent = async () => {
      try {
        setShowDefaultErrorPage(false);
        const content = await getErrorPageContent();
        if (content.fields) {
          setErrorPageContent(content);
        } else {
          setShowDefaultErrorPage(true);
        }
      } catch {
        setShowDefaultErrorPage(true);
      }
    };
    getContent();
  }, []);

  useEffect(() => {
    console.error(error);
  }, [error]);

  if (errorPagecontent.fields) {
    return (
      <div className="mx-auto min-h-[500px] px-5 md:container">
        {errorPagecontent.fields?.title && (
          <Heading1 className="mb-9 mt-7" data-testid="errorpage__title">
            {errorPagecontent.fields?.title}
          </Heading1>
        )}
        {errorPagecontent.fields?.editor && (
          <HtmlText
            className="min-w-full"
            innerHTML={errorPagecontent.fields?.editor}
            data-testid="errorpage__editor"
          ></HtmlText>
        )}
      </div>
    );
  }

  if (showDefaultErrorPage) {
    return <DefaultErrorPage statusCode={500} />;
  }

  return <Fragment></Fragment>;
}
