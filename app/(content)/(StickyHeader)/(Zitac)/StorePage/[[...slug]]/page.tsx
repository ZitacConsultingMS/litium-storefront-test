import { gql } from '@apollo/client';
import BlockContainer from 'components/blocks/BlockContainer';
import { queryServer } from 'services/dataService.server';

export default async function Page({ params }: { params: any }) {
  const content = await getContent({ params });

  return (
    <BlockContainer
      priority
      blocks={content.blocks.main}
      className="mb-4"
    ></BlockContainer>
  );
}

/*
export async function generateMetadata({
  params,
}: {
  params: any;
}): Promise<Metadata> {
  const content = await getContent({ params });
  return createMetadata(content.metadata);
}
*/

async function getContent({ params }: { params: any }) {
  return (
    await queryServer({
      query: GET_CONTENT,
      url: params.slug?.join('/') ?? '/',
    })
  ).content;
}

const GET_CONTENT = gql`
  query GetStorePage {
    content {
      ... on StorePage {
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
