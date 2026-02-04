import { render, screen } from '@testing-library/react';
import PrimaryNavigationCategoriesBlock from './PrimaryNavigationCategoriesBlock';

describe('PrimaryNavigationCategoriesBlock', () => {
  test('should render correct value of header', () => {
    const fields: any = {
      categoryLink: [
        {
          item: {
            name: 'Woman',
            url: '/woman',
            children: {
              nodes: [],
            },
          },
        },
      ],
    };
    render(
      <PrimaryNavigationCategoriesBlock
        fields={fields}
      ></PrimaryNavigationCategoriesBlock>
    );
    expect(screen.queryByTestId('navigation-link__header')).toHaveTextContent(
      'Woman'
    );
    expect(screen.queryByTestId('navigation-link__header')).toHaveAttribute(
      'href',
      '/woman'
    );
  });

  test('should render header without href', () => {
    const fields: any = {
      categoryLink: [
        {
          item: {
            name: 'Woman',
            children: {
              nodes: [],
            },
          },
        },
      ],
    };
    render(
      <PrimaryNavigationCategoriesBlock
        fields={fields}
      ></PrimaryNavigationCategoriesBlock>
    );
    expect(screen.queryByTestId('navigation-link__header')).not.toHaveAttribute(
      'href'
    );
  });

  test('should render correct number of sub category', () => {
    const fields: any = {
      categoryLink: [
        {
          item: {
            name: 'Woman',
            url: '/woman',
            children: {
              nodes: [
                {
                  name: 'Tools',
                  url: 'link-1',
                },
                {
                  name: 'Tops',
                  url: 'link-2',
                },
              ],
            },
          },
        },
      ],
    };
    render(
      <PrimaryNavigationCategoriesBlock
        fields={fields}
      ></PrimaryNavigationCategoriesBlock>
    );
    expect(screen.queryAllByTestId('navigation-link__links').length).toBe(2);
  });

  test('should render correct value of sub category', () => {
    const fields: any = {
      categoryLink: [
        {
          item: {
            name: 'Woman',
            url: '/woman',
            children: {
              nodes: [
                {
                  name: 'Tools',
                  url: '/woman/tools',
                },
              ],
            },
          },
        },
      ],
    };
    render(
      <PrimaryNavigationCategoriesBlock
        fields={fields}
      ></PrimaryNavigationCategoriesBlock>
    );
    expect(screen.queryByTestId('navigation-link__links')).toHaveTextContent(
      'Tools'
    );
    expect(screen.queryByTestId('navigation-link__links')).toHaveAttribute(
      'href',
      '/woman/tools'
    );
  });

  test('should not render sub category without href', () => {
    const fields: any = {
      categoryLink: [
        {
          item: {
            name: 'Woman',
            url: '/woman',
            children: {
              nodes: [
                {
                  name: 'Tools',
                },
              ],
            },
          },
        },
      ],
    };
    render(
      <PrimaryNavigationCategoriesBlock
        fields={fields}
      ></PrimaryNavigationCategoriesBlock>
    );
    expect(
      screen.queryByTestId('navigation-link__links')
    ).not.toBeInTheDocument();
  });

  test('should render sub category url as name', () => {
    const fields: any = {
      categoryLink: [
        {
          item: {
            name: 'Woman',
            url: '/woman',
            children: {
              nodes: [
                {
                  url: '/woman/tools',
                },
              ],
            },
          },
        },
      ],
    };
    render(
      <PrimaryNavigationCategoriesBlock
        fields={fields}
      ></PrimaryNavigationCategoriesBlock>
    );
    expect(screen.queryByTestId('navigation-link__links')).toHaveTextContent(
      '/woman/tools'
    );
  });
});
