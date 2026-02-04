import { gql } from '@apollo/client';
import BlockContainer from 'components/blocks/BlockContainer';
import { Metadata } from 'next';
import { queryServer } from 'services/dataService.server';
import { createMetadata } from 'services/metadataService.server';

export default async function Page(props: { params: Promise<any> }) {
  const params = await props.params;
  const content = await getContent({ params });
  return (
    <BlockContainer
      priority
      blocks={content.blocks.main}
      className="mb-4"
    ></BlockContainer>
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
  query GetSiteSelectorPage {
    content {
      ... on SiteSelectorPage {
        ...Metadata
        id
        blocks {
          main {
            ...AllBlockTypes
          }
        }
      }
    }
  }
`;
