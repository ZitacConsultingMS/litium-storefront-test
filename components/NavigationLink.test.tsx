import { render, screen } from '@testing-library/react';
import NavigationLink from './NavigationLink';

describe('NavigationLink', () => {
  test('should render correct header name', () => {
    const fields = {
      header: {
        text: 'Header name',
      },
    };
    render(<NavigationLink {...fields}></NavigationLink>);
    expect(screen.queryByTestId('navigation-link__header')).toHaveTextContent(
      'Header name'
    );
  });

  test('should render header without href', () => {
    const fields = {
      header: {
        text: 'Header name',
      },
    };
    render(<NavigationLink {...fields}></NavigationLink>);
    expect(screen.queryByTestId('navigation-link__header')).not.toHaveAttribute(
      'href'
    );
  });

  test('should render header with href', () => {
    const fields = {
      header: {
        text: 'Header name',
        url: '/foo',
      },
    };
    render(<NavigationLink {...fields}></NavigationLink>);
    expect(screen.queryByTestId('navigation-link__header')).toHaveAttribute(
      'href',
      '/foo'
    );
  });

  test('should not render links if not available', () => {
    const fields = {
      header: {
        text: 'Header name',
      },
    };
    render(<NavigationLink {...fields}></NavigationLink>);
    expect(
      screen.queryByTestId('navigation-link__links')
    ).not.toBeInTheDocument();
  });

  test('should render correct number of links', async () => {
    const fields = {
      header: {
        text: 'Header name',
      },
      links: [
        {
          text: 'Link 1',
          url: '/link-1',
        },
        {
          text: 'Link 2',
          url: '/link-2',
        },
      ],
    };
    render(<NavigationLink {...fields}></NavigationLink>);
    expect(screen.queryAllByTestId('navigation-link__links').length).toBe(2);
  });

  test('should render links with href', () => {
    const fields = {
      header: {
        text: 'Header name',
      },
      links: [
        {
          text: 'Link 1',
          url: '/foo',
        },
      ],
    };
    render(<NavigationLink {...fields}></NavigationLink>);
    expect(screen.queryByTestId('navigation-link__links')).toHaveAttribute(
      'href',
      '/foo'
    );
  });

  test('should not render links without text', () => {
    const fields = {
      header: {
        text: 'Header name',
      },
      links: [
        {
          text: '',
          url: '/foo',
        },
      ],
    };
    render(<NavigationLink {...fields}></NavigationLink>);
    expect(
      screen.queryByTestId('navigation-link__links')
    ).not.toBeInTheDocument();
  });

  test('should not render links without url', () => {
    const fields = {
      header: {
        text: 'Header name',
      },
      links: [
        {
          text: 'Link 1',
          url: undefined,
        },
      ],
    };
    render(<NavigationLink {...fields}></NavigationLink>);
    expect(
      screen.queryByTestId('navigation-link__links')
    ).not.toBeInTheDocument();
  });
});
