'use client';

import { gql } from '@apollo/client';
import { Block } from 'models/block';
import { ContentFieldType } from 'models/content';
import Script from 'next/script';
import { useEffect, useState } from 'react';
import { queryClient } from 'services/dataService.client';

interface ZsJotformField extends ContentFieldType {
  zsJotformUrl?: string;
}

interface ZsJotformBlockProps extends Block {
  fields: ZsJotformField;
}

const GET_CURRENT_USER = gql`
  query GetCurrentUserForJotform {
    me {
      person {
        id
        ... on B2BPersonTemplatePerson {
          fields {
            _firstName
            _lastName
          }
        }
      }
    }
  }
`;

export default function ZsJotformBlock(props: ZsJotformBlockProps) {
  const zsJotformUrl = props.fields?.zsJotformUrl;
  const formId = zsJotformUrl?.match(/jotform\.com\/(\d+)/)?.[1];
  const [userData, setUserData] = useState<{
    foretagsnamn?: string;
    kundnummer?: string;
  }>({});
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);

  useEffect(() => {
    if (!formId) return;

    // Remove any duplicate forms that Jotform might inject elsewhere
    const existingForms = document.querySelectorAll(
      `iframe[id*="${formId}"], div[id*="jotform"]`
    );
    existingForms.forEach((form, index) => {
      if (index > 0) form.remove();
    });
  }, [formId]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const result = await queryClient({
          query: GET_CURRENT_USER,
        });

        // Check if result has data and me exists
        const person = result?.me?.person;

        if (person) {
          // Extract firstName and lastName directly from fields object
          const firstName = person.fields?._firstName || '';
          const lastName = person.fields?._lastName || '';

          setUserData({
            foretagsnamn: firstName || undefined,
            kundnummer: lastName || undefined,
          });
        }
      } catch (error: any) {
        const errorArray = Array.isArray(error)
          ? error
          : error?.graphQLErrors || [];
        const networkError = error?.networkError;

        const isAuthError =
          errorArray.length > 0 &&
          errorArray.some(
            (e: any) =>
              e.extensions?.code === 'AUTH_NOT_AUTHORIZED' ||
              e.message?.includes('not authorized') ||
              e.message?.includes('authentication')
          );

        if (!isAuthError) {
          // Only log non-authentication errors
          if (errorArray.length > 0) {
            console.error('GraphQL errors:', errorArray);
          } else if (networkError) {
            console.error('Network error:', networkError);
          } else {
            console.error('Failed to fetch user data for Jotform:', error);
          }
        }
        // Silently fail - form will load without user data
      } finally {
        setIsLoadingUserData(false);
      }
    };

    fetchUserData();
  }, []);

  if (!formId) return <></>;

  const iframeId = `JotFormIFrame-${formId}`;

  // Build URL with query parameters
  const formUrl = new URL(`https://form.jotform.com/${formId}`);
  if (userData.foretagsnamn) {
    formUrl.searchParams.set('foretagsnamn', userData.foretagsnamn);
  }
  if (userData.kundnummer) {
    formUrl.searchParams.set('kundnummer', userData.kundnummer);
  }

  if (isLoadingUserData) {
    return (
      <div className="jotform-block min-w-full" style={{ height: '539px' }} />
    );
  }

  return (
    <div className="jotform-block min-w-full">
      <iframe
        id={iframeId}
        title="Jotform"
        onLoad={() => window.parent.scrollTo(0, 0)}
        allowFullScreen
        src={formUrl.toString()}
        style={{
          minWidth: '100%',
          maxWidth: '100%',
          height: '539px',
          border: 'none',
        }}
        scrolling="no"
      />
      <Script
        src="https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (window.jotformEmbedHandler) {
            window.jotformEmbedHandler(
              `iframe[id='${iframeId}']`,
              'https://form.jotform.com/'
            );
          }
        }}
      />
    </div>
  );
}
