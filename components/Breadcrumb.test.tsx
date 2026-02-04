import { render, screen } from '@testing-library/react';
import { NavigationLink } from 'models/navigation';
import Breadcrumb from './Breadcrumb';

describe('Breadcrumb', () => {
  test('should render correct page hierarchy', async () => {
    const breadcrumbs: NavigationLink[] = [
      {
        name: 'Home page',
        url: '/',
        selected: false,
      },
      {
        name: 'Woman',
        url: '/woman',
        selected: true,
      },
    ];
    render(<Breadcrumb breadcrumbs={breadcrumbs}></Breadcrumb>);
    expect(screen.queryAllByTestId('breadcrumb-desktop').length).toBe(2);
    expect(
      screen.queryAllByTestId('breadcrumb-desktop')[0].textContent
    ).toEqual('Home page');
    expect(
      screen.queryAllByTestId('breadcrumb-desktop')[1].textContent
    ).toEqual('Woman');
    expect(screen.queryAllByTestId('breadcrumb-mobile').length).toBe(1);
    expect(screen.queryAllByTestId('breadcrumb-mobile')[0].textContent).toEqual(
      'Home page'
    );
  });

  test('should render current page without href', () => {
    const breadcrumbs: NavigationLink[] = [
      {
        name: 'Home page',
        url: '/',
        selected: false,
      },
      {
        name: 'Woman',
        url: '/woman',
        selected: true,
      },
    ];
    render(<Breadcrumb breadcrumbs={breadcrumbs}></Breadcrumb>);
    const currentPage = screen.getAllByTestId('breadcrumb-desktop')[1];
    expect(currentPage).not.toHaveAttribute('href');
  });

  test('should render parent page with href', () => {
    const breadcrumbs: NavigationLink[] = [
      {
        name: 'Home page',
        url: '/',
        selected: false,
      },
      {
        name: 'Woman',
        url: '/woman',
        selected: true,
      },
    ];
    render(<Breadcrumb breadcrumbs={breadcrumbs}></Breadcrumb>);
    const parentPageDesktop = screen.getAllByTestId('breadcrumb-desktop')[0];
    expect(parentPageDesktop).toHaveAttribute('href', '/');
    const parentPageMobile = screen.getAllByTestId('breadcrumb-mobile')[0];
    expect(parentPageMobile).toHaveAttribute('href', '/');
  });
});
