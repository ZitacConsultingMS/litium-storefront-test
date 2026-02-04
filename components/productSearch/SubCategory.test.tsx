import { cloneDeep } from '@apollo/client/utilities';
import { render, screen } from '@testing-library/react';
import { CategoryItem } from 'models/category';
import React from 'react';
import SubCategory from './SubCategory';

jest.mock('components/Link', () => {
  const MockLink = ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} data-testid="sub-category">
      {children}
    </a>
  );
  MockLink.displayName = 'MockLink';
  return MockLink;
});

describe('SubCategory', () => {
  let matchMediaTemp: (query: string) => MediaQueryList;

  beforeEach(() => {
    jest.spyOn(React, 'useRef').mockImplementation(() => {
      return {
        current: {
          enable: jest.fn(),
        },
      };
    });
    matchMediaTemp = cloneDeep(window.matchMedia);
    window.matchMedia =
      window.matchMedia ||
      function () {
        return {
          matches: false,
          addListener: jest.fn(),
          removeListener: jest.fn(),
        };
      };
  });

  afterEach(() => {
    window.matchMedia = matchMediaTemp;
  });

  test('should not render sub category if not available', () => {
    const subCategories: CategoryItem[] = [];
    render(<SubCategory subCategories={subCategories}></SubCategory>);
    expect(screen.queryByTestId('sub-category')).not.toBeInTheDocument();
  });

  test('should not render sub category without url', () => {
    const subCategories: CategoryItem[] = [
      {
        __typename: 'category',
        name: 'Bottoms',
        url: '',
        id: '',
      },
    ];
    render(<SubCategory subCategories={subCategories}></SubCategory>);
    expect(screen.queryByTestId('sub-category')).not.toBeInTheDocument();
  });

  test('should not render sub category without name', () => {
    const subCategories: CategoryItem[] = [
      {
        __typename: 'category',
        name: '',
        url: '/woman/bottoms',
        id: '',
      },
    ];
    render(<SubCategory subCategories={subCategories}></SubCategory>);
    expect(screen.queryByTestId('sub-category')).not.toBeInTheDocument();
  });

  test('should render correct sub category data', () => {
    const subCategories: CategoryItem[] = [
      {
        __typename: 'category',
        name: 'Bottoms',
        url: '/woman/bottoms',
        id: '',
      },
    ];
    render(<SubCategory subCategories={subCategories}></SubCategory>);
    expect(screen.queryAllByTestId('sub-category').length).toBe(1);
    expect(screen.getByTestId('sub-category').textContent).toEqual('Bottoms');
    expect(screen.getByTestId('sub-category')).toHaveAttribute(
      'href',
      '/woman/bottoms'
    );
  });

  test('should render correct number of sub categories', () => {
    const subCategories: CategoryItem[] = [
      {
        __typename: 'category',
        name: 'Bottoms',
        url: '/woman/bottoms',
        id: '',
      },
      {
        __typename: 'category',
        name: 'Tops',
        url: '/woman/tops',
        id: '',
      },
    ];
    render(<SubCategory subCategories={subCategories}></SubCategory>);
    expect(screen.queryAllByTestId('sub-category').length).toBe(2);
  });
});
