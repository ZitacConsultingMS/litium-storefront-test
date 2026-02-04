import { gql } from '@apollo/client';
import BlockContainer from 'components/blocks/BlockContainer';
import { Heading1 } from 'components/elements/Heading';
import { HtmlText } from 'components/elements/HtmlText';
import { ErrorPage } from 'models/error';
import { Metadata } from 'next';
import { Fragment } from 'react';
import { queryServer } from 'services/dataService.server';
import { createMetadata } from 'services/metadataService.server';

export default async function Page(props: { params: Promise<any> }) {
  const params = await props.params;
  const content = await getContent({ params });
  const { fields, blocks } = content as ErrorPage;
  return (
    <Fragment>
      {blocks && (
        <BlockContainer
          priority
          blocks={blocks?.blockContainer}
          className="mb-4"
        ></BlockContainer>
      )}
      {fields?.title && (
        <Heading1 className="mb-9 mt-7" data-testid="errorpage__title">
          {fields?.title}
        </Heading1>
      )}
      {fields?.editor && (
        <HtmlText
          className="min-w-full"
          innerHTML={fields?.editor}
          data-testid="errorpage__editor"
        ></HtmlText>
      )}
    </Fragment>
  );
}

export async function generateMetadata(props: {
  params: Promise<any>;
}): Promise<Metadata> {
  const params = await props.params;
  const content = await getContent({ params });
  return createMetadata(content.metadata);
}

async function getContent({ params }: { params: any }) {
  return (
    await queryServer({
      query: GET_CONTENT,
      url: params.slug?.join('/') ?? '/',
    })
  ).content;
}

const GET_CONTENT = gql`
  query GetErrorPage {
    content {
      ... on ErrorPage {
        ...Metadata
        id
        fields {
          title
          editor
        }
        blocks {
          blockContainer {
            ...AllBlockTypes
          }
        }
      }
    }
  }
`;
