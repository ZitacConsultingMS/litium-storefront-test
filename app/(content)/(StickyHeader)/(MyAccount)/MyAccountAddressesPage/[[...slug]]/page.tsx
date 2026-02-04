import { gql } from '@apollo/client';
import BlockContainer from 'components/blocks/BlockContainer';
import {
  MainContent,
  SideNavigation,
  SideNavigationLayout,
} from 'components/layouts/SideNavigationLayout';
import B2BAddresses from 'components/users/B2BAddresses';
import B2CAddresses from 'components/users/B2CAddresses';
import { Block } from 'models/block';
import { ContentItem } from 'models/content';
import { NavigationLink } from 'models/navigation';
import { PageItemsConnection } from 'models/page';
import { Metadata } from 'next';
import { Fragment } from 'react';
import { queryServer } from 'services/dataService.server';
import { createMetadata } from 'services/metadataService.server';
import withAuthorizedCheck from '../../withAuthorizedCheck';

export default async function Page(props: {
  params: Promise<any>;
  searchParams: Promise<any>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const currentUrl = `/${params.slug?.join('/')}` || '/';
  const data = await withAuthorizedCheck(
    async () => await getContent({ params })
  );
  const totalCount = data.me?.person?.organizations.totalCount;
  const { name, parents, blocks } = data.content as UserAddressPage;
  const {
    name: topPageName,
    url: topPageUrl,
    children,
  } = await getChildren(
    parents?.nodes.length > 1 ? parents?.nodes[1]?.url : currentUrl
  );
  const isB2cPerson = totalCount === 0;
  const breadcrumbs = (() => {
    const currentPage: NavigationLink = {
      name: name,
      selected: true,
      url: '',
    };
    return [...parents?.nodes, currentPage];
  })();
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
          {isB2cPerson ? (
            <B2CAddresses />
          ) : (
            <B2BAddresses searchParams={searchParams} />
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
    url: params.slug?.join('/') ?? '/',
  });
}
const GET_CONTENT = gql`
  query GetMyAccountAddressPageContent {
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
      ... on MyAccountAddressesPage {
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
`;

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

interface UserAddressPage extends ContentItem {
  name: string;
  parents: PageItemsConnection;
  children: PageItemsConnection;
  blocks: UserAddressPageBlockContainer;
}

interface UserAddressPageBlockContainer {
  main: Block[];
}
