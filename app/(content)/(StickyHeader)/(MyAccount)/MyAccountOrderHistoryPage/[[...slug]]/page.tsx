import { gql } from '@apollo/client';
import B2BOrderHistory from 'components/B2BOrderHistory';
import B2COrderHistory from 'components/B2COrderHistory';
import BlockContainer from 'components/blocks/BlockContainer';
import { Heading2 } from 'components/elements/Heading';
import {
  MainContent,
  SideNavigation,
  SideNavigationLayout,
} from 'components/layouts/SideNavigationLayout';
import { Block } from 'models/block';
import { ContentItem } from 'models/content';
import { NavigationLink } from 'models/navigation';
import { PageItemsConnection } from 'models/page';
import { Metadata } from 'next';
import { ALL_BLOCK_TYPES_FRAGMENT } from 'operations/fragments/blocks/allBlockTypes';
import { Fragment } from 'react';
import { queryServer } from 'services/dataService.server';
import { createMetadata } from 'services/metadataService.server';
import { PaginationOptions } from 'utils/constants';
import withAuthorizedCheck from '../../withAuthorizedCheck';

export default async function Page(props: { params: Promise<any> }) {
  const params = await props.params;
  const currentUrl = `/${params.slug?.join('/')}` || '/';
  const { content, me } = await withAuthorizedCheck(
    async () => await getContent({ params })
  );
  const { name, parents, blocks } = content as OrderHistoryPage;
  const {
    name: topPageName,
    url: topPageUrl,
    children,
  } = await getChildren(
    parents.nodes.length > 1 ? parents.nodes[1]?.url : currentUrl
  );

  const breadcrumbs = (() => {
    const currentPage: NavigationLink = {
      name: name,
      selected: true,
      url: '',
    };
    return [...parents.nodes, currentPage];
  })();

  const isB2B = me.person.organizations.totalCount > 0;
  return (
    <Fragment>
      <BlockContainer
        priority
        blocks={blocks.main}
        className="mb-4"
      ></BlockContainer>
      <SideNavigationLayout>
        <SideNavigation
          name={topPageName}
          url={topPageUrl}
          rootUrl={currentUrl}
          parents={parents}
          childrenPages={children}
        />
        <MainContent breadcrumbs={breadcrumbs}>
          <Heading2 className="mb-8 mt-10 lg:mb-4">{name}</Heading2>
          {isB2B ? (
            <B2BOrderHistory params={params} />
          ) : (
            <B2COrderHistory params={params} />
          )}
        </MainContent>
      </SideNavigationLayout>
    </Fragment>
  );
}

export async function generateMetadata(props: {
  params: Promise<any>;
}): Promise<Metadata> {
  const params = await props.params;
  const { content } = await withAuthorizedCheck(
    async () => await getContent({ params })
  );
  return createMetadata(content.metadata);
}

async function getContent({ params }: { params: any }) {
  return await queryServer({
    query: GET_CONTENT,
    variables: {
      first: 1 || PaginationOptions.PageSize,
      after: '0',
    },
    url: params.slug?.join('/') ?? '/',
  });
}

async function getChildren(url: string) {
  return (
    await queryServer({
      query: GET_CHILDREN,
      url: url,
    })
  ).content;
}
const GET_CHILDREN = gql`
  query GetChildren {
    content {
      ... on IPageItem {
        id
        name
        url
        children {
          nodes {
            ... on IPageItem {
              id
              name
              url
              children {
                nodes {
                  ... on IPageItem {
                    id
                    name
                    url
                    children {
                      nodes {
                        ... on IPageItem {
                          id
                          name
                          url
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

const GET_CONTENT = gql`
  query GetContent {
    content {
      ... on IPageItem {
        ...Metadata
        id
        name
        url
        parents(reverse: true) {
          nodes {
            ... on IPageItem {
              id
              name
              url
            }
          }
        }
      }
      ... on MyAccountOrderHistoryPage {
        ...Metadata
        blocks {
          main {
            ...AllBlockTypes
          }
        }
      }
    }
    me {
      person {
        id
        organizations {
          totalCount
        }
      }
    }
  }

  ${ALL_BLOCK_TYPES_FRAGMENT}
`;

interface OrderHistoryPage extends ContentItem {
  name: string;
  parents: PageItemsConnection;
  children: PageItemsConnection;
  blocks: OrderHistoryPageBlockContainer;
}

interface OrderHistoryPageBlockContainer {
  main: Block[];
}
