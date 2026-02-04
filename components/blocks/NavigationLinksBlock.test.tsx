import { render, screen } from '@testing-library/react';
import NavigationLinksBlock from './NavigationLinksBlock';

describe('Navigation Links block', () => {
  test('should not render navigation links without href', async () => {
    const fields = {
      navigationLinksHeader: {
        text: 'Header name',
      },
      navigationLinks: [
        {
          navigationLink: {
            text: `Navigation link text 1`,
          },
        },
      ],
    };
    render(<NavigationLinksBlock fields={fields}></NavigationLinksBlock>);
    expect(screen.queryByTestId('navigation-link__header')).toHaveTextContent(
      'Header name'
    );
    expect(screen.queryByTestId('navigation-link__header')).not.toHaveAttribute(
      'href'
    );
    expect(
      screen.queryAllByTestId('navigation-link__links')[0]
    ).toBeUndefined();
  });

  test('should render correct number of links', async () => {
    const fields = {
      navigationLinksHeader: {
        text: 'Header name',
      },
      navigationLinks: [
        {
          navigationLink: {
            text: `Navigation link text 1`,
            url: 'link-1',
          },
        },
        {
          navigationLink: {
            text: `Navigation link text 2`,
            url: 'link-2',
          },
        },
      ],
    };
    render(<NavigationLinksBlock fields={fields}></NavigationLinksBlock>);
    expect(screen.queryAllByTestId('navigation-link__links').length).toBe(2);
  });

  test('should render header link with href', () => {
    const fields = {
      navigationLinksHeader: {
        text: 'Header name',
        url: '/foo',
      },
      navigationLinks: [],
    };
    render(<NavigationLinksBlock fields={fields}></NavigationLinksBlock>);
    expect(screen.queryByTestId('navigation-link__header')).toHaveAttribute(
      'href',
      '/foo'
    );
  });

  test('should render links with href', () => {
    const fields = {
      navigationLinksHeader: {
        text: 'Header name',
      },
      navigationLinks: [
        {
          navigationLink: {
            text: `Navigation link text 1`,
            url: `/foo`,
          },
        },
      ],
    };
    render(<NavigationLinksBlock fields={fields}></NavigationLinksBlock>);
    expect(
      screen.queryAllByTestId('navigation-link__links')[0]
    ).toHaveAttribute('href', '/foo');
  });
});
