import { gql } from '@apollo/client';
import OrderDetail from 'components/OrderDetail';
import {
  MainContent,
  SideNavigation,
  SideNavigationLayout,
} from 'components/layouts/SideNavigationLayout';
import { ContentItem } from 'models/content';
import { NavigationLink } from 'models/navigation';
import { RoleOption } from 'models/option';
import { PageItemsConnection } from 'models/page';
import { SearchParams } from 'models/searchParams';
import { Metadata } from 'next';
import { Fragment } from 'react';
import { queryServer } from 'services/dataService.server';
import { createMetadata } from 'services/metadataService.server';
import { RoleType } from 'utils/constants';
import withAuthorizedCheck from '../../withAuthorizedCheck';

export default async function Page(props: {
  params: Promise<any>;
  searchParams: Promise<any>;
}) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  if (!searchParams.orderId) {
    return <Fragment></Fragment>;
  }

  const currentUrl = `/${params.slug?.join('/')}` || '/';
  const { content, me, node } = await withAuthorizedCheck(
    async () => await getContent({ id: searchParams.orderId, params })
  );
  const isB2B = me.person.organizations.totalCount > 0;
  const roleOperations = me?.selectedOrganization?.roleOperations || [];

  if (isB2B && !hasRoleType(roleOperations, RoleType.ReadOrder)) {
    return <Fragment></Fragment>;
  }

  const { name, parents } = content as OrderDetailPage;
  const {
    name: topPageName,
    url: topPageUrl,
    children,
  } = await getChildren(
    parents?.nodes.length > 1 ? parents?.nodes[1]?.url : currentUrl
  );
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
      <SideNavigationLayout>
        <SideNavigation
          name={topPageName}
          url={topPageUrl}
          rootUrl={currentUrl}
          parents={parents}
          childrenPages={children}
        />
        <MainContent breadcrumbs={breadcrumbs}>
          <OrderDetail
            orderDetail={node}
            hasApproveOrder={hasRoleType(roleOperations, RoleType.ApproveOrder)}
            hasPlaceOrder={hasRoleType(roleOperations, RoleType.PlaceOrder)}
          />
        </MainContent>
      </SideNavigationLayout>
    </Fragment>
  );
}

function hasRoleType(options: RoleOption[], roleType: string) {
  return options.some((item) => item.roleOperationId === roleType);
}

export async function generateMetadata(props: {
  params: Promise<any>;
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const { content } = await withAuthorizedCheck(
    async () =>
      await getContent({
        id: searchParams.orderId,
        params,
      })
  );
  return createMetadata(content.metadata);
}

async function getContent({ id, params }: { id: string; params: any }) {
  return await queryServer({
    query: GET_CONTENT,
    url: params.slug?.join('/') ?? '/',
    variables: {
      id,
    },
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
  query GetContent($id: ID!) {
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
    }
    me {
      person {
        id
        organizations {
          totalCount
        }
      }
      selectedOrganization {
        roleOperations {
          roleOperationId
        }
      }
    }
    node(id: $id) {
      ...OrderDetail
    }
  }
`;

interface OrderDetailPage extends ContentItem {
  name: string;
  parents: PageItemsConnection;
  children: PageItemsConnection;
}
