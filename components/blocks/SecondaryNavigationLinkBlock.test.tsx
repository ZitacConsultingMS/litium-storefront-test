import { render, screen } from '@testing-library/react';
import SecondaryNavigationLinkBlock from './SecondaryNavigationLinkBlock';

describe('Secondary Navigation Link Block', () => {
  test('should render the correct link with url and text', () => {
    const block = {
      __typename: 'SecondaryNavigationLinkBlock',
      systemId: 'foo',
      fields: {
        navigationLink: {
          text: 'First menu',
          url: '/first-menu',
        },
      },
      children: [],
    };
    render(<SecondaryNavigationLinkBlock {...block} />);
    expect(
      screen.getByTestId('secondary-navigation-link__link')
    ).toHaveTextContent('First menu');
    expect(
      screen.getByTestId('secondary-navigation-link__link')
    ).toHaveAttribute('href', '/first-menu');
  });
  test('should not render the link without url', () => {
    const block = {
      __typename: 'SecondaryNavigationLinkBlock',
      systemId: 'foo',
      fields: {
        navigationLink: {
          text: 'First menu',
        },
      },
      children: [],
    };
    render(<SecondaryNavigationLinkBlock {...block} />);
    expect(
      screen.queryByTestId('secondary-navigation-link__link')
    ).not.toBeInTheDocument();
  });
  test('should not render the link without text', () => {
    const block = {
      __typename: 'SecondaryNavigationLinkBlock',
      systemId: 'foo',
      fields: {
        navigationLink: {
          url: '/first-menu',
          text: '',
        },
      },
      children: [],
    };
    render(<SecondaryNavigationLinkBlock {...block} />);
    expect(
      screen.queryByTestId('secondary-navigation-link__link')
    ).not.toBeInTheDocument();
  });
});
