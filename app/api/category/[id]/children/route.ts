import { gql } from '@apollo/client';
import { NextRequest, NextResponse } from 'next/server';
import { queryServer } from 'services/dataService.server';

const GET_CATEGORY_CHILDREN = gql`
  query GetCategoryChildren {
    content {
      ... on ICategoryItem {
        id
        name
        children {
          nodes {
            id
            name
            url
            images {
              url
            }
          }
        }
      }
      ... on MotorsokProductCategory {
        id
        name
        children {
          nodes {
            id
            name
            url
            images {
              url
            }
          }
        }
      }
      ... on CategoryProductCategory {
        id
        name
        children {
          nodes {
            id
            name
            url
            images {
              url
            }
          }
        }
      }
      ... on ZsBrandProductCategory {
        id
        name
        children {
          nodes {
            id
            name
            url
            images {
              url
            }
          }
        }
      }
      ... on Sweden_webb_categoryProductCategory {
        id
        name
        children {
          nodes {
            id
            name
            url
            images {
              url
            }
          }
        }
      }
    }
  }
`;

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const categoryUrl = request.nextUrl.searchParams.get('url');

        // URL is required - ID is only for route matching, not used in query
        if (!categoryUrl) {
            return NextResponse.json(
                { error: 'Category URL is required. Please provide ?url= parameter' },
                { status: 400 }
            );
        }

        const result = await queryServer({
            query: GET_CATEGORY_CHILDREN,
            url: categoryUrl,
            variables: {},
        });

        const content = result?.content;
        if (!content) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        const children = content?.children?.nodes || [];
        return NextResponse.json({ children });
    } catch (error: any) {
        const resolvedParams = await params;
        console.error('Error fetching category children:', {
            message: error.message,
            categoryId: resolvedParams.id,
            categoryUrl: request.nextUrl.searchParams.get('url'),
            graphQLErrors: error.graphQLErrors?.map((e: any) => e.message),
            networkError: error.networkError?.message,
        });

        return NextResponse.json(
            {
                error: 'Failed to fetch category children',
                details: error.message,
            },
            { status: 500 }
        );
    }
}
