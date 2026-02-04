import { gql } from '@apollo/client';
import { NextRequest, NextResponse } from 'next/server';
import { queryServer } from 'services/dataService.server';

const GET_CATEGORY_BY_URL = gql`
  query GetCategoryByUrl {
    content {
      ... on ICategoryItem {
        id
        name
        url
      }
      ... on MotorsokProductCategory {
        id
        name
        url
      }
      ... on CategoryProductCategory {
        id
        name
        url
      }
      ... on ZsBrandProductCategory {
        id
        name
        url
      }
      ... on Sweden_webb_categoryProductCategory {
        id
        name
        url
      }
    }
  }
`;

export async function GET(request: NextRequest) {
  try {
    const urlParam = request.nextUrl.searchParams.get('url');
    if (!urlParam) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    const result = await queryServer({
      query: GET_CATEGORY_BY_URL,
      url: urlParam,
      variables: {},
    });

    const content = result?.content;
    if (!content) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: content.id,
      name: content.name,
      url: content.url,
    });
  } catch (error: any) {
    console.error('Error fetching category by URL:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch category',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
